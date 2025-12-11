import { initiateMetadata } from "../script.js";
window.onload = () => {
    initiateMetadata();
    const form = document.getElementById("form");
    const calculationMinuteArrow = document.querySelector(".minute");
    const calculationHourArrow = document.querySelector(".hour");
    const wrap = document.querySelector(".wrap");
    const resultDiv = document.getElementById("results");
    const lastState = { minutes: 0, hours: 0, airtime: 0 };
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const minutesRaw = data.get("minutes");
        const hoursRaw = data.get("hours");
        if (typeof minutesRaw !== "string" || typeof hoursRaw !== "string") {
            return;
        }
        const a = Number(hoursRaw); // hour input
        const b = Number(minutesRaw); // minute input
        if (Number.isNaN(a) || Number.isNaN(b))
            return;
        if (lastState.minutes === b && lastState.hours === a) {
            return;
        }
        // normalize hours to 12h dial
        const dialHour = ((a % 12) + 12) % 12; // 0–11 on the face
        // current angles in DEGREES (12h clock)
        const currentMinuteDeg = b * 6;
        const currentHourDeg = dialHour * 30 + b * 0.5;
        calculationMinuteArrow.style.transform = `rotate(${currentMinuteDeg}deg)`;
        calculationHourArrow.style.transform = `rotate(${currentHourDeg}deg)`;
        // store last values
        lastState.minutes = b;
        lastState.hours = a;
        // pass DEGREES into currentPost
        setTimeout(() => addTime(a * 60 + b + 60, {
            minutes: currentMinuteDeg,
            hours: currentHourDeg,
        }), 2000);
    });
    function addTime(currentTime, currentPost = { hours: 0, minutes: 0 }) {
        // nice animation effect
        wrap.classList.add("resizing");
        setTimeout(() => wrap.classList.remove("resizing"), 1000);
        // wrap around every 12 hours
        const totalMinutesOnDial = currentTime % (12 * 60); // 720 minutes
        const hoursPassed = Math.floor(totalMinutesOnDial / 60); // 0–11
        const minutesPassed = totalMinutesOnDial % 60; // 0–59
        // target rotation 12 hours
        let newHourRot = hoursPassed * 30 + minutesPassed * 0.5;
        let newMinuteRot = minutesPassed * 6;
        // set
        const currentHourRot = currentPost.hours;
        const currentMinuteRot = currentPost.minutes;
        // force forward-only rotation
        while (newHourRot <= currentHourRot)
            newHourRot += 360;
        while (newMinuteRot <= currentMinuteRot)
            newMinuteRot += 360;
        // apply transforms
        calculationHourArrow.style.transform = `rotate(${newHourRot}deg)`;
        calculationMinuteArrow.style.transform = `rotate(${newMinuteRot}deg)`;
        // output 12 hour format
        const displayHour = hoursPassed === 0 ? 12 : hoursPassed; // 0 → 12
        const hh = String(displayHour).padStart(2, "0");
        const mm = String(minutesPassed).padStart(2, "0");
        resultDiv.innerHTML = `
      <p class="text-xs text-slate-400">
        The clock will show <span class="font-semibold text-slate-100">${hh}:${mm}</span>
      </p>
    `;
    }
};
