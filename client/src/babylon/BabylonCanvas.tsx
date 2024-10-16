import React, { useEffect, useRef } from "react";
import BabylonScene from "./BabylonScene";

export default function BabylonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // new BabylonScene(canvasRef.current);
  }, []);

  return <canvas ref={canvasRef} style={{ width: "640px", height: "480px" }} />;
}
