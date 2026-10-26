# FoodieNoms

FoodieNoms connects students with discounted surplus food from nearby vendors. This repository packages the web app as Android and iOS apps using Capacitor.

## Project structure

- `www/` — HTML, CSS, JavaScript, and assets used by the app. Make interface changes here.
- `android/` — Android Studio project.
- `ios/` — Xcode project (available in the GitHub repository).
- `capacitor.config.json` — App configuration; the web source directory is `www`.
- `firestore.rules` — Firebase Firestore security rules.

App name: **FoodieNoms**. Application ID: `com.foodienoms.app`.

The app requires an internet connection for Firebase services and online fonts.

## Prerequisites

- Git.
- Node.js 22 or later and npm, for Capacitor 8.
- Android: [Android Studio](https://developer.android.com/studio) and its required Android SDK components. Use the IDE's bundled JDK.
- iOS: a Mac with a Capacitor 8-compatible Xcode installation and iOS platform components, plus an Apple account for device signing.

## Get started

```bash
git clone https://github.com/zed1902209846-dotcom/FoodieNoms.git
cd FoodieNoms
npm ci
```

Run the following commands from the project root, where `package.json` is located. If you already have a local copy, open a terminal in that folder instead.

The web app lives directly in `www/`; no separate frontend build command is needed.

## Run on Android

1. Install Android Studio and complete its SDK setup wizard.
2. Enable developer options on your phone by tapping **Build number** seven times. On Samsung phones, this is under **Settings → About phone → Software information**.
3. Enable **USB debugging** in Developer options.
4. Run:

   ```bash
   npm run android
   ```

   This synchronizes the web files and opens Android Studio.

5. Wait for Gradle synchronization to finish.
6. Connect the phone using a USB data cable and approve the USB debugging prompt.
7. Select the phone in Android Studio and click **Run ▶**.

To use an emulator, create a virtual device in Android Studio's **Device Manager**, then select it before running the app.

### Build an APK for testing

Use Android Studio's **Build** menu to generate an APK. Menu wording varies by Android Studio version. The default debug APK is generated at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Transfer the APK to a test phone and allow installation from that source when prompted. For store distribution, generate a signed release build instead.

## Run on iPhone

iOS builds require macOS and Xcode.

1. Install and open Xcode, accept its license, and install the required iOS platform components.
2. If needed, select the Xcode developer directory:

   ```bash
   sudo xcode-select -s /Applications/Xcode.app
   ```

3. Add your Apple account under **Xcode → Settings → Accounts**.
4. From the project root, run:

   ```bash
   npm run ios
   ```

   This synchronizes the web files and opens Xcode. Wait for package dependencies to resolve.

5. Select the **App** target, open **Signing & Capabilities**, enable **Automatically manage signing**, and choose your team. If the bundle identifier is unavailable, use a unique identifier and keep the Capacitor and native project configuration consistent.
6. Connect the iPhone to the Mac and approve **Trust This Computer**.
7. Enable **Developer Mode** under **Settings → Privacy & Security** if required, then restart and confirm. If the option is missing, first let Xcode recognize the device.
8. Select the iPhone in Xcode and click **Run ▶**.
9. If prompted to trust the developer, open **Settings → General → VPN & Device Management** on the iPhone and trust the development profile.

### Free Apple account limitations

Personal Team provisioning generally expires after seven days; rebuild and reinstall from Xcode to renew it. Free accounts also have device and app limits. TestFlight and App Store distribution require Apple Developer Program membership.

## Update an installed app

After editing files in `www/`, synchronize the appropriate native project:

**Android**

```bash
npx cap sync android
```

**iOS (on a Mac)**

```bash
npx cap sync ios
```

Then click **Run ▶** in Android Studio or Xcode to rebuild and install. Running `npm run android` or `npm run ios` also synchronizes files before opening the IDE.

You normally do not need to uninstall the previous app when the application ID and signing identity match. Uninstalling clears local app data. Synchronizing alone does not update the app already installed on a phone.

Do not edit generated web copies in `android/app/src/main/assets/public/` or `ios/App/App/public/`; edit `www/` and synchronize instead.

## Test accounts

Ask a project team member for test credentials or register a new account in the app. Do not commit account passwords to the repository.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Blank screen or loading never finishes | Check the phone's internet connection and inspect WebView or device logs. |
| Login fails | Confirm that Email/Password sign-in is enabled in Firebase Authentication and verify the account credentials. |
| Changes do not appear on the phone | Run `npx cap sync android` or `npx cap sync ios`, then rebuild and reinstall using the IDE. |
| Android phone is not listed | Check the USB cable, USB debugging authorization, and any required Windows device driver. |
| Android installation reports a signature mismatch | Use the same signing key as the installed version. If reinstalling requires uninstalling, local app data will be lost. |
| iPhone development build stops opening | Check provisioning expiration, signing settings, Developer Mode, and developer trust. |

## Work across computers with GitHub

Repository: [zed1902209846-dotcom/FoodieNoms](https://github.com/zed1902209846-dotcom/FoodieNoms)

1. Clone the repository on each computer using Git or GitHub Desktop and run `npm ci`.
2. Pull the latest changes before starting work. Commit or stash existing local changes first when necessary.
3. Edit the source files, review your changes, then commit and push.
4. On the other computer, pull the changes and run `npm ci` if dependencies changed.
5. Run `npx cap sync android` on the Android development machine or `npx cap sync ios` on the Mac, then rebuild and install.

For interface work, use `www/` as the source of truth rather than the generated native web assets.
