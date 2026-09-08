const expressionDisplay =
    document.getElementById("expression");

const resultDisplay =
    document.getElementById("result");

const historyList =
    document.getElementById("historyList");

const memoryIndicator =
    document.getElementById("memoryIndicator");

const angleBtn =
    document.getElementById("angleBtn");

const themeBtn =
    document.getElementById("themeBtn");

let expression = "";

let memory = 0;

let angleMode = "DEG";

let history =
    JSON.parse(localStorage.getItem("calculatorHistory")) || [];


// ========================================
// DISPLAY
// ========================================

function updateDisplay() {

    expressionDisplay.textContent =
        expression || "0";

    try {

        if (expression) {

            const value =
                calculate(expression);

            resultDisplay.textContent =
                formatResult(value);

        } else {

            resultDisplay.textContent = "0";

        }

    } catch {

        resultDisplay.textContent = "0";

    }
}


// ========================================
// FORMAT RESULT
// ========================================

function formatResult(value) {

    if (!Number.isFinite(value)) {
        return "Error";
    }

    if (
        Math.abs(value) > 1e12 ||
        (Math.abs(value) < 1e-8 && value !== 0)
    ) {

        return value.toExponential(8);

    }

    return Number(value.toFixed(10)).toString();
}


// ========================================
// CALCULATOR ENGINE
// ========================================

function calculate(input) {

    let exp = input;

    // Percentage
    exp = exp.replace(
        /(\d+(?:\.\d+)?)%/g,
        "($1/100)"
    );


    // Constants
    exp = exp.replace(
        /\bpi\b/g,
        "Math.PI"
    );

    exp = exp.replace(
        /\be\b/g,
        "Math.E"
    );


    // Square root
    exp = exp.replace(
        /sqrt\(/g,
        "Math.sqrt("
    );


    // Logarithm
    exp = exp.replace(
        /log\(/g,
        "Math.log10("
    );


    // Natural logarithm
    exp = exp.replace(
        /ln\(/g,
        "Math.log("
    );


    // Power
    exp = exp.replace(
        /\^/g,
        "**"
    );


    // Trigonometry
    exp = exp.replace(
        /sin\(/g,
        `Math.sin(toRadians(`
    );

    exp = exp.replace(
        /cos\(/g,
        `Math.cos(toRadians(`
    );

    exp = exp.replace(
        /tan\(/g,
        `Math.tan(toRadians(`
    );


    // Close extra parenthesis for trig functions
    exp = fixTrigParentheses(exp);


    // Basic security validation
    if (
        /[^\d+\-*/().,\sA-Za-z_*]/.test(exp)
    ) {

        throw new Error("Invalid characters");

    }


    // Prevent unwanted JavaScript expressions
    const allowed =
        /^(?:Math\.(?:PI|E|sqrt|log10|log|sin|cos|tan)|toRadians|\d|[+\-*/().\s])*$/;

    if (!allowed.test(exp)) {

        throw new Error("Invalid expression");

    }


    return Function(
        `"use strict"; return (${exp})`
    )();
}


// ========================================
// TRIGONOMETRY
// ========================================

function toRadians(value) {

    if (angleMode === "DEG") {

        return value * Math.PI / 180;

    }

    return value;
}


function fixTrigParentheses(exp) {

    let functions = [
        "Math.sin(toRadians(",
        "Math.cos(toRadians(",
        "Math.tan(toRadians("
    ];

    for (const fn of functions) {

        let index = 0;

        while ((index = exp.indexOf(fn, index)) !== -1) {

            let start = index + fn.length;

            let depth = 0;

            let found = false;

            for (
                let i = start;
                i < exp.length;
                i++
            ) {

                if (exp[i] === "(") {
                    depth++;
                }

                if (exp[i] === ")") {

                    if (depth === 0) {

                        exp =
                            exp.slice(0, i + 1) +
                            ")" +
                            exp.slice(i + 1);

                        found = true;

                        break;

                    }

                    depth--;

                }

            }

            if (!found) {

                exp += ")";

            }

            index = start;

        }

    }

    return exp;
}


// ========================================
// ADD INPUT
// ========================================

function addValue(value) {

    expression += value;

    updateDisplay();

}


// ========================================
// BUTTON INPUT
// ========================================

document
    .querySelectorAll("[data-value]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                addValue(
                    button.dataset.value
                );

            }
        );

    });


// ========================================
// CLEAR
// ========================================

document
    .getElementById("clearBtn")
    .addEventListener("click", () => {

        expression = "";

        updateDisplay();

    });


// ========================================
// DELETE
// ========================================

document
    .getElementById("deleteBtn")
    .addEventListener("click", () => {

        expression =
            expression.slice(0, -1);

        updateDisplay();

    });


// ========================================
// EQUALS
// ========================================

document
    .getElementById("equalsBtn")
    .addEventListener("click", calculateResult);


function calculateResult() {

    if (!expression) return;

    try {

        const value =
            calculate(expression);

        const formatted =
            formatResult(value);

        addHistory(
            expression,
            formatted
        );

        expression =
            formatted;

        updateDisplay();

    } catch {

        resultDisplay.textContent =
            "Error";

    }

}


// ========================================
// FACTORIAL
// ========================================

document
    .getElementById("factorialBtn")
    .addEventListener("click", () => {

        try {

            const value =
                calculate(expression);

            if (
                value < 0 ||
                !Number.isInteger(value)
            ) {

                throw new Error();

            }

            let factorial = 1;

            for (
                let i = 2;
                i <= value;
                i++
            ) {

                factorial *= i;

            }

            expression =
                String(factorial);

            updateDisplay();

        } catch {

            resultDisplay.textContent =
                "Invalid factorial";

        }

    });


// ========================================
// MEMORY
// ========================================

document
    .getElementById("memoryClear")
    .addEventListener("click", () => {

        memory = 0;

        updateMemory();

    });


document
    .getElementById("memoryRecall")
    .addEventListener("click", () => {

        expression += String(memory);

        updateDisplay();

    });


document
    .getElementById("memoryAdd")
    .addEventListener("click", () => {

        try {

            memory += calculate(expression);

            updateMemory();

        } catch {

            resultDisplay.textContent =
                "Error";

        }

    });


function updateMemory() {

    memoryIndicator.textContent =
        `M: ${formatResult(memory)}`;

}


// ========================================
// ANGLE MODE
// ========================================

angleBtn.addEventListener(
    "click",
    () => {

        angleMode =
            angleMode === "DEG"
                ? "RAD"
                : "DEG";

        angleBtn.textContent =
            angleMode;

        updateDisplay();

    }
);


// ========================================
// THEME
// ========================================

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle("dark");

        const dark =
            document.body.classList.contains("dark");

        themeBtn.textContent =
            dark ? "🌙" : "☀️";

        localStorage.setItem(
            "calculatorTheme",
            dark ? "dark" : "light"
        );

    }
);


