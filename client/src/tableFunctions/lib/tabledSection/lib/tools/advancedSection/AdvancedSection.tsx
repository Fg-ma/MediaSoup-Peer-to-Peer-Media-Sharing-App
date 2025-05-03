import React, { useState } from "react";
import PositioningIndicator from "../positioningIndicator/PositioningIndicator";
import { StaticContentTypes } from "../../../../../../../../universal/contentTypeConstant";
import AlignSection from "../alignSection/AlignSection";
import { InstanceType } from "../../../TabledPortal";
import TabledPortalController from "../../TabledPortalController";
import XSection from "./lib/XSection";
import YSection from "./lib/YSection";
import ScaleSection from "./lib/ScaleSection";

export default function AdvancedSection({
  staticPlacement,
  selected,
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
  indicators: React.MutableRefObject<InstanceType[]>;
  tabledPortalController: React.MutableRefObject<TabledPortalController>;
}) {
  const [_, setRerender] = useState(false);

  return (
    <div className="flex w-full grow flex-col items-center justify-start space-y-2">
      <XSection staticPlacement={staticPlacement} setRerender={setRerender} />
      <YSection staticPlacement={staticPlacement} setRerender={setRerender} />
      <ScaleSection
        staticPlacement={staticPlacement}
        setRerender={setRerender}
      />
      <PositioningIndicator
        staticPlacement={staticPlacement}
        selected={selected}
        indicators={indicators}
        tabledPortalController={tabledPortalController}
        setRerender={setRerender}
      />
      <AlignSection
        staticPlacement={staticPlacement}
        setRerender={setRerender}
      />
    </div>
  );
}
