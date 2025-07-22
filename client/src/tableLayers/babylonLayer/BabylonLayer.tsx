import React, { useEffect } from "react";
import TableBabylonScene from "../../tableBabylon/TableBabylonScene";
import { useTableContext } from "../../context/tableContext/TableContext";

export default function BabylonLayer() {
  const { tableBabylonCanvasRef, tableBabylonScene } = useTableContext();

  useEffect(() => {
    if (tableBabylonCanvasRef.current) {
      tableBabylonScene.current = new TableBabylonScene(
        tableBabylonCanvasRef.current,
        undefined,
      );
    }
  }, []);

  return (
    <canvas
      className="z-table-babylon pointer-events-auto absolute left-0 top-0 h-full w-full"
      ref={tableBabylonCanvasRef}
    />
  );
}
