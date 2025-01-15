import React, { useEffect, useRef, useState } from "react";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateForward = nginxAssetSeverBaseUrl + "svgs/navigateForward.svg";

export default function MessageTableSection() {
  const [messageSent, setMessageSent] = useState(false);
  const [queSecondSVG, setQueSecondSVG] = useState(false);
  const messageSendButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className='grow w-1 h-full bg-fg-tone-black-6 rounded-xl border-2 border-fg-off-white relative py-[0.5%] px-[2%] flex space-x-2'>
      <input
        type='text'
        className='bg-fg-white rounded w-full h-full text-fg-tone-black-1 text-lg pl-[1%] font-K2D'
        placeholder='Send message...'
      />
      <FgButton
        externalRef={messageSendButtonRef}
        className='bg-fg-red rounded-full h-full aspect-square overflow-hidden'
        clickFunction={() => {
          if (messageSendButtonRef.current)
            messageSendButtonRef.current.disabled = true;

          setMessageSent(true);

          setTimeout(() => {
            setQueSecondSVG(true);
          }, 400);

          setTimeout(() => {
            if (messageSendButtonRef.current)
              messageSendButtonRef.current.disabled = false;

            setMessageSent(false);
            setQueSecondSVG(false);
          }, 1000);
        }}
        contentFunction={() => (
          <>
            <FgSVG
              src={navigateForward}
              attributes={[
                { key: "width", value: "80%" },
                { key: "height", value: "80%" },
                { key: "fill", value: "white" },
              ]}
              className='flex items-center justify-center h-full aspect-square'
              style={{
                ...(messageSent
                  ? {
                      transition: "transform 0.2s ease",
                      transform: "translateY(-100%) rotate(-90deg)",
                    }
                  : { transform: "rotate(-90deg)" }),
              }}
            />
            <FgSVG
              src={navigateForward}
              attributes={[
                { key: "width", value: "80%" },
                { key: "height", value: "80%" },
                { key: "fill", value: "white" },
              ]}
              className='flex items-center justify-center h-full aspect-square relative'
              style={{
                transition: "transform 0.2s ease",
                top: queSecondSVG ? "-100%" : "0%",
                transform: `translateY(${
                  queSecondSVG ? "0%" : "100%"
                }) rotate(-90deg)`,
              }}
            />
          </>
        )}
      />
    </div>
  );
}
