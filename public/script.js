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

const adminPassword = "Survey-2025"; // Admin password

const form = document.getElementById("survey-form");
const submitBtn = document.getElementById("submit-btn");
const adminViewContainer = document.getElementById("admin-view-container");
const adminViewBtn = document.getElementById("admin-view-btn");
const resultsTable = document.getElementById("results-table");
let userAnswers = {};
let currentQuestion = 0;

// Show a question
function showQuestion(index) {
  form.innerHTML = ""; // Clear form for new question
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.innerHTML = `<h3>Fråga ${index + 1}: ${questions[index]}</h3>`;

  const optionsDiv = document.createElement("div");
  optionsDiv.className = "options";

  for (let i = 1; i <= 5; i++) {
    const option = document.createElement("div");
    option.className = "option";

    const label = document.createElement("label");
    label.innerHTML = questions[index];
    option.appendChild(label);

    const select = document.createElement("select");
    select.name = `q${index}-${i}`;
    select.required = true;
    select.innerHTML = `
      <option value="" disabled selected>Välj rang (1–5)</option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
    `;
    option.appendChild(select);

    optionsDiv.appendChild(option);

    // Add change event listener to update dropdowns
    select.addEventListener("change", () => updateDropdowns(optionsDiv, select));
  }

  questionDiv.appendChild(optionsDiv);
  form.appendChild(questionDiv);

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "next-btn";
  nextBtn.textContent = "Nästa";
  nextBtn.onclick = () => {
    const selects = document.querySelectorAll(`select[name^="q${index}"]`);
    const answers = {};
    selects.forEach((select) => {
      if (select.value) {
        answers[select.name] = select.value;
      }
    });

    if (Object.keys(answers).length !== 5) {
      alert("Du måste rangordna alla alternativ.");
      return;
    }

    userAnswers[`q${index + 1}`] = answers;
    if (index < questions.length - 1) {
      showQuestion(index + 1);
    } else {
      submitBtn.style.display = "block";
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
  console.log("Submitting survey:", userAnswers);
  try {
    const res = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userAnswers),
    });

    const data = await res.json();
    console.log("Submit response:", data);
    alert(data.message);

    // Fetch and display results
    fetchResults();

    // Show admin button
    adminViewContainer.style.display = "block";
    adminViewBtn.onclick = () => {
      const password = prompt("Ange adminlösenord:");
      if (password === adminPassword) {
        window.location.href = "admin-results.html";
      } else {
        alert("Fel lösenord. Åtkomst nekad.");
      }
    };
  } catch (error) {
    console.error("Error submitting survey:", error);
  }
};

// Fetch results and render results table
async function fetchResults() {
  console.log("Fetching results...");
  try {
    const res = await fetch("/results");
    const data = await res.json();
    console.log("Results data:", data);

    // Build results table
    let html = `
      <table>
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

    Object.keys(data).forEach((question) => {
      html += `
        <tr>
          <td>${question}</td>
          <td>${data[question]["1"] || 0}</td>
          <td>${data[question]["2"] || 0}</td>
          <td>${data[question]["3"] || 0}</td>
          <td>${data[question]["4"] || 0}</td>
          <td>${data[question]["5"] || 0}</td>
        </tr>
      `;
    });

    html += "</tbody></table>";
    resultsTable.innerHTML = html;
    resultsTable.style.display = "block";
  } catch (error) {
    console.error("Error fetching results:", error);
    resultsTable.innerHTML = "<p>Det gick inte att hämta resultaten.</p>";
  }
}

// Initialize the first question
showQuestion(currentQuestion);