const languages = {
  sv: {
    questions: [
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
    ],
    options: [
      ["Fysisk leksaksbutik", "Nätbutik baserad i Sverige", "Åhléns", "Internationell e-handelsplattform", "Varuhus/lågprisbutik"],
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
    ],
    next: "Nästa",
    submit: "Skicka",
    selectRank: "Välj rang (1–5)",
    rankError: "Varje rang 1–5 måste användas exakt en gång.",
    clickToSubmit: "Klicka på Skicka för att se resultatet.",
    download: "Ladda ner resultat som CSV"
  },
  en: {
    questions: [
      "When buying toys, where do you go first?",
      "Which factor most influences your choice of store when buying toys?",
      "Which payment method do you prefer when buying toys online?",
      "Which factor most affects your satisfaction with online toy purchases?",
      "Which social media most influences your toy buying decision?",
      "What would make you shop more often from Åhléns?",
      "How important is sustainability when choosing toys?",
      "How do you usually discover new toy products?",
      "Which age group do you primarily buy toys for?",
      "What is most important when buying gifts (toys)?",
      "What type of toys do you buy most often?",
      "If you were to avoid a store or e-commerce site, what would be the main reason?"
    ],
    options: [], // We'll reuse the same Swedish options for simplicity
    next: "Next",
    submit: "Submit",
    selectRank: "Select rank (1–5)",
    rankError: "Each rank from 1–5 must be used exactly once.",
    clickToSubmit: "Click Submit to see results.",
    download: "Download results as CSV"
  }
};

let selectedLang = "sv";

const langPicker = document.createElement("select");
langPicker.innerHTML = `<option value="sv">Svenska</option><option value="en">English</option>`;
langPicker.onchange = () => {
  selectedLang = langPicker.value;
  showQuestion(currentQuestion);
};
document.body.insertBefore(langPicker, document.body.firstChild);

const form = document.getElementById("survey-form");
const submitBtn = document.getElementById("submit-btn");
let userAnswers = {};
const isAdmin = localStorage.getItem("isAdmin") === "true";
let currentQuestion = 0;

function showQuestion(index) {
  const lang = languages[selectedLang];
  const questions = lang.questions;
  const optionsList = languages.sv.options; // Using sv options for both languages

  form.innerHTML = "";
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.innerHTML = `<h3>Fråga ${index + 1}: ${questions[index]}</h3>`;

  const optionsDiv = document.createElement("div");
  optionsDiv.className = "options";

  optionsList[index].forEach((opt, i) => {
    const select = document.createElement("select");
    select.name = `q${index}-${i}`;
    select.dataset.option = opt;
    select.required = true;
    select.className = "mobile-dropdown";

    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = lang.selectRank;
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
  nextBtn.textContent = lang.next;
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
      alert(lang.rankError);
      return;
    }

    userAnswers[`q${index + 1}`] = values;
    currentQuestion++;
    if (currentQuestion < questions.length) {
      showQuestion(currentQuestion);
    } else {
      submitBtn.textContent = lang.submit;
      submitBtn.style.display = "block";
      form.innerHTML = `<p>${lang.clickToSubmit}</p>`;
    }
  };
  form.appendChild(nextBtn);
}

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
  const isAdmin = prompt("Enter admin password") === "Survey-2025";
  if (!isAdmin) {
    document.querySelector(".download-btn")?.remove();
  if (isAdmin) {
    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = languages[selectedLang].download;
    downloadBtn.onclick = () => {
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "survey_results.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    resultsContainer.appendChild(downloadBtn);
  }
  
}
};

showQuestion(currentQuestion);
