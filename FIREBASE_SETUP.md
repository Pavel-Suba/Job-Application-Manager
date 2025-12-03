# Firebase Setup Instructions

Follow these steps to set up your Firebase project and enable Google Authentication.

## 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** (or "Create a project").
3. Enter a project name (e.g., `job-application-manager`).
4. You can disable Google Analytics for this project to keep it simple.
5. Click **"Create project"**.

## 2. Register Your App (Web)
1. Once your project is ready, you'll be on the project overview page.
2. Click the **Web icon** (`</>`) to add a web app.
3. Enter an app nickname (e.g., `Job Manager Web`).
4. (Optional) Check "Also set up Firebase Hosting" if you plan to deploy it later (we can do this later too).
5. Click **"Register app"**.
6. **IMPORTANT:** You will see your `firebaseConfig` object. **Copy this code block** or keep the tab open. We will need these keys to connect our React app.

## 3. Enable Authentication
1. In the left sidebar, click on **"Build"** -> **"Authentication"**.
2. Click **"Get started"**.
3. In the "Sign-in method" tab, select **"Google"**.
4. Click **"Enable"**.
5. Select a **Project support email** from the dropdown.
6. Click **"Save"**.

## 4. Enable Firestore Database
1. In the left sidebar, click on **"Build"** -> **"Firestore Database"**.
2. Click **"Create database"**.
3. Choose a location (e.g., `eur3` for Europe or `nam5` for US).
4. Start in **Test mode** (this allows read/write access for 30 days, which is easier for development).
5. Click **"Create"**.

## 5. Enable Storage (for CVs)
1. In the left sidebar, click on **"Build"** -> **"Storage"**.
2. Click **"Get started"**.
3. Start in **Test mode**.
4. Click **"Done"**.

---

## Next Steps for Us
Once you have done this, please share the `firebaseConfig` object with me (or paste it into a file named `src/firebase.js`). It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```
