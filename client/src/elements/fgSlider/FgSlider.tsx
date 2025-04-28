import React, {
  useState,
  useRef,
  useEffect,
  Suspense,
  CSSProperties,
} from "react";
import { motion, AnimatePresence, Variants, Transition } from "framer-motion";

const SliderValuePortal = React.lazy(() => import("./lib/SliderValuePortal"));

const tickVar: Variants = {
  horizontalInit: {
    opacity: 0,
    scale: 0.8,
    x: "-50%",
  },
  verticalInit: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 100 },
    },
  },
};

const tickTransition: Transition = {
  transition: {
    opacity: { duration: 0.15 },
  },
};

const defaultFgSliderOptions = {
  tickHoveringTimeoutDuration: 75,
  id: "",
  ticks: 6,
  rangeMax: 100,
  rangeMin: 0,
  precision: 1,
  snapToWholeNum: false,
  snapToNearestTick: false,
  orientation: "vertical",
  tickLabels: true,
  labelsColor: "#090909",
};

export interface SliderOptions {
  id?: string;
  initValue?: number;
  topLabel?: string;
  bottomLabel?: string;
  ticks?: number;
  rangeMax?: number;
  rangeMin?: number;
  precision?: number;
  units?: string;
  snapToWholeNum?: boolean;
  snapToNearestTick?: boolean;
  orientation?: "vertical" | "horizontal";
  tickLabels?: boolean;
  labelsColor?: string;
}

export interface SliderChangeEvent {
  id: string;
  value: number;
  styleValue: number;
}

