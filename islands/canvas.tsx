import { useEffect, useRef, useState } from "preact/hooks";
import { drawCircle, drawLine } from "🛠️/canvas.ts";

export default function Canvas(props: { uid: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [density, setDensity] = useState(1);
  const [penSize, setPenSize] = useState(2);

  const pallete = [
    "#000000",
    "#a7f3d0",
  ];
  const penSizeList = [1, 2, 3, 5, 8, 10, 15];

  const [color, setColor] = useState("#000000");

  const getContext = (canvas: HTMLCanvasElement) => {
    return canvas.getContext("2d") as CanvasRenderingContext2D;
  };

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = getContext(canvas);
    ctx.fillStyle = pallete[pallete.length - 1];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const down = (e: PointerEvent) => {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = getContext(canvas);
    const scale = canvas.width / canvas.offsetWidth;
    const x = Math.floor(e.offsetX * scale);
    const y = Math.floor(e.offsetY * scale);
    drawCircle(ctx, x, y, penSize, density, color);
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

    drawLine(ctx, lastX, lastY, x, y, penSize, density, color);
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
  function onChangeColor(e: Event) {
    setColor((e.target as HTMLSelectElement).value);
  }

  return (
    <div>
      <div class="flex flex-col border-2 border-green-400 rounded shadow-xl">
        <canvas
          ref={canvasRef}
          class="bg-green-200 touch-none image-crisp"
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
          <div>
            <button
              class={"border-2 " +
                (density === 1 ? "border-green-500" : "")}
              onClick={() => {
                setDensity(1);
              }}
            >
              <SvgFull />
            </button>
            <button
              class={"border-2 " + (density === 0.5 ? "border-green-500" : "")}
              onClick={() => {
                setDensity(0.5);
              }}
            >
              <SvgGrid3 />
            </button>
            <button
              class={"border-2 " + (density === 0.3 ? "border-green-500" : "")}
              onClick={() => {
                setDensity(0.3);
              }}
            >
              <SvgGrid2 />
            </button>
            <button
              class={"border-2 " + (density === 0.1 ? "border-green-500" : "")}
              onClick={() => {
                setDensity(0.1);
              }}
            >
              <SvgGrid1 />
            </button>
          </div>

          <div>
            {penSizeList.map((p) => (
              <button
                class={"inline-flex justify-center items-center rounded border-2 " +
                  (penSize === p ? " border-green-500" : " border-white")}
                onClick={() => setPenSize(p)}
              >
                <svg width={30} height={30} class="bg-transparent">
                  <circle cx="50%" cy="50%" r={p} fill="black" />
                </svg>
              </button>
            ))}
          </div>

          <div>
            {pallete.map((p) => (
              <button
                class={"w-8 h-8 rounded-full border-2 ring-0 " +
                  (p === color ? " border-green-500" : " border-white")}
                style={`background-color: ${p}`}
                onClick={() => setColor(p)}
              >
              </button>
            ))}
          </div>

          {
            /* <select onInput={onChangeColor}>
            <option value="#000000">Black</option>
            <option value="#ffffff">White</option>
          </select> */
          }

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

function SvgFull() {
  return (
    <svg width={32} height={32} class="bg-transparent">
      <rect width="100%" height="100%" fill="black" />
    </svg>
  );
}

function SvgGrid1() {
  return (
    <svg width={32} height={32} class="bg-transparent">
      <defs>
        <pattern
          id="grid"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <rect
            x="0%"
            y="0%"
            width="10%"
            height="10%"
            fill="black"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

function SvgGrid2() {
  return (
    <svg width={32} height={32} class="bg-transparent">
      <defs>
        <pattern
          id="grid2"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <rect
            x="0%"
            y="0%"
            width="10%"
            height="10%"
            fill="black"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid2)" />
    </svg>
  );
}

function SvgGrid3() {
  return (
    <svg width={32} height={32} class="bg-transparent">
      <defs>
        <pattern
          id="grid3"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <rect
            x="0%"
            y="0%"
            width="10%"
            height="10%"
            fill="black"
          />
          <rect
            x="10%"
            y="10%"
            width="10%"
            height="10%"
            fill="black"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid3)" />
    </svg>
  );
}
