# my-app

A React Native reflection journal built with Expo. Write daily reflections by theme, track your streak, and review your journey over time.

## Prerequisites

- **Node.js** (v18 or later recommended)
- **npm** or **yarn**
- **Expo Go** app on your phone (for testing on a physical device), or an iOS/Android simulator

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npm start
   ```

   This opens the Expo dev tools. From there you can:

   - Press **`a`** to open on Android (emulator or device)
   - Press **`i`** to open on iOS simulator
   - Press **`w`** to open in a web browser
   - Or scan the QR code with the **Expo Go** app on your phone (ensure phone and computer are on the same Wi‑Fi)

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm start`    | Start Expo dev server          |
| `npm run android` | Run on Android              |
| `npm run ios`  | Run on iOS simulator           |
| `npm run web`  | Run in the browser             |
| `npm test`     | Run tests                      |

## Example walkthrough

Here’s a typical first run from the project folder:

1. **Open a terminal** in the project directory (`my-app`).

2. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

3. **Start the app**:
   ```bash
   npm start
   ```
   Wait until you see the QR code and “Metro waiting on…” in the terminal.

4. **Open the app** (choose one):
   - **iOS simulator:** Press **`i`** in the terminal. The simulator will launch and load the app.
   - **Android emulator:** Press **`a`** (ensure an Android emulator is already running).
   - **Web:** Press **`w`** to open the app in your default browser.
   - **Phone:** Open Expo Go, scan the QR code, and wait for the bundle to load.

5. **Confirm it works:** You should see the app’s home screen. Edits to the code will hot-reload in the running app.

To stop the dev server, press **`Ctrl+C`** in the terminal.

## Running on a physical device

1. Install **Expo Go** from the App Store (iOS) or Play Store (Android).
2. Run `npm start` and scan the QR code with your phone’s camera (iOS) or with the Expo Go app (Android).
3. Keep your phone and computer on the same Wi‑Fi network.

---

## How to use the app

### First time: onboarding

1. Open the app. You’ll see the **onboarding** screen.
2. Enter your **name** (optional; it’s used in greetings like “Good morning, Alex”).
3. Toggle **“Remind me to reflect”** on or off if you want a daily notification.
4. Tap **“Begin Journey”** to go to the main app.

### Writing a reflection

1. On the **Reflect** tab (home), you’ll see five **themes**: **Patience**, **Gratitude**, **Growth**, **Reflection**, and **Hope**.
2. **Tap a theme** to select it. A random **prompt** appears (e.g. “What small thing are you grateful for right now?”).
3. Tap **“Write”** (or the writing area) to open the writing sheet.
4. Type your reflection in the text area. You’ll see a **word count** as you type.
5. Tap **“Save Reflection”** to save. The draft clears and a new prompt appears so you can write again if you like.
6. Your **streak** (consecutive days with at least one reflection) is shown at the top.

### Viewing your journey

1. Open the **Journey** tab.
2. Use the **filter chips** at the top: **All** or a specific theme (e.g. Gratitude) to see only those reflections.
3. **Tap a reflection card** to open the **detail** view and read the full text and date.

### Growth and Intentions

- **Growth** shows a chart of your reflection activity over time.
- **Intentions** is your settings screen:
  - **Daily reminder** — turn on/off and set the time for a daily reflection reminder.
  - **Dark mode** — switch between light and dark theme.
  - **Reset Journey** — clears all reflections and returns you to onboarding (cannot be undone).
