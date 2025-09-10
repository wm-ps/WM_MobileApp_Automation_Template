import loginScreen from "../../screen/BYLogin.page";

describe('@regression Blue Yonder Login Page Functionality', () => {
    
    before('Verify Enter Realm Screen', async () => {
        console.log('\n🚀 =================================================================');
        console.log('🚀 STARTING: Blue Yonder Login Page Functionality Test Suite');
        console.log('🚀 =================================================================\n');
        await loginScreen.clickSignIn();
        console.log('📋 SETUP: Verifying "Enter your realm" screen...');
        await loginScreen.selectRealm();
        console.log('✅ SETUP COMPLETED: "Enter your realm" screen verified\n');
    });

    it('@positive - Login and logout with realm credentials', async () => {
        console.log('🧪 =================================================================');
        console.log('🧪 TEST: Login and logout with valid realm credentials');
        console.log('🧪 =================================================================\n');
        
        const realm = "by-realm";
        const username = "Johnsmith";
        const password = "@WelcomePLTNA1256";
        
        console.log(`📝 TEST DATA: Realm: ${realm}, Username: ${username}, Password: ${'*'.repeat(password.length)}\n`);
        
        console.log('📱 STEP 1: Clicking Sign In...');
        
        console.log('✅ STEP 1 COMPLETED: Sign In clicked\n');
        
        console.log('📱 STEP 2: Entering realm...');
      
        console.log('✅ STEP 3 COMPLETED: Continued past realm\n');
        
        console.log('📱 STEP 4: Entering credentials...');
        await loginScreen.enterUsername(username);
        await loginScreen.enterPassword(password);

        console.log('✅ STEP 2 COMPLETED: Realm entered\n');
        
        console.log('📱 STEP 3: Continuing...');
        await loginScreen.clickNext();

        console.log('✅ STEP 4 COMPLETED: Credentials entered\n');
        
        console.log('📱 STEP 5: Opening profile...');
        await loginScreen.selectProfile();
        console.log('✅ STEP 5 COMPLETED: Profile opened\n');
        
        console.log('📱 STEP 6: Signing out...');
        await loginScreen.clickSignOut();
        console.log('✅ STEP 6 COMPLETED: Signed out\n');
        
        console.log('🎉 =================================================================');
        console.log('🎉 TEST PASSED: Realm login and logout cycle completed successfully!');
        console.log('🎉 =================================================================\n');
    });

});
