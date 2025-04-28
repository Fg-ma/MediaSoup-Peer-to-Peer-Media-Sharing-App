import React, { useEffect, useRef } from "react";

export default function TableGridOverlay({
  gridSize,
  tableTopRef,
  gridColor,
}: {
  gridSize: { rows: number; cols: number };
  tableTopRef: React.RefObject<HTMLDivElement>;
  gridColor: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;

        // Draw grid
        const rowHeight = height / gridSize.rows;
        const colWidth = width / gridSize.cols;

        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;

        // Draw horizontal lines
        for (let i = 0; i <= gridSize.rows; i++) {
          ctx.beginPath();
          ctx.moveTo(0, i * rowHeight);
          ctx.lineTo(width, i * rowHeight);
          ctx.stroke();
        }

        // Draw vertical lines
        for (let i = 0; i <= gridSize.cols; i++) {
          ctx.beginPath();
          ctx.moveTo(i * colWidth, 0);
          ctx.lineTo(i * colWidth, height);
          ctx.stroke();
        }
      }
    }
  }, [gridSize, gridColor]);

  return (
    <canvas
      ref={canvasRef}
      className="z-grid-overlay absolute left-0 top-0 h-full w-full"
      width={tableTopRef.current?.clientWidth ?? 1}
      height={tableTopRef.current?.clientHeight ?? 1}
    ></canvas>
  );
}
