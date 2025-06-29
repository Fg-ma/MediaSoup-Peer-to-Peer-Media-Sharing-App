import React from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";

import navigateBackIcon from "../../../public/svgs/navigateBack.svg";

export default function PageTemplate({
  content,
  pageTitle,
  backFunction,
}: {
  content?: React.ReactNode;
  pageTitle?: string;
  backFunction?: (event: React.MouseEvent) => void;
}) {
  return (
    <div className='w-full h-full flex flex-col justify-center items-center space-y-2'>
      <div
        className={`h-6 w-full flex items-start ${
          pageTitle ? "space-x-1" : ""
        }`}
      >
        <FgButton
          className='h-full aspect-square'
          contentFunction={() => (
            <FgSVG
              src={navigateBackIcon}
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
                { key: "fill", value: "white" },
                { key: "stroke", value: "white" },
              ]}
            />
          )}
          // @ts-ignore
          mouseUpFunction={backFunction}
        />
        {pageTitle && (
          <div
            className='cursor-pointer font-Josefin text-lg font-bold pt-0.5 pr-2'
            onClick={backFunction}
          >
            {pageTitle}
          </div>
        )}
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div className='small-scroll-bar w-full flex flex-col space-y-1 overflow-y-auto px-2 h-max max-h-[11.375rem]'>
        {content}
      </div>
    </div>
  );
}
