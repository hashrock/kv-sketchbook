import { StateUpdater, useEffect, useRef, useState } from "preact/hooks";
import { drawCircle, drawLine } from "🛠️/canvas.ts";
import IconSend from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/send.tsx";
import IconTrash from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/trash.tsx";

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
    // window.removeEventListener(
    //   "beforeunload",
    //   handleBeforeUnloadEvent,
    // );

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

  const handleBeforeUnloadEvent = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = "";
  };

  function clear() {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = getContext(canvas);
    ctx.fillStyle = pallete[pallete.length - 1];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // useEffect(() => {
  //   globalThis.window.addEventListener("beforeunload", handleBeforeUnloadEvent);
  //   return () => {
  //     globalThis.window.removeEventListener(
  //       "beforeunload",
  //       handleBeforeUnloadEvent,
  //     );
  //   };
  // }, []);

  return (
    <div>
      <div class="flex flex-col border-2 border-green-400 rounded shadow-xl">
        <canvas
          ref={canvasRef}
          class="bg-green-200 touch-none image-crisp"
          style="image-rendering: pixelated; touch-action: none;"
          width={200}
          height={200}
          onPointerDown={down}
          onPointerUp={up}
          onPointerMove={move}
          onTouchMove={prevent}
          onPointerCancel={cancel}
        />
        <div class="flex flex-col md:flex-row md:items-center bg-white">
          <div class="flex-1 flex flex-col sm:flex-row sm:items-center mx-4 gap-x-12 my-2 gap-y-6">
            <div class="flex items-center gap-1">
              {pallete.map((p) => (
                <button
                  class={"w-8 h-8 rounded-full border-2 " +
                    (p === color ? " border-blue-500" : " border-white ")}
                  style={`background-color: ${p}`}
                  onClick={() => setColor(p)}
                >
                </button>
              ))}
            </div>

            <DensityUi density={density} setDensity={setDensity} />

            <div class="flex items-center">
              {penSizeList.map((p) => (
                <button
                  class={"inline-flex hover:text-gray-500 justify-center items-center rounded border-2 " +
                    (penSize === p ? " border-blue-500" : " border-white")}
                  onClick={() => setPenSize(p)}
                >
                  <svg width={30} height={30} class="bg-transparent">
                    <circle cx="50%" cy="50%" r={p} fill="currentColor" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <button
            alt="Clear"
            class="p-3 mr-2 text-gray-500 hover:text-red-500"
            onClick={clear}
          >
            <IconTrash class="w-6 h-6" />
          </button>

          <button
            class="flex flex-row md:flex-col justify-center px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white"
            onClick={save}
            type="button"
          >
            <IconSend class="w-6 h-6" />
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

function DensityUi(
  { density, setDensity }: {
    density: number;
    setDensity: StateUpdater<number>;
  },
) {
  return (
    <div class="flex items-center">
      <button
        class={"border-2 hover:text-gray-500 " +
          (density === 1 ? "border-blue-500" : "border-white")}
        onClick={() => {
          setDensity(1);
        }}
      >
        <SvgFull />
      </button>
      <button
        class={"border-2 hover:text-gray-500 " +
          (density === 0.5 ? "border-blue-500" : "border-white ")}
        onClick={() => {
          setDensity(0.5);
        }}
      >
        <SvgGrid3 />
      </button>
      <button
        class={"border-2 hover:text-gray-500 " +
          (density === 0.3 ? "border-blue-500" : "border-white ")}
        onClick={() => {
          setDensity(0.3);
        }}
      >
        <SvgGrid2 />
      </button>
      <button
        class={"border-2 hover:text-gray-500 " +
          (density === 0.1 ? "border-blue-500" : "border-white ")}
        onClick={() => {
          setDensity(0.1);
        }}
      >
        <SvgGrid1 />
      </button>
    </div>
  );
}

function SvgFull() {
  return (
    <svg width={32} height={32} class="bg-white">
      <rect width="100%" height="100%" fill="currentColor" />
    </svg>
  );
}

function SvgGrid1() {
  return (
    <svg width={32} height={32} class="bg-white">
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
            fill="currentColor"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

function SvgGrid2() {
  return (
    <svg width={32} height={32} class="bg-white">
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
            fill="currentColor"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid2)" />
    </svg>
  );
}

function SvgGrid3() {
  return (
    <svg width={32} height={32} class="bg-white">
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
            fill="currentColor"
          />
          <rect
            x="10%"
            y="10%"
            width="10%"
            height="10%"
            fill="currentColor"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid3)" />
    </svg>
  );
}
