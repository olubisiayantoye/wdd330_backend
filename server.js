import fs from "fs"; 
import path from "path";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000; // Use dynamic port for deployment
const COMMENTS_FILE = path.join(process.cwd(), "public", "json", "comments.json");

// ✅ Allow requests from your Netlify frontend
const corsOptions = {
    origin: ["https://sleepoutsideteam00.netlify.app", "https://deploy-preview-19--sleepoutsideteam00.netlify.app"], // Add more if needed
    methods: "GET,POST,OPTIONS",
    allowedHeaders: "Content-Type",
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Ensure "public/json" directory exists
if (!fs.existsSync(path.dirname(COMMENTS_FILE))) {
    fs.mkdirSync(path.dirname(COMMENTS_FILE), { recursive: true });
}

// Ensure "comments.json" exists
if (!fs.existsSync(COMMENTS_FILE)) {
    console.log("Creating missing comments.json...");
    fs.writeFileSync(COMMENTS_FILE, "[]", "utf8");
}

// Read comments from file
function getComments() {
    return JSON.parse(fs.readFileSync(COMMENTS_FILE, "utf8"));
}

// Save comments to file
function saveComments(comments) {
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2), "utf8");
}

// API: Get comments for a product
app.get("/comments/:productId", (req, res) => {
    const productId = req.params.productId;
    const comments = getComments().filter(comment => comment.productId === productId);
    res.json(comments);
});

// API: Add a new comment
app.post("/comments/:productId", (req, res) => {
    const productId = req.params.productId;
    const newComment = { productId, ...req.body, timestamp: new Date().toISOString() };

    const comments = getComments();
    comments.push(newComment);
    saveComments(comments);

    res.status(201).json(newComment);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
