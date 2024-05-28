import React, { useEffect, useRef } from "react";
import "./volumeIndicatorOld.css";

export default function VolumeIndicator({
  audioStream,
}: {
  audioStream?: MediaStream;
}) {
  const numSquares = useRef(26);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;

    const initAudio = async () => {
      try {
        // Get access to the user's microphone
        const stream = audioStream;

        if (!stream) {
          return;
        }

        // Create audio context
        audioContext = new AudioContext();

        // Create analyser node
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        // Connect the audio stream to the analyser node
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const noiseThreshold = 100;

        // Function to update audio levels
        const updateAudioLevels = () => {
          if (!analyser) return;

          // Create a buffer for frequency data
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          // Get frequency data
          analyser.getByteFrequencyData(dataArray);

          // Filter out values below the noise threshold
          const filteredData = dataArray.map((value) =>
            value < noiseThreshold ? 0 : value
          );

          // Get the maximum value in the frequency data array
          const maxVolume = filteredData.reduce(
            (max, value) => Math.max(max, value),
            0
          );

          // Do something with the current volume
          console.log("Current volume:", maxVolume);
          setVolumeIndicatorStyles(maxVolume);

          // Call this function again on the next animation frame
          requestAnimationFrame(updateAudioLevels);
        };

        // Start updating audio levels
        updateAudioLevels();
      } catch (err) {
        console.error("Error accessing audio stream:", err);
      }
    };

    initAudio();

    // Cleanup on unmount
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  const setVolumeIndicatorStyles = (volume: number) => {
    const maxVolume = 350;
    const cutoffVolume = 100;
    const volumeIncrement = (maxVolume - cutoffVolume) / numSquares.current;
    const filledSquares = (volume - cutoffVolume) / volumeIncrement;

    if (!containerRef.current) return;

    var angleIncrement = (2 * Math.PI) / numSquares.current;
    var radius = containerRef.current.offsetWidth / 1.4;

    for (var i = 0; i < numSquares.current; i++) {
      var square = containerRef.current.children[i] as HTMLDivElement;
      if (square) {
        // Get all classes from the element
        const classes = square.classList;

        // Convert classList to an array and filter out the classToKeep
        const classesToRemove = Array.from(classes).filter(
          (cls) => cls !== "square"
        );

        // Remove the classes to remove
        classesToRemove.forEach((cls) => classes.remove(cls));
      }
      var angle = angleIncrement * i;
      var x = Math.cos(angle) * radius;
      var y = Math.sin(angle) * radius;

      square.style.left = 50 + x + "%";
      square.style.top = 50 + y + "%";
      var rotationAngle = angle * (180 / Math.PI) + 90;
      square.style.transform = `translate(-50%, -50%) rotate(${rotationAngle}deg)`;
      if (Math.floor(filledSquares) - 2 < i && i < Math.floor(filledSquares)) {
        square.classList.add("partially-filled");
      } else if (i < Math.floor(filledSquares)) {
        square.classList.add("filled");
      } else if (filledSquares - i > 0.5) {
        square.classList.add("small-filled");
      }
    }
  };

  const squares = [];
  for (let i = 0; i < numSquares.current; i++) {
    squares.push(<div key={i} className='square'></div>);
  }

  return (
    <div className='aspect-square h-full flex items-center justify-center absolute left-0 top-0'>
      <div
        ref={containerRef}
        className='h-full aspect-square relative rotate-90 scale-y-[-1]'
      >
        {squares}
      </div>
    </div>
  );
}
