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

## Customization

### Update school information
Edit `src/schoolContext.js` to add, remove, or update any school details.

### Change the Gemini model
In `src/geminiService.js`, change the model in `API_URL`:
- `gemini-2.0-flash` (default, fast & free)
- `gemini-1.5-pro` (more capable, slower)

### Update quick-reply chips
In `src/App.js`, edit the `SUGGESTIONS` array at the top.

## Built With
- [React](https://reactjs.org/)
- [Google Gemini API](https://aistudio.google.com/)
- [react-markdown](https://github.com/remarkjs/react-markdown)
