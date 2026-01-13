# 🟢 Nyonnyola — Web Prototype

A lightweight, fun word-guessing game prototype built with React (Vite), designed for local hotseat play in small groups in Uganda.

---

## Features

* 🕹 **Local Multiplayer** – Play with friends on the same device
* 📝 **Custom Word Lists** – Use Ugandan words/slang for a local experience
* 📊 **Score Tracking** – Track player scores and rounds
* 🎨 **Minimal, Lightweight Design** – Fast and responsive
* 🔐 **Optional Firebase Authentication** – Enable email/password login for players

---

## Tech Stack

* **Framework**: React 18 with Vite
* **Language**: JavaScript (can be converted to TypeScript)
* **Styling**: Minimal CSS (`src/styles.css`)
* **Data**: Local JSON file (`src/data/words.json`)
* **Optional Backend**: Firebase (for authentication)

---

## Getting Started

1. Navigate to the project folder:

```powershell
cd "c:\Users\david\OneDrive\Desktop\WORK-APPLICATION\NYONNYOLA"
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open the URL printed by Vite (usually [http://localhost:5173](http://localhost:5173)) in your browser.

---

## Environment Variables (Optional - Firebase Auth)

To enable Firebase email/password authentication:

1. Install the Firebase SDK:

```bash
npm install firebase
```

2. Create a `.env` file in the project root with **VITE-prefixed variables**:

```text
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

3. Restart the dev server.
4. Use the Sign In button in the header to create accounts.

> ⚠ **Important:** Never commit your `.env` file to GitHub.

---

## Project Structure

```
NYONNYOLA/
├── src/
│   ├── components/       # Player setup, Lobby, GameScreen, Scoreboard, WordManager
│   ├── data/             # Sample words JSON (words.json)
│   └── styles.css        # Minimal styling
├── index.html
├── package.json
├── vite.config.js
└── .env                 # Firebase keys (optional, never commit)
```

---

## Next Steps / To-Do

* Add persistence (localStorage) for custom words and scores
* Add animations and sounds
* Enable multiplayer over local network (WebRTC / WebSocket)
* Convert project to TypeScript for better type safety

---

## License

MIT

---

