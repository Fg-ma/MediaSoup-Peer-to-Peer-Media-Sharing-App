import React from "react";
import {
  AudioEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import echoIcon from "../../../public/svgs/audio/echoIcon.svg";
import echoOffIcon from "../../../public/svgs/audio/echoOffIcon.svg";

export default function EchoEffect({
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
    ? userStreamEffects.current.audio.echo
    : remoteStreamEffects.current[username][instance].audio.echo;

  return (
    <FgButton
      className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
      clickFunction={() => {
        handleAudioEffectChange("echo");
      }}
      contentFunction={() => {
        return (
          <FgSVG
            src={streamEffects ? echoOffIcon : echoIcon}
            className='flex items-center justify-center'
            attributes={[
              { key: "width", value: "90%" },
              { key: "height", value: "90%" },
              {
                key: "fill",
                value: streamEffects ? "white" : "none",
              },
              { key: "stroke", value: "white" },
            ]}
          />
        );
      }}
      hoverContent={
        <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
          {streamEffects ? "Remove echo effect" : "Echo effect"}
        </div>
      }
      options={{ hoverTimeoutDuration: 750 }}
    />
  );
}
