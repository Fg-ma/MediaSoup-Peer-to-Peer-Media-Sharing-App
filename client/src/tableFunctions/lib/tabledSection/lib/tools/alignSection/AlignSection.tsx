import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const alignLeftIcon = nginxAssetServerBaseUrl + "svgs/alignLeftIcon.svg";
const alignCenterIcon = nginxAssetServerBaseUrl + "svgs/alignCenterIcon.svg";
const alignRightIcon = nginxAssetServerBaseUrl + "svgs/alignRightIcon.svg";
const alignTopIcon = nginxAssetServerBaseUrl + "svgs/alignTopIcon.svg";
const alignMiddleIcon = nginxAssetServerBaseUrl + "svgs/alignMiddleIcon.svg";
const alignBottomIcon = nginxAssetServerBaseUrl + "svgs/alignBottomIcon.svg";

export default function AlignSection({
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
  return (
    <div className="grid h-max w-full grid-cols-3">
      <FgButton
        className="flex aspect-square w-full items-center justify-center rounded-tl transition-all hover:bg-fg-white"
        contentFunction={() => (
          <FgSVGElement
            src={alignLeftIcon}
            className="aspect-square h-[75%] fill-fg-tone-black-1 stroke-fg-tone-black-1"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        clickFunction={() => {
          staticPlacement.current.x = 0;
          setRerender((prev) => !prev);
        }}
      />
      <FgButton
        className="flex aspect-square w-full items-center justify-center transition-all hover:bg-fg-white"
        contentFunction={() => (
          <FgSVGElement
            src={alignCenterIcon}
            className="aspect-square h-[75%] fill-fg-tone-black-1 stroke-fg-tone-black-1"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        clickFunction={() => {
          staticPlacement.current.x = 50;
          setRerender((prev) => !prev);
        }}
      />
      <FgButton
        className="flex aspect-square w-full items-center justify-center rounded-tr transition-all hover:bg-fg-white"
        contentFunction={() => (
          <FgSVGElement
            src={alignRightIcon}
            className="aspect-square h-[75%] fill-fg-tone-black-1 stroke-fg-tone-black-1"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        clickFunction={() => {
          staticPlacement.current.x = 100;
          setRerender((prev) => !prev);
        }}
      />
      <FgButton
        className="flex aspect-square w-full items-center justify-center rounded-bl transition-all hover:bg-fg-white"
        contentFunction={() => (
          <FgSVGElement
            src={alignTopIcon}
            className="aspect-square h-[75%] fill-fg-tone-black-1 stroke-fg-tone-black-1"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        clickFunction={() => {
          staticPlacement.current.y = 0;
          setRerender((prev) => !prev);
        }}
      />
      <FgButton
        className="flex aspect-square w-full items-center justify-center transition-all hover:bg-fg-white"
        contentFunction={() => (
          <FgSVGElement
            src={alignMiddleIcon}
            className="aspect-square h-[75%] fill-fg-tone-black-1 stroke-fg-tone-black-1"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        clickFunction={() => {
          staticPlacement.current.y = 50;
          setRerender((prev) => !prev);
        }}
      />
      <FgButton
        className="flex aspect-square w-full items-center justify-center rounded-br transition-all hover:bg-fg-white"
        contentFunction={() => (
          <FgSVGElement
            src={alignBottomIcon}
            className="aspect-square h-[75%] fill-fg-tone-black-1 stroke-fg-tone-black-1"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        clickFunction={() => {
          staticPlacement.current.y = 100;
          setRerender((prev) => !prev);
        }}
      />
    </div>
  );
}
