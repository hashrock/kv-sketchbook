import { useEffect, useRef, useState } from "preact/hooks";

export default function Canvas(props: { uid: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const getContext = (canvas: HTMLCanvasElement) => {
    return canvas.getContext("2d") as CanvasRenderingContext2D;
  };

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = getContext(canvas);
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
  }, []);

  const down = (e: PointerEvent) => {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = getContext(canvas);
    ctx.beginPath();
    const scale = canvas.width / canvas.offsetWidth;
    const x = e.offsetX * scale;
    const y = e.offsetY * scale;
    ctx.moveTo(x, y);
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const up = (e: PointerEvent) => {
    setIsDrawing(false);
  };

  const move = (e: PointerEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = getContext(canvas);
    const scale = canvas.width / canvas.offsetWidth;
    const x = e.offsetX * scale;
    const y = e.offsetY * scale;
    ctx?.lineTo(x, y);
    ctx?.stroke();
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

  return (
    <div>
      <div class="flex flex-col border-4 border-gray-800 rounded shadow-xl">
        <canvas
          ref={canvasRef}
          class="bg-white touch-none border-gray-300 image-crisp"
          style="image-rendering: pixelated;"
          width={300}
          height={300}
          onPointerDown={down}
          onPointerUp={up}
          onPointerMove={move}
          onTouchMove={prevent}
          onPointerCancel={cancel}
        />
        <div>
          <button
            class="px-4 py-3 bg-gray-800 text-white w-full"
            onClick={save}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
