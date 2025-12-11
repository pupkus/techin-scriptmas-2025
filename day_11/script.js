// script.ts
import { initiateMetadata } from "../script.js";
import { drawTarget } from "./target.js";
import { handleShot, RING_POINTS } from "./shoot.js";
window.addEventListener("DOMContentLoaded", () => {
    initiateMetadata();
    const targetForm = document.getElementById("target-form");
    const shootForm = document.getElementById("shoot-form");
    const randomButton = document.getElementById("random-button");
    const canvas = document.getElementById("target-canvas");
    const resultsDiv = document.getElementById("results");
    const points = document.getElementById("points-display");
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    // initial target
    drawTarget(ctx, canvas);
    points.innerText = `Possible Points: ${RING_POINTS.join(", ")}`;
    // target setup form
    if (targetForm) {
        targetForm.addEventListener("submit", (e) => {
            e.preventDefault();
            drawTarget(ctx, canvas);
            resultsDiv.innerHTML = "";
        });
    }
    // shooting form
    if (shootForm) {
        shootForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleShot(ctx, canvas, resultsDiv, { random: false });
        });
    }
    // random shot button
    if (randomButton) {
        randomButton.addEventListener("click", () => {
            handleShot(ctx, canvas, resultsDiv, { random: true });
        });
    }
});
