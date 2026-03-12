# 🧠 StudIQ — AI-Powered Personalized Learning Platform

> A gamified learning platform combining **AI tutoring, adaptive quizzes, and skill progression** to make learning interactive and engaging.

---

# 🌟 Overview

**StudIQ** is a full-stack AI learning platform where users can:

* Learn topics through an **AI Tutor**
* Solve **quests (coding/knowledge challenges)**
* Take **adaptive quizzes**
* Track **learning progress**
* Earn **XP, badges, and streaks**

The platform gamifies education by introducing **levels, worlds, and leaderboards**, making studying more engaging and motivating.

---

# 🎯 Key Features

### 🤖 AI Tutor

* Interactive AI chat assistant
* Explains concepts
* Generates practice questions
* Saves chat history

### 🧪 Adaptive Quiz System

* AI-generated quizzes
* Difficulty adjusts based on performance
* XP rewards for good scores

### 🎮 Gamified Learning

* XP system
* Level progression
* Unlockable worlds
* Achievement badges
* Study streaks

### 📈 Progress Tracking

* Topic-wise analytics
* Quiz history
* Learning insights

### 🏆 Leaderboard

* Global ranking of learners
* Based on total XP

### 🎙️ Voice Input

* Ask questions using speech
* Uses Web Speech API

---

# 🏗️ Project Architecture

```
studiq/
│
├── backend/                # Node.js + Express API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/               # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   └── index.html
│
└── README.md
```

---

# 🛠️ Tech Stack

| Layer          | Technology                |
| -------------- | ------------------------- |
| Frontend       | React 18 + Vite           |
| Styling        | Tailwind CSS              |
| Animations     | Framer Motion             |
| Backend        | Node.js + Express         |
| Database       | MongoDB Atlas             |
| Authentication | JWT + bcrypt              |
| AI Integration | Anthropic Claude API      |
| API Client     | Axios                     |
| Deployment     | Vercel / Render / Railway |

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/studiq.git
cd studiq
```

---

# 2️⃣ Install Dependencies

Install dependencies for **backend and frontend**.

```bash
npm install
cd backend
npm install

cd ../frontend
npm install
```

---

# 3️⃣ Setup Environment Variables

Create `.env` file inside **backend** folder.

```
backend/.env
```

Add the following variables:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

ANTHROPIC_API_KEY=your_anthropic_api_key

CLIENT_URL=http://localhost:5173
```

---

Create `.env` file inside **frontend** folder.

```
frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 4️⃣ Run the Project

Start **backend server**:

```bash
cd backend
npm run dev
```

Backend will run on:

```
http://localhost:5000
```

---

Start **frontend**:

```bash
cd frontend
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

Open in browser:

```
http://localhost:5173
```

---

# 🗄️ Database Schema

## Users Collection

```
name
email
password
level
totalXp
points
badges[]
streak
longestStreak
lastStudiedAt
currentDifficulty
solvedChallenges[]
studiedTopics[]
```

---

## QuizResults Collection

```
userId
topic
difficulty
score
totalQuestions
percentage
xpEarned
timeTakenSeconds
adaptiveDifficultyNext
```

---

## Progress Collection

```
userId
topic
progressPercentage
averageScore
quizzesTaken
totalXpInTopic
sessionsCount
```

---

## ChatSessions Collection

```
userId
topic
title
messages[]
xpEarned
messageCount
```

---

# 🔌 API Endpoints

| Method | Endpoint              | Description           |
| ------ | --------------------- | --------------------- |
| POST   | /api/auth/register    | Register new user     |
| POST   | /api/auth/login       | Login user            |
| GET    | /api/auth/me          | Get current user      |
| PUT    | /api/users/profile    | Update profile        |
| POST   | /api/users/xp         | Add XP                |
| POST   | /api/users/badge      | Unlock badge          |
| POST   | /api/users/solve      | Mark challenge solved |
| GET    | /api/users/stats      | Get user stats        |
| POST   | /api/ai/chat          | Send AI message       |
| POST   | /api/ai/generate-quiz | Generate quiz         |
| POST   | /api/ai/explain       | Get explanation       |
| GET    | /api/quiz/history     | Quiz history          |
| GET    | /api/progress         | Topic progress        |
| GET    | /api/leaderboard      | Top learners          |

---

# 🚀 Deployment

### Frontend

Deploy using:

* Vercel
* Netlify

Build command:

```
npm run build
```

Output directory:

```
dist
```

---

### Backend

Deploy using:

* Render
* Railway
* Heroku

Start command:

```
node server.js
```

---

# 📸 Screenshots

*(Add screenshots here once UI is ready)*

Example sections:

* Landing Page
* Dashboard
* Quiz Mode
* AI Tutor Chat
* Leaderboard

---

# 📜 License

MIT License

---

# ⭐ Support

If you found this project useful:

⭐ Star this repository
🍴 Fork the project
🚀 Contribute improvements
