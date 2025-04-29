const questions = [
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
];

const options = [
  ["Physical toy store", "Swedish online store", "Åhléns", "International e-commerce platform", "Department store/discount store"],
  ["Price", "Delivery time", "Assortment/Product range", "Customer service and advice", "Ease of ordering"],
  ["Klarna", "Credit/Debit card", "Swish", "PayPal", "Direct bank payment"],
  ["Fast delivery", "Free shipping", "Easy return handling", "Customer support availability", "Product quality"],
  ["Facebook", "Instagram", "TikTok", "YouTube", "No social media influences me"],
  ["Lower prices", "Faster deliveries", "Larger assortment", "More campaigns", "More sustainable products"],
  ["Most important", "Very important", "Quite important", "Less important", "Not important"],
  ["Recommendations", "Social media", "Advertising", "In-store visits", "Search online"],
  ["0–2 years", "3–5 years", "6–9 years", "10–12 years", "Over 12 years"],
  ["Trendy", "Unique", "Educational", "Sustainable", "Affordable"],
  ["Traditional toys", "Electronic toys", "Crafts", "Outdoor toys", "Collectibles"],
  ["High prices", "Poor customer service", "Long delivery times", "Poor assortment", "Complicated returns"]
];

const nextButtonText = "Next";
const submitButtonText = "Submit";
const rankSelectionText = "Select rank (1–5)";
const rankErrorText = "Each rank from 1–5 must be used exactly once.";
const clickSubmitText = "Click Submit to see results.";
const downloadText = "Download results as CSV";

const form = document.getElementById("survey-form");
const submitBtn = document.getElementById("submit-btn");
let userAnswers = {};
let currentQuestion = 0;

const isAdmin = prompt("Enter admin password") === "Survey-2025";
if (!isAdmin) {
  document.querySelector(".download-btn")?.remove();
}

function showQuestion(index) {
  form.innerHTML = "";
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.innerHTML = `<h3>Question ${index + 1}: ${questions[index]}</h3>`;

  const optionsDiv = document.createElement("div");
  optionsDiv.className = "options";

  options[index].forEach((opt, i) => {
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
    if (currentQuestion < questions.length) {
      showQuestion(currentQuestion);
    } else {
      submitBtn.textContent = submitButtonText;
      submitBtn.style.display = "block";
      form.innerHTML = `<p>${clickSubmitText}</p>`;
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
    thead.innerHTML = `<tr><th>Question ${qIndex + 1}</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>`;
    table.appendChild(thead);
    csvContent += `\nQuestion ${qIndex + 1},1,2,3,4,5\n`;

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

  if (isAdmin) {
    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = downloadText;
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
};

showQuestion(currentQuestion);