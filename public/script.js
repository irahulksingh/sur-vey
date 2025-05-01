const questions = {
  sv: [
    "När du ska köpa leksaker, vart vänder du dig först?",
    "Vilken faktor påverkar mest ditt val av butik vid köp av leksaker?",
    "Hur ofta köper du leksaker på ett år?",
    "Föredrar du fysiska butiker eller online shopping för leksaker?",
    "Vilken typ av leksaker tycker dina barn mest om?",
    "Hur viktigt är priset när du köper leksaker?",
    "Hur nöjd är du med utbudet av leksaker i butikerna?",
    "Skulle du rekommendera din favorit-leksaksbutik till andra?",
    "Hur viktigt är leveranshastigheten när du handlar leksaker online?",
    "Tar du hänsyn till hållbarhet när du köper leksaker?",
    "Hur mycket spenderar du vanligtvis på leksaker per månad?",
    "Föredrar du märkesleksaker framför icke-märkesleksaker?"
  ],
  en: [
    "When buying toys, where do you go first?",
    "What factor most influences your choice of store when buying toys?",
    "How often do you buy toys in a year?",
    "Do you prefer physical stores or online shopping for toys?",
    "What type of toys do your children enjoy the most?",
    "How important is price when buying toys?",
    "How satisfied are you with the variety of toys available in stores?",
    "Would you recommend your favorite toy store to others?",
    "How important is delivery speed when shopping for toys online?",
    "Do you consider sustainability when buying toys?",
    "How much do you usually spend on toys per month?",
    "Do you prefer branded toys over non-branded ones?"
  ]
};

const options = {
  sv: [
    ["Fysisk leksaksbutik", "Svensk nätbutik", "Åhléns", "Internationell e-handelsplattform", "Varuhus/lågprisbutik"],
    ["Pris", "Leveranstid", "Sortiment/Produktutbud", "Kundservice och rådgivning", "Enkelhet att beställa"],
    ["En gång i månaden", "Varannan månad", "En gång i halvåret", "En gång om året", "Sällan eller aldrig"],
    ["Fysiska butiker", "Online shopping", "Båda lika mycket"],
    ["Pedagogiska leksaker", "Byggleksaker", "Dockor och mjukisdjur", "Elektroniska leksaker", "Utomhusleksaker"],
    ["Mycket viktigt", "Ganska viktigt", "Inte så viktigt", "Helt oviktigt"],
    ["Mycket nöjd", "Nöjd", "Neutral", "Missnöjd", "Mycket missnöjd"],
    ["Ja, definitivt", "Ja, förmodligen", "Inte säker", "Förmodligen inte", "Nej, aldrig"],
    ["Mycket viktigt", "Ganska viktigt", "Inte så viktigt", "Helt oviktigt"],
    ["Ja, alltid", "Ja, ibland", "Sällan", "Aldrig"],
    ["Mindre än 500 kr", "500–1000 kr", "1000–2000 kr", "2000–5000 kr", "Mer än 5000 kr"],
    ["Ja, alltid", "Ja, ibland", "Inte så ofta", "Aldrig"]
  ],
  en: [
    ["Physical toy store", "Swedish online store", "Åhléns", "International e-commerce platform", "Department/discount store"],
    ["Price", "Delivery time", "Selection/Product range", "Customer support and advice", "Ease of ordering"],
    ["Once a month", "Every two months", "Twice a year", "Once a year", "Rarely or never"],
    ["Physical stores", "Online shopping", "Both equally"],
    ["Educational toys", "Building toys", "Dolls and stuffed animals", "Electronic toys", "Outdoor toys"],
    ["Very important", "Somewhat important", "Not very important", "Not important at all"],
    ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"],
    ["Yes, definitely", "Yes, probably", "Not sure", "Probably not", "No, never"],
    ["Very important", "Somewhat important", "Not very important", "Not important at all"],
    ["Yes, always", "Yes, sometimes", "Rarely", "Never"],
    ["Less than $50", "$50–$100", "$100–$200", "$200–$500", "More than $500"],
    ["Yes, always", "Yes, sometimes", "Not often", "Never"]
  ]
};

let currentLanguage = "sv";
let userAnswers = {};
let currentQuestion = 0;

const form = document.getElementById("survey-form");
const submitBtn = document.getElementById("submit-btn");
const resultsContainer = document.getElementById("results-table");
const languageSelect = document.getElementById("language-select");
const surveyTitle = document.getElementById("survey-title");

// Update the survey language
languageSelect.addEventListener("change", () => {
  currentLanguage = languageSelect.value;
  surveyTitle.textContent = currentLanguage === "sv" ? "Enkätundersökning" : "Survey";
  currentQuestion = 0;
  userAnswers = {};
  showQuestion(currentQuestion);
});

