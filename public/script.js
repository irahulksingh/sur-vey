const frågor = [
  "När du ska köpa leksaker, vart vänder du dig först?",
  "Vilken faktor påverkar mest ditt val av butik vid köp av leksaker?",
  "Vilken betalningsmetod föredrar du när du handlar leksaker online?",
  "Vilket alternativ påverkar mest din nöjdhet vid köp av leksaker online?",
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

const nextButtonText = "Next";
const submitButtonText = "Submit";
const rankSelectionText = "Select rank (1–5)";
const rankErrorText = "Each rank from 1–5 must be used exactly once.";
const clickSubmitText = "Click Submit to see results.";
const downloadText = "Download results as CSV";

const form = document.getElementById("survey-form");
const submitBtn = document.getElementById("submit-btn");
const downloadBtn = document.getElementById("download-btn");
let userAnswers = {};
let currentQuestion = 0;

// Show questions
function showQuestion(index) {
  form.innerHTML = "";
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.innerHTML = `<h3>Fråga ${index + 1}: ${frågor[index]}</h3>`;

  const optionsDiv = document.createElement("div");
  optionsDiv.className = "options";

  alternativ[index].forEach((opt, i) => {
    const select = document.createElement("select");
    select.name = `q${index}-${i}`;
    select.dataset.option = opt;
    select.required = true;
    select.className = "mobile-dropdown";

    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = rankSelectionText;
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    select.appendChild(defaultOpt);

    for (let r = 1; r <= 5; r++) {
      const optEl = document.createElement("option");
      optEl.value = r;
      optEl.textContent = r;
      select.appendChild(optEl);
    }

    const label = document.createElement("label");
    label.textContent = opt;
    label.appendChild(select);
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
    const selects = form.querySelectorAll("select");
    const values = {};
    const usedRanks = new Set();
    let valid = true;

    selects.forEach(select => {
      const val = select.value;
      if (!val || usedRanks.has(val)) {
        valid = false;
      } else {
        usedRanks.add(val);
        values[select.dataset.option] = parseInt(val);
      }
    });

    if (!valid || usedRanks.size !== 5) {
      alert(rankErrorText);
      return;
    }

    userAnswers[`q${index + 1}`] = values;
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

  const response = await fetch("/results");
  const resultData = await response.json();

  const resultsContainer = document.getElementById("results-table");
  resultsContainer.innerHTML = "";

  let csvContent = "data:text/csv;charset=utf-8,";

  Object.entries(resultData).forEach(([q, options], qIndex) => {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr><th>Fråga ${qIndex + 1}</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>`;
    table.appendChild(thead);
    csvContent += `\nFråga ${qIndex + 1},1,2,3,4,5\n`;

    const tbody = document.createElement("tbody");
    Object.entries(options).forEach(([option, value]) => {
      const row = document.createElement("tr");
      const rowData = [option];
      for (let i = 1; i <= 5; i++) {
        rowData.push(value[i] || 0);
      }
      row.innerHTML = `<td>${option}</td>` + rowData.slice(1).map(v => `<td>${v}</td>`).join("");
      tbody.appendChild(row);
      csvContent += rowData.join(",") + "\n";
    });

    table.appendChild(tbody);
    resultsContainer.appendChild(table);
    resultsContainer.appendChild(document.createElement("br"));
  });

  downloadBtn.style.display = "block";
};

// Handle download button click
downloadBtn.addEventListener("click", () => {
  const isAdmin = prompt("Enter admin password") === "Survey-2025";
  if (isAdmin) {
    alert("Password correct! You can now download the results.");
    const csvContent = generateCSVContent(); // Function to generate CSV content
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "survey_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    alert("Incorrect password! Access denied.");
  }
});

// Dummy CSV generation logic (replace with actual logic)
function generateCSVContent() {
  return "data:text/csv;charset=utf-8,Fråga,Alternativ 1,Alternativ 2\nExempel Fråga,5,3";
}

showQuestion(currentQuestion);