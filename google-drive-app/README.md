

## Google Drive App

A simple **Vue + Node.js** application that allows you to:

- **Authenticate** with Google Drive  
- **View, edit, and delete** your Drive files  
- **Chat** with an AI assistant about your Drive file metadata  

---

## Features

1. **Google OAuth**  
   - Securely log in to your Google Drive.  
   - Uses OAuth2 to obtain the necessary tokens for file operations.  

2. **File Management**  
   - Fetch file details (name, size, modified date).  
   - Rename or delete files.  
   - View files directly in Google Drive.

3. **AI Chat**  
   - Ask questions like “Which file is the largest?” or “Which file was modified most recently?”  
   - Powered by **Groq** (or a supported OpenAI model, such as `gpt-3.5-turbo` or `gpt-4`).  

4. **Responsive UI**  
   - A landing page that shows **"Connect to Google Drive"** only if you are not authenticated.  
   - A **side navbar** with hover animations for quick navigation.  
   - A **floating AI chat button** that slides in from the right.

---

## Working Process

1. **OAuth Setup**  
   - Created an **OAuth2 client** for Google Drive.  
   - Obtained **Google Client ID** and **Client Secret** from the Google Cloud Console.  
   - Implemented `/auth/google` and `/auth/callback` routes to handle login and store tokens in session.

2. **AI Provider Choice**  
   - Explored using **OpenAI** but considered usage limits and costs.  
   - Decided to use **Groq** as a free alternative for AI chat.  
   - Updated the `/chat` route to send prompts to Groq’s API.

3. **Tailwind CSS Consideration**  
   - Initially used **Tailwind** for rapid styling.  
   - Found the project was small enough for **plain CSS** to suffice, so removed Tailwind.

4. **UI Enhancements**  
   - Created a **sliding chat panel** from the right, inspired by a CodePen example.  
   - Adopted a **side navbar** with hover animation.  
   - Focused on a clean, modern look without overcomplicating.

5. **Final Integration**  
   - Combined **Google Drive file management** and **AI chat** in one cohesive UI.  
   - Tested file CRUD operations and chat responses thoroughly.

---

## Project Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```
2. **Run in Development**
   ```bash
   pnpm run serve
   ```
3. **Build for Production**
   ```bash
   pnpm run build
   ```
4. **Lint and Fix Files**
   ```bash
   pnpm run lint
   ```

---

## Configuration

- **Environment Variables**  
  - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for Google OAuth.  
  - `GROQ_API_KEY` (or another AI provider key) for AI Chat.  
  - Stored in a `.env` file (see [Configuration Reference](https://cli.vuejs.org/config/)).

- **Server**  
  - Runs on **port 3000**.  
  - CORS enabled for `localhost:8080`.

---

## Usage

1. **Start the Server**  
   ```bash
   node server.js
   ```
2. **Serve the Frontend**  
   ```bash
   pnpm run serve
   ```
3. **Authenticate**  
   - Click **“Connect to Google Drive”** on the landing page if not authenticated.  
   - Complete the OAuth flow to retrieve tokens.
4. **Manage Files**  
   - Rename, delete, or view them from the dashboard.  
   - Ask the AI about file details via the floating chat button.


