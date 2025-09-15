const { execSync, exec, spawnSync, spawn } = require("child_process");
const os = require("os");
const dns = require("dns");
const config = require("./config");

function runCommand(command) {
  try {
    return execSync(command, { stdio: ["pipe", "pipe", "pipe"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function detectOS() {
  const platform = os.platform();
  if (platform === "darwin") return "macOS";
  if (platform === "win32") return "Windows";
  if (platform === "linux") return "Linux";
  return "Unknown";
}

function checkNetwork() {
  return new Promise((resolve) => {
    dns.lookup("google.com", (err) => {
      if (err) {
        console.log("❌ No internet connection detected.");
        resolve(false);
      } else {
        console.log("✅ Internet connection available.");
        resolve(true);
      }
    });
  });
}

function checkNode(requiredVersion, download) {
  const version = runCommand("node -v");
  if (version) {
    const major = version.replace("v", "").split(".")[0];
    if (parseFloat(major) === parseFloat(requiredVersion)) {
      console.log(`✅ Node.js version ${major} is installed.`);
    } else {
      console.log(
        `⚠️ Node.js version ${major} found, but version ${requiredVersion} is required. Download: ${download}`
      );
    }
  } else {
    console.log(`❌ Node.js not installed. Install from: ${download}`);
  }
}

function checkJava(requiredVersion, download) {
  const result = spawnSync("java", ["-version"], { encoding: "utf8" });
  const versionOutput = (result.stderr || result.stdout || "").trim();

  if (versionOutput) {
    const match = versionOutput.match(/version\s+"([\d._]+)"/);
    let major = "unknown";
    if (match) {
      const parts = match[1].split(".");
      if (parts[0] === "1") {
        major = parts[1]; // "1.8" → 8
      } else {
        major = parts[0]; // "11.0.20" → 11, "17.0.4.1" → 17
      }
    }

    if (parseFloat(major) === parseFloat(requiredVersion)) {
      console.log(`✅ Java version ${major} is installed. (Detected ${match[1]})`);
    } else {
      console.log(
        `⚠️ Java version ${major} detected (${match ? match[1] : "unknown"}), but version ${requiredVersion} is required. Download: ${download}`
      );
    }
  } else {
    console.log(`❌ Java not installed. Install from: ${download}`);
  }
}

function checkAndroidStudio(download) {
  const possibleCommands = [
    "studio.sh --version", // Linux
    "/Applications/Android\\ Studio.app/Contents/MacOS/studio --version", // macOS
    "\"C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe\" --version", // Windows
  ];

  let detected = null;
  for (const cmd of possibleCommands) {
    const result = runCommand(cmd);
    if (result) {
      detected = result;
      break;
    }
  }

  if (detected) {
    console.log(`✅ Android Studio is installed. Version: ${detected}`);
  } else {
    console.log(`❌ Android Studio not detected. Install from: ${download}`);
  }
}

function checkEmulator(requiredVersion, download) {
  const version = runCommand("emulator -version");
  if (version) {
    const match = version.match(/(\d+)/);
    const major = match ? match[1] : "unknown";
    if (parseFloat(major) === parseFloat(requiredVersion)) {
      console.log(`✅ Emulator version ${major} is installed.`);
    } else {
      console.log(
        `ℹ️ Emulator version ${major} found, but Minimal version required ${requiredVersion}. Download: ${download}`
      );
    }
  } else {
    console.log(`❌ Emulator not installed. Install from: ${download}`);
  }
}

function checkXcodeVersion(requiredVersion) {
  return new Promise((resolve) => {
    exec("xcodebuild -version", (error, stdout) => {
      if (error) {
        resolve({
          ok: false,
          message:
            "❌ Xcode not installed. Download: https://developer.apple.com/xcode/",
        });
        return;
      }

      const match = stdout.match(/Xcode\s+([0-9.]+)/);
      const installed = match ? match[1] : null;

      if (!installed) {
        resolve({
          ok: false,
          message: "❌ Could not parse installed Xcode version",
        });
        return;
      }

      if (parseFloat(installed) >= parseFloat(requiredVersion)) {
        resolve({
          ok: true,
          message: `✅ Xcode ${installed} meets requirement (>= ${requiredVersion})`,
        });
      } else {
        resolve({
          ok: false,
          message: `❌ Installed Xcode ${installed}, but required >= ${requiredVersion}`,
        });
      }
    });
  });
}

async function displayEmulatorWDIOInfo() {
  const adbCheck = spawn("adb", ["devices"], { shell: true });

  let output = "";
  adbCheck.stdout.on("data", (data) => (output += data.toString()));
  adbCheck.stderr.on("data", (data) => (output += data.toString()));

  adbCheck.on("close", async () => {
    const lines = output.split("\n").filter(Boolean);
    const emulatorLines = lines.filter((line) => line.includes("emulator"));

    if (emulatorLines.length === 0) {
      console.log("📱 No running emulator found.");
      return;
    }

    console.log(
      "\n\n🔹Before starting the tests, please review the emulator configuration details provided below and ensure they align with the capabilities defined in `sampleMobileAutomation/wdio.conf.ts`\n"
    );

    for (const line of emulatorLines) {
      const emulatorId = line.split("\t")[0];
      try {
        const version = await getEmulatorAndroidVersion(emulatorId);

        // WDIO-style message
        console.log(`📱 'appium:deviceName': '${emulatorId}'`);
        console.log(`📱 'appium:platformVersion': '${version}'\n\n`);
      } catch (err) {
        console.log(`📱 Could not get version for ${emulatorId}: ${err.message}`);
      }
    }
  });
}

function getEmulatorAndroidVersion(emulatorId) {
  return new Promise((resolve, reject) => {
    const adbShell = spawn(
      "adb",
      ["-s", emulatorId, "shell", "getprop", "ro.build.version.release"],
      { shell: true }
    );

    let version = "";
    adbShell.stdout.on("data", (data) => (version += data.toString()));
    adbShell.stderr.on("data", (data) => (version += data.toString()));

    adbShell.on("close", () => resolve(version.trim()));
    adbShell.on("error", reject);
  });
}

async function main() {
  const { requirements } = config;
  const osType = detectOS();

  console.log(`🔎 Detected OS: ${osType}`);

  const networkOk = await checkNetwork();
  if (!networkOk) {
    console.log("⚠️ Skipping further checks since no network connection.");
    return;
  }

  checkNode(requirements.node.version, requirements.node.download);
  checkJava(requirements.java.version, requirements.java.download);

  if (requirements.androidStudio.required) {
    checkAndroidStudio(requirements.androidStudio.download);
  }

  checkEmulator(requirements.emulator.version, requirements.emulator.download);
  displayEmulatorWDIOInfo();
  if (osType === "macOS") {
    const xcode = await checkXcodeVersion(requirements.xcode.version);
    console.log(xcode.message);
  } else {
    console.log("ℹ️ Xcode check skipped (not macOS).");
  }
}

main();
