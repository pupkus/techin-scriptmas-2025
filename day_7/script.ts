import { initiateMetadata } from "../script.js";

const incBy = 2;
const incEvery = 3;

window.onload = () => {
  initiateMetadata();

  const hallContainer = document.getElementById("hall-container") as HTMLDivElement;
  const resultsDiv = document.getElementById("results") as HTMLDivElement;
  const form = document.querySelector("form") as HTMLFormElement;
  const submitButton = form.querySelector("button[type='submit']") as HTMLButtonElement;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const firstRowLen = formData.get("row-len") as string;
    const totalRows = formData.get("rows") as string;
    const incrementBy = Number(formData.get("increment-by") as string) || incBy;
    const incrementEvery = Number(formData.get("increment-every") as string) || incEvery;

    const k = Number(firstRowLen);
    const n = Number(totalRows);

    if (isNaN(k) || isNaN(n) || k <= 0 || n <= 0) {
      alert("Please enter valid positive numbers for both fields.");
      return;
    }

    // Reset previous result
    hallContainer.innerHTML = "";
    resultsDiv.innerHTML = "";

    submitButton.disabled = true;
    submitButton.classList.add("opacity-70", "cursor-not-allowed");

    let totalSeats = 0;
    const rowSizes: number[] = [];

    for (let i = 0; i < n; i++) {
      const groupIndex = i === 0 ? 0 : 1 + Math.floor((i - 1) / incrementEvery);

      const seatsInRow = k + groupIndex * incrementBy;

      totalSeats += seatsInRow;
      rowSizes.push(seatsInRow);

      await drawRow(hallContainer, seatsInRow, n);
    }

    // summary
    resultsDiv.innerHTML = `
      <p>Total seats: <span class="font-semibold">${totalSeats}</span></p>
    `;

    // smoothly bring the hall into view
    hallContainer.scrollIntoView({ behavior: "smooth", block: "start" });

    submitButton.disabled = false;
    submitButton.classList.remove("opacity-70", "cursor-not-allowed");
  });
};

async function drawRow(hallContainer: HTMLDivElement, seats: number, totalRows: number) {
  const rowDiv = document.createElement("div");
  rowDiv.classList.add("row", "flex", "justify-center");

  rowDiv.style.opacity = "0";
  rowDiv.style.transform = "translateY(4px)";
  hallContainer.appendChild(rowDiv);

  const isSmallHall = totalRows <= 25;
  const isMediumHall = totalRows > 25 && totalRows <= 50;
  const isBigHall = totalRows > 50;

  for (let i = 0; i < seats; i++) {
    const seatDiv = document.createElement("div");
    seatDiv.classList.add("seat", "w-4", "h-4", "bg-teal-300", "border", "border-teal-500", "rounded-sm");
    rowDiv.appendChild(seatDiv);

    // 1) animate EVERY seat (slowest, nicest)
    if (isSmallHall) {
      seatDiv.classList.add("resizing");
      setTimeout(() => seatDiv.classList.remove("resizing"), 500);
      await new Promise((resolve) => setTimeout(resolve, 1));
      continue;
    }

    // 2) animate only some seats (every 3rd), faster
    if (isMediumHall && i % 3 === 0) {
      seatDiv.classList.add("resizing");
      setTimeout(() => seatDiv.classList.remove("resizing"), 250);
      await new Promise((resolve) => setTimeout(resolve, 0));
      continue;
    }

    // 3) noper-seat awaits
    if (isBigHall) {
      continue;
    }
  }

  // Row fade-in for all cases
  requestAnimationFrame(() => {
    rowDiv.style.transition = "opacity 0.2s ease, transform 0.2s ease";
    rowDiv.style.opacity = "1";
    rowDiv.style.transform = "translateY(0)";
  });
}
