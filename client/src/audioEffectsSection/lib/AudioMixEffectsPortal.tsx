import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Transition, Variants, motion } from "framer-motion";
import AudioEffectSlider from "./AudioEffectSlider";
import AudioMixEffect from "./AudioMixEffect";

const AudioMixEffectsPortalVar: Variants = {
  init: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 100 },
    },
  },
};

const AudioMixEffectsPortalTransition: Transition = {
  transition: {
    opacity: { duration: 0.15 },
  },
};

export default function AudioMixEffectsPortal({
  buttonRef,
}: {
  buttonRef: React.RefObject<HTMLButtonElement>;
}) {
  const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0 });
  const portalRef = useRef<HTMLDivElement>(null);

  const getPortalPosition = () => {
    if (!buttonRef.current || !portalRef.current) {
      return;
    }

    const buttonRect = buttonRef.current.getBoundingClientRect();

    const top = buttonRect.bottom;

    const left =
      buttonRect.left - portalRef.current.getBoundingClientRect().width;

    const bodyRect = document.body.getBoundingClientRect();
    const topPercent = (top / bodyRect.height) * 100;
    const leftPercent = (left / bodyRect.width) * 100;

    setPortalPosition({
      top: topPercent,
      left: leftPercent,
    });
  };

  useEffect(() => {
    getPortalPosition();
  }, []);

  return ReactDOM.createPortal(
    <motion.div
      ref={portalRef}
      className={`${
        !portalPosition.top && !portalPosition.left && "opacity-0"
      } absolute z-20 bg-white rounded p-3 font-K2D text-md shadow max-w-lg max-h-[38rem]`}
      style={{
        top: `${portalPosition.top}%`,
        left: `${portalPosition.left}%`,
      }}
      variants={AudioMixEffectsPortalVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={AudioMixEffectsPortalTransition}
    >
      <div className='flex items-center justify-start space-x-2 mb-4'>
        <AudioMixEffectButton effect='Reverb' />
        <AudioMixEffectButton effect='Chorus' />
        <AudioMixEffectButton effect='EQ' />
        <AudioMixEffectButton effect='Delay' />
        <AudioMixEffectButton effect='Distortion' />
        <AudioMixEffectButton effect='Pitch shift' />
        <AudioMixEffectButton effect='Phaser' />
      </div>
      <div className='flex items-center justify-center space-x-6'>
        <AudioMixEffect
          effectLabel='Reverb'
          effectOptions={[
            {
              topLabel: "decay",
              ticks: 6,
              rangeMax: 10,
              rangeMin: 0,
              units: "sec",
            },
            {
              bottomLabel: "pre-delay",
              ticks: 6,
              rangeMax: 0.1,
              rangeMin: 0,
              precision: 2,
              units: "sec",
            },
          ]}
          bgColor='#858585'
        />
        <AudioMixEffect
          effectLabel='Chorus'
          effectOptions={[
            {
              topLabel: "freq",
              ticks: 6,
              rangeMax: 5,
              rangeMin: 0,
              units: "Hz",
            },
            {
              bottomLabel: "delay",
              ticks: 6,
              rangeMax: 20,
              rangeMin: 0,
              units: "ms",
            },
            {
              topLabel: "depth",
              ticks: 6,
              rangeMax: 1,
              rangeMin: 0,
              precision: 2,
              units: "%",
            },
          ]}
          bgColor='#d8bd9a'
        />
        <AudioMixEffect
          effectLabel='EQ'
          effectOptions={[
            {
              bottomLabel: "low",
              ticks: 9,
              rangeMax: 24,
              rangeMin: -24,
              units: "dB",
            },
            {
              bottomLabel: "mid",
              ticks: 9,
              rangeMax: 24,
              rangeMin: -24,
              units: "dB",
            },
            {
              topLabel: "high",
              ticks: 9,
              rangeMax: 24,
              rangeMin: -24,
              precision: 2,
              units: "dB",
            },
          ]}
          bgColor='#888097'
        />
        <AudioMixEffect
          effectLabel='Delay'
          effectOptions={[
            {
              bottomLabel: "delay",
              ticks: 5,
              rangeMax: 4,
              rangeMin: 0,
              units: "sec",
            },
            {
              bottomLabel: "feedback",
              ticks: 6,
              rangeMax: 1,
              rangeMin: 0,
              units: "%",
            },
          ]}
          bgColor='#c5cfd0'
        />
        <AudioMixEffect
          effectLabel='Distortion'
          effectOptions={[
            {
              bottomLabel: "dist",
              ticks: 6,
              rangeMax: 1,
              rangeMin: 0,
              units: "%",
            },
            {
              topLabel: "oversample",
              ticks: 6,
              rangeMax: 4,
              rangeMin: 2,
              units: "x",
            },
          ]}
          bgColor='#e7c47d'
        />
        <AudioMixEffect
          effectLabel='Pitch shift'
          effectOptions={[
            {
              bottomLabel: "pitch",
              ticks: 9,
              rangeMax: 12,
              rangeMin: -12,
              units: "semitones",
            },
          ]}
          bgColor='#9d4c0a'
        />
        <AudioMixEffect
          effectLabel='Phaser'
          effectOptions={[
            {
              bottomLabel: "freq",
              ticks: 6,
              rangeMax: 10,
              rangeMin: 0,
              units: "Hz",
            },
            {
              bottomLabel: "oct",
              ticks: 9,
              rangeMax: 8,
              rangeMin: 0,
              units: "Oct",
            },
            {
              bottomLabel: "base freq",
              ticks: 6,
              rangeMax: 1000,
              rangeMin: 0,
              units: "Hz",
            },
          ]}
          bgColor='#d03818'
        />
      </div>
    </motion.div>,
    document.body
  );
}

