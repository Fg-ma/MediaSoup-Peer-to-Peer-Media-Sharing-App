import React, { useEffect, useRef, useState } from "react";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import { AudioEffectTypes } from "../../context/effectsContext/typeConstant";
import FgButton from "../../fgElements/fgButton/FgButton";
import FgSVG from "../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import { AudioEffectTemplate } from "./typeConstant";

export default function AudioEffectButton({
  username,
  instance,
  isUser,
  producerType,
  producerId,
  audioEffect,
  audioEffectTemplate,
  scrollingContainerRef,
  handleAudioEffectChange,
}: {
  username: string;
  instance: string;
  isUser: boolean;
  producerType: "audio" | "screenAudio";
  producerId?: string;
  audioEffect: AudioEffectTypes;
  audioEffectTemplate: AudioEffectTemplate;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  handleAudioEffectChange: (effect: AudioEffectTypes) => void;
}) {
  const { userStreamEffects, remoteStreamEffects } = useEffectsContext();

  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const attributes = useRef<{ key: string; value: string; id?: string }[]>([]);

  const streamEffects = isUser
    ? producerType === "audio"
      ? userStreamEffects.current[producerType][audioEffect]
      : producerId
      ? userStreamEffects.current[producerType][producerId][audioEffect]
      : undefined
    : producerType === "audio"
    ? remoteStreamEffects.current[username][instance][producerType][audioEffect]
    : producerId
    ? remoteStreamEffects.current[username][instance][producerType][producerId][
        audioEffect
      ]
    : undefined;

  for (let i = 0; i < audioEffectTemplate.attributes.length; i++) {
    const attribute = audioEffectTemplate.attributes[i];

    attributes.current.push({
      key: attribute.key,
      id: attribute.id,
      value:
        attribute.activityDependentValue !== undefined
          ? streamEffects
            ? attribute.activityDependentValue.deactive
            : attribute.activityDependentValue.active
          : attribute.value,
    });
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true); // Load the button when it's visible
            observer.unobserve(entry.target); // Stop observing once it's loaded
          }
        });
      },
      {
        root: scrollingContainerRef.current, // Container to observe within
        threshold: 0.1, // Trigger when 10% of the button is visible
      }
    );

    if (buttonRef.current) {
      observer.observe(buttonRef.current); // Start observing the button
    }

    return () => {
      if (buttonRef.current) {
        observer.unobserve(buttonRef.current); // Clean up observer on unmount
      }
    };
  }, [scrollingContainerRef]);

  return (
    <div ref={buttonRef} className='min-w-12 max-w-24 aspect-square'>
      {isVisible ? (
        <FgButton
          className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75 overflow-clip relative'
          scrollingContainerRef={scrollingContainerRef}
          clickFunction={() => {
            handleAudioEffectChange(audioEffect);
          }}
          contentFunction={() => {
            return (
              <FgSVG
                src={
                  streamEffects
                    ? audioEffectTemplate.offIcon
                    : audioEffectTemplate.icon
                }
                className='flex items-center justify-center'
                attributes={attributes.current}
              />
            );
          }}
          hoverContent={
            <FgHoverContentStandard
              content={
                streamEffects
                  ? audioEffectTemplate.hoverContent.deactive
                  : audioEffectTemplate.hoverContent.active
              }
            />
          }
          options={{
            hoverTimeoutDuration: 750,
          }}
        />
      ) : (
        <div className='bg-gray-300 w-full h-full animate-pulse rounded'></div> // Placeholder while loading
      )}
    </div>
  );
}
