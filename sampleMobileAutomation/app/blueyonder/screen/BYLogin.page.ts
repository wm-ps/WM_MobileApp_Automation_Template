import { Text } from 'react-native';
const MAX_TIMEOUT = 60000;

class Login {
    // ===== Title Verification =====
    getLoginPageTitle = async () => {
        console.log('📱 Getting login page title...');
        const title = await $('~label2_caption').getText();
        console.log(`✅ Login page title retrieved: "${title}"`);
        return title;
    };

    assertLoginPageTitleVisibility = async () => {
        console.log('👁️  Waiting for login page title to be displayed...');
        await $('~label2_caption').waitForDisplayed({ timeout: MAX_TIMEOUT });
        console.log('✅ Login page title is now visible');
    };

    verifyLoginPageTitle = async () => {
        console.log('🔍 Verifying login page title...');
        await this.assertLoginPageTitleVisibility();
        const actualTitle = await this.getLoginPageTitle();
        const expectedTitle = "abczxp";
        console.log(`🔄 Comparing titles - Expected: "${expectedTitle}", Actual: "${actualTitle}"`);
        await expect(actualTitle).toEqual(expectedTitle);
        console.log('✅ Login page title verification completed successfully');
    };

    // ===== Realm Login Flow =====
    selectRealm = async () => {
        console.log('👁️  Waiting for "Enter your realm" input field...');
    
        // Locate the first EditText
        const realmInput = await driver.$('android.widget.EditText');
        await realmInput.waitForDisplayed({ timeout: MAX_TIMEOUT });
        console.log('✅ Realm input field is visible');
    
        // Clear and enter realm name
        const signInName = "by-realm";
        console.log(`⌨️  Entering realm: ${signInName}`);
        await realmInput.clearValue();
        await realmInput.addValue(signInName);
        console.log('✅ Realm entered successfully');
    
        // Continue button
        console.log('👆 Clicking Continue button...');
        const continueBtn = await driver.$('//android.widget.Button[@text="Continue"]'); // accessibility id
        await continueBtn.waitForDisplayed({ timeout: MAX_TIMEOUT });
        await continueBtn.click();
        console.log('✅ Continue button clicked');

        console.log('👁️  Waiting for "Sign in with" button...');
        const signInBtn = await driver.$('android=new UiSelector().textContains("Sign in with")');
        await signInBtn.waitForDisplayed({ timeout: MAX_TIMEOUT });
        console.log('✅ "Sign in with" button is visible');

        console.log('👆 Clicking on "Sign in with" button...');
        await signInBtn.click();
        console.log('✅ "Sign in with" button clicked');
    };

    clickSignIn = async () => {
        console.log('👆 Clicking on Sign In button...');
        const el7 = await $('~buttonSignIn_a');
        await el7.waitForDisplayed({ timeout: MAX_TIMEOUT });
        await el7.click();
        console.log('✅ Sign In button clicked successfully');
    };

    enterUsername = async (username: string) => {
        console.log(`⌨️  Entering username: ${username}`);
        const el11 = await $("-android uiautomator:new UiSelector().resourceId(\"signInName\")");
        await el11.waitForDisplayed({ timeout: MAX_TIMEOUT });
        await el11.clearValue();
        await el11.addValue(username);
        console.log('✅ Username entered successfully');
    };

    enterPassword = async (password: string) => {
        console.log(`⌨️  Entering password: ${'*'.repeat(password.length)}`);
        const el12 = await $("-android uiautomator:new UiSelector().resourceId(\"password\")");
        await el12.waitForDisplayed({ timeout: MAX_TIMEOUT });
        await el12.clearValue();
        await el12.addValue(password);
        console.log('✅ Password entered successfully');
    };

    clickNext = async () => {
        console.log('👆 Clicking Next...');
        const el13 = await $("-android uiautomator:new UiSelector().resourceId(\"next\")");
        await el13.waitForDisplayed({ timeout: MAX_TIMEOUT });
        await el13.click();
        console.log('✅ Next button clicked');

    };

    selectProfile = async () => {
        console.log('👆 Selecting profile (JS)...');
        const el14 = await $("-android uiautomator:new UiSelector().text(\"JS\")");
        await el14.waitForDisplayed({ timeout: MAX_TIMEOUT });
        await el14.click();
        console.log('✅ Profile selected');
    };

    clickSignOut = async () => {
        console.log('👆 Clicking Sign Out button...');
        const el15 = await $('~signOutButton_caption');
        await el15.waitForDisplayed({ timeout: MAX_TIMEOUT });
        await el15.click();
        console.log('✅ Sign Out button clicked');
    };

    // ===== Full Flows =====
    fullLoginFlow = async (realm: string, username: string, password: string) => {
        console.log('🚀 Starting full realm login flow...');
        await this.selectRealm();
        await this.clickSignIn();
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickNext();
        await this.selectProfile();
        console.log('✅ Login flow completed');
    };

    fullLogoutFlow = async () => {
        console.log('🚀 Starting logout flow...');
        await this.clickSignOut();
        console.log('✅ Logout flow completed');
    };
}

export default new Login();
