import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateForward = nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function ExpandLineNumbers({
  isLineNums,
  setIsLineNums,
}: {
  isLineNums: boolean;
  setIsLineNums: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const handleClick = (event: React.MouseEvent | PointerEvent) => {
    event.preventDefault();
    setIsLineNums((prev) => !prev);
  };

  return (
    <div className="media-floating-content">
      <AnimatePresence>
        {!isLineNums && (
          <motion.div
            className="absolute right-full top-0 z-[5] h-10 w-12 rounded-l-md bg-fg-tone-black-1 pr-1"
            initial={{ y: 0, x: 50, opacity: 0 }}
            animate={{ y: 0, x: 8, opacity: 1 }}
            exit={{ y: 0, x: 50, opacity: 0 }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <FgButton
              className="flex h-full w-full items-center justify-center"
              style={{ right: "calc(100% - 0.5rem)" }}
              pointerDownFunction={handleClick}
              contentFunction={() => (
                <FgSVGElement
                  className="flex items-center justify-center"
                  src={navigateForward}
                  attributes={[
                    { key: "width", value: "1.5rem" },
                    { key: "height", value: "1.5rem" },
                    { key: "stroke", value: "#f2f2f2" },
                    { key: "fill", value: "#f2f2f2" },
                  ]}
                />
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
