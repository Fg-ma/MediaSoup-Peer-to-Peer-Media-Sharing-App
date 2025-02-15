import React from "react";
import FgButton from "../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgSVG from "../../elements/fgSVG/FgSVG";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const linkIcon = nginxAssetSeverBaseUrl + "svgs/linkIcon.svg";

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
    <div className='flex h-8 items-center justify-start space-x-4 pl-[2%]'>
      <FgButton
        clickFunction={() => {
          window.open(link, "_blank");
        }}
        contentFunction={() => (
          <div className='text-white text-xl font-K2D'>{content}</div>
        )}
        hoverContent={
          <FgHoverContentStandard
            content={
              <div
                className='text-fg-tone-black-2 text-lg font-K2D max-w-96 p-2'
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
        className='flex h-full aspect-square bg-fg-red-light rounded-full items-center justify-center'
        clickFunction={() => {
          window.open(link, "_blank");
        }}
        contentFunction={() => (
          <FgSVG
            src={linkIcon}
            className='flex items-center justify-center pr-0.75 pt-0.5'
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
                className='text-fg-tone-black-2 text-lg font-K2D max-w-96 p-2'
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
