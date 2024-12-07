import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated, SpringValue } from "react-spring";
import { colors } from "../fgVisualMedia/lib/colors";
import AudioAnalyser from "./lib/AudioAnalyzer";
import PathGenerator from "./lib/PathGenerator";
import FgButton from "../fgElements/fgButton/FgButton";
import FgAudioElementController from "./lib/FgAudioElementController";
import { FgAudioElementContainerOptionsType } from "./FgAudioElementContainer";

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

export default function FgAudioElement({
  svgRef,
  audioStream,
  audioRef,
  username,
  setPopupVisible,
  handleMute,
  clientMute,
  localMute,
  isUser = false,
  doubleClickFunction,
  fgAudioElementContainerOptions,
}: {
  svgRef: React.RefObject<SVGSVGElement>;
  audioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  username: string;
  setPopupVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handleMute: () => void;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  isUser?: boolean;
  doubleClickFunction?: (() => void) | undefined;
  fgAudioElementContainerOptions: FgAudioElementContainerOptionsType;
}) {
  const [movingY, setMovingY] = useState<number[]>(
    Array(fgAudioElementContainerOptions.numFixedPoints - 1).fill(50)
  );
  const [fixedY, setFixedY] = useState<number[]>(
    Array(fgAudioElementContainerOptions.numFixedPoints - 1).fill(50)
  );
  const [leftHandlePosition, setLeftHandlePosition] = useState({ x: 4, y: 50 });
  const [rightHandlePosition, setRightHandlePosition] = useState({
    x: 96,
    y: 50,
  });
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

  const springs = useSpring<{ [key: string]: SpringValue<number> }>({
    ...Object.fromEntries(movingY.map((y, index) => [`y${index + 1}`, y])),
    ...Object.fromEntries(fixedY.map((y, index) => [`fixed_y${index + 1}`, y])),
    config: { duration: fgAudioElementContainerOptions.springDuration },
  });

  const fgAudioElementController = new FgAudioElementController(
    isUser,
    fgAudioElementContainerOptions,
    localMute,
    clientMute,
    fixedPointsX,
    sineCurveY,
    bellCurveY,
    setMovingY,
    setFixedY,
    svgRef,
    pathRef,
    audioRef,
    pathGenerator,
    timerRef,
    sideDragging,
    setLeftHandlePosition,
    setRightHandlePosition,
    setPopupVisible,
    handleMute
  );

  useEffect(() => {
    pathGenerator.current = new PathGenerator();

    fgAudioElementController.init();

    window.addEventListener("mousemove", fgAudioElementController.onMouseMove);

    return () => {
      window.removeEventListener(
        "mousemove",
        fgAudioElementController.onMouseMove
      );
    };
  }, []);

  // Audio analyser
  useEffect(() => {
    if (
      audioStream === undefined ||
      audioStream.getAudioTracks().length === 0
    ) {
      return;
    }

    audioAnalyzer.current = new AudioAnalyser(
      fgAudioElementContainerOptions.noiseThreshold,
      fgAudioElementController.updateMovingY,
      audioStream
    );

    // Cleanup on unmount
    return () => {
      audioAnalyzer.current?.destructor();
    };
  }, [audioStream]);

  const ySpringsArray = Object.values(springs)
    .filter((spring): spring is SpringValue<number> => spring !== undefined)
    .map((spring) => spring.get());

  // @ts-expect-error: ts cannot infer y1 is avaible
  const animatedPathData = springs.y1.to(
    () =>
      pathGenerator.current?.generatePathData(
        ySpringsArray,
        fgAudioElementContainerOptions.muteStyleOption,
        fixedPointsX,
        localMute,
        clientMute,
        leftHandlePosition,
        rightHandlePosition
      ) ?? ""
  );

  return (
    <FgButton
      clickFunction={fgAudioElementController.onClick}
      className='w-full h-full'
      contentFunction={() => (
        <svg
          className='w-full h-full'
          ref={svgRef}
          viewBox={`0 0 ${viewBoxSize.w} ${viewBoxSize.h}`}
        >
          <defs>
            <filter id={`${username}_shadow`}>
              <feGaussianBlur
                in='SourceAlpha'
                stdDeviation='0.75'
                result='blur'
              />
              <feOffset in='blur' dx='0.25' dy='0.5' result='offsetBlur' />

              <feFlood
                floodColor={
                  shadowColors[
                    fgAudioElementContainerOptions.shadowColor as keyof typeof shadowColors
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

            {fgAudioElementContainerOptions.muteStyleOption === "morse" && (
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
                      fgAudioElementContainerOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='15.34%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='16.216%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='18.59%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='19.47%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='28.369%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />

                <stop
                  offset='29.249%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='38.146%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />

                {/* u */}
                <stop
                  offset='39.026%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='41.40%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='42.28%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='44.658%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='45.538%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='47.91%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='48.79%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='51.17%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='52.05%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='60.947%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />

                <stop
                  offset='61.827%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='70.72%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />

                {/* t */}
                <stop
                  offset='71.60%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='80.50%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />

                <stop
                  offset='81.38%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='90.27%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.secondaryMuteColor as keyof typeof colors
                    ]
                  }
                />

                {/* e */}
                <stop
                  offset='91.16%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
                <stop
                  offset='94%'
                  stopColor={
                    colors[
                      fgAudioElementContainerOptions.primaryMuteColor as keyof typeof colors
                    ]
                  }
                />
              </linearGradient>
            )}

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
                    fgAudioElementContainerOptions.volumeColor as keyof typeof colors
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
                    fgAudioElementContainerOptions.volumeColor as keyof typeof colors
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
                fgAudioElementContainerOptions.muteStyleOption === "morse"
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
                if (!isUser) fgAudioElementController.startDrag(event, "left");
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
                if (!isUser) fgAudioElementController.startDrag(event, "right");
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
          const validDoubleClick = fgAudioElementController.isOnPath(event);

          if (validDoubleClick) doubleClickFunction();
        })
      }
      style={{ cursor: "default" }}
    />
  );
}
