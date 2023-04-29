import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

export default function Canvas() {
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
    ctx.moveTo(e.offsetX, e.offsetY);
  };

  const up = (e: PointerEvent) => {
    setIsDrawing(false);
  };

  const move = (e: PointerEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = getContext(canvas);
    ctx?.lineTo(e.offsetX, e.offsetY);
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
      // reload
      location.reload();
    }
  };

  return (
    <div>
      <h1>Canvas</h1>
      <canvas
        ref={canvasRef}
        class="bg-white touch-none"
        width={300}
        height={300}
        onPointerDown={down}
        onPointerUp={up}
        onPointerMove={move}
        onTouchMove={prevent}
        onPointerCancel={cancel}
      />

      <div>
        <button onClick={save}>Save</button>
      </div>
    </div>
  );
}
