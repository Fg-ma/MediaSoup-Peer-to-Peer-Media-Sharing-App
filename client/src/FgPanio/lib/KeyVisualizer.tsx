import React, { useState, useEffect } from "react";

const keyColors: { [key: string]: string } = {
  a: "red",
  s: "orange",
  d: "yellow",
  f: "green",
  g: "blue",
  h: "indigo",
  j: "violet",
};

const KeyVisualizer: React.FC = () => {
  const [keyPresses, setKeyPresses] = useState<
    Map<string, { startTime: number; duration: number }>
  >(new Map());
  const [disappearedKeys, setDisappearedKeys] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (keyColors[event.key] && !keyPresses.has(event.key)) {
        setKeyPresses((prev) =>
          new Map(prev).set(event.key, { startTime: Date.now(), duration: 0 })
        );
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (keyColors[event.key] && keyPresses.has(event.key)) {
        const { startTime } = keyPresses.get(event.key) || { startTime: 0 };
        const duration = Date.now() - startTime;
        setKeyPresses((prev) => {
          const newPresses = new Map(prev);
          newPresses.set(event.key, { startTime, duration });
          return newPresses;
        });

        // Mark the key for disappearing animation
        setDisappearedKeys((prev) => new Set(prev).add(event.key));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyPresses]);

  useEffect(() => {
    // Remove disappeared keys after animation
    const timer = setTimeout(() => {
      setDisappearedKeys(new Set());
    }, 1000); // Duration of the upward animation

    return () => clearTimeout(timer);
  }, [disappearedKeys]);

  return (
    <div className='w-full h-64 bg-gray-200 relative overflow-hidden'>
      {[...keyPresses.entries()].map(
        ([key, { startTime, duration }], index) => {
          const currentDuration = Date.now() - startTime;
          const height = Math.min(duration, currentDuration) / 10; // Calculate height based on duration

          return (
            <div
              key={key} // Use key value as the unique key for React
              className={`absolute bottom-0 w-6 ${
                disappearedKeys.has(key) ? "animate-up" : ""
              }`}
              style={{
                backgroundColor: keyColors[key],
                left: `${index * 24}px`,
                height: `${height}px`, // Set height based on duration
                transition: "height 0.1s ease-out", // Smooth height transition
              }}
            />
          );
        }
      )}
      <style>
        {`
          @keyframes animateUp {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(-100vh); // Move upward off the screen
            }
          }
          .animate-up {
            animation: animateUp 1s forwards; // Duration of the upward animation
          }
        `}
      </style>
    </div>
  );
};

export default KeyVisualizer;
