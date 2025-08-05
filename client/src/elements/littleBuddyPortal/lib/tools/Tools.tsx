import React from "react";
import FgButton from "../../../fgButton/FgButton";
import FgHoverContentStandard from "../../../fgHoverContentStandard/FgHoverContentStandard";
import FgSVGElement from "../../../fgSVGElement/FgSVGElement";
import SearchBar from "./searchBar/SearchBar";
import { useSignalContext } from "../../../../context/signalContext/SignalContext";
import { LittleBuddiesTypes } from "../../../../tableBabylon/littleBuddies/lib/typeConstant";
import LittleBuddyPortalController from "../LittleBuddyPortalController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const checkIcon = nginxAssetServerBaseUrl + "svgs/checkIcon.svg";
const paintBrushIcon = nginxAssetServerBaseUrl + "svgs/paintBrushIcon.svg";
const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";
const moreIcon = nginxAssetServerBaseUrl + "svgs/moreIcon.svg";
const moreOffIcon = nginxAssetServerBaseUrl + "svgs/moreOffIcon.svg";

export default function Tools({
  littleBuddyPortalController,
  advanced,
  setAdvanced,
  setLittleBuddyActive,
  setSearchContent,
  searchValue,
  selected,
}: {
  littleBuddyPortalController: React.MutableRefObject<LittleBuddyPortalController>;
  advanced: boolean;
  setAdvanced: React.Dispatch<React.SetStateAction<boolean>>;
  setLittleBuddyActive: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchContent: React.Dispatch<
    React.SetStateAction<
      {
        score: number;
        aid?: string;
        iid?: string;
        sid?: string;
        xid?: string;
        vid?: string;
      }[]
    >
  >;
  searchValue: React.MutableRefObject<string>;
  selected: React.MutableRefObject<
    {
      littleBuddy: LittleBuddiesTypes;
      aspect: number;
      count: number | "zero";
    }[]
  >;
}) {
  const { sendNewInstanceSignal, sendGeneralSignal } = useSignalContext();

  return (
    <div className="flex h-12 w-full space-x-1">
      <FgButton
        className="flex aspect-square h-full items-center justify-center rounded bg-fg-red"
        contentFunction={() => (
          <FgSVGElement
            src={checkIcon}
            className="aspect-square h-[70%] fill-fg-off-white stroke-fg-off-white"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        clickFunction={() => {
          littleBuddyPortalController.current.placeInstances();
          littleBuddyPortalController.current.uploadInstances();
          setLittleBuddyActive(false);
        }}
        hoverContent={
          <FgHoverContentStandard content="Place content on table" />
        }
        options={{
          hoverSpacing: 4,
          hoverType: "above",
          hoverTimeoutDuration: 1250,
        }}
      />
      <FgButton
        className="flex aspect-square h-full items-center justify-center rounded bg-fg-tone-black-8"
        contentFunction={() => (
          <FgSVGElement
            src={paintBrushIcon}
            className="aspect-square h-[70%] fill-fg-off-white stroke-fg-off-white"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        clickFunction={() => {
          if (selected.current.length === 0) return;

          sendNewInstanceSignal({
            type: "instancesLayerMode",
            data: {
              mode: "paint",
            },
          });

          sendNewInstanceSignal({
            type: "startInstancesDrag",
            data: {
              instances: selected.current
                .filter((sel) => sel.count !== "zero" && sel.count !== 0)
                .map((sel) => ({
                  littleBuddy: sel.littleBuddy,
                  instances: Array.from({
                    // @ts-expect-error "zero" was already filtered out
                    length: sel.count,
                  }).map(() => ({
                    height: 15,
                    width: 15 * sel.aspect,
                  })),
                })),
            },
          });

          sendGeneralSignal({
            type: "tableInfoSignal",
            data: {
              message: "Press esc/delete to exit",
              timeout: 4000,
            },
          });

          setLittleBuddyActive(false);
        }}
        hoverContent={<FgHoverContentStandard content="Paint content" />}
        options={{
          hoverSpacing: 4,
          hoverType: "above",
          hoverTimeoutDuration: 1250,
        }}
      />
      <FgButton
        className="flex aspect-square h-full items-center justify-center rounded bg-fg-tone-black-4"
        contentFunction={() => (
          <FgSVGElement
            src={closeIcon}
            className="aspect-square h-[70%] fill-fg-off-white stroke-fg-off-white"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        clickFunction={() => {
          littleBuddyPortalController.current.reset();
        }}
        hoverContent={<FgHoverContentStandard content="Clear selected" />}
        options={{
          hoverSpacing: 4,
          hoverType: "above",
          hoverTimeoutDuration: 1250,
        }}
      />
      <FgButton
        className="flex aspect-square h-full items-center justify-center rounded"
        contentFunction={() => (
          <FgSVGElement
            src={advanced ? moreOffIcon : moreIcon}
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
          hoverTimeoutDuration: 1250,
        }}
      />
      {!advanced && (
        <SearchBar
          setSearchContent={setSearchContent}
          advanced={advanced}
          searchValue={searchValue}
        />
      )}
    </div>
  );
}
