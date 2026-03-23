# PNHS-Main Chatbot 🏫

A custom AI-powered chatbot for **Parañaque National High School – Main**, built with React and the Google Gemini API.

---

## Features
- Answers questions about enrollment, SHS strands, facilities, clubs, contacts, and more
- Powered by **Google Gemini 2.0 Flash** via Google AI Studio
- Clean, professional UI with PNHS school colors (navy & gold)
- Supports both **English and Filipino** responses
- Quick-reply suggestion chips for common questions
- Typing indicator while fetching responses
- Fully responsive for mobile and desktop

---

## Setup & Installation

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Gemini API key
Create a `.env` file in the root folder (one already exists as a template):
```
REACT_APP_GEMINI_API_KEY=your_actual_api_key_here
```

Get your free API key at: https://aistudio.google.com/app/apikey

### 3. Run the app locally
```bash
npm start
```
The app will open at `http://localhost:3000`

### 4. Build for production
```bash
npm run build
```
This creates an optimized `build/` folder you can deploy to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

---

## Project Structure
```
pnhs-chatbot/
├── public/
│   └── index.html          # HTML entry point
├── src/
│   ├── App.js              # Main chatbot UI component
│   ├── geminiService.js    # Gemini API integration
│   ├── schoolContext.js    # PNHS-Main knowledge base / system prompt
│   ├── index.js            # React entry point
│   └── index.css           # Global styles & CSS variables
├── .env                    # API key (do NOT commit to git)
├── package.json
└── README.md
```

---

## Customization

### Update school information
Edit `src/schoolContext.js` to add, remove, or update any school details.

### Change the Gemini model
In `src/geminiService.js`, change the model in `API_URL`:
- `gemini-2.0-flash` (default, fast & free)
- `gemini-1.5-pro` (more capable, slower)

### Update quick-reply chips
In `src/App.js`, edit the `SUGGESTIONS` array at the top.

---

## Security Note
⚠️ Never commit your `.env` file or expose your API key in public repositories.
Add `.env` to your `.gitignore` file.

---

## Built With
- [React](https://reactjs.org/)
- [Google Gemini API](https://aistudio.google.com/)
- [react-markdown](https://github.com/remarkjs/react-markdown)
