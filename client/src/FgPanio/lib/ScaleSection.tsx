import React, { useEffect } from "react";
import Scale from "./Scale";

export default function ScaleSection({
  externalRef,
}: {
  externalRef?: React.RefObject<HTMLDivElement>;
}) {
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (externalRef && externalRef.current) {
        externalRef.current.scrollLeft += event.deltaY;
      }
    };

    externalRef?.current?.addEventListener("wheel", handleWheel);

    return () => {
      externalRef?.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div ref={externalRef} className='scale-section space-x-0.25'>
      <Scale />
      <Scale />
      <Scale />
      <Scale />
    </div>
  );
}
