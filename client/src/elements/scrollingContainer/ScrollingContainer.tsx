import React, { useState, useEffect, useRef, ReactNode } from "react";
import { AnimatePresence, Transition, Variants, motion } from "framer-motion";
import "./lib/scrollingContainer.css";
import FgButton from "../fgButton/FgButton";
import FgSVGElement from "../fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateForward = nginxAssetServerBaseUrl + "svgs/navigateForward.svg";
const navigateBack = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

const scrollButtonsVar: Variants = {
  leftInit: { opacity: 0, x: -20 },
  leftAnimate: {
    opacity: 1,
    x: 0,
  },
  rightInit: { opacity: 0, x: 20 },
  rightAnimate: {
    opacity: 1,
    x: 0,
  },
  hover: { backgroundColor: "rgb(64, 64, 64)", fill: "rgb(242, 242, 242)" },
};

const scrollButtonsTransition: Transition = {
  transition: {
    opacity: {
      duration: 0.15,
      ease: "linear",
    },
    x: {
      duration: 0.15,
      ease: "linear",
    },
  },
};

export default function ScrollingContainer({
  externalRef,
  content,
  buttonBackgroundColor = "#161616",
  buttonBackgroundColorTransition = {
    backgroundColor: { duration: 0.3, ease: "linear" },
    boxShadow: {
      duration: 0.3,
      ease: "linear",
    },
  },
}: {
  externalRef?: React.RefObject<HTMLDivElement>;
  content: ReactNode;
  buttonBackgroundColor?: string;
  buttonBackgroundColorTransition?: Transition;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const updateVisibleScroll = () => {
    const scrollRef = externalRef ? externalRef : scrollingContainerRef;

    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    updateVisibleScroll();
  }, [content]);

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const scrollRef = externalRef ? externalRef : scrollingContainerRef;

    if (scrollRef.current) {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        scrollRef.current.scrollLeft += event.deltaX;
      } else {
        scrollRef.current.scrollLeft += event.deltaY;
      }
      updateVisibleScroll();
    }
  };

  useEffect(() => {
    const scrollRef = externalRef ? externalRef : scrollingContainerRef;

    scrollRef.current?.addEventListener("wheel", handleWheel);

    return () => {
      scrollRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleScroll = () => {
    updateVisibleScroll();
  };

  const scrollToRight = () => {
    const scrollRef = externalRef ? externalRef : scrollingContainerRef;

    if (scrollRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth;
      const clientWidth = scrollRef.current.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      const scrollStep = clientWidth;

      let newScrollLeft = scrollRef.current.scrollLeft + scrollStep;

      newScrollLeft = Math.min(newScrollLeft, maxScroll);

      scrollRef.current.scrollLeft = newScrollLeft;
    }
  };

  const scrollToLeft = () => {
    const scrollRef = externalRef ? externalRef : scrollingContainerRef;

    if (scrollRef.current) {
      const scrollStep = scrollRef.current.clientWidth;

      let newScrollLeft = scrollRef.current.scrollLeft - scrollStep;

      newScrollLeft = Math.max(newScrollLeft, 0);

      scrollRef.current.scrollLeft = newScrollLeft;
    }
  };

  return (
    <div className="flex w-full items-center justify-start overflow-hidden">
      <AnimatePresence>
        {showLeftScroll && (
          <motion.div
            className="flex z-10 h-full w-8 items-center justify-center bg-fg-white"
            variants={scrollButtonsVar}
            initial="leftInit"
            exit="leftInit"
            animate={{
              ...scrollButtonsVar.leftAnimate,
              backgroundColor: buttonBackgroundColor,
              boxShadow: externalRef?.current
                ? // prettier-ignore
                  `${-externalRef.current.clientHeight / 3}px 0 ${externalRef.current.clientHeight / 4}px ${externalRef.current.clientHeight / 2}px ${buttonBackgroundColor}`
                : scrollingContainerRef.current
                  ? // prettier-ignore
                    `${-scrollingContainerRef.current.clientHeight / 3}px 0 ${scrollingContainerRef.current.clientHeight / 4}px ${scrollingContainerRef.current.clientHeight / 2}px ${buttonBackgroundColor}`
                  : `1px 0 6px 8px ${buttonBackgroundColor}`,
            }}
            transition={{
              ...buttonBackgroundColorTransition,
              ...scrollButtonsTransition,
            }}
          >
            <FgButton
              className="flex aspect-square w-8 items-center justify-center rounded-full pr-0.5"
              contentFunction={() => (
                <FgSVGElement
                  src={navigateBack}
                  className="fill-fg-off-white stroke-fg-off-white"
                  attributes={[
                    { key: "height", value: "1.25rem" },
                    { key: "width", value: "1.25rem" },
                  ]}
                />
              )}
              animationOptions={{
                variants: scrollButtonsVar,
                transition: scrollButtonsTransition,
                whileHover: "hover",
              }}
              clickFunction={() => scrollToLeft()}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div
        ref={externalRef ? externalRef : scrollingContainerRef}
        className="flex hide-scroll-bar w-full grow items-center justify-start overflow-x-auto"
        onScroll={handleScroll}
      >
        {content}
      </div>
      <AnimatePresence>
        {showRightScroll && (
          <motion.div
            className="flex z-10 h-full w-8 items-center justify-center bg-fg-tone-black-2"
            style={{
              boxShadow: "-1px 0 6px 8px rgba(255, 255, 255, 1)",
            }}
            variants={scrollButtonsVar}
            initial="rightInit"
            exit="rightInit"
            animate={{
              ...scrollButtonsVar.rightAnimate,
              backgroundColor: buttonBackgroundColor,
              boxShadow: externalRef?.current
                ? // prettier-ignore
                  `${externalRef.current.clientHeight / 3}px 0 ${externalRef.current.clientHeight / 4}px ${externalRef.current.clientHeight / 2}px ${buttonBackgroundColor}`
                : scrollingContainerRef.current
                  ? // prettier-ignore
                    `${scrollingContainerRef.current.clientHeight / 3}px 0 ${scrollingContainerRef.current.clientHeight / 4}px ${scrollingContainerRef.current.clientHeight / 2}px ${buttonBackgroundColor}`
                  : `1px 0 6px 8px ${buttonBackgroundColor}`,
            }}
            transition={{
              ...buttonBackgroundColorTransition,
              ...scrollButtonsTransition,
            }}
          >
            <FgButton
              className="flex aspect-square w-8 items-center justify-center rounded-full pl-0.5"
              contentFunction={() => (
                <FgSVGElement
                  src={navigateForward}
                  className="fill-fg-off-white stroke-fg-off-white"
                  attributes={[
                    { key: "height", value: "1.25rem" },
                    { key: "width", value: "1.25rem" },
                  ]}
                />
              )}
              animationOptions={{
                variants: scrollButtonsVar,
                transition: scrollButtonsTransition,
                whileHover: "hover",
              }}
              clickFunction={() => scrollToRight()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
