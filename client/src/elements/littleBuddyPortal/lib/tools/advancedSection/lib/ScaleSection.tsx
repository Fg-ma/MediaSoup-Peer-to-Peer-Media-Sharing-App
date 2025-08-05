import React, { useRef, useState } from "react";
import FgButton from "../../../../../fgButton/FgButton";
import FgHoverContentStandard from "../../../../../fgHoverContentStandard/FgHoverContentStandard";
import FgInput from "../../../../../fgInput/FgInput";
import FgSVGElement from "../../../../../fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";
const minusIcon = nginxAssetServerBaseUrl + "svgs/minusIcon.svg";

export default function ScaleSection({
  staticPlacement,
  setRerender,
}: {
  staticPlacement: React.MutableRefObject<{
    x: "default" | "hide" | number;
    y: "default" | "hide" | number;
    scale: "hide" | number;
  }>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [focused, setFocused] = useState(false);

  const realValueRef = useRef("1");

  const holdTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const holdInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  return (
    <div className="flex h-10 w-full items-center justify-center rounded">
      <div className="pr-2 font-K2D text-xl">Scale:</div>
      <div className="flex h-full grow">
        <FgButton
          className="flex aspect-square h-full items-center justify-center"
          contentFunction={() => (
            <FgSVGElement
              src={additionIcon}
              className="aspect-square h-[60%] fill-fg-tone-black-1 stroke-fg-tone-black-1"
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
              ]}
            />
          )}
          pointerDownFunction={() => {
            if (holdTimeout.current) {
              clearTimeout(holdTimeout.current);
              holdTimeout.current = undefined;
            }
            if (holdInterval.current) {
              clearInterval(holdInterval.current);
              holdInterval.current = undefined;
            }

            holdTimeout.current = setTimeout(() => {
              holdInterval.current = setInterval(() => {
                staticPlacement.current.scale =
                  staticPlacement.current.scale === "hide"
                    ? 1.1
                    : Math.min(5, staticPlacement.current.scale + 0.1);
                realValueRef.current = `${parseFloat(staticPlacement.current.scale.toFixed(2))}`;
                setRerender((prev) => !prev);
              }, 50);
            }, 1000);
          }}
          pointerUpFunction={() => {
            if (holdTimeout.current) {
              clearTimeout(holdTimeout.current);
              holdTimeout.current = undefined;
            }
            if (holdInterval.current) {
              clearInterval(holdInterval.current);
              holdInterval.current = undefined;
            }
          }}
          clickFunction={() => {
            staticPlacement.current.scale =
              staticPlacement.current.scale === "hide"
                ? 1.1
                : Math.min(5, staticPlacement.current.scale + 0.1);
            realValueRef.current = `${parseFloat(staticPlacement.current.scale.toFixed(2))}`;
            setRerender((prev) => !prev);
          }}
          hoverContent={<FgHoverContentStandard content="Increase scale" />}
          options={{
            hoverSpacing: 4,
            hoverType: "above",
            hoverTimeoutDuration: 3250,
          }}
        />
        <FgInput
          className="aspect-square max-w-14 grow bg-fg-off-white font-K2D text-xl"
          type="number"
          onChange={(event) => {
            let newCount: number | "hide" = parseFloat(event.target.value);
            if (isNaN(newCount)) {
              newCount = "hide";
            } else {
              newCount = Math.max(0.01, Math.min(5, newCount));
            }
            const real =
              newCount === "hide" || newCount === 0.01
                ? event.target.value
                : `${newCount}`;
            realValueRef.current = real.length >= 4 ? real.slice(0, 4) : real;

            staticPlacement.current.scale = newCount;
            setRerender((prev) => !prev);
          }}
          onFocus={() => {
            setFocused(true);
          }}
          onUnfocus={() => {
            setFocused(false);

            if (staticPlacement.current.scale === "hide") {
              staticPlacement.current.scale = 1;
              realValueRef.current = "1";
              setRerender((prev) => !prev);
            }
          }}
          externalValue={
            focused
              ? realValueRef.current
              : staticPlacement.current.scale === "hide"
                ? ""
                : `${parseFloat(staticPlacement.current.scale.toFixed(2))}`
          }
          options={{
            submitButton: false,
            padding: 0,
            centerText: true,
            backgroundColor: "#d6d6d6",
            autocomplete: "off",
            min: 0,
            max: 5,
            step: 0.1,
          }}
        />
        <FgButton
          className="flex aspect-square h-full items-center justify-center"
          contentFunction={() => (
            <FgSVGElement
              src={minusIcon}
              className="aspect-square h-[60%] fill-fg-tone-black-1 stroke-fg-tone-black-1"
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
              ]}
            />
          )}
          pointerDownFunction={() => {
            if (holdTimeout.current) {
              clearTimeout(holdTimeout.current);
              holdTimeout.current = undefined;
            }
            if (holdInterval.current) {
              clearInterval(holdInterval.current);
              holdInterval.current = undefined;
            }

            holdTimeout.current = setTimeout(() => {
              holdInterval.current = setInterval(() => {
                staticPlacement.current.scale =
                  staticPlacement.current.scale === "hide"
                    ? 0.9
                    : Math.max(0.01, staticPlacement.current.scale - 0.1);
                realValueRef.current = `${parseFloat(staticPlacement.current.scale.toFixed(2))}`;
                setRerender((prev) => !prev);
              }, 50);
            }, 1000);
          }}
          pointerUpFunction={() => {
            if (holdTimeout.current) {
              clearTimeout(holdTimeout.current);
              holdTimeout.current = undefined;
            }
            if (holdInterval.current) {
              clearInterval(holdInterval.current);
              holdInterval.current = undefined;
            }
          }}
          clickFunction={() => {
            staticPlacement.current.scale =
              staticPlacement.current.scale === "hide"
                ? 0.9
                : Math.max(0.01, staticPlacement.current.scale - 0.1);
            realValueRef.current = `${parseFloat(staticPlacement.current.scale.toFixed(2))}`;
            setRerender((prev) => !prev);
          }}
          hoverContent={<FgHoverContentStandard content="Decrease scale" />}
          options={{
            hoverSpacing: 4,
            hoverType: "above",
            hoverTimeoutDuration: 3250,
          }}
        />
      </div>
    </div>
  );
}
