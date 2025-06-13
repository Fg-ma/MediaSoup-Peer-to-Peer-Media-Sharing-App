import React, { useEffect, useRef } from "react";
import "./lib/initializingSpinner.css";

export default function InitializingSpinner({
  progress = 0,
  revolutionDuration = 1.5,
  pauseDuration = 3.5,
  tailLength = 6,
  color = "#3b82f6",
}) {
  const progressRef = useRef(progress);
  const spinnerContainerRef = useRef<HTMLDivElement>(null);

  // clamp progress
  useEffect(() => {
    progressRef.current = Math.min(Math.max(progress, 0), 1);
  }, [progress]);

  useEffect(() => {
    let cancelled = false;

    async function animatePhase(
      duration: number,
      onProgress: (p: number) => void,
    ) {
      return new Promise<void>((resolve) => {
        const start = performance.now();
        function tick(now: number) {
          if (cancelled) return resolve();
          const elapsed = now - start;
          const p = Math.min(1, elapsed / (duration * 1000));
          onProgress(p);
          if (p < 1) {
            requestAnimationFrame(tick);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(tick);
      });
    }

    async function run() {
      while (!cancelled) {
        // reset progress states
        spinnerContainerRef.current?.style.setProperty("--spin-progress", "0");
        spinnerContainerRef.current?.style.setProperty("--pause-progress", "0");

        // spinProgress: 0-1
        await animatePhase(revolutionDuration, (p) => {
          spinnerContainerRef.current?.style.setProperty(
            "--angle",
            `${p * 360}`,
          );
          spinnerContainerRef.current?.style.setProperty(
            "--spin-progress",
            `${p}`,
          );
        });

        // pauseProgress: 0-1
        await animatePhase(pauseDuration, (p) => {
          spinnerContainerRef.current?.style.setProperty(
            "--pause-progress",
            `${Math.min(1, p * 6)}`,
          );
        });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [revolutionDuration, pauseDuration]);

  useEffect(() => {
    spinnerContainerRef.current?.style.setProperty(
      "--tail-length",
      `${tailLength}`,
    );
  }, [tailLength]);

  const segments = Array.from({ length: tailLength }, (_, i) => i);

  return (
    <div
      ref={spinnerContainerRef}
      className="spinner-container relative aspect-square w-52 rounded-full bg-white"
    >
      {segments.map((i) => {
        return (
          <div
            key={i}
            className="spinner-segment-container absolute inset-0"
            style={{
              "--i": i,
              transformOrigin: "50% 50%",
              transition: `transform 0.016s linear`,
            }}
          >
            <div
              className="absolute left-1/2 aspect-square -translate-x-1/2 rounded-full"
              style={{
                width: `${20 - (20 / tailLength) * i}%`,
                top: `${((20 / tailLength) * i) / 2}%`,
                background: color,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
