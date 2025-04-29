const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

let allAnswers = [];

app.post("/submit", (req, res) => {
  const answers = req.body;
  allAnswers.push(answers);
  res.json({ message: "Svar skickades!" });
});

app.get("/results", (req, res) => {
  const resultSummary = {};

  allAnswers.forEach((response) => {
    Object.entries(response).forEach(([qKey, options]) => {
      if (!resultSummary[qKey]) resultSummary[qKey] = {};

      Object.entries(options).forEach(([option, rank]) => {
        if (!resultSummary[qKey][option]) resultSummary[qKey][option] = {};
        if (!resultSummary[qKey][option][rank]) resultSummary[qKey][option][rank] = 0;

        resultSummary[qKey][option][rank]++;
      });
    });
  });

  res.json(resultSummary);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
