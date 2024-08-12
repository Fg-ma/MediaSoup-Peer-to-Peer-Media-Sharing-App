import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated } from "react-spring";
import { colors } from "../fgVideo/lib/colors";
import AudioAnalyser from "./lib/AudioAnalyzer";
import PathGenerator from "./lib/PathGenerator";
import FgButton from "../fgButton/FgButton";
import FgPortal from "../fgPortal/FgPortal";

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
  svgRef,
  audioStream,
  audioRef,
  username,
  name,
  handleMute,
  clientMute,
  localMute,
  isUser = false,
  doubleClickFunction,
  options,
}: {
  svgRef: React.RefObject<SVGSVGElement>;
  audioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  username: string;
  name?: string;
  handleMute: () => void;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  isUser?: boolean;
  doubleClickFunction?: (() => void) | undefined;
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
    Array(fgAudioElementOptions.numFixedPoints - 1).fill(50)
  );
  const [fixedY, setFixedY] = useState<number[]>(
    Array(fgAudioElementOptions.numFixedPoints - 1).fill(50)
  );
  const [leftHandlePosition, setLeftHandlePosition] = useState({ x: 4, y: 50 });
  const [rightHandlePosition, setRightHandlePosition] = useState({
    x: 96,
    y: 50,
  });
  const [popupVisible, setPopupVisible] = useState(false);
  const bellCurveY = useRef<number[]>([]);
  const sineCurveY = useRef<number[]>([]);
  const fixedPointsX = useRef<number[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const leftHandleRef = useRef<SVGRectElement>(null);
  const rightHandleRef = useRef<SVGRectElement>(null);
  const sideDragging = useRef<"left" | "right" | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioAnalyzer = useRef<AudioAnalyser | undefined>();
  const pathGenerator = useRef<PathGenerator | undefined>();
  const viewBoxSize = {
    w: 100,
    h: 100,
  };
  const patternSize = {
    w: 0.18,
    h: 0.23,
  };

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
    const totalWidth = 100;
    const startOffset = 16;
    const endOffset = 16;
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
    event.stopPropagation();

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

    const newY = Math.max(-34, Math.min(134, cursorPoint.y));

    if (sideDragging.current === "left") {
      setLeftHandlePosition((prevState) => ({ ...prevState, y: newY }));
    } else if (sideDragging.current === "right") {
      setRightHandlePosition((prevState) => ({ ...prevState, y: newY }));
    }

    const newVol = Math.abs(newY - 50) / 84;

    handleVolumeSlider(newVol);
  };

  const stopDrag = (event: MouseEvent) => {
    event.stopPropagation();

    if (!isUser) {
      window.removeEventListener("mousemove", drag);
      window.removeEventListener("mouseup", stopDrag);
    }

    setLeftHandlePosition((prevState) => ({ ...prevState, y: 50 }));
    setRightHandlePosition((prevState) => ({ ...prevState, y: 50 }));
    sideDragging.current = null;
  };

  const isOnPath = (event: React.MouseEvent) => {
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
      svgPointTransformed.y >= bbox.y - 10 &&
      svgPointTransformed.y <= bbox.y + 10
    ) {
      return true;
    }

    return false;
  };

  const onClick = (event: React.MouseEvent) => {
    const validClick = isOnPath(event);

    if (validClick) {
      handleMute();
    }
  };

  const onMouseMove = (event: MouseEvent) => {
    const validMove = isOnPath(event as unknown as React.MouseEvent);

    if (validMove) {
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
        (value, index) => value * volumeLevel * 84 * (-1) ** index + 50
      );
      fixedYArray = Array(fgAudioElementOptions.numFixedPoints - 1).fill(50);
    } else if (fgAudioElementOptions.muteStyleOption === "smile") {
      movingYArray = sineCurveY.current
        .filter((_, index) => index % 2 === 0)
        .map((value, index) => value * 10 + 50);
      fixedYArray = sineCurveY.current
        .filter((_, index) => index % 2 === 1)
        .map((value, index) => value * 10 + 50);
      fixedYArray.push(50);
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
        <FgPortal
          type='mouse'
          content={
            <div className='w-max h-max shadow-lg px-4 py-2 z-auto rounded-md text-lg font-Josefin'>
              {name ? name : username}
            </div>
          }
        />
      )}
      <FgButton
        clickFunction={onClick}
        contentFunction={() => (
          <svg
            className='w-full aspect-square'
            ref={svgRef}
            viewBox={`0 0 ${viewBoxSize.w} ${viewBoxSize.h}`}
          >
            <defs>
              <filter id={`${username}_shadow`}>
                <feGaussianBlur
                  in='SourceAlpha'
                  stdDeviation='2'
                  result='blur'
                />
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
                <rect
                  x='0'
                  y='0'
                  width={viewBoxSize.w}
                  height={viewBoxSize.h}
                  fill='black'
                />
                <animated.path
                  ref={pathRef}
                  d={animatedPathData}
                  stroke='white'
                  strokeWidth='4'
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
                {/* m */}
                <stop
                  offset='6%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='15.34%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='16.216%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='18.59%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='19.47%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='28.369%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />

                <stop
                  offset='29.249%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='38.146%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />

                {/* u */}
                <stop
                  offset='39.026%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='41.40%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='42.28%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='44.658%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='45.538%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='47.91%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='48.79%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='51.17%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='52.05%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='60.947%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />

                <stop
                  offset='61.827%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='70.72%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />

                {/* t */}
                <stop
                  offset='71.60%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='80.50%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />

                <stop
                  offset='81.38%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='90.27%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />

                {/* e */}
                <stop
                  offset='91.16%'
                  stopColor={
                    colors[
                      fgAudioElementOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='94%'
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
                    colors[
                      fgAudioElementOptions.volumeColor as keyof typeof colors
                    ]
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
                    colors[
                      fgAudioElementOptions.volumeColor as keyof typeof colors
                    ]
                  }
                />
              </linearGradient>

              <pattern
                id={`${username}_background_matrix`}
                x='0'
                y='0'
                width={viewBoxSize.w}
                height={viewBoxSize.h}
                patternUnits='userSpaceOnUse'
              >
                <rect
                  x='0'
                  y='0'
                  width={viewBoxSize.w * patternSize.w}
                  height={viewBoxSize.h * patternSize.h}
                  fill={`url(#${username}_top_gradient)`}
                ></rect>
                <rect
                  x={viewBoxSize.w * patternSize.w}
                  y='0'
                  width={viewBoxSize.w * (1 - 2 * patternSize.w)}
                  height={viewBoxSize.h * patternSize.h}
                  fill='black'
                ></rect>
                <rect
                  x={viewBoxSize.w * (1 - patternSize.w)}
                  y='0'
                  width={viewBoxSize.w * patternSize.w}
                  height={viewBoxSize.h * patternSize.h}
                  fill={`url(#${username}_top_gradient)`}
                ></rect>

                <rect
                  x='0'
                  y={viewBoxSize.h * patternSize.h}
                  width={viewBoxSize.w * patternSize.w}
                  height={viewBoxSize.h * (1 - 2 * patternSize.h)}
                  fill='black'
                ></rect>
                <rect
                  x={viewBoxSize.w * patternSize.w}
                  y={viewBoxSize.h * patternSize.h}
                  width={viewBoxSize.w * (1 - 2 * patternSize.w)}
                  height={viewBoxSize.h * (1 - 2 * patternSize.h)}
                  fill='black'
                ></rect>
                <rect
                  x={viewBoxSize.w * (1 - patternSize.w)}
                  y={viewBoxSize.h * patternSize.h}
                  width={viewBoxSize.w * patternSize.w}
                  height={viewBoxSize.h * (1 - 2 * patternSize.h)}
                  fill='black'
                ></rect>

                <rect
                  x='0'
                  y={viewBoxSize.h * (1 - patternSize.h)}
                  width={viewBoxSize.w * patternSize.w}
                  height={viewBoxSize.h * patternSize.h}
                  fill={`url(#${username}_bottom_gradient)`}
                ></rect>
                <rect
                  x={viewBoxSize.w * patternSize.w}
                  y={viewBoxSize.h * (1 - patternSize.h)}
                  width={viewBoxSize.w * (1 - 2 * patternSize.w)}
                  height={viewBoxSize.h * patternSize.h}
                  fill='black'
                ></rect>
                <rect
                  x={viewBoxSize.w * (1 - patternSize.w)}
                  y={viewBoxSize.h * (1 - patternSize.h)}
                  width={viewBoxSize.w * patternSize.w}
                  height={viewBoxSize.h * patternSize.h}
                  fill={`url(#${username}_bottom_gradient)`}
                ></rect>
              </pattern>
            </defs>
            <g filter={`url(#${username}_shadow)`}>
              <rect
                x='0'
                y='0'
                width={viewBoxSize.w}
                height={viewBoxSize.h}
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
                x={4}
                y={47}
                width={16}
                height={6}
                rx={3}
                ry={3}
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
                x={80}
                y={47}
                width={16}
                height={6}
                rx={3}
                ry={3}
                fill='transparent'
                style={{ cursor: "pointer" }}
              />
            )}
          </svg>
        )}
        doubleClickFunction={
          doubleClickFunction &&
          ((event) => {
            const validDoubleClick = isOnPath(event);

            if (validDoubleClick) doubleClickFunction();
          })
        }
      />
    </div>
  );
}
