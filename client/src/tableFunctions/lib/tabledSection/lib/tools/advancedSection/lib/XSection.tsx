import React, { useRef } from "react";
import FgButton from "../../../../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgInput from "../../../../../../../elements/fgInput/FgInput";
import FgSVGElement from "../../../../../../../elements/fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";
const minusIcon = nginxAssetServerBaseUrl + "svgs/minusIcon.svg";

export default function XSection({
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
  const holdTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const holdInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  return (
    <div className="flex h-10 w-full items-center justify-center rounded">
      <div className="pr-1 font-K2D text-xl">X:</div>
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
                staticPlacement.current.x =
                  staticPlacement.current.x === "default" ||
                  staticPlacement.current.x === "hide"
                    ? 51
                    : Math.min(100, staticPlacement.current.x + 1);
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
            staticPlacement.current.x =
              staticPlacement.current.x === "default" ||
              staticPlacement.current.x === "hide"
                ? 51
                : Math.min(100, staticPlacement.current.x + 1);
            setRerender((prev) => !prev);
          }}
          hoverContent={<FgHoverContentStandard content="Move right" />}
          options={{
            hoverSpacing: 4,
            hoverType: "above",
            hoverTimeoutDuration: 3250,
          }}
        />
        <FgInput
          className="aspect-square max-w-12 grow bg-fg-off-white font-K2D text-xl"
          type="number"
          onChange={(event) => {
            let newCount: number | "hide" | "default" = parseInt(
              event.target.value,
            );

            if (isNaN(newCount)) {
              newCount = "hide";
            } else {
              newCount = Math.max(0, Math.min(100, newCount));
            }

            staticPlacement.current.x = newCount;
            setRerender((prev) => !prev);
          }}
          onUnfocus={() => {
            if (staticPlacement.current.x === "hide") {
              staticPlacement.current.x = "default";
              setRerender((prev) => !prev);
            }
          }}
          externalValue={
            staticPlacement.current.x === "hide"
              ? ""
              : staticPlacement.current.x === "default"
                ? "50"
                : `${staticPlacement.current.x.toFixed(0) ?? ""}`
          }
          options={{
            submitButton: false,
            padding: 0,
            centerText: true,
            backgroundColor: "#d6d6d6",
            min: 0,
            max: 100,
            step: 1,
            autocomplete: "off",
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
                staticPlacement.current.x =
                  staticPlacement.current.x === "default" ||
                  staticPlacement.current.x === "hide"
                    ? 49
                    : Math.max(0, staticPlacement.current.x - 1);
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
            staticPlacement.current.x =
              staticPlacement.current.x === "default" ||
              staticPlacement.current.x === "hide"
                ? 49
                : Math.max(0, staticPlacement.current.x - 1);
            setRerender((prev) => !prev);
          }}
          hoverContent={<FgHoverContentStandard content="Move left" />}
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
