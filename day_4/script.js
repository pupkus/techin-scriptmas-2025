import { initiateMetadata } from "../script.js";
window.onload = () => {
    initiateMetadata();
    let numberArray = [];
    let end = false;
    const inputContainer = document.querySelector(".input-container");
    const form = document.getElementById("form");
    const input = document.getElementById("inputNumber");
    const button = document.querySelector("button");
    const resultDiv = document.getElementById("results");
    input.addEventListener("input", () => {
        input.setCustomValidity("");
    });
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const raw = input.value.trim();
        const parsed = Number(raw);
        if (end) {
            if (confirm("Start over?")) {
                reset();
            }
            return;
        }
        const isInvalid = !raw ||
            Number.isNaN(parsed) ||
            parsed < 0 ||
            (raw.includes(".") && raw.split(".")[1] && raw.split(".")[1].length > 2);
        if (isInvalid) {
            input.setCustomValidity("The number must be greater than or equal to 0 and have at most 2 decimal places.");
            input.reportValidity();
            return;
        }
        input.setCustomValidity("");
        addChip(parsed);
        input.value = "";
    });
    function addChip(value) {
        const newChip = document.createElement("span");
        newChip.className = `price inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mx-2 ${value > 10 ? "bg-teal-900 text-teal-100" : "bg-red-900 text-red-100"}`;
        newChip.innerText = String(value);
        inputContainer.appendChild(newChip);
        numberArray.push(value);
        if (value === 0) {
            finish();
        }
    }
    function finish() {
        const priceChips = Array.from(document.querySelectorAll(".price")).filter(({ innerText }) => Number(innerText) <= 10);
        priceChips.forEach((chip) => chip.classList.add("price-collapse"));
        const sum = numberArray.reduce((acc, curr) => (curr > 10 ? acc + curr : acc), 0);
        const filtered = numberArray.filter((num) => num > 10);
        resultDiv.innerHTML = `
      <p class="pt-2 text-base font-semibold">
        Total price of magical toys: <span class="text-emerald-400">${sum}</span>
      </p>
      <p class="pt-2 text-base font-semibold">
        Number of magical toys: <span class="text-emerald-400">${filtered.length}</span>
      </p>
    `;
        end = true;
        input.disabled = true;
        button.classList.add("bg-red-600", "hover:bg-red-500");
        button.classList.remove("bg-emerald-600", "hover:bg-emerald-500");
        button.textContent = "Reset";
    }
    function reset() {
        button.classList.remove("bg-red-600", "hover:bg-red-500");
        button.classList.add("bg-emerald-600", "hover:bg-emerald-500");
        resultDiv.innerHTML = "";
        button.textContent = "Submit";
        numberArray = [];
        inputContainer.innerHTML = "";
        end = false;
        input.disabled = false;
        input.focus();
    }
};
