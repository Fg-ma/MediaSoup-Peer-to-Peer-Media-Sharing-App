import React, { useEffect, useRef, useState } from "react";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import { AudioEffectTypes } from "../../../../universal/effectsTypeConstant";
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
  const { userEffects, remoteEffects } = useEffectsContext();

  const attributes = useRef<{ key: string; value: string; id?: string }[]>([]);

  const streamEffects = isUser
    ? producerType === "audio"
      ? userEffects.current[producerType][audioEffect]
      : producerType === "video"
        ? producerId
          ? userEffects.current[producerType][producerId].audio[audioEffect]
          : undefined
        : producerId
          ? userEffects.current[producerType][producerId][audioEffect]
          : undefined
    : producerType === "audio"
      ? remoteEffects.current[username][instance][producerType][audioEffect]
      : producerType === "video"
        ? producerId
          ? remoteEffects.current[producerType][producerId].audio[audioEffect]
          : undefined
        : producerId
          ? remoteEffects.current[username][instance][producerType][producerId][
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
      className="relative flex aspect-square w-full min-w-12 items-center justify-center overflow-clip rounded bg-fg-tone-black-4 hover:bg-fg-red-light"
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
            className="flex items-center justify-center"
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
  );
}
