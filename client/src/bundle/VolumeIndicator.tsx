import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated } from "react-spring";
import { colors } from "./colors";

const VolumeIndicator = ({
  audioStream,
  audioRef,
  username,
  handleMute,
  muteLock,
  localMuted,
  isUser = false,
  springDuration = 250,
  noiseThreshold = 0.2,
  numFixedPoints = 10,
  bellCurveAmplitude = 1,
  bellCurveMean = 0.5,
  bellCurveStdDev = 0.4,
  shadowColor = "black",
  volumeColor = "FgPrimary",
  primaryMuteColor = "FgPrimary",
  secondaryMuteColor = "black",
}: {
  audioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  username: string;
  handleMute: () => void;
  muteLock: React.MutableRefObject<boolean>;
  localMuted: React.MutableRefObject<boolean>;
  isUser?: boolean;
  springDuration?: number;
  noiseThreshold?: number;
  numFixedPoints?: number;
  bellCurveAmplitude?: number;
  bellCurveMean?: number;
  bellCurveStdDev?: number;
  shadowColor?: string;
  volumeColor?: string;
  primaryMuteColor?: string;
  secondaryMuteColor?: string;
}) => {
  const shadowColors = {
    black: "rgba(0, 0, 0, 0.8)",
    red: "rgba(90, 0, 0, 0.8)",
    green: "rgba(0, 90, 0, 0.8)",
    blue: "rgba(0, 0, 90, 0.8)",
    purple: "rgba(70, 8, 91, 0.8)",
    pink: "rgba(95, 23, 71, 0.8)",
    yellow: "rgba(96, 82, 30, 0.8)",
    lime: "rgba(67, 96, 30, 0.8)",
    aqua: "rgba(30, 96, 96, 0.8)",
    FgPrimary: "rgba(96, 38, 8, 0.8)",
    FgSecondary: "rgba(17, 57, 96, 0.8)",
  };
  const [movingY, setMovingY] = useState<number[]>(
    Array(numFixedPoints - 1).fill(0)
  );
  const [isDragging, setIsDragging] = useState(false);
  const [leftHandlePosition, setLeftHandlePosition] = useState({ x: 10, y: 0 });
  const [rightHandlePosition, setRightHandlePosition] = useState({
    x: 190,
    y: 0,
  });
  const bellCurveY = useRef<number[]>([]);
  const fixedPointsX = useRef<number[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const leftHandleRef = useRef<SVGRectElement>(null);
  const rightHandleRef = useRef<SVGRectElement>(null);
  const sideDragging = useRef<"left" | "right" | null>(null);
  const patternWidth = 0.18;
  const patternHeight = 0.2;

  const springs = useSpring<{ [key: string]: any }>({
    ...Object.fromEntries(movingY.map((y, index) => [`y${index + 1}`, y])),
    config: { duration: springDuration },
  });

  const init = () => {
    // X points
    const totalWidth = 200;
    const startOffset = 20;
    const endOffset = 20;
    const usableWidth = totalWidth - startOffset - endOffset;
    const step = usableWidth / (numFixedPoints - 1);

    fixedPointsX.current = Array.from(
      { length: numFixedPoints },
      (_, i) => startOffset + i * step
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
  };

  const handleVolumeSlider = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (!isUser) {
        audioRef.current.muted = volume === 0;
      }
    }
  };

  useEffect(() => {
    const startDrag = (event: MouseEvent, side: "left" | "right") => {
      event.preventDefault();
      setIsDragging(true);
      sideDragging.current = side;
    };

    const drag = (event: MouseEvent) => {
      if (!isDragging || !svgRef.current || !sideDragging.current) return;

      const svgPoint = svgRef.current.createSVGPoint();
      svgPoint.x = event.clientX;
      svgPoint.y = event.clientY;
      const cursorPoint = svgPoint.matrixTransform(
        svgRef.current.getScreenCTM()?.inverse()
      );
      const newY = Math.max(-220, Math.min(220, cursorPoint.y));
      if (sideDragging.current === "left") {
        setLeftHandlePosition((prevState) => ({ ...prevState, y: newY }));
      } else if (sideDragging.current === "right") {
        setRightHandlePosition((prevState) => ({ ...prevState, y: newY }));
      }
      handleVolumeSlider(Math.abs(newY / 220));
    };

    const stopDrag = () => {
      setIsDragging(false);
      setLeftHandlePosition((prevState) => ({ ...prevState, y: 0 }));
      setRightHandlePosition((prevState) => ({ ...prevState, y: 0 }));
      sideDragging.current = null;
    };

    const onClick = (event: MouseEvent) => {
      const bbox = pathRef.current?.getBBox();
      const svgPoint = svgRef.current?.createSVGPoint();
      if (!bbox || !svgPoint || muteLock.current) return;

      svgPoint.x = event.clientX;
      svgPoint.y = event.clientY;

      // Convert client coordinates to SVG coordinates
      const svgPointTransformed = svgPoint.matrixTransform(
        svgRef.current?.getScreenCTM()?.inverse()
      );

      if (
        svgPointTransformed.x >= bbox.x &&
        svgPointTransformed.x <= bbox.x + bbox.width &&
        svgPointTransformed.y >= Math.min(bbox.y, -20) &&
        svgPointTransformed.y <= bbox.y + Math.max(bbox.height, 40)
      ) {
        handleMute();
      }
    };

    init();

    svgRef.current?.addEventListener("click", (event) => onClick(event));

    if (!isUser) {
      leftHandleRef.current?.addEventListener("mousedown", (event) =>
        startDrag(event, "left")
      );
      rightHandleRef.current?.addEventListener("mousedown", (event) =>
        startDrag(event, "right")
      );
      window.addEventListener("mousemove", drag);
      window.addEventListener("mouseup", stopDrag);
    }

    return () => {
      svgRef.current?.removeEventListener("click", (event) => onClick(event));
      if (!isUser) {
        leftHandleRef.current?.addEventListener("mousedown", (event) =>
          startDrag(event, "left")
        );
        rightHandleRef.current?.addEventListener("mousedown", (event) =>
          startDrag(event, "right")
        );
        window.removeEventListener("mousemove", drag);
        window.removeEventListener("mouseup", stopDrag);
      }
    };
  }, [isDragging, svgRef, leftHandleRef, rightHandleRef]);

  // Audio analyser
  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;

    const initAudio = async () => {
      try {
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
  }, [audioStream]);

  // Function to update the moving points' Y values
  const updateMovingY = (volumeLevel: number) => {
    const curvedArray = bellCurveY.current.map(
      (value, index) => value * volumeLevel * 200 * (-1) ** index
    );
    setMovingY(curvedArray);
  };

  // Generate the path data using the fixed and moving points
  const generatePathData = (ySprings: number[]) => {
    const path = [`M0 0`];
    path.push(`Q 10 ${leftHandlePosition.y} 20 0`);
    for (let i = 1; i < fixedPointsX.current.length; i++) {
      const xMid =
        fixedPointsX.current[i - 1] +
        (fixedPointsX.current[i] - fixedPointsX.current[i - 1]) / 2;
      path.push(`Q${xMid} ${ySprings[i - 1]}, ${fixedPointsX.current[i]} 0`);
    }
    path.push(`Q 190 ${rightHandlePosition.y} 200 0`);

    return path.join(" ");
  };

  const ySpringsArray = Object.values(springs).map((spring: any) =>
    spring.get()
  );
  const animatedPathData = springs.y1.to(() => generatePathData(ySpringsArray));

  return (
    <div className='w-60 aspect-square'>
      <svg
        ref={svgRef}
        className='z-50 w-full aspect-square'
        viewBox='0 -150 200 300'
      >
        <defs>
          <filter id={`${username}_shadow`}>
            <feGaussianBlur in='SourceAlpha' stdDeviation='2' result='blur' />
            <feOffset in='blur' dx='1' dy='2' result='offsetBlur' />

            <feFlood
              floodColor={
                shadowColors[shadowColor as keyof typeof shadowColors]
              }
              result='colorBlur'
            />
            <feComposite
              in='colorBlur'
              in2='offsetBlur'
              operator='in'
              result='coloredBlur'
            />

            <feMerge>
              <feMergeNode in='coloredBlur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>

          <mask id={`${username}_mask`}>
            <rect x='-10' y='-150' width='220' height='450' fill='black' />
            <animated.path
              ref={pathRef}
              d={animatedPathData}
              stroke='white'
              strokeWidth='7'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </mask>

          <linearGradient
            id={`${username}_mute_gradient`}
            x1='0%'
            y1='0%'
            x2='100%'
            y2='0%'
            gradientUnits='userSpaceOnUse'
          >
            <stop
              offset='0%'
              stopColor={colors[primaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='10.61%'
              stopColor={colors[primaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='11.61%'
              stopColor={colors[secondaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='14.31%'
              stopColor={colors[secondaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='15.31%'
              stopColor={colors[primaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='25.42%'
              stopColor={colors[primaryMuteColor as keyof typeof colors]}
            />

            <stop
              offset='26.42%'
              stopColor={colors[secondaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='36.53%'
              stopColor={colors[secondaryMuteColor as keyof typeof colors]}
            />

            <stop
              offset='37.53%'
              stopColor={colors[primaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='40.23%'
              stopColor={colors[primaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='41.23%'
              stopColor={colors[secondaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='43.93%'
              stopColor={colors[secondaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='44.93%'
              stopColor={colors[primaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='47.63%'
              stopColor={colors[primaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='48.63%'
              stopColor={colors[secondaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='51.33%'
              stopColor={colors[secondaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='52.33%'
              stopColor={colors[primaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='62.44%'
              stopColor={colors[primaryMuteColor as keyof typeof colors]}
            />

            <stop
              offset='63.44%'
              stopColor={colors[secondaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='73.55%'
              stopColor={colors[secondaryMuteColor as keyof typeof colors]}
            />

            <stop
              offset='74.55%'
              stopColor={colors[primaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='84.66%'
              stopColor={colors[primaryMuteColor as keyof typeof colors]}
            />

            <stop
              offset='85.66%'
              stopColor={colors[secondaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='95.77%'
              stopColor={colors[secondaryMuteColor as keyof typeof colors]}
            />

            <stop
              offset='96.77%'
              stopColor={colors[primaryMuteColor as keyof typeof colors]}
            />
            <stop
              offset='100%'
              stopColor={colors[primaryMuteColor as keyof typeof colors]}
            />
          </linearGradient>

          <linearGradient
            id={`${username}_top_gradient`}
            x1='0%'
            y1='0%'
            x2='0%'
            y2='100%'
          >
            <stop
              offset='45%'
              stopColor={colors[volumeColor as keyof typeof colors]}
            />
            <stop offset='95%' stopColor='black' />
          </linearGradient>

          <linearGradient
            id={`${username}_bottom_gradient`}
            x1='0%'
            y1='0%'
            x2='0%'
            y2='100%'
          >
            <stop offset='5%' stopColor='black' />
            <stop
              offset='55%'
              stopColor={colors[volumeColor as keyof typeof colors]}
            />
          </linearGradient>

          <pattern
            id={`${username}_background_matrix`}
            x='-20'
            y='-120'
            width={svgRef.current?.clientWidth}
            height={svgRef.current?.clientHeight}
            patternUnits='userSpaceOnUse'
          >
            <rect
              x='0'
              y='0'
              width={
                svgRef.current
                  ? svgRef.current.clientWidth * patternWidth
                  : undefined
              }
              height={
                svgRef.current
                  ? svgRef.current.clientHeight * patternHeight
                  : undefined
              }
              fill={`url(#${username}_top_gradient)`}
            ></rect>
            <rect
              x={
                svgRef.current
                  ? svgRef.current.clientWidth * patternWidth
                  : undefined
              }
              y='0'
              width={
                svgRef.current
                  ? svgRef.current.clientWidth * (1 - 2 * patternWidth)
                  : undefined
              }
              height={
                svgRef.current
                  ? svgRef.current.clientHeight * patternHeight
                  : undefined
              }
              fill='black'
            ></rect>
            <rect
              x={
                svgRef.current
                  ? svgRef.current.clientWidth * (1 - patternWidth)
                  : undefined
              }
              y='0'
              width={
                svgRef.current
                  ? svgRef.current.clientWidth * patternWidth
                  : undefined
              }
              height={
                svgRef.current
                  ? svgRef.current.clientHeight * patternHeight
                  : undefined
              }
              fill={`url(#${username}_top_gradient)`}
            ></rect>

            <rect
              x='0'
              y={
                svgRef.current
                  ? svgRef.current.clientHeight * patternHeight
                  : undefined
              }
              width={
                svgRef.current
                  ? svgRef.current.clientWidth * patternWidth
                  : undefined
              }
              height={
                svgRef.current
                  ? svgRef.current.clientHeight * (1 - 2 * patternHeight)
                  : undefined
              }
              fill='black'
            ></rect>
            <rect
              x={
                svgRef.current
                  ? svgRef.current.clientWidth * patternWidth
                  : undefined
              }
              y={
                svgRef.current
                  ? svgRef.current.clientHeight * patternHeight
                  : undefined
              }
              width={
                svgRef.current
                  ? svgRef.current.clientWidth * (1 - 2 * patternWidth)
                  : undefined
              }
              height={
                svgRef.current
                  ? svgRef.current.clientHeight * (1 - 2 * patternHeight)
                  : undefined
              }
              fill='black'
            ></rect>
            <rect
              x={
                svgRef.current
                  ? svgRef.current.clientWidth * (1 - patternWidth)
                  : undefined
              }
              y={
                svgRef.current
                  ? svgRef.current.clientHeight * patternHeight
                  : undefined
              }
              width={
                svgRef.current
                  ? svgRef.current.clientWidth * patternWidth
                  : undefined
              }
              height={
                svgRef.current
                  ? svgRef.current.clientHeight * (1 - 2 * patternHeight)
                  : undefined
              }
              fill='black'
            ></rect>

            <rect
              x='0'
              y={
                svgRef.current
                  ? svgRef.current.clientHeight * (1 - patternHeight)
                  : undefined
              }
              width={
                svgRef.current
                  ? svgRef.current.clientWidth * patternWidth
                  : undefined
              }
              height={
                svgRef.current
                  ? svgRef.current.clientHeight * patternHeight
                  : undefined
              }
              fill={`url(#${username}_bottom_gradient)`}
            ></rect>
            <rect
              x={
                svgRef.current
                  ? svgRef.current.clientWidth * patternWidth
                  : undefined
              }
              y={
                svgRef.current
                  ? svgRef.current.clientHeight * (1 - patternHeight)
                  : undefined
              }
              width={
                svgRef.current
                  ? svgRef.current.clientWidth * (1 - 2 * patternWidth)
                  : undefined
              }
              height={
                svgRef.current
                  ? svgRef.current.clientHeight * patternHeight
                  : undefined
              }
              fill='black'
            ></rect>
            <rect
              x={
                svgRef.current
                  ? svgRef.current.clientWidth * (1 - patternWidth)
                  : undefined
              }
              y={
                svgRef.current
                  ? svgRef.current.clientHeight * (1 - patternHeight)
                  : undefined
              }
              width={
                svgRef.current
                  ? svgRef.current.clientWidth * patternWidth
                  : undefined
              }
              height={
                svgRef.current
                  ? svgRef.current.clientHeight * patternHeight
                  : undefined
              }
              fill={`url(#${username}_bottom_gradient)`}
            ></rect>
          </pattern>
        </defs>
        <g filter={`url(#${username}_shadow)`}>
          <rect
            x='-20'
            y='-120'
            width={svgRef.current?.clientWidth}
            height={svgRef.current?.clientHeight}
            fill={
              localMuted.current || muteLock.current
                ? `url(#${username}_mute_gradient)`
                : `url(#${username}_background_matrix)`
            }
            mask={`url(#${username}_mask)`}
          />
        </g>
        {!isUser && (
          <animated.rect
            ref={leftHandleRef}
            x={-5.5}
            y={-5.5}
            width={31}
            height={11}
            rx={5.5}
            ry={5.5}
            fill='transparent'
            style={{ cursor: "pointer" }}
          />
        )}
        {!isUser && (
          <animated.rect
            ref={rightHandleRef}
            x={174.5}
            y={-5.5}
            width={31}
            height={11}
            rx={5.5}
            ry={5.5}
            fill='transparent'
            style={{ cursor: "pointer" }}
          />
        )}
      </svg>
    </div>
  );
};

export default VolumeIndicator;
