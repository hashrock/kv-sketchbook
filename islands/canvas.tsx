import { useEffect, useRef, useState } from "preact/hooks";

export default function Canvas(props: { uid: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [density, setDensity] = useState(1);
  const [penSize, setPenSize] = useState(2);

  const getContext = (canvas: HTMLCanvasElement) => {
    return canvas.getContext("2d") as CanvasRenderingContext2D;
  };

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = getContext(canvas);
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
  }, []);

  function drawPixel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
  ) {
    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }

  function drawLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    r: number,
  ) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      drawCircle(ctx, x1, y1, r);
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

  function drawCircle(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
  ) {
    for (let iy = 0; iy < 200; iy++) {
      for (let ix = 0; ix < 200; ix++) {
        const x = ix - 100;
        const y = iy - 100;

        if (x * x + y * y < r * r) {
          const sx = x + cx;
          const sy = y + cy;

          //halftone
          const bayer = bayerMatrix[sx % 4][sy % 4];
          if (bayer / 16 > density) continue;

          drawPixel(ctx, sx, sy);
        }
      }
    }
  }

  const down = (e: PointerEvent) => {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = getContext(canvas);
    const scale = canvas.width / canvas.offsetWidth;
    const x = Math.floor(e.offsetX * scale);
    const y = Math.floor(e.offsetY * scale);
    drawCircle(ctx, x, y, penSize);
    setLastX(x);
    setLastY(y);
  };

  const up = (e: PointerEvent) => {
    setIsDrawing(false);
  };

  const move = (e: PointerEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = getContext(canvas);
    const scale = canvas.width / canvas.offsetWidth;
    const x = Math.floor(e.offsetX * scale);
    const y = Math.floor(e.offsetY * scale);

    drawLine(ctx, lastX, lastY, x, y, penSize);
    setLastX(x);
    setLastY(y);
  };

  const prevent = (e: TouchEvent) => {
    e.preventDefault();
  };

  const cancel = (e: PointerEvent) => {
    setIsDrawing(false);
  };
  const save = async () => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const promise = new Promise((resolve) => {
      canvas.toBlob(resolve, `image/png`);
    });

    const blob = await promise as Blob;
    const formData = new FormData();
    formData.append("image", blob);
    const res = await fetch("/api/image", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      location.href = "/user/" + props.uid + "";
    }
  };

  function onChangeDensity(e: Event) {
    setDensity(Number((e.target as HTMLSelectElement).value));
  }
  function onChangePenSize(e: Event) {
    setPenSize(Number((e.target as HTMLSelectElement).value));
  }

  return (
    <div>
      <div class="flex flex-col border-2 border-green-400 rounded shadow-xl">
        <canvas
          ref={canvasRef}
          class="bg-green-200 touch-none border-gray-300 image-crisp"
          style="image-rendering: pixelated;"
          width={200}
          height={200}
          onPointerDown={down}
          onPointerUp={up}
          onPointerMove={move}
          onTouchMove={prevent}
          onPointerCancel={cancel}
        />
        <div>
          <select
            onInput={onChangeDensity}
          >
            <option value="0.1">10%</option>
            <option value="0.3">30%</option>
            <option value="0.5">50%</option>
            <option value="1.0">100%</option>
          </select>

          <select onInput={onChangePenSize}>
            <option value="1">1px</option>
            <option value="2">2px</option>
            <option value="3">3px</option>
            <option value="4">4px</option>
            <option value="5">5px</option>
            <option value="6">6px</option>
            <option value="7">7px</option>
            <option value="8">8px</option>
            <option value="9">9px</option>
            <option value="10">10px</option>
            <option value="10">15px</option>
            <option value="10">20px</option>
          </select>

          <button
            class="px-4 py-3 bg-gray-800 text-white"
            onClick={save}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
