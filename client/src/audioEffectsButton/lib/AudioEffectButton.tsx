import React, { useRef } from "react";
import {
  AudioEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import { AudioEffectTemplate } from "./AudioEffectsSection";

export default function TelephoneEffect({
  username,
  instance,
  isUser,
  audioEffect,
  audioEffectTemplate,
  scrollingContainerRef,
  handleAudioEffectChange,
}: {
  username: string;
  instance: string;
  isUser: boolean;
  audioEffect: AudioEffectTypes;
  audioEffectTemplate: AudioEffectTemplate;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  handleAudioEffectChange: (effect: AudioEffectTypes) => Promise<void>;
}) {
  const { userStreamEffects, remoteStreamEffects } = useStreamsContext();

  const attributes = useRef<{ key: string; value: string; id?: string }[]>([]);
  const streamEffects = isUser
    ? userStreamEffects.current.audio[audioEffect]
    : remoteStreamEffects.current[username][instance].audio[audioEffect];

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
          : audioEffectTemplate.attributes[i].value,
    });
  }

  return (
    <FgButton
      className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
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
        <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
          {streamEffects
            ? audioEffectTemplate.hoverContent.deactive
            : audioEffectTemplate.hoverContent.active}
        </div>
      }
      options={{ hoverTimeoutDuration: 750 }}
    />
  );
}
