# WM Mobile App Automation Template

A Node utility that:  
- Checks **system dependencies** like Node.js, Java, Android Studio, and Emulator versions against `config.js`.  
- Runs a **sample login scenario test case** to validate environment setup.  
- Displays a **test execution report**.  

---

## 📦 Project Details  
- **Name:** WM_MobileApp_Automation_Template
- **Version:** 1.0.0

---

## 🚀 Features  
- Verify required software versions (Node, Java, Android Studio, Emulator).  
- Run sample automated tests (login scenario).  
- Generate and display test reports.  
- Easy CLI commands with clear log messages.  

---

## 📂 Project Structure  

```text
WM_MobileApp_Automation_Template/
│
├── sampleMobileAutomation # Automation test cases
├── main.js                # Entry script for system checks 
├── runSampleTestcase.js   # Executes sample login test
├── config.js              # Defines required versions
├── package.json
└── README.md
```
## <img width="28" height="28" alt="image" src="https://github.com/user-attachments/assets/4b19e121-abde-4a82-9458-368339b56834" /> Download the APK

Download the APK from [here](https://drive.google.com/file/d/1r3d6hFYZuzL3X6FIjGhEaP2KdODejx6h) and place it in the following folder in the project:sampleMobileAutomation

## <img width="28" height="28" alt="image" src="https://github.com/user-attachments/assets/8247da5b-6abf-4a2e-9e52-34656c3d9714" /> Configure Testing Device

Open folder `samplemobileautomation/wdio.conf.ts` and navigate to **line 71**, under the `capabilities` section.

Update the following values according to your testing device/emulator:

```ts
'appium:deviceName': 'emulator-5554',
'appium:platformVersion': '14.0',
```

## <img width="28" height="28" alt="image" src="https://github.com/user-attachments/assets/614612f2-e25a-4a43-8e41-c528574ac022" /> Installation  

Clone this repository and install dependencies:  

```bash
git clone https://github.com/wm-ps/WM_MobileApp_Automation_Template.git
cd WM_MobileApp_Automation_Template
npm install
```
## <img width="28" height="28" alt="image" src="https://github.com/user-attachments/assets/2fa26ff1-98f9-4299-bd7f-71987b10c492" /> Install the App in Emulator

Install the downloaded APK in your emulator

## 🛠️ Usage  

After installation, the following commands are available:  

### 🔍 Run System Check  
Checks installed versions against requirements defined in `config.js`.  

```bash
npm run system-check
```

### 🧪 Execute Sample Test Case  
Runs a sample **login scenario test case**.  

```bash
npm run execute-test
```

### 📊 Show Test Report  
Displays the saved test report from the sample test run.  

```bash
npm run show-test-report
```
