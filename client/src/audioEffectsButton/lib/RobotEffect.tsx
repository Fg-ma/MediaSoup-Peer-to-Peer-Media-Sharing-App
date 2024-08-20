import React from "react";
import {
  AudioEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import robotIcon from "../../../public/svgs/audio/robotIcon.svg";
import robotOffIcon from "../../../public/svgs/audio/robotOffIcon.svg";

export default function RobotEffect({
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
    ? userStreamEffects.current.audio.robot
    : remoteStreamEffects.current[username][instance].audio.robot;

  return (
    <FgButton
      className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
      clickFunction={() => {
        handleAudioEffectChange("robot");
      }}
      contentFunction={() => {
        return (
          <FgSVG
            src={streamEffects ? robotOffIcon : robotIcon}
            className='flex items-center justify-center'
            attributes={[
              { key: "width", value: "90%" },
              { key: "height", value: "90%" },
              { key: "fill", value: "white" },
              { key: "stroke", value: "white" },
              ...(streamEffects
                ? [{ key: "fill", value: "red", id: "eyes" }]
                : []),
            ]}
          />
        );
      }}
      hoverContent={
        <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
          {streamEffects ? "Remove robot effect" : "Robot effect"}
        </div>
      }
      options={{ hoverTimeoutDuration: 750 }}
    />
  );
}
