const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Path to the JSON file for storing results
const DB_PATH = path.join(__dirname, "db.json");

// Middleware for parsing JSON and serving static files
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize JSON file if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({}));
}

// API: Get survey results
app.get("/api/results", (req, res) => {
  const data = fs.readJSONSync(DB_PATH);
  res.json(data);
});

// API: Submit survey
app.post("/api/submit", (req, res) => {
  const surveyData = req.body;

  let results = fs.readJSONSync(DB_PATH);

  // Update results for each question and option
  for (const [questionId, selectedOptions] of Object.entries(surveyData)) {
    if (!results[questionId]) {
      results[questionId] = {};
    }

    for (const [option, rank] of Object.entries(selectedOptions)) {
      if (!results[questionId][option]) {
        results[questionId][option] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      }
      results[questionId][option][rank] += 1;
    }
  }

  // Save updated results to the JSON file
  fs.writeJSONSync(DB_PATH, results);
  res.json({ message: "Survey submitted successfully!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});