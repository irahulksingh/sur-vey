const questions = [
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

const options = [
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

const adminPassword = "Survey-2025"; // Admin password

const form = document.getElementById("survey-form");
const submitBtn = document.getElementById("submit-btn");
const adminViewContainer = document.getElementById("admin-view-container");
const adminViewBtn = document.getElementById("admin-view-btn");
const resultsTable = document.getElementById("results-table");
let userAnswers = {};
let currentQuestion = 0;

// Show questions
function showQuestion(index) {
  form.innerHTML = ""; // Clear form for new question
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.innerHTML = `<h3>Fråga ${index + 1}: ${questions[index]}</h3>`;

  const optionsDiv = document.createElement("div");
  optionsDiv.className = "options";

  options[index].forEach((opt, i) => {
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
      const rankOption = document.createElement("option");
      rankOption.value = r;
      rankOption.textContent = r;
      select.appendChild(rankOption);
    }

    const label = document.createElement("label");
    label.textContent = opt;
    label.appendChild(select);
    optionsDiv.appendChild(label);

    // Add change event listener to update dropdowns
    select.addEventListener("change", () => updateDropdowns(optionsDiv, select));
  });

  questionDiv.appendChild(optionsDiv);
  form.appendChild(questionDiv);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Nästa";
  nextBtn.type = "button";
  nextBtn.className = "next-btn";
  nextBtn.onclick = () => {
    const selects = form.querySelectorAll("select");
    const answers = {};
    const usedRanks = new Set();
    let valid = true;

    selects.forEach(select => {
      if (!select.value || usedRanks.has(select.value)) {
        valid = false;
      } else {
        usedRanks.add(select.value);
        answers[select.dataset.option] = parseInt(select.value);
      }
    });

    if (!valid || usedRanks.size !== 5) {
      alert("Varje rang 1–5 måste användas exakt en gång.");
      return;
    }

    userAnswers[`q${index + 1}`] = answers;
    currentQuestion++;
    if (currentQuestion < questions.length) {
      showQuestion(currentQuestion);
    } else {
      submitBtn.style.display = "block";
      form.innerHTML = `<p>Klicka på "Skicka" för att slutföra enkäten.</p>`;
    }
  };
  form.appendChild(nextBtn);
}

// Update dropdowns to disable selected ranks
function updateDropdowns(optionsDiv, currentSelect) {
  const selects = optionsDiv.querySelectorAll("select");
  const selectedValues = Array.from(selects).map(select => select.value);

  selects.forEach(select => {
    const currentValue = select.value;
    Array.from(select.options).forEach(option => {
      if (option.value && selectedValues.includes(option.value) && option.value !== currentValue) {
        option.disabled = true;
      } else {
        option.disabled = false;
      }
    });
  });
}

// Submit survey
submitBtn.onclick = async () => {
  // Send answers to the server
  const res = await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userAnswers)
  });

  const data = await res.json();
  alert(data.message);

  // Show the results table and fetch data dynamically
  resultsTable.style.display = "block";
  fetchResults();

  // Show admin view button
  adminViewContainer.style.display = "block";

  adminViewBtn.onclick = () => {
    const password = prompt("Ange adminlösenord:");
    if (password === adminPassword) {
      window.location.href = "admin-results.html";
    } else {
      alert("Fel lösenord! Åtkomst nekad.");
    }
  };
};

// Fetch and render results
async function fetchResults() {
  try {
    const res = await fetch("/results");
    const resultData = await res.json();

    // Clear previous results
    resultsTable.innerHTML = "";

    let html = "<table>";
    html += `
      <thead>
        <tr>
          <th>Fråga</th>
          <th>Alternativ 1</th>
          <th>Alternativ 2</th>
          <th>Alternativ 3</th>
          <th>Alternativ 4</th>
          <th>Alternativ 5</th>
        </tr>
      </thead>
      <tbody>
    `;

    Object.entries(resultData).forEach(([question, options]) => {
      html += `
        <tr>
          <td>${question}</td>
          ${[1, 2, 3, 4, 5].map(rank => `<td>${options[rank] || 0}</td>`).join("")}
        </tr>
      `;
    });

    html += "</tbody></table>";
    resultsTable.innerHTML = html;
  } catch (error) {
    console.error("Error fetching results:", error);
    resultsTable.innerHTML = "<p>Det gick inte att hämta resultaten.</p>";
  }
}

// Initialize the first question
showQuestion(currentQuestion);