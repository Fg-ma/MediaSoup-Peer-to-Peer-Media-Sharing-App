import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

export default function Captions({
  videoContainerRef,
  voskCaptions,
  containerRef,
}: {
  videoContainerRef: React.RefObject<HTMLDivElement>;
  voskCaptions: string;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const [timedOut, setTimedOut] = useState(false);
  const captionsRef = useRef<HTMLDivElement>(null);
  const timeOut = useRef<NodeJS.Timeout | undefined>(undefined);

  if (!videoContainerRef.current) {
    return;
  }

  useEffect(() => {
    timeOut.current = setTimeout(() => {
      setTimedOut(true);
    }, 4500);

    return () => {
      setTimedOut(false);
      clearTimeout(timeOut.current);
      timeOut.current = undefined;
    };
  }, [voskCaptions]);

  useEffect(() => {
    if (!captionsRef.current) {
      return;
    }

    // Get the total scroll height
    const totalHeight = captionsRef.current.scrollHeight;

    // Calculate the height of three lines
    const lineHeight = parseFloat(
      getComputedStyle(captionsRef.current).lineHeight
    );
    const maxVisibleHeight = lineHeight * 3;

    // Scroll to the last three lines
    if (totalHeight > maxVisibleHeight) {
      captionsRef.current.scrollTop = totalHeight - maxVisibleHeight;
    }
  }, [voskCaptions, containerRef.current?.clientWidth]);

  return ReactDOM.createPortal(
    <div
      className='captions w-max'
      style={{
        maxWidth: `${(containerRef.current?.clientWidth ?? 1) * 0.8}px`,
      }}
    >
      {!timedOut && voskCaptions && (
        <div
          ref={captionsRef}
          className='caption-text select-none'
          style={{
            maxWidth: `${(containerRef.current?.clientWidth ?? 1) * 0.8}px`,
          }}
        >
          {voskCaptions}
        </div>
      )}
    </div>,
    videoContainerRef.current
  );
}
