
const display = document.getElementById("display");
const previous = document.getElementById("previous");
const historyList = document.getElementById("history-list");
const themeButton = document.getElementById("theme-toggle");

let expression = "";
let resultShown = false;
let history = [];

// Update the calculator display
function updateDisplay() {
    display.value = expression || "0";
}

// Add a number or operator
function addValue(value) {
    const operators = ["+", "-", "*", "/"];
    const last = expression.slice(-1);

    // Start a new calculation after getting a result
    if (resultShown) {
        if ("0123456789.".includes(value)) {
            expression = "";
        }
        resultShown = false;
    }

    // Replace an operator if another one is clicked
    if (operators.includes(value)) {
        if (expression === "" && value !== "-") return;

        if (operators.includes(expression.slice(-1))) {
            expression = expression.slice(0, -1);
        }
    }

    // Allow only one decimal point per number
    if (value === ".") {
        const currentNumber = expression.split(/[+\-*/]/).pop();
        if (currentNumber.includes(".")) return;
    }

    expression += value;
    updateDisplay();
}

// Clear the current calculation
function clearDisplay() {
    expression = "";
    resultShown = false;
    previous.textContent = "";
    updateDisplay();
}

// Delete the last character
function deleteLast() {
    expression = expression.slice(0, -1);
    resultShown = false;
    updateDisplay();
}

// Convert a number to a percentage
function percentage() {
    const match = expression.match(/(\d*\.?\d+)$/);

    if (!match) return;

    const number = Number(match[0]) / 100;

    expression =
        expression.slice(0, -match[0].length) + number;

    resultShown = false;
    updateDisplay();
}

// Calculate the answer
function calculate() {
    if (!expression) return;

    try {
        // Allow only arithmetic characters
        if (!/^[0-9+\-*/.()\s]+$/.test(expression)) {
            throw new Error("Invalid expression");
        }

        // Evaluate the arithmetic expression
        const answer = Function(
            '"use strict"; return (' + expression + ')'
        )();

        if (!Number.isFinite(answer)) {
            throw new Error("Invalid result");
        }

        const formattedAnswer = Number(answer.toPrecision(10));

        // Save the calculation before updating the display
        addToHistory(expression, formattedAnswer);

        previous.textContent = expression + " =";
        expression = String(formattedAnswer);
        resultShown = true;

        updateDisplay();

    } catch {
        display.value = "Try again!";
        expression = "";
        resultShown = true;
    }
}

// Add a calculation to the history
function addToHistory(calculation, answer) {
    history.unshift({
        calculation: calculation,
        answer: answer
    });

    // Keep only the five latest calculations
    history = history.slice(0, 5);

    showHistory();
}

// Display saved calculations
function showHistory() {
    historyList.innerHTML = "";

    if (history.length === 0) {
        historyList.innerHTML =
            '<li class="empty-history">' +
            'Your calculations will appear here ♡</li>';
        return;
    }

    history.forEach(function(item) {
        const li = document.createElement("li");

        const calculation = document.createElement("span");
        calculation.className = "history-expression";
        calculation.textContent = item.calculation;

        const answer = document.createElement("span");
        answer.className = "history-result";
        answer.textContent = "= " + item.answer;

        li.append(calculation, answer);
        historyList.appendChild(li);
    });
}

// Clear calculation history
function clearHistory() {
    history = [];
    showHistory();
}

// Switch between light and dark themes
function toggleTheme() {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        themeButton.textContent = "☀";
        themeButton.setAttribute("aria-label", "Switch to light theme");
    } else {
        themeButton.textContent = "☾";
        themeButton.setAttribute("aria-label", "Switch to dark theme");
    }
}

// Listen for calculator button clicks
document.querySelector(".buttons").addEventListener("click", function(event) {
    const button = event.target.closest("button");

    if (!button) return;

    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value !== undefined) {
        addValue(value);
    }

    if (action === "clear") clearDisplay();
    if (action === "delete") deleteLast();
    if (action === "percent") percentage();
    if (action === "calculate") calculate();
});

// Connect the other buttons
themeButton.addEventListener("click", toggleTheme);
document.getElementById("clear-history")
    .addEventListener("click", clearHistory);
