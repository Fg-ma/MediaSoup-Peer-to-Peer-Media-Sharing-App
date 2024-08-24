import React, { useEffect, useRef } from "react";
import FgPanel from "../fgPanel/FgPanel";
import "./lib/panioStyles.css";
import ScaleSection from "./lib/ScaleSection";

export default function FgPanio() {
  const scaleSectionRef = useRef<HTMLDivElement>(null);

  const resize = () => {
    if (!scaleSectionRef.current) {
      return;
    }

    const heightInPixels = scaleSectionRef.current.offsetHeight;
    const newWidth = heightInPixels * 0.15;

    scaleSectionRef.current.style.setProperty("--key-width", `${newWidth}px`);
  };

  useEffect(() => {
    resize();
  }, []);

  return (
    <FgPanel
      content={
        <div className='panio'>
          <ScaleSection externalRef={scaleSectionRef} />
        </div>
      }
      resizeCallback={resize}
      initHeight={200}
      initWidth={200}
    />
  );
}
