import React, { useEffect, useRef, useState } from "react";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import { AudioEffectTypes } from "../../context/effectsContext/typeConstant";
import FgButton from "../../elements/fgButton/FgButton";
import FgSVGElement from "../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../elements/fgHoverContentStandard/FgHoverContentStandard";
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
  producerType: "audio" | "screenAudio" | "video";
  producerId?: string;
  audioEffect: AudioEffectTypes;
  audioEffectTemplate: AudioEffectTemplate;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  handleAudioEffectChange: (effect: AudioEffectTypes) => void;
}) {
  const { userStreamEffects, remoteStreamEffects } = useEffectsContext();

  const attributes = useRef<{ key: string; value: string; id?: string }[]>([]);

  const streamEffects = isUser
    ? producerType === "audio"
      ? userStreamEffects.current[producerType][audioEffect]
      : producerType === "video"
      ? producerId
        ? userStreamEffects.current[producerType][producerId].audio[audioEffect]
        : undefined
      : producerId
      ? userStreamEffects.current[producerType][producerId][audioEffect]
      : undefined
    : producerType === "audio"
    ? remoteStreamEffects.current[username][instance][producerType][audioEffect]
    : producerType === "video"
    ? producerId
      ? remoteStreamEffects.current[producerType][producerId].audio[audioEffect]
      : undefined
    : producerId
    ? remoteStreamEffects.current[username][instance][producerType][producerId][
        audioEffect
      ]
    : undefined;

  useEffect(() => {
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
  }, [streamEffects]);

  return (
    <FgButton
      className='flex items-center justify-center min-w-12 w-full aspect-square hover:bg-fg-red-light rounded bg-fg-tone-black-4 overflow-clip relative'
      scrollingContainerRef={scrollingContainerRef}
      clickFunction={() => {
        handleAudioEffectChange(audioEffect);
      }}
      contentFunction={() => {
        return (
          <FgSVGElement
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
        hoverZValue: 500000000000,
      }}
    />
  );
}
