# Push notifications

## Setup push notifications

### Android API Configuration
1. Log in at [console.developers.google.com](https://console.developers.google.com)
2. Create a project
3. From the Dashboard, select "Use API"
4. Select "Cloud Messaging for Android" from the "Mobile APIs" section
5. Click "Enable API"

After completing the server side, follow these steps
1. Navigate to [Google Developers Portal](https://developers.google.com/mobile/add?platform=android)
2. Select your App's Name, enter the android package name EXACTLY as the "id" in your cordova config.xml
3. Select "CONTINUE TO Choose and configure services arrow_forward"
4. Select "Cloud Messaging", and Enable Cloud messaging
5. You will now see the Server API key - This should be configured on the Synthesis Server ("google.api.key")
6. And the "Sender ID" which must be configured on the mobile app (SynthConfig.androidSenderID)
7. You do not have to continue with the wizard, a config file is not required.

### iOS Server Certificates
(You'll have to do these steps on a Mac)

1. Log in at [Apple Developer Portal](https://developer.apple.com)
2. Click on "App IDs" at "Identifiers" on the left navigation
3. Click on the App ID for your application.
4. Check that "Push Notifications" are enabled,
 1 if not, select edit, and tick the "Push Notifications" box
 2. Select Create certificate for development
 3. Follow the prompts to create the certificate, save all files generated and downloaded in the "keys" directory of the project. Use the "ios-dev" or "ios-prod" directories depending on the environment you are creating it for.
  User email: Any email address (preferably your own)
  Common name: Synthesis Push Development|Production
  Request is: Saved to disk
 4. From your keystore, export the private key, of the key you just created (Apple Push Services: \<app id\>) -\> \<app name\> Push [Development|Production]. Export as .12 and save as "SynthesisMobile.p12" in the "keys" (ios-dev or ios-prod) directory of this project. Leave the password blank. This file will be saved as Certificates.p12
5. Now that you have all the keys, use the create_keys.sh script in the "keys" directory to generate the server key for you navigate the "keys" directory and execute `./createKeys.sh`
 (You might have to rename some files for the script to work)
6. Once done, you will have a "SynthesisMobile-development-server.p12" file which must be placed on the Synthesis Server
7. Configure
 * `push.apple.key.file=file:///opt/synthesis_home/SynthesisMobile-development-server.p12`
 * `push.apple.key.passphrase=<your password>`
