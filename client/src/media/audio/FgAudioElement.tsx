import React, { useState, useEffect, useRef } from "react";
import { animated, useSprings } from "react-spring";
import AudioAnalyser from "./lib/AudioAnalyzer";
import PathGenerator from "./lib/PathGenerator";
import FgButton from "../../elements/fgButton/FgButton";
import FgAudioElementController from "./lib/FgAudioElementController";
import {
  FgAudioElementContainerOptionsType,
  Settings,
} from "./lib/typeConstant";

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
  settings,
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
  settings: Settings;
}) {
  const [movingY, setMovingY] = useState<number[]>(
    Array(settings.numFixedPoints.value - 1).fill(50)
  );
  const [fixedY, setFixedY] = useState<number[]>(
    Array(settings.numFixedPoints.value - 1).fill(50)
  );
  const [leftHandlePosition, setLeftHandlePosition] = useState({ x: 4, y: 50 });
  const [rightHandlePosition, setRightHandlePosition] = useState({
    x: 96,
    y: 50,
  });
  const envelopeY = useRef<number[]>([]);
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

  const springs = useSprings(movingY.length + fixedY.length, [
    ...movingY.map((y) => ({
      y,
      config: { duration: fgAudioElementContainerOptions.springDuration },
    })),
    ...fixedY.map((y) => ({
      y,
      config: { duration: fgAudioElementContainerOptions.springDuration },
    })),
  ]);

  const fgAudioElementController = new FgAudioElementController(
    isUser,
    localMute,
    clientMute,
    fixedPointsX,
    sineCurveY,
    envelopeY,
    setMovingY,
    svgRef,
    pathRef,
    audioRef,
    pathGenerator,
    timerRef,
    sideDragging,
    setLeftHandlePosition,
    setRightHandlePosition,
    setPopupVisible,
    handleMute,
    settings
  );

  const updateFixedY = () => {
    if (!localMute.current && !clientMute.current) {
      setFixedY(Array(settings.numFixedPoints.value - 1).fill(50));
    } else {
      const fixedY = sineCurveY.current
        .filter((_, index) => index % 2 === 1)
        .map((value) => value * 10 + 50);
      fixedY.push(50);

      setFixedY(fixedY);
    }
  };

  useEffect(() => {
    setMovingY(Array(settings.numFixedPoints.value - 1).fill(50));
    updateFixedY();

    fgAudioElementController.init();
  }, [settings.numFixedPoints.value]);

  useEffect(() => {
    updateFixedY();
  }, [localMute.current, clientMute.current]);

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

  useEffect(() => {
    fgAudioElementController.handleEnvelopeChange();
  }, [settings.envelopeType.value, JSON.stringify(settings.envelopeType)]);

  const ySpringsArray = springs.map(({ y }) => y.get());

  const animatedPathData = springs[0].y.to(
    () =>
      pathGenerator.current?.generatePathData(
        ySpringsArray,
        settings.muteStyle.value,
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
                floodColor={settings.shadowColor.value}
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

            {settings.muteStyle.value === "morse" && (
              <linearGradient
                id={`${username}_mute_morse_gradient`}
                x1='0%'
                y1='0%'
                x2='100%'
                y2='0%'
                gradientUnits='userSpaceOnUse'
              >
                {/* m */}
                <stop offset='6%' stopColor={settings.primaryMuteColor.value} />
                <stop
                  offset='15.34%'
                  stopColor={settings.primaryMuteColor.value}
                />
                <stop
                  offset='16.216%'
                  stopColor={settings.secondaryMuteColor.value}
                />
                <stop
                  offset='18.59%'
                  stopColor={settings.secondaryMuteColor.value}
                />
                <stop
                  offset='19.47%'
                  stopColor={settings.primaryMuteColor.value}
                />
                <stop
                  offset='28.369%'
                  stopColor={settings.primaryMuteColor.value}
                />

                <stop
                  offset='29.249%'
                  stopColor={settings.secondaryMuteColor.value}
                />
                <stop
                  offset='38.146%'
                  stopColor={settings.secondaryMuteColor.value}
                />

                {/* u */}
                <stop
                  offset='39.026%'
                  stopColor={settings.primaryMuteColor.value}
                />
                <stop
                  offset='41.40%'
                  stopColor={settings.primaryMuteColor.value}
                />
                <stop
                  offset='42.28%'
                  stopColor={settings.secondaryMuteColor.value}
                />
                <stop
                  offset='44.658%'
                  stopColor={settings.secondaryMuteColor.value}
                />
                <stop
                  offset='45.538%'
                  stopColor={settings.primaryMuteColor.value}
                />
                <stop
                  offset='47.91%'
                  stopColor={settings.primaryMuteColor.value}
                />
                <stop
                  offset='48.79%'
                  stopColor={settings.secondaryMuteColor.value}
                />
                <stop
                  offset='51.17%'
                  stopColor={settings.secondaryMuteColor.value}
                />
                <stop
                  offset='52.05%'
                  stopColor={settings.primaryMuteColor.value}
                />
                <stop
                  offset='60.947%'
                  stopColor={settings.primaryMuteColor.value}
                />

                <stop
                  offset='61.827%'
                  stopColor={settings.secondaryMuteColor.value}
                />
                <stop
                  offset='70.72%'
                  stopColor={settings.secondaryMuteColor.value}
                />

                {/* t */}
                <stop
                  offset='71.60%'
                  stopColor={settings.primaryMuteColor.value}
                />
                <stop
                  offset='80.50%'
                  stopColor={settings.primaryMuteColor.value}
                />

                <stop
                  offset='81.38%'
                  stopColor={settings.secondaryMuteColor.value}
                />
                <stop
                  offset='90.27%'
                  stopColor={settings.secondaryMuteColor.value}
                />

                {/* e */}
                <stop
                  offset='91.16%'
                  stopColor={settings.primaryMuteColor.value}
                />
                <stop
                  offset='94%'
                  stopColor={settings.primaryMuteColor.value}
                />
              </linearGradient>
            )}

            {(leftHandlePosition.y !== 50 || rightHandlePosition.y !== 50) && (
              <>
                <linearGradient
                  id={`${username}_top_gradient`}
                  x1='0%'
                  y1='0%'
                  x2='0%'
                  y2='100%'
                >
                  <stop
                    offset='45%'
                    stopColor={settings.volumeHandleColor.value}
                  />
                  <stop offset='95%' stopColor={settings.color.value} />
                </linearGradient>

                <linearGradient
                  id={`${username}_bottom_gradient`}
                  x1='0%'
                  y1='0%'
                  x2='0%'
                  y2='100%'
                >
                  <stop offset='5%' stopColor={settings.color.value} />
                  <stop
                    offset='55%'
                    stopColor={settings.volumeHandleColor.value}
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
                    fill={settings.color.value}
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
                    fill={settings.color.value}
                  ></rect>
                  <rect
                    x={viewBoxSize.w * patternSize.w}
                    y={viewBoxSize.h * patternSize.h}
                    width={viewBoxSize.w * (1 - 2 * patternSize.w)}
                    height={viewBoxSize.h * (1 - 2 * patternSize.h)}
                    fill={settings.color.value}
                  ></rect>
                  <rect
                    x={viewBoxSize.w * (1 - patternSize.w)}
                    y={viewBoxSize.h * patternSize.h}
                    width={viewBoxSize.w * patternSize.w}
                    height={viewBoxSize.h * (1 - 2 * patternSize.h)}
                    fill={settings.color.value}
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
                    fill={settings.color.value}
                  ></rect>
                  <rect
                    x={viewBoxSize.w * (1 - patternSize.w)}
                    y={viewBoxSize.h * (1 - patternSize.h)}
                    width={viewBoxSize.w * patternSize.w}
                    height={viewBoxSize.h * patternSize.h}
                    fill={`url(#${username}_bottom_gradient)`}
                  ></rect>
                </pattern>
              </>
            )}
          </defs>
          <g filter={`url(#${username}_shadow)`}>
            <rect
              x='0'
              y='0'
              width={viewBoxSize.w}
              height={viewBoxSize.h}
              fill={
                (localMute.current || clientMute.current) &&
                settings.muteStyle.value === "morse"
                  ? `url(#${username}_mute_morse_gradient)`
                  : leftHandlePosition.y !== 50 || rightHandlePosition.y !== 50
                  ? `url(#${username}_background_matrix)`
                  : settings.color.value
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
