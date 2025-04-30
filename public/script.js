const frågor = [
  "När du ska köpa leksaker, vart vänder du dig först?",
  "Vilken faktor påverkar mest ditt val av butik vid köp av leksaker?"
];

const alternativ = [
  ["Fysisk leksaksbutik", "Svensk nätbutik", "Åhléns", "Internationell e-handelsplattform", "Varuhus/lågprisbutik"],
  ["Pris", "Leveranstid", "Sortiment/Produktutbud", "Kundservice och rådgivning", "Enkelhet att beställa"]
];

const nextButtonText = "Nästa"; // Swedish for "Next"
const submitButtonText = "Skicka"; // Swedish for "Submit"
const rankErrorText = "Varje alternativ måste ha exakt en rang (1–5)."; // Swedish for "Each option must have exactly one rank."
const clickSubmitText = "Klicka på Skicka för att slutföra enkäten."; // Swedish for "Click Submit to complete the survey."

const form = document.getElementById("survey-form");
const submitBtn = document.getElementById("submit-btn");
const resultsContainer = document.getElementById("results-table"); // Div for displaying results
let userAnswers = {};
let currentQuestion = 0;

// Show questions with radio buttons for each rank
function showQuestion(index) {
  form.innerHTML = "";
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.innerHTML = `<h3>Fråga ${index + 1}: ${frågor[index]}</h3>`;

  const optionsDiv = document.createElement("div");
  optionsDiv.className = "options";

  alternativ[index].forEach((opt, optIndex) => {
    const optionContainer = document.createElement("div");
    optionContainer.className = "option-container";

    const label = document.createElement("label");
    label.textContent = opt;
    label.className = "option-label";

    // Add radio buttons for ranks 1–5
    const radioGroup = document.createElement("div");
    radioGroup.className = "radio-group";

    for (let rank = 1; rank <= 5; rank++) {
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `option-${optIndex}`; // Grouped by option
      radio.value = rank;
      radio.dataset.option = opt;
      radio.dataset.rank = rank;
      radio.className = "radio-input";

      const radioLabel = document.createElement("label");
      radioLabel.className = "radio-label";
      radioLabel.textContent = rank;
      radioLabel.appendChild(radio);

      radioGroup.appendChild(radioLabel);
    }

    optionContainer.appendChild(label);
    optionContainer.appendChild(radioGroup);
    optionsDiv.appendChild(optionContainer);
  });

  questionDiv.appendChild(optionsDiv);
  form.appendChild(questionDiv);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = nextButtonText;
  nextBtn.type = "button";
  nextBtn.className = "next-btn";
  nextBtn.onclick = () => {
    const selectedRanks = Array.from(optionsDiv.querySelectorAll("input:checked"));
    if (selectedRanks.length !== alternativ[index].length) {
      alert(rankErrorText);
      return;
    }

    const answers = {};
    selectedRanks.forEach(radio => {
      answers[radio.dataset.option] = parseInt(radio.value);
    });

    userAnswers[`q${index + 1}`] = answers;
    currentQuestion++;
    if (currentQuestion < frågor.length) {
      showQuestion(currentQuestion);
    } else {
      submitBtn.textContent = submitButtonText;
      submitBtn.style.display = "block";
      form.innerHTML = `<p>${clickSubmitText}</p>`;
    }
  };
  form.appendChild(nextBtn);
}

// Submit survey
submitBtn.onclick = async () => {
  const res = await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userAnswers)
  });

  const data = await res.json();
  alert(data.message);

  // Fetch and display the results
  await fetchResults();
};

// Fetch and display results
async function fetchResults() {
  const response = await fetch("/results");
  const resultData = await response.json();

  resultsContainer.innerHTML = ""; // Clear previous results

  const table = document.createElement("table");
  table.className = "result-table";

  // Create table header
  const thead = document.createElement("thead");
  thead.innerHTML = `<tr>
    <th>Fråga</th>
    <th>Alternativ</th>
    <th>Rank</th>
  </tr>`;
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement("tbody");
  Object.entries(resultData).forEach(([question, options]) => {
    Object.entries(options).forEach(([option, rank]) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${question}</td>
        <td>${option}</td>
        <td>${rank}</td>
      `;
      tbody.appendChild(row);
    });
  });

  table.appendChild(tbody);
  resultsContainer.appendChild(table);
}

// Initialize the first question
showQuestion(currentQuestion);