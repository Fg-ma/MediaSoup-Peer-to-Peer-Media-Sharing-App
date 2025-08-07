import React, { useState } from "react";
import PositioningIndicator from "../positioningIndicator/PositioningIndicator";
import AlignSection from "../alignSection/AlignSection";
import XSection from "./lib/XSection";
import YSection from "./lib/YSection";
import ScaleSection from "./lib/ScaleSection";
import { InstanceType } from "../../../../../elements/littleBuddyPortal/LittleBuddyPortal";
import LittleBuddyPortalController from "../../LittleBuddyPortalController";
import { LittleBuddiesTypes } from "../../../../../tableBabylon/littleBuddies/lib/typeConstant";

export default function AdvancedSection({
  staticPlacement,
  selected,
  indicators,
  littleBuddyPortalController,
}: {
  staticPlacement: React.MutableRefObject<{
    x: "default" | "hide" | number;
    y: "default" | "hide" | number;
    scale: "hide" | number;
  }>;
  selected: React.MutableRefObject<
    | {
        littleBuddy: LittleBuddiesTypes;
        aspect: number;
      }
    | undefined
  >;
  indicators: React.MutableRefObject<InstanceType | undefined>;
  littleBuddyPortalController: React.MutableRefObject<LittleBuddyPortalController>;
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
        littleBuddyPortalController={littleBuddyPortalController}
        setRerender={setRerender}
      />
      <AlignSection
        staticPlacement={staticPlacement}
        setRerender={setRerender}
      />
    </div>
  );
}
