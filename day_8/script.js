import { initiateMetadata } from "../script.js";
window.onload = () => {
    initiateMetadata();
    const form = document.querySelector("form");
    const gridDisplay = document.getElementById("grid-display");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const length = formData.get("length");
        if (!length || isNaN(Number(length)) || Number(length) <= 0) {
            alert("Please enter a valid positive number for length.");
            return;
        }
        const gridSize = Number(length);
        gridDisplay.innerHTML = ""; // Clear previous grid if any
        // Create grid container
        const gridContainer = document.createElement("div");
        gridContainer.style.display = "grid";
        gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        gridContainer.style.gap = "5px";
        // Populate grid with cells
        for (let i = 0; i < gridSize * gridSize; i++) {
            const cell = document.createElement("div");
            cell.style.border = "1px solid #000";
            cell.style.padding = "20px";
            cell.style.textAlign = "center";
            cell.textContent = (i + 1).toString();
            gridContainer.appendChild(cell);
        }
        gridDisplay.appendChild(gridContainer);
        // add grid-display classses and make it grid of
    });
};
function getCell(i, N, R) {
    const cell = document.createElement("div");
    const row = Math.floor(i / R); // full-grid row
    const col = i % R; // full-grid col
    const delay = Math.min((row + col) * 25, 600); // cap delay so big grids
    const isBorder = row === 0 || row === R - 1 || col === 0 || col === R - 1;
    if (isBorder)
        return make(cell, "#", "bg-red-400 text-slate-900", delay);
    const r = row;
    const c = col;
    // sum = row + col (1-indexed inner grid)
    const sum = r + c;
    // apply rules
    if (sum % 15 === 0)
        return make(cell, "G", "bg-sky-300 text-slate-900", delay);
    if (sum % 3 === 0)
        return make(cell, "T", "bg-amber-300 text-slate-900", delay);
    if (sum % 5 === 0)
        return make(cell, "S", "bg-emerald-400 text-slate-900", delay);
    return make(cell, ".", "bg-slate-200 text-slate-900", delay);
}
function make(el, char, color, delay) {
    el.className = [
        "grid-cell",
        color,
        "border",
        "border-slate-700",
        "aspect-square",
        "transition-transform",
        "hover:scale-110",
        "animate-pop",
    ].join(" ");
    el.style.animationDelay = `${delay}ms`;
    el.innerText = char;
    return el;
}
