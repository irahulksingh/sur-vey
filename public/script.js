const frågor = [
  "När du ska köpa leksaker, vart vänder du dig först?",
  "Vilken faktor påverkar mest ditt val av butik vid köp av leksaker?",
  "Vilken betalningsmetod föredrar du när du handlar leksaker online?",
  "Vilket alternativ påverkar mest ditt beslut att köpa leksaker?",
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

const submitBtn = document.getElementById("submit-btn");
const downloadBtn = document.getElementById("download-btn");
let userAnswers = {};
let currentQuestion = 0;

// Show questions
function showQuestion(index) {
  const form = document.getElementById("survey-form");
  form.innerHTML = ""; // Clear form for new question

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

    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "Välj rang (1–5)";
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
  nextBtn.textContent = "Next";
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
      alert("Each rank from 1–5 must be used exactly once.");
      return;
    }

    userAnswers[`q${index + 1}`] = values;
    currentQuestion++;
    if (currentQuestion < frågor.length) {
      showQuestion(currentQuestion);
    } else {
      submitBtn.style.display = "block";
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

  downloadBtn.style.display = "block";
};

// Handle download button click
downloadBtn.addEventListener("click", async () => {
  const response = await fetch("/results");
  const resultData = await response.json();

  const csvContent = generateCSVContent(resultData); // Generate CSV content
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "survey_results.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Generate CSV content
function generateCSVContent(resultData) {
  let csv = "Fråga,Alternativ,Rank 1,Rank 2,Rank 3,Rank 4,Rank 5\n";

  Object.entries(resultData).forEach(([question, options]) => {
    alternativ.forEach((option, optIndex) => {
      const row = [
        frågor[optIndex],
        option,
        options[1] || 0,
        options[2] || 0,
        options[3] || 0,
        options[4] || 0,
        options[5] || 0
      ];
      csv += row.join(",") + "\n";
    });
  });

  return "data:text/csv;charset=utf-8," + csv;
}

// Initialize the first question
showQuestion(currentQuestion);