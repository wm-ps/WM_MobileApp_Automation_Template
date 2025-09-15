const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

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

async function setupAndroid() {
  const shell = os.userInfo().shell.includes("zsh") ? ".zshrc" : ".bashrc";
  const file = path.join(os.homedir(), shell);

  const exports = [
    `export ANDROID_HOME=$HOME/Library/Android/sdk`,
    `export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk`,
    `export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH`,
  ];

  let config = "";
  try {
    config = fs.readFileSync(file, "utf-8");  // ✅ read
  } catch {
    console.warn(`⚠️  ${file} not found, will create it fresh.`);
  }

  let updated = false;

  for (const line of exports) {
    if (!config.includes(line)) {
      config += `\n${line}`;
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(file, config, "utf-8");  // ✅  write
    console.log(`✅ Android SDK environment variables added to ~/${shell}`);
    console.log(`👉 Run: source ~/${shell} to apply changes.`);
  } else {
    console.log(`✅ ANDROID_HOME & ANDROID_SDK_ROOT already set in ~/${shell}`);
  }
}

async function updatePlatformVersion() {
  try {
    // 1. Find default emulator
    const avds = execSync("emulator -list-avds").toString().trim().split("\n");
    if (avds.length === 0 || !avds[0]) {
      throw new Error("❌ No emulator found. Create one in Android Studio AVD Manager.");
    }
    const defaultAvd = avds[0];
    console.log(`📱 Using emulator: ${defaultAvd}`);

    // 2. Start emulator (detached so Node script continues)
    const emulatorProcess = spawn("emulator", ["-avd", defaultAvd], {
      detached: true,
      stdio: "ignore",
    });
    emulatorProcess.unref();

    // 3. Wait until adb detects the device
    console.log("⏳ Waiting for emulator to boot...");
    execSync("adb wait-for-device");

    // Ensure system boot completed
    let bootCompleted = "";
    while (bootCompleted.trim() !== "1") {
      try {
        bootCompleted = execSync("adb shell getprop sys.boot_completed").toString();
      } catch {
        // keep retrying
      }
    }
    console.log("✅ Emulator booted");

    // 4. Get Android version
    const androidVersion = execSync(
      "adb shell getprop ro.build.version.release"
    ).toString().trim();
    console.log(`📦 Detected Android version: ${androidVersion}`);

    // 5. Update wdio.conf.ts
    const configPath = path.resolve("./samplemobileautomation/wdio.conf.ts");
    let config = fs.readFileSync(configPath, "utf-8");

    config = config.replace(
      /('appium:platformVersion':\s*['\"])(.*?)(['\"])/,
      `$1${androidVersion}$3`
    );

    fs.writeFileSync(configPath, config);
    console.log(`✅ Updated wdio.conf.ts with platformVersion = ${androidVersion}`);
  } catch (err) {
    console.error("❌ Failed to update platformVersion:", err.message);
    process.exit(1);
  }
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
    }
    else if(arg === 'setupAndroid')
    {
      await setupAndroid();
    }
    else if(arg === 'updatePlatformVersion')
    {
      await updatePlatformVersion();
    }
    else {
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
