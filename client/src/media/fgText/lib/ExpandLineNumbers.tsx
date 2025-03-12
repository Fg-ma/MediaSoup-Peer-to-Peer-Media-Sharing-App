import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVG from "../../../elements/fgSVG/FgSVG";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateForward = nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function ExpandLineNumbers({
  expandLineNumbersButtonRef,
  lineNumbersRef,
}: {
  expandLineNumbersButtonRef: React.RefObject<HTMLButtonElement>;
  lineNumbersRef: React.RefObject<HTMLDivElement>;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const handleClick = (event: React.MouseEvent | PointerEvent) => {
    event.preventDefault();
    setCollapsed((prev) => !prev);
  };

  useEffect(() => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.addEventListener("pointerdown", handleClick);
    }

    return () => {
      if (lineNumbersRef.current) {
        lineNumbersRef.current.removeEventListener("pointerdown", handleClick);
      }
    };
  }, [lineNumbersRef.current]);

  return (
    <div className='media-floating-content'>
      <AnimatePresence>
        {collapsed && (
          <motion.div
            className='absolute top-0 right-full pr-1 w-12 h-10 bg-fg-tone-black-1 z-[5] rounded-l-md'
            initial={{ y: 0, x: 50, opacity: 0 }}
            animate={{ y: 0, x: 8, opacity: 1 }}
            exit={{ y: 0, x: 50, opacity: 0 }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <FgButton
              externalRef={expandLineNumbersButtonRef}
              className='flex w-full h-full items-center justify-center'
              style={{ right: "calc(100% - 0.5rem)" }}
              pointerDownFunction={handleClick}
              contentFunction={() => (
                <FgSVG
                  className='flex items-center justify-center'
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
