import { initiateMetadata } from "../script.js";
window.onload = () => {
    initiateMetadata();
    const form = document.getElementById("form");
    const minuteArrow = document.querySelector(".minute");
    const hourArrow = document.querySelector(".hour");
    const wrap = document.querySelector(".wrap");
    const resultDiv = document.getElementById("results");
    const lastState = { minutes: 0, hours: 0 };
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const minutesRaw = data.get("minutes");
        const hoursRaw = data.get("hours");
        if (typeof minutesRaw !== "string" || typeof hoursRaw !== "string") {
            return;
        }
        const x = Number(hoursRaw); // hour input
        const y = Number(minutesRaw); // minute input
        minuteArrow.style.transform = `rotate(${y * 6}deg)`;
        hourArrow.style.transform = `rotate(${x * 30 + y * 0.5}deg)`;
        if (lastState.minutes === y && lastState.hours === x) {
            return;
        }
        // a nice animation effect
        wrap.classList.add("resizing");
        setTimeout(() => wrap.classList.remove("resizing"), 1000);
        const m = x * 60 + y; // minutes
        const s = m * 60; // seconds
        const hh = String(x).padStart(2, "0");
        const mm = String(y).padStart(2, "0");
        resultDiv.innerHTML = `
        <p class="text-xs text-slate-400">
          Total time passed from midnight to <span class="font-semibold text-slate-100">${hh}:${mm}</span>
        </p>
        <p class="pt-2 text-base font-semibold">
          Total minutes passed: <span class="text-emerald-400">${m}</span>
        </p>
        <p class="pt-2 text-base font-semibold">
          Total seconds passed: <span class="text-emerald-400">${s}</span>
        </p>
      `;
        lastState.minutes = Number(y);
        lastState.hours = Number(x);
    });
};
