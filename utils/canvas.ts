export function drawPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: number,
  density: number,
  color: string
) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    drawCircle(ctx, x1, y1, r, density, color);
    if (x1 === x2 && y1 === y2) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x1 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y1 += sy;
    }
  }
}

const bayerMatrix = [
  [1, 9, 3, 11],
  [13, 5, 15, 7],
  [4, 12, 2, 10],
  [16, 8, 14, 6],
];

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  density: number,
  color: string
) {
  for (let iy = 0; iy < 200; iy++) {
    for (let ix = 0; ix < 200; ix++) {
      const x = ix - 100;
      const y = iy - 100;

      if (x * x + y * y < r * r) {
        const sx = x + cx;
        const sy = y + cy;

        //halftone
        const bayer = bayerMatrix[mod(sx, 4)][mod(sy, 4)];
        if (bayer / 16 > density) continue;

        drawPixel(ctx, sx, sy, color);
      }
    }
  }
}
