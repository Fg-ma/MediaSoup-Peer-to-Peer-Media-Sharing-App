import React from "react";

export default function KeyVisualizer({
  keyVisualizerRef,
  keyPresses,
}: {
  keyVisualizerRef: React.RefObject<HTMLDivElement>;
  keyPresses: {
    [key: string]: {
      currentlyPressed: boolean;
      height: number;
      bottom: number;
    }[];
  };
}) {
  return (
    <div className='w-full h-full flex items-center justify-center bg-fg-white-90'>
      <div ref={keyVisualizerRef} className='key-visualizer'>
        {Object.entries(keyPresses).map(([key, keyPressArray]) =>
          keyPressArray.map((instance, index) => {
            return (
              <div
                key={`${key}_${index}`}
                className={`key-visualizer-key ${key}`}
                style={{
                  backgroundColor: "orange",
                  bottom: instance && instance.bottom && `${instance.bottom}px`,
                  height: instance && instance.height && `${instance.height}px`,
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
