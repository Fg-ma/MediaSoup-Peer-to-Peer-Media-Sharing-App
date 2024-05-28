import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated } from "react-spring";

const VolumeIndicator = ({
  audioStream,
  bundleRef,
  handleMute,
  springDuration = 250,
  noiseThreshold = 0.2,
  numFixedPoints = 10,
  bellCurveAmplitude = 1,
  bellCurveMean = 0.5,
  bellCurveStdDev = 0.4,
}: {
  audioStream?: MediaStream;
  bundleRef: React.RefObject<HTMLDivElement>;
  handleMute: () => void;
  springDuration?: number;
  noiseThreshold?: number;
  numFixedPoints?: number;
  bellCurveAmplitude?: number;
  bellCurveMean?: number;
  bellCurveStdDev?: number;
}) => {
  const bellCurveY = useRef<number[]>([]);
  const fixedPointsX = useRef<number[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [movingY, setMovingY] = useState<number[]>(
    Array(numFixedPoints - 1).fill(0)
  );
  const springs = useSpring<{ [key: string]: any }>({
    ...Object.fromEntries(movingY.map((y, index) => [`y${index + 1}`, y])),
    config: { duration: springDuration },
  });

  // Init
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const bbox = pathRef.current?.getBBox();
      const svgPoint = svgRef.current?.createSVGPoint();
      if (!bbox || !svgPoint) return;

      svgPoint.x = event.clientX;
      svgPoint.y = event.clientY;

      // Convert client coordinates to SVG coordinates
      const svgPointTransformed = svgPoint.matrixTransform(
        svgRef.current?.getScreenCTM()?.inverse()
      );

      if (
        svgPointTransformed.x >= bbox.x &&
        svgPointTransformed.x <= bbox.x + bbox.width &&
        svgPointTransformed.y >= bbox.y &&
        svgPointTransformed.y <= bbox.y + bbox.height
      ) {
        handleMute();
        if (
          pathRef.current &&
          bundleRef.current &&
          bundleRef.current.classList.contains("mute")
        ) {
          pathRef.current.style.stroke = "#F56114";
        } else if (
          pathRef.current &&
          bundleRef.current &&
          !bundleRef.current.classList.contains("mute")
        ) {
          pathRef.current.style.stroke = "black";
        }
      }
    };

    svgRef.current?.addEventListener("click", (event) => onClick(event));

    // X points
    const step = 200 / (numFixedPoints - 1);
    fixedPointsX.current = Array.from(
      { length: numFixedPoints },
      (_, i) => i * step
    );

    // Bell curve
    const generateBellCurve = (
      numPoints: number,
      amplitude: number,
      mean: number,
      stdDev: number
    ) => {
      const yCoordinates = [];
      const step = 1 / (numPoints - 1);

      for (let i = 0; i < numPoints; i++) {
        const x = i * step;
        const exponent = -Math.pow((x - mean) / stdDev, 2) / 2;
        const y = amplitude * Math.exp(exponent);
        yCoordinates.push(y);
      }

      return yCoordinates;
    };

    bellCurveY.current = generateBellCurve(
      numFixedPoints - 1,
      bellCurveAmplitude,
      bellCurveMean,
      bellCurveStdDev
    );

    return () => {
      svgRef.current?.removeEventListener("click", (event) => onClick(event));
    };
  }, []);

  // Audio analyser
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

        // Function to update audio levels
        const updateAudioLevels = () => {
          if (!analyser) return;

          // Create a buffer for frequency data
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          // Get frequency data
          analyser.getByteFrequencyData(dataArray);

          // Get the maximum value in the frequency data array
          const sum = dataArray.reduce((acc, value) => acc + value, 0);
          const meanVolume = sum / dataArray.length;

          // Do something with the current volume
          const normalizedVolume = meanVolume / 100;

          updateMovingY(
            normalizedVolume < noiseThreshold
              ? 0
              : Math.min(normalizedVolume, 1)
          );

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

  // Function to update the moving points' Y values
  const updateMovingY = (volumeLevel: number) => {
    const curvedArray = bellCurveY.current.map(
      (value, index) => value * volumeLevel * 200 * (-1) ** index
    );
    setMovingY(curvedArray);
  };

  // Generate the path data using the fixed and moving points
  const generatePathData = (ySprings: number[]) => {
    const path = [`M${fixedPointsX.current[0]} 0`];
    for (let i = 1; i < fixedPointsX.current.length; i++) {
      const xMid =
        fixedPointsX.current[i - 1] +
        (fixedPointsX.current[i] - fixedPointsX.current[i - 1]) / 2;
      path.push(`Q${xMid} ${ySprings[i - 1]}, ${fixedPointsX.current[i]} 0`);
    }
    return path.join(" ");
  };

  const ySpringsArray = Object.values(springs).map((spring: any) =>
    spring.get()
  );
  const animatedPathData = springs.y1.to(() => generatePathData(ySpringsArray));

  return (
    <div className='w-min h-min relative'>
      <svg
        ref={svgRef}
        className='z-50 w-40 aspect-square'
        viewBox='0 -150 200 300'
      >
        <animated.path
          ref={pathRef}
          d={animatedPathData}
          stroke='black'
          strokeWidth='7'
          fill='none'
          strokeLinecap='round'
          filter={
            !ySpringsArray.every((element) => element === 0)
              ? "url(#shadow)"
              : ""
          }
        />
        <defs>
          <filter id='shadow'>
            <feGaussianBlur in='SourceAlpha' stdDeviation='2' result='blur' />
            <feOffset in='blur' dx='1' dy='2' result='offsetBlur' />
            <feMerge>
              <feMergeNode in='offsetBlur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default VolumeIndicator;
