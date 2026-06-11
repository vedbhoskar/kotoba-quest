# 🇯🇵 Kotoba Quest

A modern Japanese vocabulary flashcard application built with **Expo, React Native, and TypeScript**.

Kotoba Quest helps learners practice Japanese vocabulary using interactive flashcard sessions. The app uses a structured JLPT vocabulary dataset organized by lessons and provides an adaptive review system where incorrectly answered words are repeated until the learner masters the complete set.

The application is built with a single codebase and runs on **Android and Web**.

---

## 📚 About the Project

The vocabulary dataset is based on the JLPT N5 syllabus and is organized chapter-wise. Each vocabulary entry contains:

* Japanese writing (Kanji, Hiragana, or Katakana)
* Reading in Hiragana
* Romaji transcription
* English meanings
* Additional metadata such as verb groups when available

Users can create custom study sessions by selecting:

* A single chapter
* Multiple chapters
* The entire vocabulary dataset

During a session, the application displays Japanese words as flashcards. The user reveals the answer, checks whether they remembered it correctly, and the application adapts the session based on their performance.

Words marked as incorrect are placed back into the review queue and appear again naturally later in the session. A session only ends once all selected vocabulary has been answered correctly.

---
## 📲 Download APK

The latest Android APK is available from the GitHub Releases page.

➡️ https://github.com/vedbhoskar/kotoba-quest/releases
---

## 🎮 How to Use

### 1. Select a Study Set

Choose the vocabulary you want to study:

* Individual lessons
* Multiple lessons
* Complete JLPT level

The application displays the total number of words before starting.

---

### 2. Start Flashcard Session

Each card initially displays:

```
Japanese Word
```

Tap the card to reveal:

```
Reading (Hiragana)
Romaji
English Meaning
```

---

### 3. Mark Your Response

After reviewing the answer, select:

* ✅ **Got It** — The word is considered learned for the current session.
* ❌ **Review Again** — The word is added back into the queue and will appear again later.

---

### 4. Complete the Session

At the end of the session, the application provides statistics such as:

* Total words studied
* Correct answers
* Incorrect attempts
* Accuracy percentage
* Time spent
* XP and points earned

All progress and session history are stored locally on the device.

---

## 🛠 Technology Stack

### Frontend

* Expo
* React Native
* TypeScript
* Expo Router

### UI & Animation

* NativeWind (Tailwind CSS for React Native)
* React Native Reanimated
* React Native Gesture Handler
* Moti

### State Management

* Zustand

### Data Storage

* MMKV / Async Storage for local data persistence
* Static JSON files for vocabulary datasets

---

## 📂 Dataset Structure

The vocabulary is stored in JSON format.

Example:

```json
{
  "id": "N5-L14-001",
  "japanese": "消します",
  "reading": "けします",
  "romaji": "keshimasu",
  "meaning": [
    "turn off"
  ],
  "verb_group": "I"
}
```

---

## 🏗 Project Structure

```
kotoba-quest/
│
├── app/             # Application routes and screens
├── components/      # Reusable UI components
├── data/            # Vocabulary JSON datasets
├── store/           # Zustand stores
├── hooks/           # Custom React hooks
├── utils/           # Helper functions
├── types/           # TypeScript interfaces
├── assets/          # Fonts, images and icons
│
└── README.md
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/vedbhoskar/kotoba-quest.git
```

### Move into the project directory

```bash
cd kotoba-quest
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npx expo start
```

---

## 📱 Running the Application

### Android

Install the Expo Go application on your Android device and scan the QR code displayed in the terminal.

You can also build an APK using Expo EAS Build.

---

### Web

Run:

```bash
npm run web
```

The application will open in your browser.

---

## 💾 Local Data

Kotoba Quest follows an offline-first approach.

The following data is stored locally:

* Learning history
* Session statistics
* XP and points
* User progress
* Weak vocabulary tracking

No account, login, or internet connection is required to use the application.

---

## 👨‍💻 Developer

Developed by **Ved Bhoskar**

Email: [vedbhoskar7@gmail.com](mailto:vedbhoskar7@gmail.com)

---

## 📜 License

This project is created for educational and personal learning purposes.

© Ved Bhoskar. All Rights Reserved.
