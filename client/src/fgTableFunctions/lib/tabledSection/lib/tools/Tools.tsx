import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import { StaticContentTypes } from "../../../../../../../universal/contentTypeConstant";
import TabledPortalController from "../TabledPortalController";
import SearchBar from "./searchBar/SearchBar";
import { Categories } from "../../TabledPortal";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const checkIcon = nginxAssetServerBaseUrl + "svgs/checkIcon.svg";
const paintBrushIcon = nginxAssetServerBaseUrl + "svgs/paintBrushIcon.svg";
const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";
const moreIcon = nginxAssetServerBaseUrl + "svgs/moreIcon.svg";
const moreOffIcon = nginxAssetServerBaseUrl + "svgs/moreOffIcon.svg";

export default function Tools({
  tabledPortalController,
  advanced,
  setAdvanced,
  setTabledActive,
  activePage,
  setSearchContent,
  searchValue,
}: {
  tabledPortalController: TabledPortalController;
  advanced: boolean;
  setAdvanced: React.Dispatch<React.SetStateAction<boolean>>;
  setTabledActive: React.Dispatch<React.SetStateAction<boolean>>;
  activePage: Categories;
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
}) {
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
          tabledPortalController.placeInstances();
          tabledPortalController.uploadInstances();
          setTabledActive(false);
        }}
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
            className="aspect-square h-[70%] fill-fg-off-white stroke-fg-off-white"
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
            className="aspect-square h-[70%] fill-fg-off-white stroke-fg-off-white"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        clickFunction={() => {
          tabledPortalController.reset();
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
          hoverZValue: 1000000,
          hoverTimeoutDuration: 1250,
        }}
      />
      {!advanced && (
        <SearchBar
          activePage={activePage}
          setSearchContent={setSearchContent}
          advanced={advanced}
          searchValue={searchValue}
        />
      )}
    </div>
  );
}
