import React from "react";
import {
  AudioEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import alienIcon from "../../../public/svgs/audio/alienIcon.svg";
import alienOffIcon from "../../../public/svgs/audio/alienOffIcon.svg";

export default function AlienEffect({
  username,
  instance,
  isUser,
  handleAudioEffectChange,
}: {
  username: string;
  instance: string;
  isUser: boolean;
  handleAudioEffectChange: (effect: AudioEffectTypes) => Promise<void>;
}) {
  const { userStreamEffects, remoteStreamEffects } = useStreamsContext();

  const streamEffects = isUser
    ? userStreamEffects.current.audio.alien
    : remoteStreamEffects.current[username][instance].audio.alien;

  return (
    <FgButton
      className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
      clickFunction={() => {
        handleAudioEffectChange("alien");
      }}
      contentFunction={() => {
        return (
          <FgSVG
            src={streamEffects ? alienOffIcon : alienIcon}
            className='flex items-center justify-center'
            attributes={[
              { key: "width", value: "90%" },
              { key: "height", value: "90%" },
            ]}
          />
        );
      }}
      hoverContent={
        <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
          {streamEffects ? "Remove alien effect" : "Alien effect"}
        </div>
      }
      options={{ hoverTimeoutDuration: 750 }}
    />
  );
}