function AudioMixEffectButton({ effect }: { effect: string }) {
  const [active, setActive] = useState(false);

  return (
    <button
      className={`audio_mix_effect_button ${
        active ? "selected" : ""
      } font-K2D text-lg bg-fg-white-95 rounded px-5 pb-2 shadow`}
      onClick={() => setActive((prev) => !prev)}
    >
      {effect}
      <div className='audio_mix_effect_button_underline h-0.5 w-full rounded-full'></div>
    </button>
  );
}

import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";
import config from "@config";
import { CollectionButtonsProps, CollectionNames } from "@FgTypes/middleTypes";
import CollectionButton from "./CollectionButton";
import { motion, Variants, Transition } from "framer-motion";

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
  hover: { backgroundColor: "rgb(64 64 64)", fill: "white" },
};

const transition: Transition = {
  transition: {
    duration: 0.3,
    ease: "easeOut",
  },
};

const isDevelopment = process.env.NODE_ENV === "development";
const serverUrl = isDevelopment
  ? config.development.serverUrl
  : config.production.serverUrl;

export default function CollectionButtons({
  entityType,
  entity_username,
  isEditablePage,
}: CollectionButtonsProps) {
  /* 
    Description:   
      Creates the collection buttons for swtiching between different collections 
      associated with an entity and also also for creating new collections.
    Unique Properties:
      N/A
  */

  const collectionButtonsRef = useRef<HTMLDivElement>(null);
  const [collectionNames, setCollectionNames] = useState<CollectionNames[]>([]);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  // Get collections for a certain entity
  useEffect(() => {
    const fetchCollectionNamesData = async () => {
      try {
        if (entity_username) {
          const response = await Axios.get(
            `${serverUrl}/collections/collections_names`,
            {
              params: {
                entity_username: entity_username,
              },
            }
          );
          setCollectionNames(response.data);
        }
      } catch (error) {
        console.error("Error fetching collection names:", error);
      }
    };

    fetchCollectionNamesData();
  }, [entity_username]);

  const collections = collectionNames.map((collection) => {
    return (
      <CollectionButton
        key={collection.collection_id}
        entityType={entityType}
        collection_id={collection.collection_id}
        collection_name={collection.collection_name}
      />
    );
  });

  // Logic for how scroll buttons should be displayed based on given conditions
  const updateVisibleScroll = () => {
    if (collectionButtonsRef.current) {
      if (collectionButtonsRef.current.scrollLeft > 0) {
        setShowLeftScroll(true);
      } else {
        setShowLeftScroll(false);
      }

      if (
        collectionButtonsRef.current.scrollWidth >
        collectionButtonsRef.current.clientWidth
      ) {
        if (
          collectionButtonsRef.current.scrollLeft +
            collectionButtonsRef.current.clientWidth <
          collectionButtonsRef.current.scrollWidth
        ) {
          setShowRightScroll(true);
        } else {
          setShowRightScroll(false);
        }
      } else {
        setShowRightScroll(false);
      }
    }
  };

  // Change which scroll buttons are visible when new collections are loaded
  useEffect(() => {
    updateVisibleScroll();
  }, [collectionNames]);

  const handleScroll = () => {
    updateVisibleScroll();
  };

  const scrollToRight = () => {
    if (collectionButtonsRef.current) {
      const scrollWidth = collectionButtonsRef.current.scrollWidth;
      const clientWidth = collectionButtonsRef.current.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      const scrollStep = clientWidth;

      let newScrollLeft = collectionButtonsRef.current.scrollLeft + scrollStep;

      newScrollLeft = Math.min(newScrollLeft, maxScroll);

      collectionButtonsRef.current.scrollLeft = newScrollLeft;
    }
  };

  const scrollToLeft = () => {
    if (collectionButtonsRef.current) {
      const scrollStep = collectionButtonsRef.current.clientWidth;

      let newScrollLeft = collectionButtonsRef.current.scrollLeft - scrollStep;

      newScrollLeft = Math.max(newScrollLeft, 0);

      collectionButtonsRef.current.scrollLeft = newScrollLeft;
    }
  };

  return (
    <>
      {collectionNames.length > 0 && (
        <div className='h-11 mb-2 flex w-full px-2 items-center justify-start'>
          {showLeftScroll && (
            <motion.div
              className='w-8 h-8 bg-white flex items-center justify-center z-10'
              style={{
                boxShadow: "14px 0 6px 8px rgba(255, 255, 255, 1)",
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
            ref={collectionButtonsRef}
            className='h-11 grow space-x-6 flex items-center justify-start overflow-x-auto w-full'
            onScroll={handleScroll}
          >
            {isEditablePage.current && (
              <button
                className='h-9 aspect-square bg-fg-white-90 rounded bg-cover bg-no-repeat'
                style={{
                  backgroundImage: 'url("/assets/icons/plus.svg")',
                }}
              ></button>
            )}
            {collections}
          </div>
          {showRightScroll && (
            <motion.div
              className='w-8 h-8 bg-white flex items-center justify-center z-10'
              style={{
                boxShadow: "-14px 0 6px 8px rgba(255, 255, 255, 1)",
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
      )}
    </>
  );
}
