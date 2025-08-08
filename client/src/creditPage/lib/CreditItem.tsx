import React from "react";
import FgButton from "../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgSVGElement from "../../elements/fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const linkIcon = nginxAssetServerBaseUrl + "svgs/linkIcon.svg";

export default function CreditItem({
  link,
  content,
  hoverContent,
}: {
  link: string;
  content: string;
  hoverContent: string;
}) {
  return (
    <div className="flex h-max items-center justify-start space-x-4 pl-[2%] pr-8">
      <FgButton
        className="flex items-center justify-start"
        clickFunction={() => {
          window.open(link, "_blank");
        }}
        contentFunction={() => (
          <div className="flex items-center justify-center text-left align-middle font-K2D text-xl text-fg-white">
            <span className="mr-2 text-4xl font-bold text-fg-red-light">
              {" "}
              -{" "}
            </span>
            {content}
          </div>
        )}
        hoverContent={
          <FgHoverContentStandard
            content={
              <div
                className="max-w-96 p-2 font-K2D text-lg text-fg-tone-black-2"
                style={{
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  hyphens: "auto",
                }}
              >
                {hoverContent}
              </div>
            }
          />
        }
        options={{ hoverSpacing: 4, hoverTimeoutDuration: 1500 }}
      />
      <FgButton
        className="flex aspect-square h-8 items-center justify-center rounded-full bg-fg-red-light"
        clickFunction={() => {
          window.open(link, "_blank");
        }}
        contentFunction={() => (
          <FgSVGElement
            src={linkIcon}
            className="flex items-center justify-center pr-0.75 pt-0.5"
            attributes={[
              { key: "width", value: "70%" },
              { key: "height", value: "70%" },
              { key: "fill", value: "#f2f2f2" },
              { key: "stroke", value: "#f2f2f2" },
            ]}
          />
        )}
        hoverContent={
          <FgHoverContentStandard
            content={
              <div
                className="max-w-96 p-2 font-K2D text-lg text-fg-tone-black-2"
                style={{
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  hyphens: "auto",
                }}
              >
                {hoverContent}
              </div>
            }
          />
        }
        options={{ hoverSpacing: 4, hoverTimeoutDuration: 1500 }}
      />
    </div>
  );
}
