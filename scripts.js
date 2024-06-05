let currentStep = 1;
let totalSteps = 0;
let questions = [];
let timer;
let timeLeft = 60;

function loadQuestions() {
  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic");
  const questionFile = `questions-${topic}.json`;

  fetch(questionFile)
    .then((response) => response.json())
    .then((data) => {
      questions = data;
      totalSteps = questions.length;
      generateQuizSteps();
      showStep(currentStep);
      startTimer();
    })
    .catch((error) => console.error("Error loading questions:", error));
}

function generateQuizSteps() {
  const quizContainer = document.getElementById("quiz-container");
  const quizz = document.getElementById("quizz");

  quizContainer.innerHTML = "";

  const timerDiv = document.createElement("div");
  timerDiv.id = "timer";
  timerDiv.innerText = "Time Left: 01:00";
  quizz.appendChild(timerDiv);

  questions.forEach((question, index) => {
    const stepDiv = document.createElement("div");
    stepDiv.className = "quiz-step";
    stepDiv.id = `step-${index + 1}`;

    const questionHeader = document.createElement("h3");
    questionHeader.innerText = `Question: ${index + 1}/${questions.length}`;
    stepDiv.appendChild(questionHeader);

    const questionParagraph = document.createElement("p");
    questionParagraph.innerText = question.question;
    stepDiv.appendChild(questionParagraph);

    question.options.forEach((option) => {
      const optionLabel = document.createElement("label");
      const optionInput = document.createElement("input");
      optionInput.type = "radio";
      optionInput.name = `q${index + 1}`;
      optionInput.value = option;
      optionLabel.appendChild(optionInput);
      optionLabel.appendChild(document.createTextNode(option));
      stepDiv.appendChild(optionLabel);
      stepDiv.appendChild(document.createElement("br"));
    });

    if (index > 0) {
      const prevButton = document.createElement("button");
      prevButton.innerText = "Previous";
      prevButton.onclick = () => previousStep(index + 1);
      stepDiv.appendChild(prevButton);
    }

    if (index < questions.length - 1) {
      const nextButton = document.createElement("button");
      nextButton.innerText = "Next";
      nextButton.onclick = () => nextStep(index + 1);
      stepDiv.appendChild(nextButton);
    }

    // Add submit button on each step
    const submitButton = document.createElement("button");
    submitButton.innerText = "Submit";
    submitButton.onclick = submitQuiz;
    stepDiv.appendChild(submitButton);

    quizContainer.appendChild(stepDiv);
  });

  const resultDiv = document.createElement("div");
  resultDiv.id = "result";
  resultDiv.className = "quiz-step";
  const resultHeader = document.createElement("h2");
  resultHeader.innerText = "Your Result";
  resultDiv.appendChild(resultHeader);
  const resultText = document.createElement("p");
  resultText.id = "result-text";
  resultDiv.appendChild(resultText);

  const restartButton = document.createElement("button");
  restartButton.innerText = "Restart";
  restartButton.onclick = restartQuiz;
  resultDiv.appendChild(restartButton);

  const homeButton = document.createElement("button");
  homeButton.innerText = "Go to Homepage";
  homeButton.onclick = goToHomePage;
  resultDiv.appendChild(homeButton);

  quizContainer.appendChild(resultDiv);
}

function showStep(step) {
  document.querySelectorAll(".quiz-step").forEach((el) => {
    el.classList.remove("active");
  });

  if (step === "result") {
    document.getElementById("result").classList.add("active");
  } else {
    document.getElementById(`step-${step}`).classList.add("active");
  }
}

function nextStep(step) {
  if (step < totalSteps) {
    currentStep++;
    showStep(currentStep);
  }
}

function previousStep(step) {
  if (step > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

function submitQuiz() {
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let unattempted = 0;

  questions.forEach((question, index) => {
    const selectedOption = document.querySelector(
      `input[name="q${index + 1}"]:checked`
    );
    if (selectedOption) {
      if (selectedOption.value === question.answer) {
        correctAnswers++;
        const nextSibling = selectedOption.nextElementSibling;
        if (nextSibling) {
          nextSibling.classList.add("correct");
        }
      } else {
        wrongAnswers++;
        const nextSibling = selectedOption.nextElementSibling;
        if (nextSibling) {
          nextSibling.classList.add("wrong");
        }
      }
    } else {
      unattempted++;
    }
  });

  const totalQuestions = questions.length;
  const obtainedScore = correctAnswers;
  const totalScore = totalQuestions;

  const resultText = document.getElementById("result-text");
  resultText.innerHTML = `<span class="correct">Correct: </span>${correctAnswers}<br><span class="wrong">Wrong: </span>${wrongAnswers}<br>Unattempted: ${unattempted}<br><p class="obtainedScore">Obtained Score: ${obtainedScore} / ${totalScore}</p>`;
  showStep("result");

  document.getElementById("timer").style.display = "none";
  clearInterval(timer);

  const username = localStorage.getItem("userName");
  const userDiv = document.createElement("div");
  userDiv.id = "user-info";
  const userName = document.createElement("span");
  userName.id = "user-name";
  userName.innerText = `${username}`;
  const logoutButton = document.createElement("button");
  logoutButton.id = "logout-button";
  logoutButton.innerText = "Logout";
  logoutButton.onclick = logout;

  userDiv.appendChild(userName);
  userDiv.appendChild(logoutButton);
  document.getElementById("quizz").appendChild(userDiv);
}

function restartQuiz() {
  currentStep = 1;
  document.querySelectorAll("input[type=radio]").forEach((input) => {
    input.checked = false;
  });
  timeLeft = 60;
  startTimer();
  showStep(currentStep);

  document.getElementById("timer").style.display = "block";
  const userInfoDiv = document.getElementById("user-info");
  if (userInfoDiv) {
    userInfoDiv.remove();
  }
}

function goToHomePage() {
  window.location.href = "home.html";
}

function startTimer() {
  const timerDiv = document.getElementById("timer");
  timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      submitQuiz();
    } else {
      timeLeft--;
      const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
      const seconds = String(timeLeft % 60).padStart(2, "0");
      timerDiv.innerText = `Time Left: ${minutes}:${seconds}`;
    }
  }, 1000);
}

function logout() {
  localStorage.removeItem("username");
  window.location.href = "index.html";
}

if (window.location.pathname.endsWith("quiz.html")) {
  loadQuestions();
}
