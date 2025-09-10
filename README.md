# Preflight Automation Checker  

A Node utility that:  
- Checks **system dependencies** like Node.js, Java, Android Studio, and Emulator versions against `config.js`.  
- Runs a **sample login scenario test case** to validate environment setup.  
- Displays a **test execution report**.  

---

## 📦 Project Details  
- **Name:** preflight-automation-checker  
- **Version:** 1.0.0  
- **Author:** Vara Sharma  
- **License:** MIT  

---

## 🚀 Features  
- Verify required software versions (Node, Java, Android Studio, Emulator).  
- Run sample automated tests (login scenario).  
- Generate and display test reports.  
- Easy CLI commands with clear log messages.  

---

## 📂 Project Structure  

```text
system-requirements-checker/
│
├── main.js                # Entry script for system checks 
├── runSampleTestcase.js   # Executes sample login test (automation test cases are inside sampleMobileAutomation folder)
├── config.js              # Defines required versions
├── package.json
└── README.md
```
## Download the APK

Download the APK from [here](https://drive.google.com/file/d/1r3d6hFYZuzL3X6FIjGhEaP2KdODejx6h) and place it in the following folder in the project:sampleMobileAutomation

## Configure Testing Device

Open folder `samplemobileautomation/wdio.conf.ts` and navigate to **line 71**, under the `capabilities` section.

Update the following values according to your testing device/emulator:

```ts
'appium:deviceName': 'emulator-5554',
'appium:platformVersion': '14.0',
```


## ⚙️ Installation  

Clone this repository and install dependencies:  

```bash
git clone https://github.com/<your-username>/system-requirements-checker.git
cd system-requirements-checker
npm install
```

## 🛠️ Usage  

After installation, the following commands are available:  

### 🔍 Run System Check  
Checks installed versions against requirements defined in `config.js`.  

```bash
npm run systemCheck
```

### 🧪 Execute Sample Test Case  
Runs a sample **login scenario test case**.  

```bash
npm run executeSampleTest
```

### 📊 Show Test Report  
Displays the saved test report from the sample test run.  

```bash
npm run showTestReport
```
