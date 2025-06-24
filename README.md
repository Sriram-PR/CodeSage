# CodeSage – Your AI-Powered Coding Mentor

**CodeSage** is an AI-driven, multi-agent coding assistant that helps developers write better code, detect bugs, optimize performance, and receive real-time mentorship — all within a seamless development environment.

Whether you're a beginner or a seasoned engineer, CodeSage accelerates your workflow with intelligent feedback, one-click fixes, and contextual AI guidance.

---

## 🚀 Features

- 🔍 **AI Code Review** – Get instant feedback on readability, structure, and best practices.
- 🐞 **Real-Time Bug Detection** – Identify and resolve logic errors and vulnerabilities early.
- ⚙️ **Performance Optimization** – Receive suggestions to improve code speed and maintainability.
- 💬 **AI Chatbot Mentor** – Chat with a context-aware assistant for best practices and explanations.
- ⚡ **One-Click Fixes** – Instantly accept or reject AI-suggested improvements.

---

## 🧠 How It Works

1. **Write Code** in the Monaco editor.
2. **AI Agents Process** the code using the multi-agent CrewAI backend.
3. **Receive Insights**:
   - Code review feedback
   - Bug and security analysis
   - Performance optimization suggestions
4. **Apply Fixes** with a single click.
5. **Ask Questions** to the Gemini-powered chatbot mentor for guidance.

---

## 🛠️ Tech Stack

- **AI Models**: Gemini 2.0 family via OpenRouter
- **Frontend**: Next.js, Tailwind CSS, shadcn/ui
- **Backend**: CrewAI (multi-agent framework), FastAPI, Judge0
- **Editor**: Monaco Editor
- **Deployment**: Vercel

---

## 📦 Getting Started

### 1. Fork the Repository

Fork and clone the repo from [github.com/avinashv4/CodeSage](https://github.com/avinashv4/CodeSage)

```bash
git clone https://github.com/avinashv4/CodeSage.git
cd CodeSage
```

### 🔐 Environment Variables

Create a `.env` file in **both the `frontend` and `backend` folders** with the following variables:

#### `frontend/.env`

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
```
#### `backend/.env`

```env
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```
### 2. Backend Setup
```bash
cd backend
uv venv  # create a virtual environment using uv
source .venv/bin/activate  # or use the appropriate command for your OS
uv pip install -r requirements.txt
uvicorn main:app --reload  # runs FastAPI server
```
### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Your app should now be running locally at:

Frontend → http://localhost:3000

Backend API → http://localhost:8000

---

## 🤝 Contributing

Contributions are welcome! If you'd like to fix a bug, suggest a feature, or contribute improvements, please open an issue or submit a pull request.

---
