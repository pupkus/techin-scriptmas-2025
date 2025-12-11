import { drawTarget, getTargetState, worldToCanvas, WORLD_EXTENT } from "./target.js";
export const RING_POINTS = [50, 30, 15, 5]; // r1, r2, r3, r4
const EPS = 1e-6; // 0.000001 tolerance
// parse numbe from input by id
function getNumberValue(id) {
    const el = document.getElementById(id);
    const val = Number(el.value);
    return Number.isNaN(val) ? 0 : val;
}
function scoreShot(x, y, state) {
    const { center, radii } = state;
    const { xc, yc } = center;
    const dx = x - xc;
    const dy = y - yc;
    const distance = Math.sqrt(dx * dx + dy * dy);
    let ringIndex = null;
    let points = 0;
    let onBoundary = false;
    for (let i = 0; i < radii.length; i++) {
        const r = radii[i];
        const basePoints = RING_POINTS[i] ?? 0;
        if (Math.abs(distance - r) < EPS) {
            ringIndex = i;
            points = basePoints / 2;
            onBoundary = true;
            break;
        }
        if (distance < r) {
            ringIndex = i;
            points = basePoints;
            onBoundary = false;
            break;
        }
    }
    // outside all rings, 0 points
    if (ringIndex === null) {
        points = 0;
    }
    return { x, y, distance, ringIndex, onBoundary, points };
}
// draw dot where shot landed
function drawShotDot(ctx, canvas, x, y, state) {
    const { transform } = state;
    const { px, py } = worldToCanvas(x, y, canvas, transform);
    // redraw target first
    drawTarget(ctx, canvas);
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444"; // red
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#f97316"; // orange outline
    ctx.stroke();
}
// generate result text
function renderResult(resultsDiv, result) {
    const ringText = result.ringIndex === null
        ? "outside all rings (miss)"
        : result.ringIndex === 0
            ? "bullseye (inner circle)"
            : `ring ${result.ringIndex + 1}`;
    const boundaryText = result.onBoundary ? " (on the boundary → half points)" : "";
    resultsDiv.innerHTML = `
    <p class="text-xs text-slate-300">
      Shot at <span class="font-semibold text-slate-50">(${result.x}, ${result.y})</span><br/>
      Distance from center:
      <span class="font-mono text-slate-100">${result.distance.toFixed(2)}</span><br/>
      Hit: <span class="font-semibold text-slate-100">${ringText}</span>${boundaryText}<br/>
      Points earned:
      <span class="font-bold text-emerald-400">${result.points}</span>
    </p>
  `;
}
// handle shot
export function handleShot(ctx, canvas, resultsDiv, options) {
    const state = getTargetState(canvas);
    if (!state)
        return;
    let x;
    let y;
    if (options?.random) {
        // handle random shot
        x = (Math.random() * 2 - 1) * WORLD_EXTENT;
        y = (Math.random() * 2 - 1) * WORLD_EXTENT;
        // update inputs
        const sx = document.getElementById("shoot-xc");
        const sy = document.getElementById("shoot-yc");
        if (sx)
            sx.value = x.toFixed(2);
        if (sy)
            sy.value = y.toFixed(2);
    }
    else {
        x = getNumberValue("shoot-xc");
        y = getNumberValue("shoot-yc");
    }
    const result = scoreShot(x, y, state);
    drawShotDot(ctx, canvas, x, y, state);
    renderResult(resultsDiv, result);
}
