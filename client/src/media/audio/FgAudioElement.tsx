import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated, SpringValue } from "react-spring";
import AudioAnalyser from "./lib/AudioAnalyzer";
import PathGenerator from "./lib/PathGenerator";
import FgButton from "../../elements/fgButton/FgButton";
import FgAudioElementController from "./lib/FgAudioElementController";
import { tableColorMap } from "../../fgTable/lib/tableColors";
import { FgAudioElementContainerOptionsType } from "./lib/typeConstant";

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
  handleMute: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined
  ) => void;
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

    window.addEventListener(
      "pointermove",
      fgAudioElementController.onPointerMove
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        fgAudioElementController.onPointerMove
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
                  tableColorMap[fgAudioElementContainerOptions.shadowColor]
                    .shadowColor
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
                    tableColorMap[
                      fgAudioElementContainerOptions.primaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='15.34%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.primaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='16.216%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.secondaryMuteColor
                    ].secondary
                  }
                />
                <stop
                  offset='18.59%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.secondaryMuteColor
                    ].secondary
                  }
                />
                <stop
                  offset='19.47%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.primaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='28.369%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.primaryMuteColor
                    ].primary
                  }
                />

                <stop
                  offset='29.249%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.secondaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='38.146%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.secondaryMuteColor
                    ].primary
                  }
                />

                {/* u */}
                <stop
                  offset='39.026%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.primaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='41.40%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.primaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='42.28%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.secondaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='44.658%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.secondaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='45.538%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.primaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='47.91%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.primaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='48.79%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.secondaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='51.17%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.secondaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='52.05%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.primaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='60.947%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.primaryMuteColor
                    ].primary
                  }
                />

                <stop
                  offset='61.827%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.secondaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='70.72%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.secondaryMuteColor
                    ].primary
                  }
                />

                {/* t */}
                <stop
                  offset='71.60%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.primaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='80.50%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.primaryMuteColor
                    ].primary
                  }
                />

                <stop
                  offset='81.38%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.secondaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='90.27%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.secondaryMuteColor
                    ].primary
                  }
                />

                {/* e */}
                <stop
                  offset='91.16%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.primaryMuteColor
                    ].primary
                  }
                />
                <stop
                  offset='94%'
                  stopColor={
                    tableColorMap[
                      fgAudioElementContainerOptions.primaryMuteColor
                    ].primary
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
                  tableColorMap[fgAudioElementContainerOptions.volumeColor]
                    .primary
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
                  tableColorMap[fgAudioElementContainerOptions.volumeColor]
                    .primary
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
              onPointerDown={(event) => {
                if (!isUser) fgAudioElementController.startDrag(event, "left");
              }}
              x={4}
              y={47}
              width={16}
              height={6}
              rx={3}
              ry={3}
              fill='transparent'
              stroke='transparent'
              style={{ cursor: "pointer" }}
            />
          )}
          {!isUser && (
            <animated.rect
              ref={rightHandleRef}
              onPointerDown={(event) => {
                if (!isUser) fgAudioElementController.startDrag(event, "right");
              }}
              x={80}
              y={47}
              width={16}
              height={6}
              rx={3}
              ry={3}
              fill='transparent'
              stroke='transparent'
              style={{ cursor: "pointer" }}
            />
          )}
        </svg>
      )}
      doubleClickFunction={
        doubleClickFunction &&
        ((event) => {
          const validDoubleClick = fgAudioElementController.isOnPath(
            event as unknown as React.PointerEvent
          );

          if (validDoubleClick) doubleClickFunction();
        })
      }
      style={{ cursor: "default" }}
    />
  );
}