// Load saved theme

if (
    localStorage.getItem(
        "calculatorTheme"
    ) === "dark"
) {

    document.body.classList.add("dark");

    themeBtn.textContent = "🌙";

}


// ========================================
// COPY
// ========================================

document
    .getElementById("copyBtn")
    .addEventListener("click", async () => {

        try {

            await navigator.clipboard.writeText(
                resultDisplay.textContent
            );

            const old =
                document.getElementById("copyBtn")
                    .textContent;

            document.getElementById("copyBtn")
                .textContent = "Copied!";

            setTimeout(() => {

                document.getElementById("copyBtn")
                    .textContent = old;

            }, 1000);

        } catch {

            alert("Unable to copy");

        }

    });


// ========================================
// HISTORY
// ========================================

function addHistory(
    calculation,
    result
) {

    history.unshift({

        calculation,

        result

    });


    // Keep only latest 20 calculations

    history =
        history.slice(0, 20);


    localStorage.setItem(
        "calculatorHistory",
        JSON.stringify(history)
    );


    renderHistory();

}


function renderHistory() {

    if (!history.length) {

        historyList.innerHTML =
            `<p class="empty-history">
                No calculations yet
            </p>`;

        return;

    }


    historyList.innerHTML =
        history.map((item, index) => {

            return `
                <div
                    class="history-item"
                    data-index="${index}"
                >

                    <div class="history-expression">
                        ${escapeHTML(item.calculation)}
                    </div>

                    <div class="history-result">
                        = ${escapeHTML(item.result)}
                    </div>

                </div>
            `;

        }).join("");


    document
        .querySelectorAll(".history-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    const index =
                        Number(item.dataset.index);

                    expression =
                        history[index].calculation;

                    updateDisplay();

                }
            );

        });

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// Clear history

document
    .getElementById("clearHistory")
    .addEventListener("click", () => {

        history = [];

        localStorage.removeItem(
            "calculatorHistory"
        );

        renderHistory();

    });


// ========================================
// KEYBOARD SUPPORT
// ========================================

document.addEventListener(
    "keydown",
    event => {

        const key = event.key;


        if (
            /[0-9+\-*/().]/.test(key)
        ) {

            addValue(key);

            return;

        }


        if (key === "Enter" || key === "=") {

            calculateResult();

            return;

        }


        if (key === "Backspace") {

            expression =
                expression.slice(0, -1);

            updateDisplay();

            return;

        }


        if (key === "Escape") {

            expression = "";

            updateDisplay();

        }

    }
);


// Initial render

renderHistory();

updateMemory();

updateDisplay();