import React, { useState } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgInput from "../../../../../../elements/fgInput/FgInput";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";
const minusIcon = nginxAssetServerBaseUrl + "svgs/minusIcon.svg";

export default function AdvancedSection({
  staticPlacement,
}: {
  staticPlacement: React.MutableRefObject<{
    x: "default" | "hide" | number;
    y: "default" | "hide" | number;
    scale: "hide" | number;
    alignVertical: "none" | "top" | "center" | "bottom";
    alignHorizontal: "none" | "right" | "center" | "left";
  }>;
}) {
  const [_, setRerender] = useState(false);

  return (
    <div className="flex h-max w-full flex-wrap items-center justify-start">
      <div className="mr-5 flex h-12 w-max items-center justify-center">
        <div className="pb-2 pr-1 font-K2D text-4xl">X:</div>
        <div className="flex h-full grow">
          <FgButton
            className="aspect-square h-full"
            contentFunction={() => (
              <FgSVGElement
                src={additionIcon}
                className="h-full w-full fill-fg-tone-black-1 stroke-fg-tone-black-1"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                ]}
              />
            )}
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
              hoverZValue: 1000000,
              hoverTimeoutDuration: 3250,
            }}
          />
          <FgInput
            className="aspect-square max-w-10 grow font-K2D text-xl"
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
                  : `${staticPlacement.current.x ?? ""}`
            }
            options={{
              submitButton: false,
              padding: 0,
              centerText: true,
            }}
          />
          <FgButton
            className="aspect-square h-full"
            contentFunction={() => (
              <FgSVGElement
                src={minusIcon}
                className="h-full w-full fill-fg-tone-black-1 stroke-fg-tone-black-1"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                ]}
              />
            )}
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
              hoverZValue: 1000000,
              hoverTimeoutDuration: 3250,
            }}
          />
        </div>
      </div>
      <div className="mr-5 flex h-12 w-max items-center justify-center">
        <div className="pb-2 pr-1 font-K2D text-4xl">Y:</div>
        <div className="flex h-full grow">
          <FgButton
            className="aspect-square h-full"
            contentFunction={() => (
              <FgSVGElement
                src={additionIcon}
                className="h-full w-full fill-fg-tone-black-1 stroke-fg-tone-black-1"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                ]}
              />
            )}
            clickFunction={() => {
              staticPlacement.current.y =
                staticPlacement.current.y === "default" ||
                staticPlacement.current.y === "hide"
                  ? 51
                  : Math.min(100, staticPlacement.current.y + 1);
              setRerender((prev) => !prev);
            }}
            hoverContent={<FgHoverContentStandard content="Move down" />}
            options={{
              hoverSpacing: 4,
              hoverType: "above",
              hoverZValue: 1000000,
              hoverTimeoutDuration: 3250,
            }}
          />
          <FgInput
            className="aspect-square max-w-10 grow font-K2D text-xl"
            onChange={(event) => {
              let newCount: number | "hide" | "default" = parseInt(
                event.target.value,
              );

              if (isNaN(newCount)) {
                newCount = "hide";
              } else {
                newCount = Math.max(0, Math.min(100, newCount));
              }

              staticPlacement.current.y = newCount;
              setRerender((prev) => !prev);
            }}
            onUnfocus={() => {
              if (staticPlacement.current.y === "hide") {
                staticPlacement.current.y = "default";
                setRerender((prev) => !prev);
              }
            }}
            externalValue={
              staticPlacement.current.y === "hide"
                ? ""
                : staticPlacement.current.y === "default"
                  ? "50"
                  : `${staticPlacement.current.y ?? ""}`
            }
            options={{
              submitButton: false,
              padding: 0,
              centerText: true,
            }}
          />
          <FgButton
            className="aspect-square h-full"
            contentFunction={() => (
              <FgSVGElement
                src={minusIcon}
                className="h-full w-full fill-fg-tone-black-1 stroke-fg-tone-black-1"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                ]}
              />
            )}
            clickFunction={() => {
              staticPlacement.current.y =
                staticPlacement.current.y === "default" ||
                staticPlacement.current.y === "hide"
                  ? 49
                  : Math.max(0, staticPlacement.current.y - 1);
              setRerender((prev) => !prev);
            }}
            hoverContent={<FgHoverContentStandard content="Move up" />}
            options={{
              hoverSpacing: 4,
              hoverType: "above",
              hoverZValue: 1000000,
              hoverTimeoutDuration: 3250,
            }}
          />
        </div>
      </div>
      <div className="flex h-12 w-max items-center justify-center">
        <div className="pb-2 pr-1 font-K2D text-4xl">Scale:</div>
        <div className="flex h-full grow">
          <FgButton
            className="aspect-square h-full"
            contentFunction={() => (
              <FgSVGElement
                src={additionIcon}
                className="h-full w-full fill-fg-tone-black-1 stroke-fg-tone-black-1"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                ]}
              />
            )}
            clickFunction={() => {
              staticPlacement.current.scale =
                staticPlacement.current.scale === "hide"
                  ? 1.1
                  : Math.min(5, staticPlacement.current.scale + 0.1);
              setRerender((prev) => !prev);
            }}
            hoverContent={<FgHoverContentStandard content="Increase scale" />}
            options={{
              hoverSpacing: 4,
              hoverType: "above",
              hoverZValue: 1000000,
              hoverTimeoutDuration: 3250,
            }}
          />
          <FgInput
            className="aspect-square max-w-10 grow font-K2D text-xl"
            onChange={(event) => {
              let newCount: number | "hide" | "default" = parseInt(
                event.target.value,
              );

              if (isNaN(newCount)) {
                newCount = "hide";
              } else {
                newCount = Math.max(0.01, Math.min(5, newCount));
              }

              staticPlacement.current.scale = newCount;
              setRerender((prev) => !prev);
            }}
            onUnfocus={() => {
              if (staticPlacement.current.scale === "hide") {
                staticPlacement.current.scale = 1;
                setRerender((prev) => !prev);
              }
            }}
            externalValue={
              staticPlacement.current.scale === "hide"
                ? ""
                : `${staticPlacement.current.scale}`
            }
            options={{
              submitButton: false,
              padding: 0,
              centerText: true,
            }}
          />
          <FgButton
            className="aspect-square h-full"
            contentFunction={() => (
              <FgSVGElement
                src={minusIcon}
                className="h-full w-full fill-fg-tone-black-1 stroke-fg-tone-black-1"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                ]}
              />
            )}
            clickFunction={() => {
              staticPlacement.current.scale =
                staticPlacement.current.scale === "hide"
                  ? 0.9
                  : Math.max(0.01, staticPlacement.current.scale - 0.1);
              setRerender((prev) => !prev);
            }}
            hoverContent={<FgHoverContentStandard content="Decrease scale" />}
            options={{
              hoverSpacing: 4,
              hoverType: "above",
              hoverZValue: 1000000,
              hoverTimeoutDuration: 3250,
            }}
          />
        </div>
      </div>
    </div>
  );
}
