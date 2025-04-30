const frågor = [
  "När du ska köpa leksaker, vart vänder du dig först?",
  "Vilken faktor påverkar mest ditt val av butik vid köp av leksaker?",
];

const alternativ = [
  ["Fysisk leksaksbutik", "Svensk nätbutik", "Åhléns", "Internationell e-handelsplattform", "Varuhus/lågprisbutik"],
  ["Pris", "Leveranstid", "Sortiment/Produktutbud", "Kundservice och rådgivning", "Enkelhet att beställa"],
];

const nextButtonText = "Nästa"; // Swedish for "Next"
const submitButtonText = "Skicka"; // Swedish for "Submit"
const rankErrorText = "Varje rang från 1 till 5 måste användas exakt en gång."; // Swedish for "Each rank from 1–5 must be used exactly once."
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
      radio.name = `rank-${index}-${rank}`; // Unique to the question and rank
      radio.value = rank;
      radio.dataset.option = opt;
      radio.dataset.rank = rank;
      radio.className = "radio-input";

      const radioLabel = document.createElement("label");
      radioLabel.className = "radio-label";
      radioLabel.textContent = rank;
      radioLabel.appendChild(radio);

      radioGroup.appendChild(radioLabel);

      // Add event listener to prevent duplicate ranks
      radio.addEventListener("change", () => updateRadioGroups(optionsDiv, rank));
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
    const usedRanks = new Set(selectedRanks.map(radio => radio.dataset.rank));

    if (usedRanks.size !== 5 || selectedRanks.length !== 5) {
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

// Prevent duplicate ranks in the same question
function updateRadioGroups(optionsDiv, selectedRank) {
  const allRadios = optionsDiv.querySelectorAll("input");
  allRadios.forEach(radio => {
    if (radio.dataset.rank === selectedRank.toString() && !radio.checked) {
      radio.disabled = true;
    } else {
      radio.disabled = false;
    }
  });
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
    <th>Rank 1</th>
    <th>Rank 2</th>
    <th>Rank 3</th>
    <th>Rank 4</th>
    <th>Rank 5</th>
  </tr>`;
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement("tbody");
  Object.entries(resultData).forEach(([question, options]) => {
    Object.entries(options).forEach(([option, rankings]) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${question}</td>
        <td>${option}</td>
        ${Array.from({ length: 5 }, (_, i) => `<td>${rankings[i + 1] || 0}</td>`).join("")}
      `;
      tbody.appendChild(row);
    });
  });

  table.appendChild(tbody);
  resultsContainer.appendChild(table);
}

// Initialize the first question
showQuestion(currentQuestion);