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

const optionsList = [
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
];

let currentQuestion = 0;
const form = document.getElementById("survey-form");
const submitBtn = document.getElementById("submit-btn");

let userAnswers = {};

function showQuestion(index) {
  form.innerHTML = "";
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.innerHTML = `<h3>Fråga ${index + 1}: ${questions[index]}</h3>`;

  const optionsDiv = document.createElement("div");
  optionsDiv.className = "options";

  optionsList[index].forEach((opt, i) => {
    optionsDiv.innerHTML += `
      <label>
        ${opt}
        <input type="number" name="q${index}" min="1" max="5" data-option="${opt}" required>
      </label><br>
    `;
  });

  questionDiv.appendChild(optionsDiv);
  form.appendChild(questionDiv);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Nästa";
  nextBtn.type = "button";
  nextBtn.onclick = () => {
    const inputs = form.querySelectorAll(`input[name="q${index}"]`);
    const values = {};
    let valid = true;
    inputs.forEach(input => {
      if (!input.value) valid = false;
      values[input.dataset.option] = input.value;
    });
    if (!valid) {
      alert("Vänligen fyll i alla alternativ med värden 1–5.");
      return;
    }
    userAnswers[`q${index + 1}`] = values;
    currentQuestion++;
    if (currentQuestion < questions.length) {
      showQuestion(currentQuestion);
    } else {
      submitBtn.style.display = "block";
      form.innerHTML = "<p>Klicka på Skicka för att se resultatet.</p>";
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

  const chartCanvas = document.getElementById("result-chart");
  chartCanvas.style.display = "block";
  const response = await fetch("/results");
  const resultData = await response.json();

  const labels = Object.keys(resultData["q1"]);
  const datasets = Object.entries(resultData).map(([q, options], i) => ({
    label: `Fråga ${i + 1}`,
    data: labels.map(l => options[l] || 0),
    backgroundColor: `hsl(${i * 30}, 70%, 60%)`
  }));

  new Chart(chartCanvas, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      scales: { x: { stacked: true }, y: { stacked: true } }
    }
  });
};

showQuestion(currentQuestion);
