const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectFolder = path.join(__dirname, "./sampleMobileAutomation"); // Replace with your folder

// Helper to run a command and capture logs
function runCommandAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, shell: true });

    child.stdout.on("data", (data) => {
      process.stdout.write(data.toString());
    });

    child.stderr.on("data", (data) => {
      process.stderr.write(data.toString());
    });

    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`));
    });
  });
}

async function showTestReport() {
    process.chdir(projectFolder);
    console.log("🧪 Generating test Reports...");
    await runCommandAsync("npm", ["run", "allure-generate"]);
    console.log("✅  Completed the generation of test Reports...");
    console.log("🧪 Opening the generated test Reports...");
    await runCommandAsync("npm", ["run", "allure:open"]);
}

async function main() {
    const arg = process.argv[2];

    if(arg === 'showTestReport')
    {
       await showTestReport();
    }else {
  // 1. Check if Android emulator is running
  const adbCheck = spawn("adb", ["devices"], { shell: true });
  let adbOutput = "";
  for await (const chunk of adbCheck.stdout) {
    adbOutput += chunk.toString();
  }
  for await (const chunk of adbCheck.stderr) {
    adbOutput += chunk.toString();
  }

  await new Promise((resolve) => adbCheck.on("close", resolve));

  if (!adbOutput.includes("emulator")) {
    console.error("❌ Android emulator is not running. Please start it and try again.");
    process.exit(1);
  }
  console.log("✅ Android emulator is running");

  // 2. Navigate to project folder
  process.chdir(projectFolder);

  // 3. Check node_modules
  if (!fs.existsSync(path.join(projectFolder, "node_modules"))) {
    console.log("📦 node_modules not found. Running npm install...");
    await runCommandAsync("npm", ["install"]);
  } else {
    console.log("✅ node_modules already installed");
  }

  // 4. Run testcases
  console.log("🧪 Running test-login...");
  await runCommandAsync("npm", ["run", "test-login"]);

  console.log("✅ Testcases completed!");
}
}

main().catch((err) => {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
});
