const frågor = [
  "När du ska köpa leksaker, vart vänder du dig först?",
  "Vilken faktor påverkar mest ditt val av butik vid köp av leksaker?",
  "Vilken betalningsmetod föredrar du när du handlar leksaker online?",
  "Vilket alternativ påverkar mest ditt beslut att köpa leksaker online?",
  "Vilka sociala medier påverkar mest ditt beslut att köpa leksaker?",
  "Vad skulle få dig att handla oftare från Åhléns?",
  "Hur viktig är hållbarhet när du väljer leksaker?",
  "Hur upptäcker du oftast nya leksaksprodukter?",
  "Vilken åldersgrupp handlar du främst leksaker till?",
  "Vad är viktigast vid köp av presenter (leksaker)?",
  "Vilken typ av leksaker köper du oftast?",
  "Om du skulle välja bort en butik eller e-handel, vad skulle vara främsta anledningen?"
];

const alternativ = [
  ["Fysisk leksaksbutik", "Svensk nätbutik", "Åhléns", "Internationell e-handelsplattform", "Varuhus/lågprisbutik"],
  ["Pris", "Leveranstid", "Sortiment/Produktutbud", "Kundservice och rådgivning", "Enkelhet att beställa"],
  ["Klarna", "Kredit-/betalkort", "Swish", "PayPal", "Direkt bankbetalning"],
  ["Snabb leverans", "Fri frakt", "Enkel returhantering", "Kundsupportens tillgänglighet", "Produktens kvalitet"],
  ["Facebook", "Instagram", "TikTok", "YouTube", "Inget socialt media påverkar mig"],
  ["Lägre priser", "Snabbare leveranser", "Större sortiment", "Fler kampanjer", "Mer hållbara produkter"],
  ["Viktigast av allt", "Mycket viktigt", "Ganska viktigt", "Mindre viktigt", "Oviktigt"],
  ["Rekommendationer", "Sociala medier", "Reklam", "Besök i butik", "Söka online"],
  ["0–2 år", "3–5 år", "6–9 år", "10–12 år", "Över 12 år"],
  ["Trendig", "Unik", "Pedagogisk", "Hållbar", "Prisvärd"],
  ["Traditionella leksaker", "Elektroniska leksaker", "Pyssel", "Utomhusleksaker", "Samlarprodukter"],
  ["Höga priser", "Dålig kundservice", "Lång leveranstid", "Dåligt sortiment", "Komplicerad retur"]
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

// Show questions with radio buttons
function showQuestion(index) {
  form.innerHTML = "";
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.innerHTML = `<h3>Fråga ${index + 1}: ${frågor[index]}</h3>`;

  const optionsDiv = document.createElement("div");
  optionsDiv.className = "options";

  alternativ[index].forEach((opt, i) => {
    const label = document.createElement("label");
    label.className = "radio-label";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = `q${index}`;
    radio.value = i + 1;
    radio.className = "radio-input";

    label.appendChild(radio);
    label.appendChild(document.createTextNode(opt));
    optionsDiv.appendChild(label);
    optionsDiv.appendChild(document.createElement("br"));
  });

  questionDiv.appendChild(optionsDiv);
  form.appendChild(questionDiv);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = nextButtonText;
  nextBtn.type = "button";
  nextBtn.className = "next-btn";
  nextBtn.onclick = () => {
    const selectedOption = form.querySelector(`input[name="q${index}"]:checked`);
    if (!selectedOption) {
      alert(rankErrorText);
      return;
    }

    userAnswers[`q${index + 1}`] = selectedOption.value;
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
    ${alternativ[0].map((_, i) => `<th>Alternativ ${i + 1}</th>`).join("")}
  </tr>`;
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement("tbody");
  Object.entries(resultData).forEach(([question, options], qIndex) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>Fråga ${qIndex + 1}</td>` +
      Array.from({ length: 5 }, (_, i) => `<td>${options[i + 1] || 0}</td>`).join("");
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  resultsContainer.appendChild(table);
}

// Initialize the first question
showQuestion(currentQuestion);