require("dotenv").config();
const OpenAI = require("openai");
const express = require("express");
const session = require("express-session");
const { google } = require("googleapis");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");

const app = express();
const PORT = 3000;

// ✅ Enable CORS (Fix frontend/backend communication)
const cors = require("cors");

app.use(cors({
  origin: "http://localhost:8080", // ✅ Allow frontend
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"], // ✅ Allow all necessary methods
  allowedHeaders: ["Content-Type", "Authorization"], // ✅ Allow necessary headers
  credentials: true, // ✅ Allow session-based authentication
}));

// ✅ Handle preflight CORS requests (important for PATCH & DELETE requests)
app.options("*", cors());app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret_key",
    resave: true,
    saveUninitialized: true,
  })
);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ Use API key from .env
});

// ✅ Initialize Google OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/auth/callback"
);

// ✅ Set refresh token from .env (if available)
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
}

// ✅ Middleware: Ensure Authentication & Refresh Tokens
async function ensureAuthenticated(req, res, next) {
  try {
    if (!req.session.tokens) {
      console.error("⚠️ No session tokens found.");
      return res.status(401).send("Unauthorized - Please log in.");
    }

    oauth2Client.setCredentials(req.session.tokens);
    
    // ✅ Refresh token if needed
    const currentTime = new Date().getTime();
    if (!oauth2Client.credentials.access_token || (oauth2Client.credentials.expiry_date && oauth2Client.credentials.expiry_date < currentTime)) {
      console.log("🔄 Refreshing access token...");
      const { credentials } = await oauth2Client.refreshAccessToken();
      req.session.tokens = credentials;
      oauth2Client.setCredentials(credentials);
    }

    req.drive = google.drive({ version: "v3", auth: oauth2Client });
    next();
  } catch (error) {
    console.error("❌ Authentication Error:", error);
    res.status(500).send("Authentication failed.");
  }
}


// ✅ Google OAuth Login
app.get("/auth/google", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive"],
    prompt: "consent",
  });
  res.redirect(authUrl);
});

// ✅ Google OAuth Callback (Save Tokens)
app.get("/auth/callback", async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);

    req.session.tokens = tokens;  // ✅ Store tokens in session
    oauth2Client.setCredentials(tokens);

    console.log("✅ Successfully authenticated!");
    res.redirect("http://localhost:8080/dashboard");
  } catch (error) {
    console.error("❌ Authentication Failed:", error);
    res.status(500).send("Google Authentication Failed.");
  }
});
app.get("/auth/status", (req, res) => {
  if (req.session.tokens) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});


// ✅ Fetch Google Drive Files
app.get("/files", ensureAuthenticated, async (req, res) => {
  try {
    const { sort } = req.query;

    const response = await req.drive.files.list({
      fields: "files(id, name, modifiedTime, mimeType, size, owners)",
      orderBy: sort === "modifiedTime" ? "modifiedTime desc" : undefined,
      q: "'me' in owners or trashed=false",
    });

    res.json(response.data.files);
  } catch (error) {
    console.error("❌ Error fetching files:", error.response?.data || error.message);
    res.status(500).send("Error fetching files");
  }
});


// ✅ Upload a File to Google Drive
const upload = multer({ dest: "uploads/" });
app.post("/upload", ensureAuthenticated, upload.single("file"), async (req, res) => {
  try {
    const { originalname, path } = req.file;
    const response = await req.drive.files.create({
      requestBody: { name: originalname },
      media: { body: fs.createReadStream(path) },
    });

    fs.unlinkSync(path); // Delete temp file
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    res.status(500).send("Error uploading file");
  }
});

// ✅ Delete a File from Google Drive
app.delete("/files/:id", ensureAuthenticated, async (req, res) => {
  try {
    await req.drive.files.delete({ fileId: req.params.id });
    res.send("File deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting file:", error);
    res.status(500).send("Error deleting file");
  }
});

// ✅ Rename a File in Google Drive
app.patch("/files/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;
    await req.drive.files.update({
      fileId: req.params.id,
      requestBody: { name },
    });
    res.send("File renamed successfully");
  } catch (error) {
    console.error("❌ Error renaming file:", error);
    res.status(500).send("Error renaming file");
  }
});

// ✅ Logout (Clear Session)
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.send("Logged out successfully");
});

// ✅ Chat with AI about Google Drive Files
app.post("/chat", ensureAuthenticated, async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).send("Prompt cannot be empty.");
  }

  try {
    // ✅ Fetch Google Drive File Metadata (But NOT Content)
    const response = await req.drive.files.list({
      fields: "files(id, name, size, modifiedTime, owners)", // ✅ Only fetch metadata
      q: "'me' in owners or trashed=false",
    });

    const files = response.data.files;

    if (!files || files.length === 0) {
      return res.json({ response: "No files found in your Google Drive." });
    }

    // ✅ Convert File Metadata to Readable Text
    let fileData = "Here is a summary of your Google Drive files:\n\n";
    files.forEach((file, index) => {
      fileData += `${index + 1}. Name: ${file.name}, Size: ${file.size || "Unknown"} bytes, Last Modified: ${file.modifiedTime}, Owner: ${file.owners[0]?.displayName || "Unknown"}\n`;
    });

    // ✅ Combine User Question with File Metadata
    const aiPrompt = `${fileData}\n\nUser Question: ${prompt}\nAnswer in a concise way based on the provided metadata.`;

    // ✅ Send to Groq API
    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile", // ✅ Use Groq model
        messages: [{ role: "user", content: aiPrompt }],
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ Return AI's Answer
    if (aiResponse.data && aiResponse.data.choices && aiResponse.data.choices[0].message) {
      res.json({ response: aiResponse.data.choices[0].message.content.trim() });
    } else {
      console.error("⚠️ Unexpected Groq API Response:", aiResponse.data);
      res.status(500).send("Error processing response from AI.");
    }
  } catch (error) {
    console.error("❌ Error fetching files or AI response:", error.response?.data || error.message);
    res.status(500).send("Error generating response.");
  }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
