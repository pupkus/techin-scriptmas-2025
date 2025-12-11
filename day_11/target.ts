// chat gpt magic here, don't ask

type RingRadiusId = "r1" | "r2" | "r3" | "r4";

// worldymmetric around 0
// x, y in [-WORLD_EXTENT, WORLD_EXTENT]
export const WORLD_EXTENT = 10;
const GRID_STEP = 1;
const LABEL_STEP = 5;
const CANVAS_PADDING = 40;

export type Transform = {
  scale: number;
  originX: number;
  originY: number;
};

export type TargetState = {
  radii: number[];
  center: { xc: number; yc: number };
  transform: Transform;
};

// ---------- helpers ----------

function getRadii(): number[] {
  const ids: RingRadiusId[] = ["r1", "r2", "r3", "r4"];
  const radii: number[] = [];

  ids.forEach((id) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (!el) return;

    const val = Number(el.value);
    if (!Number.isNaN(val) && val > 0) {
      radii.push(val);
    }
  });

  return radii.sort((a, b) => a - b);
}

function getCenter(): { xc: number; yc: number } {
  const xcInput = document.getElementById("xc") as HTMLInputElement | null;
  const ycInput = document.getElementById("yc") as HTMLInputElement | null;

  const xc = xcInput ? Number(xcInput.value) || 0 : 0;
  const yc = ycInput ? Number(ycInput.value) || 0 : 0;

  return { xc, yc };
}

function computeTransform(canvas: HTMLCanvasElement): Transform {
  const w = canvas.width;
  const h = canvas.height;

  const drawableWidth = w - CANVAS_PADDING * 2;
  const drawableHeight = h - CANVAS_PADDING * 2;

  const scaleX = drawableWidth / (WORLD_EXTENT * 2);
  const scaleY = drawableHeight / (WORLD_EXTENT * 2);
  const scale = Math.min(scaleX, scaleY);

  const originX = w / 2;
  const originY = h / 2;

  return { scale, originX, originY };
}

// world (math) → canvas (pixels), with (0,0) at canvas center
export function worldToCanvas(x: number, y: number, canvas: HTMLCanvasElement, transform: Transform) {
  const { scale, originX, originY } = transform;
  const px = originX + x * scale;
  const py = originY - y * scale; // flip Y
  return { px, py };
}

// get full state for scoring / drawing hits
export function getTargetState(canvas: HTMLCanvasElement): TargetState | null {
  const radii = getRadii();
  if (radii.length === 0) return null;

  const center = getCenter();
  const transform = computeTransform(canvas);

  return { radii, center, transform };
}

// ---------- main draw function ----------

export function drawTarget(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const state = getTargetState(canvas);
  const radii = state?.radii ?? [];
  const { center } = state ?? { center: { xc: 0, yc: 0 } };

  const w = canvas.width;
  const h = canvas.height;

  // clear
  ctx.clearRect(0, 0, w, h);

  // background
  ctx.fillStyle = "#020617"; // slate-950-ish
  ctx.fillRect(0, 0, w, h);

  const transform = computeTransform(canvas);
  const { scale, originX, originY } = transform;

  // ---------- grid ----------
  ctx.save();
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = "rgba(148,163,184,0.15)";

  // vertical grid lines
  for (let x = -WORLD_EXTENT; x <= WORLD_EXTENT; x += GRID_STEP) {
    const { px } = worldToCanvas(x, 0, canvas, transform);
    ctx.beginPath();
    ctx.moveTo(px, CANVAS_PADDING * 0.5);
    ctx.lineTo(px, h - CANVAS_PADDING * 0.5);
    ctx.stroke();
  }

  // horizontal grid lines
  for (let y = -WORLD_EXTENT; y <= WORLD_EXTENT; y += GRID_STEP) {
    const { py } = worldToCanvas(0, y, canvas, transform);
    ctx.beginPath();
    ctx.moveTo(CANVAS_PADDING * 0.5, py);
    ctx.lineTo(w - CANVAS_PADDING * 0.5, py);
    ctx.stroke();
  }

  // axes
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(148,163,184,0.5)";

  // Y axis
  ctx.beginPath();
  ctx.moveTo(originX, CANVAS_PADDING * 0.5);
  ctx.lineTo(originX, h - CANVAS_PADDING * 0.5);
  ctx.stroke();

  // X axis
  ctx.beginPath();
  ctx.moveTo(CANVAS_PADDING * 0.5, originY);
  ctx.lineTo(w - CANVAS_PADDING * 0.5, originY);
  ctx.stroke();

  // board border
  ctx.strokeStyle = "rgba(148,163,184,0.4)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(CANVAS_PADDING * 0.5, CANVAS_PADDING * 0.5, w - CANVAS_PADDING, h - CANVAS_PADDING);
  ctx.restore();

  // ---------- axis labels ----------
  ctx.save();
  ctx.fillStyle = "rgba(248,250,252,0.7)";
  ctx.font = "18px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

  // X labels
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let x = -WORLD_EXTENT; x <= WORLD_EXTENT; x += LABEL_STEP) {
    if (x === 0) continue;
    const { px, py } = worldToCanvas(x, 0, canvas, transform);
    ctx.fillText(String(x), px, py + 4);
  }

  // Y labels
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let y = -WORLD_EXTENT; y <= WORLD_EXTENT; y += LABEL_STEP) {
    if (y === 0) continue;
    const { px, py } = worldToCanvas(0, y, canvas, transform);
    ctx.fillText(String(y), px - 4, py);
  }

  // Center label
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`Center: (${center.xc}, ${center.yc})`, CANVAS_PADDING * 0.5 + 4, CANVAS_PADDING * 0.5 + 2);
  ctx.restore();

  // ---------- draw target ----------
  if (!state) return;

  const { xc, yc } = state.center;
  const { px: cx, py: cy } = worldToCanvas(xc, yc, canvas, transform);

  for (let i = radii.length - 1; i >= 0; i--) {
    const rUnits = radii[i];
    const rPx = rUnits * scale;

    ctx.beginPath();
    ctx.arc(cx, cy, rPx, 0, Math.PI * 2);

    if (i > 0) {
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fill();
    }

    if (i === 0) {
      ctx.fillStyle = "#000000";
      ctx.fill();
    }

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.20)";
    ctx.stroke();
  }
}
