import React, { useState } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgInput from "../../../../../../elements/fgInput/FgInput";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import PositioningIndicator from "../positioningIndicator/PositioningIndicator";
import { StaticContentTypes } from "../../../../../../../../universal/contentTypeConstant";
import AlignSection from "../alignSection/AlignSection";
import { InstanceType } from "../../../TabledPortal";
import TabledPortalController from "../../TabledPortalController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";
const minusIcon = nginxAssetServerBaseUrl + "svgs/minusIcon.svg";

export default function AdvancedSection({
  staticPlacement,
  selected,
  setRerender,
  indicators,
  tabledPortalController,
}: {
  staticPlacement: React.MutableRefObject<{
    x: "default" | "hide" | number;
    y: "default" | "hide" | number;
    scale: "hide" | number;
  }>;
  selected: React.MutableRefObject<
    {
      contentType: StaticContentTypes;
      contentId: string;
      aspect: number;
      count: number | "zero";
    }[]
  >;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
  indicators: React.MutableRefObject<InstanceType[]>;
  tabledPortalController: TabledPortalController;
}) {
  return (
    <div className="flex w-full grow flex-col items-center justify-start space-y-2">
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
            className="aspect-square max-w-10 grow bg-fg-off-white font-K2D text-xl"
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
              backgroundColor: "#d6d6d6",
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
      <div className="flex h-10 w-full items-center justify-center rounded">
        <div className="pr-1 font-K2D text-xl">Y:</div>
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
            className="aspect-square max-w-10 grow bg-fg-off-white font-K2D text-xl"
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
              backgroundColor: "#d6d6d6",
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
            className="aspect-square max-w-14 grow bg-fg-off-white font-K2D text-xl"
            onChange={(event) => {
              let newCount: number | "hide" = parseFloat(event.target.value);

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
                : `${parseFloat(staticPlacement.current.scale.toFixed(2))}`
            }
            options={{
              submitButton: false,
              padding: 0,
              centerText: true,
              backgroundColor: "#d6d6d6",
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
      <PositioningIndicator
        staticPlacement={staticPlacement}
        selected={selected}
        indicators={indicators}
        tabledPortalController={tabledPortalController}
      />
      <AlignSection
        staticPlacement={staticPlacement}
        setRerender={setRerender}
      />
    </div>
  );
}
