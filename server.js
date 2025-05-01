const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection URI (replace <username> and <password> with your credentials)
const MONGO_URI = process.env.MONGO_URI;
const DATABASE_NAME = "surveyDB"; // Name of your database

// Middleware for parsing JSON and serving static files
app.use(bodyParser.json());
app.use(express.static("public"));

// MongoDB client
let db;

// Connect to MongoDB Atlas
(async function connectDB() {
  try {
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(DATABASE_NAME);
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("Failed to connect to MongoDB Atlas:", err);
  }
})();

// API: Get survey results
app.get("/api/results", async (req, res) => {
  try {
    const results = await db.collection("results").find({}).toArray();
    res.json(results);
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

// API: Submit survey
app.post("/api/submit", async (req, res) => {
  const surveyData = req.body;

  try {
    for (const [questionId, selectedOptions] of Object.entries(surveyData)) {
      for (const [option, rank] of Object.entries(selectedOptions)) {
        // Increment the rank counts for the given option
        await db.collection("results").updateOne(
          { questionId, option },
          { $inc: { [`ranks.${rank}`]: 1 } }, // Increment rank count
          { upsert: true } // Insert if document doesn't exist
        );
      }
    }
    res.json({ message: "Survey submitted successfully!" });
  } catch (err) {
    console.error("Error submitting survey:", err);
    res.status(500).json({ error: "Failed to submit survey" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});