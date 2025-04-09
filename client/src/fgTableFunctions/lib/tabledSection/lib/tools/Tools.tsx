import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import { StaticContentTypes } from "../../../../../../../universal/contentTypeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const checkIcon = nginxAssetServerBaseUrl + "svgs/checkIcon.svg";
const paintBrushIcon = nginxAssetServerBaseUrl + "svgs/paintBrushIcon.svg";
const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";
const moreIcon = nginxAssetServerBaseUrl + "svgs/moreIcon.svg";

export default function Tools({
  selected,
  setRerender,
  setAdvanced,
}: {
  selected: React.MutableRefObject<
    {
      contentType: StaticContentTypes;
      contentId: string;
      aspect: number;
      count: number | "zero";
    }[]
  >;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
  setAdvanced: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="flex h-8 w-max space-x-1">
      <FgButton
        className="flex aspect-square h-full items-center justify-center rounded bg-fg-red"
        contentFunction={() => (
          <FgSVGElement
            src={checkIcon}
            className="aspect-square h-[90%] fill-fg-off-white stroke-fg-off-white"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        clickFunction={() => {}}
        hoverContent={
          <FgHoverContentStandard content="Place content on table" />
        }
        options={{
          hoverSpacing: 4,
          hoverType: "above",
          hoverZValue: 1000000,
          hoverTimeoutDuration: 1250,
        }}
      />
      <FgButton
        className="flex aspect-square h-full items-center justify-center rounded bg-fg-tone-black-8"
        contentFunction={() => (
          <FgSVGElement
            src={paintBrushIcon}
            className="aspect-square h-[90%] fill-fg-off-white stroke-fg-off-white"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        clickFunction={() => {}}
        hoverContent={<FgHoverContentStandard content="Paint content" />}
        options={{
          hoverSpacing: 4,
          hoverType: "above",
          hoverZValue: 1000000,
          hoverTimeoutDuration: 1250,
        }}
      />
      <FgButton
        className="flex aspect-square h-full items-center justify-center rounded bg-fg-tone-black-4"
        contentFunction={() => (
          <FgSVGElement
            src={closeIcon}
            className="aspect-square h-[90%] fill-fg-off-white stroke-fg-off-white"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        clickFunction={() => {
          selected.current = [];
          setRerender((prev) => !prev);
        }}
        hoverContent={<FgHoverContentStandard content="Clear selected" />}
        options={{
          hoverSpacing: 4,
          hoverType: "above",
          hoverZValue: 1000000,
          hoverTimeoutDuration: 1250,
        }}
      />
      <FgButton
        className="flex aspect-square h-full items-center justify-center rounded"
        contentFunction={() => (
          <FgSVGElement
            src={moreIcon}
            className="aspect-square h-[85%] fill-fg-tone-black-1 stroke-fg-tone-black-1"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        clickFunction={() => {
          setAdvanced((prev) => !prev);
        }}
        hoverContent={<FgHoverContentStandard content="Advanced" />}
        options={{
          hoverSpacing: 4,
          hoverType: "above",
          hoverZValue: 1000000,
          hoverTimeoutDuration: 1250,
        }}
      />
    </div>
  );
}
