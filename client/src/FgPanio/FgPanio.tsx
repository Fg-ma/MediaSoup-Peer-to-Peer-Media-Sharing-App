import React, { useEffect, useRef, useState } from "react";
import FgPanel from "../fgPanel/FgPanel";
import "./lib/panioStyles.css";
import ScaleSection from "./lib/ScaleSection";

export default function FgPanio() {
  const scaleSectionRef = useRef<HTMLDivElement>(null);
  const keyWidth = useRef(0);
  const [visibleOctave, setVisibleOctave] = useState(0);

  const resize = () => {
    if (!scaleSectionRef.current) {
      return;
    }

    const heightInPixels = scaleSectionRef.current.offsetHeight;
    const newWidth = heightInPixels * 0.15;

    keyWidth.current = newWidth;

    scaleSectionRef.current.style.setProperty("--key-width", `${newWidth}px`);
    scaleSectionRef.current.style.setProperty(
      "--key-border-style",
      newWidth > 32 ? "solid" : "none"
    );

    getVisibleOctave();
  };

  const getVisibleOctave = () => {
    if (!scaleSectionRef.current) {
      return;
    }
    const octaveWidth = keyWidth.current * 7 + 6;
    const left = scaleSectionRef.current.scrollLeft;

    setVisibleOctave(Math.round(left / octaveWidth));
  };

  useEffect(() => {
    resize();
  }, []);

  return (
    <FgPanel
      content={
        <div className='panio'>
          <ScaleSection
            externalRef={scaleSectionRef}
            getVisibleOctave={getVisibleOctave}
            visibleOctave={visibleOctave}
          />
        </div>
      }
      resizeCallback={resize}
      initHeight={300}
      initWidth={400}
      minWidth={285}
      minHeight={190}
    />
  );
}
