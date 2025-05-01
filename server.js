require('dotenv').config(); // Load environment variables from .env file

const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI; // The connection string is stored in an environment variable
const DATABASE_NAME = "surveyDB";

let db;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files from the "public" directory

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

// POST endpoint to submit survey data
app.post("/api/submit", async (req, res) => {
  const surveyData = req.body;

  try {
    for (const [questionId, selectedOptions] of Object.entries(surveyData)) {
      for (const [option, rank] of Object.entries(selectedOptions)) {
        if (typeof rank !== "number") {
          return res.status(400).json({ error: "Invalid rank data type" });
        }

        // Increment the rank counts for the given option
        await db.collection("results").updateOne(
          { questionId, option },
          { $inc: { [`ranks.${rank}`]: 1 } },
          { upsert: true }
        );
      }
    }
    res.json({ message: "Survey submitted successfully!" });
  } catch (err) {
    console.error("Error submitting survey:", err);
    res.status(500).json({ error: "Failed to submit survey" });
  }
});

// GET endpoint to fetch only ranks
app.get("/api/ranks", async (req, res) => {
  try {
    // Fetch only the 'ranks' field from the MongoDB collection
    const ranks = await db.collection("results").find({}, { projection: { ranks: 1, _id: 0 } }).toArray();
    res.json(ranks); // Return the ranks array
  } catch (err) {
    console.error("Error fetching ranks:", err);
    res.status(500).json({ error: "Failed to fetch ranks" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});