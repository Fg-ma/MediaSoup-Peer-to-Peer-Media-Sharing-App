import React, { useState, useEffect, useRef, ReactNode } from "react";
import { Transition, Variants, motion } from "framer-motion";
import "./lib/scrollingContainer.css";

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
  hover: { backgroundColor: "rgb(64 64 64)", fill: "rgb(255, 255, 255)" },
};

const transition: Transition = {
  transition: {
    duration: 0.3,
    ease: "easeOut",
  },
};

export default function ScrollingContainer({
  content,
}: {
  content: ReactNode;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const updateVisibleScroll = () => {
    if (scrollingContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollingContainerRef.current;

      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    updateVisibleScroll();
  }, [content]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (scrollingContainerRef.current) {
        scrollingContainerRef.current.scrollLeft += event.deltaY;
        updateVisibleScroll();
      }
    };

    scrollingContainerRef.current?.addEventListener("wheel", handleWheel);

    return () => {
      scrollingContainerRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleScroll = () => {
    updateVisibleScroll();
  };

  const scrollToRight = () => {
    if (scrollingContainerRef.current) {
      const scrollWidth = scrollingContainerRef.current.scrollWidth;
      const clientWidth = scrollingContainerRef.current.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      const scrollStep = clientWidth;

      let newScrollLeft = scrollingContainerRef.current.scrollLeft + scrollStep;

      newScrollLeft = Math.min(newScrollLeft, maxScroll);

      scrollingContainerRef.current.scrollLeft = newScrollLeft;
    }
  };

  const scrollToLeft = () => {
    if (scrollingContainerRef.current) {
      const scrollStep = scrollingContainerRef.current.clientWidth;

      let newScrollLeft = scrollingContainerRef.current.scrollLeft - scrollStep;

      newScrollLeft = Math.max(newScrollLeft, 0);

      scrollingContainerRef.current.scrollLeft = newScrollLeft;
    }
  };

  return (
    <div className='flex w-full items-center justify-start overflow-hidden'>
      {showLeftScroll && (
        <motion.div
          className='w-8 h-full bg-white flex items-center justify-center z-10'
          style={{
            boxShadow: "1px 0 6px 8px rgba(255, 255, 255, 1)",
          }}
          variants={scrollButtonsVar}
          initial='leftInit'
          animate={showLeftScroll ? "leftAnimate" : "leftInit"}
          transition={transition}
        >
          <motion.button
            className='w-8 aspect-square rounded-full'
            variants={scrollButtonsVar}
            whileHover='hover'
            onClick={scrollToLeft}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='32'
              viewBox='0 -960 960 960'
              width='32'
            >
              <path d='m432-480 156 156q11 11 11 28t-11 28q-11 11-28 11t-28-11L348-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l184-184q11-11 28-11t28 11q11 11 11 28t-11 28L432-480Z' />
            </svg>
          </motion.button>
        </motion.div>
      )}
      <div
        ref={scrollingContainerRef}
        className='grow flex items-center justify-start overflow-x-auto w-full'
        onScroll={handleScroll}
      >
        {content}
      </div>
      {showRightScroll && (
        <motion.div
          className='w-8 h-full bg-white flex items-center justify-center z-10'
          style={{
            boxShadow: "-1px 0 6px 8px rgba(255, 255, 255, 1)",
          }}
          variants={scrollButtonsVar}
          initial='rightInit'
          animate={showRightScroll ? "rightAnimate" : "rightInit"}
          transition={transition}
        >
          <motion.button
            className='w-8 aspect-square rounded-full'
            variants={scrollButtonsVar}
            whileHover='hover'
            onClick={scrollToRight}
          >
            <svg
              className='ml-0.5'
              xmlns='http://www.w3.org/2000/svg'
              height='32'
              viewBox='0 -960 960 960'
              width='32'
            >
              <path d='M504-480 348-636q-11-11-11-28t11-28q11-11 28-11t28 11l184 184q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L404-268q-11 11-28 11t-28-11q-11-11-11-28t11-28l156-156Z' />
            </svg>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
