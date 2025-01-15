import React, { useRef, useState } from "react";
import FgImage from "../../fgElements/fgImageElement/FgImageElement";
import FgButton from "../../fgElements/fgButton/FgButton";
import FgPanel from "../../fgElements/fgPanel/FgPanel";

export default function UserBubble({
  fullDim,
  src,
  srcLoading,
  primaryColor,
  secondaryColor,
}: {
  fullDim: "width" | "height";
  src: string;
  srcLoading: string;
  primaryColor: string;
  secondaryColor: string;
}) {
  const [moreUserInformationActive, setMoreUserInformationActive] =
    useState(false);
  const userBubbleButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <FgButton
        externalRef={userBubbleButtonRef}
        className={`aspect-square rounded-full border-2 overflow-hidden ${
          fullDim === "height" ? "h-full" : "w-full"
        }`}
        style={{
          borderColor: primaryColor,
          boxShadow: `0px 4px 8px ${secondaryColor}`,
        }}
        contentFunction={() => <FgImage src={src} srcLoading={srcLoading} />}
        clickFunction={() => setMoreUserInformationActive((prev) => !prev)}
      />
      {moreUserInformationActive && (
        <FgPanel
          content={
            <div className='w-full h-full overflow-y-auto small-vertical-scroll-bar'></div>
          }
          initPosition={{
            referenceElement: userBubbleButtonRef.current ?? undefined,
            placement: "above",
            padding: 8,
          }}
          initWidth={"300px"}
          initHeight={"230px"}
          minWidth={200}
          minHeight={80}
          closeCallback={() => setMoreUserInformationActive(false)}
          closePosition='topRight'
          shadow={{ top: true, bottom: true }}
        />
      )}
    </>
  );
}
