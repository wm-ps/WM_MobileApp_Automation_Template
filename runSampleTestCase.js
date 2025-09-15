const { spawn, execSync, exec } = require("child_process");
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
  const homeDir = os.homedir();
  const platform = process.platform;

  // Detect if ANDROID_HOME or ANDROID_SDK_ROOT is set
  const androidHomeSet = !!process.env.ANDROID_HOME || !!process.env.ANDROID_SDK_ROOT;

  // Try detecting SDK
  let detectedSdk = null;
  const possibleSdkPaths = [
    path.join(homeDir, "Library", "Android", "sdk"),        // macOS
    path.join(homeDir, "Android", "Sdk"),                  // Linux
    path.join(process.env.LOCALAPPDATA || "", "Android", "Sdk") // Windows
  ];
  for (const sdkPath of possibleSdkPaths) {
    if (fs.existsSync(sdkPath)) {
      detectedSdk = sdkPath;
      break;
    }
  }

  // Check adb and emulator
  let adbAvailable = false;
  let emulatorAvailable = false;
  try { execSync("adb --version", { stdio: "ignore" }); adbAvailable = true; } catch {}
  try { execSync("emulator -version", { stdio: "ignore" }); emulatorAvailable = true; } catch {}

  // If everything exists
  if (adbAvailable && emulatorAvailable && androidHomeSet) {
    console.log("✅ Android SDK is fully set up. adb, emulator, and ANDROID_HOME are available.");
    return;
  }

  const missing = {
    home: !androidHomeSet,
    adb: !adbAvailable,
    emulator: !emulatorAvailable,
  };

  console.log("\n📦 Android SDK Setup Instructions (only missing items)\n");

  // If no SDK detected at all, show download link
  if (!detectedSdk && !adbAvailable && !emulatorAvailable) {
    console.log("⚠️ No Android SDK detected.");
    console.log("💡 Download Android Studio & SDK here: https://developer.android.com/studio\n");
  }

  if (platform === "darwin" || platform === "linux") {
    console.log("💻 === macOS / Linux ===");
    console.log(`🏠 HOME directory: ${homeDir}`);
    if (detectedSdk) console.log(`💡 Detected SDK path: ${detectedSdk}`);

    if (missing.home || missing.emulator) {
      console.log("\n🛠️ Add the following lines to your shell config file (~/.zshrc or ~/.bashrc):");
      if (missing.home) {
        console.log(`export ANDROID_HOME=${detectedSdk || "$HOME/Library/Android/sdk"}`);
        console.log(`export ANDROID_SDK_ROOT=${detectedSdk || "$HOME/Library/Android/sdk"}`);
      }
      if (missing.emulator) {
        console.log("export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH");
      }
    }

    console.log("\n🔄 Apply changes:");
    console.log("source ~/.zshrc   # or source ~/.bashrc");

    console.log("\n🔍 Verify setup:");
    if (missing.home || missing.adb) console.log("echo $ANDROID_HOME\nadb --version");
    else console.log("adb --version");
    if (missing.emulator) console.log("emulator -version");
    else console.log("emulator -version");

  } else if (platform === "win32") {
    console.log("💻 === Windows (PowerShell, 32/64-bit) ===");
    console.log(`🏠 USERPROFILE: ${process.env.USERPROFILE}`);
    if (detectedSdk) console.log(`💡 Detected SDK path: ${detectedSdk}`);

    if (missing.home || missing.emulator) {
      console.log("\n🛠️ Set environment variables temporarily (for this session):");
      if (missing.home) {
        console.log(`$env:ANDROID_HOME = "${detectedSdk || `${process.env.LOCALAPPDATA}\\Android\\Sdk`}"`);
        console.log(`$env:ANDROID_SDK_ROOT = "${detectedSdk || `${process.env.LOCALAPPDATA}\\Android\\Sdk`}"`);
      }
      if (missing.emulator) {
        console.log("$env:Path += \";$env:ANDROID_HOME\\emulator;$env:ANDROID_HOME\\platform-tools;$env:ANDROID_HOME\\tools\"");
      }
    }

    if (missing.home || missing.emulator) {
      console.log("\n🛠️ To set permanently:");
      console.log("- System Properties → Environment Variables → New");
      console.log(`  ANDROID_HOME = ${detectedSdk || `${process.env.LOCALAPPDATA}\\Android\\Sdk`}`);
      console.log(`  ANDROID_SDK_ROOT = ${detectedSdk || `${process.env.LOCALAPPDATA}\\Android\\Sdk`}`);
      console.log("  Add to PATH:");
      console.log("      %ANDROID_HOME%\\emulator");
      console.log("      %ANDROID_HOME%\\platform-tools");
      console.log("      %ANDROID_HOME%\\tools");
    }

    console.log("\n🔍 Verify setup:");
    if (missing.home || missing.adb) console.log("echo $env:ANDROID_HOME\nadb --version");
    else console.log("adb --version");
    if (missing.emulator) console.log("emulator -version");
    else console.log("emulator -version");

  } else {
    console.log("⚠️ Unsupported platform. Please set Android SDK variables manually.");
  }

  console.log("\n✅ Follow the above instructions, then restart your terminal.");
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



async function checkApkExists() {
  const resolvedPath = path.resolve(projectFolder);
  console.log(`Checking folder: ${resolvedPath}`);

  // Read all files in the folder
  fs.readdir(resolvedPath, (err, files) => {
    if (err) {
      console.error(`❌ Error accessing folder: ${err.message}`);
      process.exit(1);
    }
   
    // console.log('Files found in folder:', files);

    // Check for exact match
    if (files.includes('BY.apk')) {
      console.log(`✅ APK found at: ${path.join(resolvedPath, 'BY.apk')}`);
    } else {
      console.log(`❌ APK not found at ${projectFolder}. Please download it from: https://drive.google.com/file/d/1r3d6hFYZuzL3X6FIjGhEaP2KdODejx6h`);
      process.exit(1);
    }
  });
}


async function checkAppInstalled() {
  const APK_NAME = 'BY.apk';
  const APK_PATH = path.resolve('./', APK_NAME);
  const PACKAGE_NAME = 'com.blueyonder.replenishment'; // replace with your actual package name

  return new Promise((resolve) => {
    exec('adb shell pm list packages', (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ Error running adb: ${err.message}`);
        return resolve(false);
      }

      if (stdout.includes(PACKAGE_NAME)) {
        console.log(`✅ App ${PACKAGE_NAME} is already installed on the emulator`);
        resolve(true);
      } else {
        console.log(`❌ The app is not installed on the emulator. You can install it by either:`);
        console.log(`ℹ️   1. Drag and drop the APK (${projectFolder}/${APK_NAME}) onto the emulator window`);
        console.log(`ℹ️   2. Using the command line: adb install "${projectFolder}/${APK_NAME}"`);
        process.exit(1);
        // resolve(false);
      }
    });
  });
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

  checkApkExists();

  checkAppInstalled();
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
