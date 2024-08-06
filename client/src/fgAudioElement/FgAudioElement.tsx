import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated } from "react-spring";
import { colors } from "../fgVideo/lib/colors";
import AudioAnalyser from "./lib/AudioAnalyzer";
import PathGenerator from "./lib/PathGenerator";

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

const defaultFgAudioElementOptions: {
  springDuration: number;
  noiseThreshold: number;
  numFixedPoints: number;
  bellCurveAmplitude: number;
  bellCurveMean: number;
  bellCurveStdDev: number;
  shadowColor: string;
  volumeColor: string;
  primaryMuteColor: string;
  secondaryMuteColor: string;
  muteStyleOption: "morse" | "smile";
} = {
  springDuration: 250,
  noiseThreshold: 0.2,
  numFixedPoints: 10,
  bellCurveAmplitude: 1,
  bellCurveMean: 0.5,
  bellCurveStdDev: 0.4,
  shadowColor: "black",
  volumeColor: "FgPrimary",
  primaryMuteColor: "FgPrimary",
  secondaryMuteColor: "black",
  muteStyleOption: "smile",
};

export default function FgAudioElement({
  audioStream,
  audioRef,
  username,
  name,
  handleMute,
  clientMute,
  localMute,
  isUser = false,
  options,
}: {
  audioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  username: string;
  name?: string;
  handleMute: () => void;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  isUser?: boolean;
  options?: {
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
    muteStyleOption?: "morse" | "smile";
  };
}) {
  const fgAudioElementOptions = {
    ...defaultFgAudioElementOptions,
    ...options,
  };

  const [movingY, setMovingY] = useState<number[]>(
    Array(fgAudioElementOptions.numFixedPoints - 1).fill(0)
  );
  const [fixedY, setFixedY] = useState<number[]>(
    Array(fgAudioElementOptions.numFixedPoints - 1).fill(0)
  );
  const [leftHandlePosition, setLeftHandlePosition] = useState({ x: 10, y: 0 });
  const [rightHandlePosition, setRightHandlePosition] = useState({
    x: 190,
    y: 0,
  });
  const [popupVisible, setPopupVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const bellCurveY = useRef<number[]>([]);
  const sineCurveY = useRef<number[]>([]);
  const fixedPointsX = useRef<number[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const leftHandleRef = useRef<SVGRectElement>(null);
  const rightHandleRef = useRef<SVGRectElement>(null);
  const sideDragging = useRef<"left" | "right" | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioAnalyzer = useRef<AudioAnalyser | undefined>();
  const pathGenerator = useRef<PathGenerator | undefined>();
  const patternWidth = 0.18;
  const patternHeight = 0.2;

  const springs = useSpring<{ [key: string]: any }>({
    ...Object.fromEntries(movingY.map((y, index) => [`y${index + 1}`, y])),
    ...Object.fromEntries(fixedY.map((y, index) => [`fixed_y${index + 1}`, y])),
    config: { duration: fgAudioElementOptions.springDuration },
  });

  const init = () => {
    if (!pathGenerator.current) {
      return;
    }

    // X points
    const totalWidth = 200;
    const startOffset = 20;
    const endOffset = 20;
    const usableWidth = totalWidth - startOffset - endOffset;
    const step = usableWidth / (fgAudioElementOptions.numFixedPoints - 1);

    fixedPointsX.current = Array.from(
      { length: fgAudioElementOptions.numFixedPoints },
      (_, i) => startOffset + i * step
    );

    sineCurveY.current = pathGenerator.current.generateSineWave(
      fgAudioElementOptions.numFixedPoints * 2 - 3,
      1,
      1,
      0
    );

    bellCurveY.current = pathGenerator.current.generateBellCurve(
      fgAudioElementOptions.numFixedPoints - 1,
      fgAudioElementOptions.bellCurveAmplitude,
      fgAudioElementOptions.bellCurveMean,
      fgAudioElementOptions.bellCurveStdDev
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

  const startDrag = (event: React.MouseEvent, side: "left" | "right") => {
    event.preventDefault();

    if (!isUser) {
      window.addEventListener("mousemove", drag);
      window.addEventListener("mouseup", stopDrag);
    }

    sideDragging.current = side;
  };

  const drag = (event: MouseEvent) => {
    if (!svgRef.current || !sideDragging.current) return;

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

  const stopDrag = (event: MouseEvent) => {
    event.stopPropagation();

    if (!isUser) {
      window.removeEventListener("mousemove", drag);
      window.removeEventListener("mouseup", stopDrag);
    }

    setLeftHandlePosition((prevState) => ({ ...prevState, y: 0 }));
    setRightHandlePosition((prevState) => ({ ...prevState, y: 0 }));
    sideDragging.current = null;
  };

  const onClick = (event: React.MouseEvent) => {
    const bbox = pathRef.current?.getBBox();
    const svgPoint = svgRef.current?.createSVGPoint();
    if (!bbox || !svgPoint || clientMute.current) return;

    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;

    // Convert client coordinates to SVG coordinates
    const svgPointTransformed = svgPoint.matrixTransform(
      svgRef.current?.getScreenCTM()?.inverse()
    );

    if (
      svgPointTransformed.x >= bbox.x &&
      svgPointTransformed.x <= bbox.x + bbox.width &&
      svgPointTransformed.y >= Math.min(bbox.y - 20, -20) &&
      svgPointTransformed.y <= bbox.y + Math.max(bbox.height + 20, 20)
    ) {
      handleMute();
    }
  };

  const onMouseMove = (event: MouseEvent) => {
    const bbox = pathRef.current?.getBBox();
    const svgPoint = svgRef.current?.createSVGPoint();
    if (!bbox || !svgPoint || clientMute.current) return;

    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;

    // Convert client coordinates to SVG coordinates
    const svgPointTransformed = svgPoint.matrixTransform(
      svgRef.current?.getScreenCTM()?.inverse()
    );

    if (
      svgPointTransformed.x >= bbox.x &&
      svgPointTransformed.x <= bbox.x + bbox.width &&
      svgPointTransformed.y >= Math.min(bbox.y - 20, -20) &&
      svgPointTransformed.y <= bbox.y + Math.max(bbox.height + 20, 20)
    ) {
      setMousePosition({
        x: event.clientX + 12,
        y: event.clientY - 240,
      });

      if (!svgRef.current?.classList.contains("cursor-pointer")) {
        svgRef.current?.classList.add("cursor-pointer");
      }

      if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          setPopupVisible(true);
        }, 2500);
      }
    } else {
      if (svgRef.current?.classList.contains("cursor-pointer")) {
        svgRef.current?.classList.remove("cursor-pointer");
      }

      if (timerRef.current) {
        setPopupVisible(false);
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  useEffect(() => {
    pathGenerator.current = new PathGenerator();

    init();

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  // Audio analyser
  useEffect(() => {
    audioAnalyzer.current = new AudioAnalyser(
      audioStream,
      fgAudioElementOptions.noiseThreshold
    );

    audioAnalyzer.current.initAudio(updateMovingY);

    // Cleanup on unmount
    return () => {
      audioAnalyzer.current?.destructor();
    };
  }, [audioStream]);

  // Function to update the moving points' Y values
  const updateMovingY = (volumeLevel: number) => {
    let movingYArray;
    let fixedYArray;
    if (
      (!localMute.current && !clientMute.current) ||
      fgAudioElementOptions.muteStyleOption !== "smile"
    ) {
      movingYArray = bellCurveY.current.map(
        (value, index) => value * volumeLevel * 200 * (-1) ** index
      );
      fixedYArray = Array(fgAudioElementOptions.numFixedPoints - 1).fill(0);
    } else if (fgAudioElementOptions.muteStyleOption === "smile") {
      movingYArray = sineCurveY.current
        .filter((_, index) => index % 2 === 0)
        .map((value, index) => value * 20);
      fixedYArray = sineCurveY.current
        .filter((_, index) => index % 2 === 1)
        .map((value, index) => value * 20);
      fixedYArray.push(0);
    }

    if (movingYArray) {
      setMovingY(movingYArray);
    }
    if (fixedYArray) {
      setFixedY(fixedYArray);
    }
  };

  const ySpringsArray = Object.values(springs).map((spring: any) =>
    spring.get()
  );
  const animatedPathData = springs.y1.to(
    () =>
      pathGenerator.current?.generatePathData(
        ySpringsArray,
        fgAudioElementOptions.muteStyleOption,
        fixedPointsX,
        localMute,
        clientMute,
        leftHandlePosition,
        rightHandlePosition
      ) ?? ""
  );

  return (
    <div className='w-60 aspect-square relative'>
      {popupVisible && (
        <div
          className='w-max h-max absolute shadow-lg px-4 py-2 z-[1000] rounded-md text-lg font-Josefin'
          style={
            mousePosition.x && mousePosition.y
              ? { left: mousePosition.x, top: mousePosition.y }
              : {}
          }
        >
          {name ? name : username}
        </div>
      )}
      <svg
        ref={svgRef}
        onClick={onClick}
        className='z-10 w-full aspect-square'
        viewBox='0 -150 200 300'
      >
        <defs>
          <filter id={`${username}_shadow`}>
            <feGaussianBlur in='SourceAlpha' stdDeviation='2' result='blur' />
            <feOffset in='blur' dx='1' dy='2' result='offsetBlur' />

            <feFlood
              floodColor={
                shadowColors[
                  fgAudioElementOptions.shadowColor as keyof typeof shadowColors
                ]
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
            id={`${username}_mute_morse_gradient`}
            x1='0%'
            y1='0%'
            x2='100%'
            y2='0%'
            gradientUnits='userSpaceOnUse'
          >
            <stop
              offset='0%'
              stopColor={
                colors[
                  fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='10.61%'
              stopColor={
                colors[
                  fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='11.61%'
              stopColor={
                colors[
                  fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='14.31%'
              stopColor={
                colors[
                  fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='15.31%'
              stopColor={
                colors[
                  fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='25.42%'
              stopColor={
                colors[
                  fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                ]
              }
            />

            <stop
              offset='26.42%'
              stopColor={
                colors[
                  fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='36.53%'
              stopColor={
                colors[
                  fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                ]
              }
            />

            <stop
              offset='37.53%'
              stopColor={
                colors[
                  fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='40.23%'
              stopColor={
                colors[
                  fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='41.23%'
              stopColor={
                colors[
                  fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='43.93%'
              stopColor={
                colors[
                  fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='44.93%'
              stopColor={
                colors[
                  fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='47.63%'
              stopColor={
                colors[
                  fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='48.63%'
              stopColor={
                colors[
                  fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='51.33%'
              stopColor={
                colors[
                  fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='52.33%'
              stopColor={
                colors[
                  fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='62.44%'
              stopColor={
                colors[
                  fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                ]
              }
            />

            <stop
              offset='63.44%'
              stopColor={
                colors[
                  fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='73.55%'
              stopColor={
                colors[
                  fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                ]
              }
            />

            <stop
              offset='74.55%'
              stopColor={
                colors[
                  fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='84.66%'
              stopColor={
                colors[
                  fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                ]
              }
            />

            <stop
              offset='85.66%'
              stopColor={
                colors[
                  fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='95.77%'
              stopColor={
                colors[
                  fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                ]
              }
            />

            <stop
              offset='96.77%'
              stopColor={
                colors[
                  fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                ]
              }
            />
            <stop
              offset='100%'
              stopColor={
                colors[
                  fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                ]
              }
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
              stopColor={
                colors[fgAudioElementOptions.volumeColor as keyof typeof colors]
              }
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
              stopColor={
                colors[fgAudioElementOptions.volumeColor as keyof typeof colors]
              }
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
              (localMute.current || clientMute.current) &&
              fgAudioElementOptions.muteStyleOption === "morse"
                ? `url(#${username}_mute_morse_gradient)`
                : `url(#${username}_background_matrix)`
            }
            mask={`url(#${username}_mask)`}
          />
        </g>
        {!isUser && (
          <animated.rect
            ref={leftHandleRef}
            onMouseDown={(event) => {
              if (!isUser) startDrag(event, "left");
            }}
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
            onMouseDown={(event) => {
              if (!isUser) startDrag(event, "right");
            }}
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
}