export default function FgSlider({
  className,
  style,
  externalValue,
  externalStyleValue,
  onValueChange,
  disabled = false,
  options,
}: {
  className?: string;
  style?: CSSProperties;
  externalValue?: number;
  externalStyleValue?: number;
  onValueChange?: (event: SliderChangeEvent) => void;
  disabled?: boolean;
  options?: SliderOptions;
}) {
  const fgSliderOptions = {
    ...defaultFgSliderOptions,
    ...options,
  };

  const [sliding, setSliding] = useState(false);
  const [handleHovering, setHandleHovering] = useState(false);
  const [tickHovering, setTickHovering] = useState(false);
  const tickHoveringTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const trackRef = useRef<HTMLDivElement>(null);
  const tickPositions = useRef<number[]>(
    Array.from({ length: fgSliderOptions.ticks }, (_, i) => {
      const positionPercent = (i / (fgSliderOptions.ticks - 1)) * 90 + 5;
      return positionPercent;
    }),
  );
  const snapValues = useRef<number[]>(
    Array.from({ length: fgSliderOptions.ticks }, (_, i) => {
      const positionPercent = (i / (fgSliderOptions.ticks - 1)) * 100;
      return positionPercent;
    }),
  );

  const [_, setRerender] = useState(false);

  const rescaleValue = (
    value: number,
    fromRange: [number, number],
    toRange: [number, number],
  ): number => {
    const [fromMin, fromMax] = fromRange;
    const [toMin, toMax] = toRange;

    // Normalize the value to a 0-1 range
    const normalizedValue = (value - fromMin) / (fromMax - fromMin);

    // Scale it to the new range
    return toMin + normalizedValue * (toMax - toMin);
  };

  const snapPositions = (value: number): number => {
    const threshold = fgSliderOptions.snapToNearestTick
      ? (snapValues.current[1] - Math.abs(snapValues.current[0])) / 2
      : 2;

    for (let i = 0; i < snapValues.current.length; i++) {
      if (Math.abs(value - snapValues.current[i]) <= threshold) {
        return snapValues.current[i];
      }
    }

    return value;
  };

  const [value, setValue] = useState(
    rescaleValue(
      snapPositions(
        rescaleValue(
          fgSliderOptions.initValue !== undefined
            ? fgSliderOptions.initValue
            : (fgSliderOptions.rangeMax + fgSliderOptions.rangeMin) / 2,
          [fgSliderOptions.rangeMin, fgSliderOptions.rangeMax],
          [0, 100],
        ),
      ),
      [0, 100],
      [fgSliderOptions.rangeMin, fgSliderOptions.rangeMax],
    ),
  );
  const [styleValue, setStyleValue] = useState(
    Math.max(
      5,
      Math.min(
        95,
        rescaleValue(
          snapPositions(
            rescaleValue(
              fgSliderOptions.initValue !== undefined
                ? fgSliderOptions.initValue
                : (fgSliderOptions.rangeMax + fgSliderOptions.rangeMin) / 2,
              [fgSliderOptions.rangeMin, fgSliderOptions.rangeMax],
              [0, 100],
            ),
          ),
          [0, 100],
          [5, 95],
        ),
      ),
    ),
  );

  const handlePointerMove = (event: React.PointerEvent | PointerEvent) => {
    if (!trackRef.current) {
      return;
    }

    const trackRect = trackRef.current.getBoundingClientRect();

    let offset: number | undefined;
    if (fgSliderOptions.orientation === "vertical") {
      offset = ((trackRect.bottom - event.clientY) / trackRect.height) * 100;
    } else if (fgSliderOptions.orientation === "horizontal") {
      offset = ((event.clientX - trackRect.left) / trackRect.width) * 100;
    }

    if (!offset) {
      return;
    }

    const newValue = Math.max(
      0,
      Math.min(100, rescaleValue(offset, [5, 95], [0, 100])),
    );
    let newValueState = rescaleValue(
      snapPositions(newValue),
      [0, 100],
      [fgSliderOptions.rangeMin, fgSliderOptions.rangeMax],
    );

    // Snap to whole number if enabled
    if (fgSliderOptions.snapToWholeNum) {
      newValueState = Math.round(newValueState);
    }

    setValue(newValueState);
    setStyleValue(
      Math.max(
        5,
        Math.min(
          95,
          rescaleValue(
            newValueState,
            [fgSliderOptions.rangeMin, fgSliderOptions.rangeMax],
            [5, 95],
          ),
        ),
      ),
    );
  };

  const handlePointerUp = () => {
    setSliding(false);
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setSliding(true);
    handlePointerMove(event);

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  useEffect(() => {
    if (onValueChange) {
      onValueChange({ id: fgSliderOptions.id, value, styleValue });
    }
  }, [value, styleValue]);

  const externalStyleValueRef = useRef(
    Math.max(
      5,
      Math.min(
        95,
        rescaleValue(
          snapPositions(
            rescaleValue(
              externalStyleValue ?? 0,
              [fgSliderOptions.rangeMin, fgSliderOptions.rangeMax],
              [0, 100],
            ),
          ),
          [0, 100],
          [5, 95],
        ),
      ),
    ),
  );

  useEffect(() => {
    if (externalStyleValue === undefined) return;

    externalStyleValueRef.current = Math.max(
      5,
      Math.min(
        95,
        rescaleValue(
          snapPositions(
            rescaleValue(
              externalStyleValue,
              [fgSliderOptions.rangeMin, fgSliderOptions.rangeMax],
              [0, 100],
            ),
          ),
          [0, 100],
          [5, 95],
        ),
      ),
    );

    setRerender((prev) => !prev);
  }, [externalStyleValue]);

  return (
    <div
      id={fgSliderOptions.id}
      className={`${className} relative flex flex-col items-center justify-center ${fgSliderOptions.orientation === "vertical" ? "h-full w-max" : ""} ${fgSliderOptions.orientation === "horizontal" ? "h-max w-full" : ""}`}
      style={style}
    >
      {fgSliderOptions.topLabel && (
        <div
          className={`overflow-wrap-break-word flex w-full max-w-full items-center justify-center hyphens-auto break-words font-K2D text-base ${disabled ? "text-opacity-75" : ""} ${fgSliderOptions.orientation === "vertical" ? "text-center" : ""} ${fgSliderOptions.orientation === "horizontal" ? "text-start" : ""} `}
          style={{ color: fgSliderOptions.labelsColor }}
        >
          <div className="grow select-none">{fgSliderOptions.topLabel}</div>
          {tickHovering &&
            fgSliderOptions.units &&
            fgSliderOptions.orientation === "horizontal" && (
              <AnimatePresence>
                <motion.div
                  className="w-max select-none"
                  variants={tickVar}
                  initial="init"
                  animate="animate"
                  exit="init"
                  transition={tickTransition}
                >
                  {fgSliderOptions.units}
                </motion.div>
              </AnimatePresence>
            )}
        </div>
      )}
      <div
        className={`flex items-center justify-center ${fgSliderOptions.orientation === "vertical" ? "w-full grow" : ""} ${fgSliderOptions.orientation === "horizontal" ? "w-full py-1" : ""} `}
      >
        <div
          className={`relative cursor-pointer rounded ${disabled ? "" : "hover:shadow-FgSlider"} ${fgSliderOptions.orientation === "vertical" ? "h-full w-2.5" : ""} ${
            fgSliderOptions.orientation === "horizontal" ? "h-2.5 w-full" : ""
          } `}
          style={{
            background: `linear-gradient(to ${
              fgSliderOptions.orientation === "vertical"
                ? "top"
                : fgSliderOptions.orientation === "horizontal"
                  ? "right"
                  : "top"
            }, ${disabled ? "#b20203" : "#d40213"} ${
              externalStyleValue !== undefined
                ? externalStyleValueRef.current
                : styleValue
            }%, #e6e6e6 ${
              externalStyleValue !== undefined
                ? externalStyleValueRef.current
                : styleValue
            }%)`,
            boxShadow: sliding ? "inset 0 0 1.25px rgba(0, 0, 0, 0.3)" : "",
          }}
          ref={trackRef}
          onPointerDown={handlePointerDown}
        >
          {tickPositions.current.map((pos, index) => (
            <div key={pos}>
              <div
                className={`absolute rounded-1.5 ${disabled ? "bg-fg-tone-black-5" : "bg-fg-tone-black-1"} ${
                  fgSliderOptions.orientation === "vertical"
                    ? "left-1/2 h-1 w-3.5 -translate-x-1/2"
                    : ""
                } ${
                  fgSliderOptions.orientation === "horizontal"
                    ? "top-1/2 h-3.5 w-1 -translate-y-1/2"
                    : ""
                } `}
                style={{
                  [fgSliderOptions.orientation === "vertical"
                    ? "bottom"
                    : fgSliderOptions.orientation === "horizontal"
                      ? "left"
                      : "bottom"]: `calc(${pos}% - 2px)`,
                }}
                onPointerEnter={() => {
                  tickHoveringTimeout.current = setTimeout(() => {
                    setTickHovering(true);
                  }, fgSliderOptions.tickHoveringTimeoutDuration);
                }}
                onPointerLeave={() => {
                  if (tickHoveringTimeout.current) {
                    clearTimeout(tickHoveringTimeout.current);
                  }
                  setTickHovering(false);
                }}
              ></div>
              {fgSliderOptions.tickLabels && tickHovering && !sliding && (
                <AnimatePresence>
                  <motion.div
                    style={{
                      [fgSliderOptions.orientation === "vertical"
                        ? "bottom"
                        : ""]: `calc(${pos}% - 0.625rem)`,
                      [fgSliderOptions.orientation === "horizontal"
                        ? "left"
                        : ""]: `${pos}%`,
                      color: fgSliderOptions.labelsColor,
                    }}
                    className={`absolute flex w-max select-none items-center justify-center font-K2D text-sm ${disabled ? "text-opacity-75" : ""} ${
                      fgSliderOptions.orientation === "vertical"
                        ? "left-3.5"
                        : ""
                    } ${
                      fgSliderOptions.orientation === "horizontal"
                        ? fgSliderOptions.bottomLabel
                          ? "bottom-3"
                          : "top-2.5"
                        : ""
                    } `}
                    variants={tickVar}
                    initial={
                      fgSliderOptions.orientation === "vertical"
                        ? "verticalInit"
                        : fgSliderOptions.orientation === "horizontal"
                          ? "horizontalInit"
                          : "verticalInit"
                    }
                    animate="animate"
                    exit="init"
                    transition={tickTransition}
                  >
                    {fgSliderOptions.units &&
                    fgSliderOptions.orientation === "vertical" &&
                    (index === 0 || index === tickPositions.current.length - 1)
                      ? `${rescaleValue(
                          pos,
                          [5, 95],
                          [fgSliderOptions.rangeMin, fgSliderOptions.rangeMax],
                        ).toFixed(fgSliderOptions.precision)} ${
                          fgSliderOptions.units
                        }`
                      : `${parseFloat(
                          rescaleValue(
                            pos,
                            [5, 95],
                            [
                              fgSliderOptions.rangeMin,
                              fgSliderOptions.rangeMax,
                            ],
                          ).toFixed(fgSliderOptions.precision),
                        )}`}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          ))}
          <div
            className={`absolute cursor-pointer rounded ${disabled ? "bg-fg-tone-black-6" : "bg-fg-tone-black-3"} ${
              fgSliderOptions.orientation === "vertical"
                ? "left-1/2 h-2.5 w-4.5 -translate-x-1/2"
                : ""
            } ${
              fgSliderOptions.orientation === "horizontal"
                ? "top-1/2 h-4.5 w-2.5 -translate-y-1/2"
                : ""
            } `}
            style={{
              [fgSliderOptions.orientation === "vertical"
                ? "bottom"
                : fgSliderOptions.orientation === "horizontal"
                  ? "left"
                  : "bottom"]: `calc(${
                externalStyleValue !== undefined
                  ? externalStyleValueRef.current
                  : styleValue
              }% - 5px)`,
            }}
            onPointerEnter={() => {
              setHandleHovering(true);
            }}
            onPointerLeave={() => {
              setHandleHovering(false);
            }}
          ></div>
          {(sliding || handleHovering) && (
            <Suspense fallback={<div>Loading...</div>}>
              <SliderValuePortal
                value={externalValue !== undefined ? externalValue : value}
                precision={fgSliderOptions.precision}
                units={fgSliderOptions.units}
              />
            </Suspense>
          )}
        </div>
      </div>
      {fgSliderOptions.bottomLabel && (
        <div
          className={`overflow-wrap-break-word flex w-full max-w-full items-center justify-center hyphens-auto break-words font-K2D text-base ${disabled ? "text-opacity-75" : ""} ${fgSliderOptions.orientation === "vertical" ? "text-center" : ""} ${fgSliderOptions.orientation === "horizontal" ? "text-start" : ""} `}
          style={{ color: fgSliderOptions.labelsColor }}
        >
          <div className="grow select-none">{fgSliderOptions.bottomLabel}</div>
          {tickHovering &&
            fgSliderOptions.units &&
            fgSliderOptions.orientation === "horizontal" && (
              <AnimatePresence>
                <motion.div
                  className="w-max select-none"
                  variants={tickVar}
                  initial="init"
                  animate="animate"
                  exit="init"
                  transition={tickTransition}
                >
                  {fgSliderOptions.units}
                </motion.div>
              </AnimatePresence>
            )}
        </div>
      )}
    </div>
  );
}