// Show questions with radio buttons for each rank
function showQuestion(index) {
  form.innerHTML = "";
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.innerHTML = `<h3>${questions[currentLanguage][index]}</h3>`;

  const optionsDiv = document.createElement("div");
  optionsDiv.className = "options";

  options[currentLanguage][index].forEach((opt, optIndex) => {
    const optionContainer = document.createElement("div");
    optionContainer.className = "option-container";

    // Option label (text)
    const label = document.createElement("label");
    label.textContent = opt;
    label.className = "option-label";

    // Add radio buttons for each rank (1–5)
    const radioGroup = document.createElement("div");
    radioGroup.className = "radio-group";

    for (let rank = 1; rank <= 5; rank++) {
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `rank-${index}-${optIndex}`;
      radio.value = rank;
      radio.dataset.option = opt;
      radio.dataset.rank = rank;
      radio.className = "radio-input";

      const radioLabel = document.createElement("label");
      radioLabel.className = "radio-label";
      radioLabel.textContent = rank;

      // Place the radio button inside the label (for better accessibility)
      radioLabel.appendChild(radio);
      radioGroup.appendChild(radioLabel);

      // Add event listener to handle deselecting duplicate ranks
      radio.addEventListener("change", () => {
        deselectDuplicateRanks(optionsDiv, rank, radio);
      });
    }

    // Append the label (option text) and radio group
    optionContainer.appendChild(label); // Option text
    optionContainer.appendChild(radioGroup); // Radio buttons underneath
    optionsDiv.appendChild(optionContainer);
  });

  questionDiv.appendChild(optionsDiv);
  form.appendChild(questionDiv);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = currentLanguage === "sv" ? "Nästa" : "Next";
  nextBtn.type = "button";
  nextBtn.className = "next-btn";

  // On clicking "Next"
  nextBtn.onclick = () => {
    // Validate if each option has a selected rank
    const selectedRanks = Array.from(optionsDiv.querySelectorAll("input:checked"));
    if (selectedRanks.length !== options[currentLanguage][index].length) {
      alert(
        currentLanguage === "sv"
          ? "Du måste rangordna alla alternativ innan du går vidare."
          : "You must rank all options before proceeding to the next question."
      );
      return;
    }

    // Collect answers for the current question
    const answers = {};
    selectedRanks.forEach(radio => {
      answers[radio.dataset.option] = parseInt(radio.value);
    });

    userAnswers[`q${index + 1}`] = answers;
    currentQuestion++;

    // Show the next question or submit the form
    if (currentQuestion < questions[currentLanguage].length) {
      showQuestion(currentQuestion);
    } else {
      submitBtn.textContent = currentLanguage === "sv" ? "Skicka" : "Submit";
      submitBtn.style.display = "block";
      form.innerHTML = `<p>${
        currentLanguage === "sv"
          ? "Klicka på Skicka för att slutföra enkäten."
          : "Click Submit to complete the survey."
      }</p>`;
    }
  };

  form.appendChild(nextBtn);
}

// Function to deselect duplicate ranks
function deselectDuplicateRanks(optionsDiv, selectedRank, selectedRadio) {
  const allRadios = optionsDiv.querySelectorAll("input");
  allRadios.forEach(radio => {
    if (
      radio !== selectedRadio && // Don't deselect the currently selected radio
      radio.value === selectedRank.toString() &&
      radio.checked
    ) {
      radio.checked = false; // Uncheck the radio button with the same rank
    }
  });
}

// Prevent duplicate ranks
function updateRanks(optionsDiv, selectedRank) {
  const allRadios = optionsDiv.querySelectorAll("input");
  allRadios.forEach(radio => {
    if (radio.value === selectedRank.toString() && !radio.checked) {
      radio.disabled = true;
    } else {
      radio.disabled = false;
    }
  });
}

// Submit survey
submitBtn.onclick = async () => {
  submitBtn.disabled = true; // Disable the button after submission
  const res = await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userAnswers)
  });

  const data = await res.json();
  alert(data.message);

  // Fetch and display results
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
  thead.innerHTML = `
    <tr>
      <th>${currentLanguage === "sv" ? "Fråga" : "Question"}</th>
      <th>${currentLanguage === "sv" ? "Alternativ" : "Option"}</th>
      <th>Rank 1</th>
      <th>Rank 2</th>
      <th>Rank 3</th>
      <th>Rank 4</th>
      <th>Rank 5</th>
    </tr>
  `;
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement("tbody");

  Object.entries(resultData).forEach(([question, options], index) => {
    const totalOptions = Object.keys(options).length; // Count the number of options for the current question
    let isFirstRowForQuestion = true;

    Object.entries(options).forEach(([option, ranks], optionIndex) => {
      const row = document.createElement("tr");

      // Add the "Fråga" (Question) column only for the first row of the question
      if (isFirstRowForQuestion) {
        const questionCell = document.createElement("td");
        questionCell.rowSpan = totalOptions; // Merge rows for this question
        questionCell.textContent = `${index + 1}`; // Display the question number (1, 2, etc.)
        questionCell.className = "merged-question-cell"; // Add a class for styling

        // Append the question cell to the row
        row.appendChild(questionCell);

        isFirstRowForQuestion = false;
      }

      // Add the option name and ranks
      const optionCell = document.createElement("td");
      optionCell.textContent = option;
      row.appendChild(optionCell);

      // Add rank columns
      [1, 2, 3, 4, 5].forEach(rank => {
        const rankCell = document.createElement("td");
        rankCell.textContent = ranks[rank] || 0; // Show 0 if no rank is assigned
        row.appendChild(rankCell);
      });

      tbody.appendChild(row);
    });
  });

  table.appendChild(tbody);
  resultsContainer.appendChild(table);
}

// Initialize the first question
showQuestion(currentQuestion);