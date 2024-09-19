import React, { useState, useEffect, useRef, Suspense } from "react";
import { Socket } from "socket.io-client";
import { AudioEffectTypes } from "../../context/StreamsContext";
import FgPanel from "../../fgPanel/FgPanel";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import mixAudioEffectsIcon from "../../../public/svgs/audio/mixAudioEffectsIcon.svg";
import mixAudioEffectsOffIcon from "../../../public/svgs/audio/mixAudioEffectsOffIcon.svg";
import panioIcon from "../../../public/svgs/audio/panioIcon.svg";
import panioOffIcon from "../../../public/svgs/audio/panioOffIcon.svg";
import VolumeSVG from "../../FgVolumeElement/lib/VolumeSVG";
import volumeSVGPaths from "../../FgVolumeElement/lib/volumeSVGPaths";
import AudioEffectButton from "./AudioEffectButton";

import robotIcon from "../../../public/svgs/audio/robotIcon.svg";
import robotOffIcon from "../../../public/svgs/audio/robotOffIcon.svg";
import echoIcon from "../../../public/svgs/audio/echoIcon.svg";
import echoOffIcon from "../../../public/svgs/audio/echoOffIcon.svg";
import alienIcon from "../../../public/svgs/audio/alienIcon.svg";
import alienOffIcon from "../../../public/svgs/audio/alienOffIcon.svg";
import underwaterIcon from "../../../public/svgs/audio/underwaterIcon.svg";
import underwaterOffIcon from "../../../public/svgs/audio/underwaterOffIcon.svg";
import telephoneIcon from "../../../public/svgs/audio/telephoneIcon.svg";
import telephoneOffIcon from "../../../public/svgs/audio/telephoneOffIcon.svg";
import spaceIcon from "../../../public/svgs/audio/spaceIcon.svg";
import spaceOffIcon from "../../../public/svgs/audio/spaceOffIcon.svg";
import distortionIcon from "../../../public/svgs/audio/distortionIcon.svg";
import distortionOffIcon from "../../../public/svgs/audio/distortionOffIcon.svg";
import vintageIcon from "../../../public/svgs/audio/vintageIcon.svg";
import vintageOffIcon from "../../../public/svgs/audio/vintageOffIcon.svg";
import psychedelicIcon from "../../../public/svgs/audio/psychedelicIcon.svg";
import psychedelicOffIcon from "../../../public/svgs/audio/psychedelicOffIcon.svg";
import deepBassIcon from "../../../public/svgs/audio/deepBassIcon.svg";
import deepBassOffIcon from "../../../public/svgs/audio/deepBassOffIcon.svg";
import highEnergyIcon from "../../../public/svgs/audio/highEnergyIcon.svg";
import highEnergyOffIcon from "../../../public/svgs/audio/highEnergyOffIcon.svg";
import ambientIcon from "../../../public/svgs/audio/ambientIcon.svg";
import ambientOffIcon from "../../../public/svgs/audio/ambientOffIcon.svg";
import glitchIcon from "../../../public/svgs/audio/glitchIcon.svg";
import glitchOffIcon from "../../../public/svgs/audio/glitchOffIcon.svg";
import muffledIcon from "../../../public/svgs/audio/muffledIcon.svg";
import muffledOffIcon from "../../../public/svgs/audio/muffledOffIcon.svg";
import crystalIcon from "../../../public/svgs/audio/crystalIcon.svg";
import crystalOffIcon from "../../../public/svgs/audio/crystalOffIcon.svg";
import heavyMetalIcon from "../../../public/svgs/audio/heavyMetalIcon.svg";
import heavyMetalOffIcon from "../../../public/svgs/audio/heavyMetalOffIcon.svg";
import dreamyIcon from "../../../public/svgs/audio/dreamyIcon.svg";
import dreamyOffIcon from "../../../public/svgs/audio/dreamyOffIcon.svg";
import horrorIcon from "../../../public/svgs/audio/horrorIcon.svg";
import horrorOffIcon from "../../../public/svgs/audio/horrorOffIcon.svg";
import sciFiIcon from "../../../public/svgs/audio/sciFiIcon.svg";
import sciFiOffIcon from "../../../public/svgs/audio/sciFiOffIcon.svg";
import dystopianIcon from "../../../public/svgs/audio/dystopianIcon.svg";
import dystopianOffIcon from "../../../public/svgs/audio/dystopianOffIcon.svg";
import retroGameIcon from "../../../public/svgs/audio/retroGameIcon.svg";
import retroGameOffIcon from "../../../public/svgs/audio/retroGameOffIcon.svg";
import ghostlyIcon from "../../../public/svgs/audio/ghostlyIcon.svg";
import ghostlyOffIcon from "../../../public/svgs/audio/ghostlyOffIcon.svg";
import metallicIcon from "../../../public/svgs/audio/metallicIcon.svg";
import metallicOffIcon from "../../../public/svgs/audio/metallicOffIcon.svg";
import hypnoticIcon from "../../../public/svgs/audio/hypnoticIcon.svg";
import hypnoticOffIcon from "../../../public/svgs/audio/hypnoticOffIcon.svg";
import cyberpunkIcon from "../../../public/svgs/audio/cyberpunkIcon.svg";
import cyberpunkOffIcon from "../../../public/svgs/audio/cyberpunkOffIcon.svg";
import windyIcon from "../../../public/svgs/audio/windyIcon.svg";
import windyOffIcon from "../../../public/svgs/audio/windyOffIcon.svg";
import radioIcon from "../../../public/svgs/audio/radioIcon.svg";
import radioOffIcon from "../../../public/svgs/audio/radioOffIcon.svg";
import explosionIcon from "../../../public/svgs/audio/explosionIcon.svg";
import explosionOffIcon from "../../../public/svgs/audio/explosionOffIcon.svg";
import whisperIcon from "../../../public/svgs/audio/whisperIcon.svg";
import whisperOffIcon from "../../../public/svgs/audio/whisperOffIcon.svg";
import submarineIcon from "../../../public/svgs/audio/submarineIcon.svg";
import submarineOffIcon from "../../../public/svgs/audio/submarineOffIcon.svg";
import windTunnelIcon from "../../../public/svgs/audio/windTunnelIcon.svg";
import windTunnelOffIcon from "../../../public/svgs/audio/windTunnelOffIcon.svg";
import crushedBassIcon from "../../../public/svgs/audio/crushedBassIcon.svg";
import crushedBassOffIcon from "../../../public/svgs/audio/crushedBassOffIcon.svg";
import etherealIcon from "../../../public/svgs/audio/etherealIcon.svg";
import etherealOffIcon from "../../../public/svgs/audio/etherealOffIcon.svg";
import electroStingIcon from "../../../public/svgs/audio/electroStingIcon.svg";
import electroStingOffIcon from "../../../public/svgs/audio/electroStingOffIcon.svg";
import heartbeatIcon from "../../../public/svgs/audio/heartbeatIcon.svg";
import heartbeatOffIcon from "../../../public/svgs/audio/heartbeatOffIcon.svg";
import underworldIcon from "../../../public/svgs/audio/underworldIcon.svg";
import underworldOffIcon from "../../../public/svgs/audio/underworldOffIcon.svg";
import sizzlingIcon from "../../../public/svgs/audio/sizzlingIcon.svg";
import sizzlingOffIcon from "../../../public/svgs/audio/sizzlingOffIcon.svg";
import staticNoiseIcon from "../../../public/svgs/audio/staticNoiseIcon.svg";
import staticNoiseOffIcon from "../../../public/svgs/audio/staticNoiseOffIcon.svg";
import bubblyIcon from "../../../public/svgs/audio/bubblyIcon.svg";
import bubblyOffIcon from "../../../public/svgs/audio/bubblyOffIcon.svg";
import thunderIcon from "../../../public/svgs/audio/thunderIcon.svg";
import thunderOffIcon from "../../../public/svgs/audio/thunderOffIcon.svg";
import echosOfThePastIcon from "../../../public/svgs/audio/echosOfThePastIcon.svg";
import echosOfThePastOffIcon from "../../../public/svgs/audio/echosOfThePastOffIcon.svg";

const AudioMixEffectsPortal = React.lazy(
  () => import("./AudioMixEffectsPortal")
);
const FgPiano = React.lazy(() => import("../../FgPiano/FgPiano"));

export type AudioEffectTemplate = {
  icon: string;
  offIcon: string;
  attributes: {
    key: string;
    value: string;
    activityDependentValue?: {
      active: string;
      deactive: string;
    };
    id?: string;
  }[];
  hoverContent: {
    active: string;
    deactive: string;
  };
};

export type AudioEffectTemplates = {
  [audioEffectType in AudioEffectTypes]: AudioEffectTemplate;
};

const audioEffectTemplates: AudioEffectTemplates = {
  robot: {
    icon: robotIcon,
    offIcon: robotOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
      {
        key: "fill",
        id: "eyes",
        value: "red",
        activityDependentValue: { active: "", deactive: "red" },
      },
    ],
    hoverContent: { active: "Robot effect", deactive: "Remove robot effect" },
  },
  echo: {
    icon: echoIcon,
    offIcon: echoOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "stroke", value: "white" },
      {
        key: "fill",
        value: "white",
        activityDependentValue: { active: "none", deactive: "white" },
      },
    ],
    hoverContent: { active: "Echo effect", deactive: "Remove echo effect" },
  },
  alien: {
    icon: alienIcon,
    offIcon: alienOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: { active: "Alien effect", deactive: "Remove alien effect" },
  },
  underwater: {
    icon: underwaterIcon,
    offIcon: underwaterOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Underwater effect",
      deactive: "Remove underwater effect",
    },
  },
  telephone: {
    icon: telephoneIcon,
    offIcon: telephoneOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Telephone effect",
      deactive: "Remove telephone effect",
    },
  },
  space: {
    icon: spaceIcon,
    offIcon: spaceOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Space effect",
      deactive: "Remove space effect",
    },
  },
  distortion: {
    icon: distortionIcon,
    offIcon: distortionOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Distortion effect",
      deactive: "Remove distortion effect",
    },
  },
  vintage: {
    icon: vintageIcon,
    offIcon: vintageOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
      {
        key: "fill",
        id: "center",
        value: "#f56114",
        activityDependentValue: { active: "none", deactive: "#f56114" },
      },
    ],
    hoverContent: {
      active: "Vintage effect",
      deactive: "Remove vintage effect",
    },
  },
  psychedelic: {
    icon: psychedelicIcon,
    offIcon: psychedelicOffIcon,
    attributes: [
      { key: "width", value: "100%" },
      { key: "height", value: "100%" },
    ],
    hoverContent: {
      active: "Psychedelic effect",
      deactive: "Remove psychedelic effect",
    },
  },
  deepBass: {
    icon: deepBassIcon,
    offIcon: deepBassOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "stroke", value: "white" },
      {
        id: "innerEllipse",
        key: "fill",
        value: "white",
        activityDependentValue: { active: "white", deactive: "white" },
      },
    ],
    hoverContent: {
      active: "Deep bass effect",
      deactive: "Remove deep bass effect",
    },
  },
  highEnergy: {
    icon: highEnergyIcon,
    offIcon: highEnergyOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "High energy effect",
      deactive: "Remove high energy effect",
    },
  },
  ambient: {
    icon: ambientIcon,
    offIcon: ambientOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Ambient effect",
      deactive: "Remove ambient effect",
    },
  },
  glitch: {
    icon: glitchIcon,
    offIcon: glitchOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Glitch effect",
      deactive: "Remove glitch effect",
    },
  },
  muffled: {
    icon: muffledIcon,
    offIcon: muffledOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Muffled effect",
      deactive: "Remove muffled effect",
    },
  },
  crystal: {
    icon: crystalIcon,
    offIcon: crystalOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Crystal effect",
      deactive: "Remove crystal effect",
    },
  },
  heavyMetal: {
    icon: heavyMetalIcon,
    offIcon: heavyMetalOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Heavy metal effect",
      deactive: "Remove heavy metal effect",
    },
  },
  dreamy: {
    icon: dreamyIcon,
    offIcon: dreamyOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Dreamy effect",
      deactive: "Remove dreamy effect",
    },
  },
  horror: {
    icon: horrorIcon,
    offIcon: horrorOffIcon,
    attributes: [
      { key: "width", value: "100%" },
      { key: "height", value: "100%" },
    ],
    hoverContent: {
      active: "Horror effect",
      deactive: "Remove horror effect",
    },
  },
  sciFi: {
    icon: sciFiIcon,
    offIcon: sciFiOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Sci-fi effect",
      deactive: "Remove sci-fi effect",
    },
  },
  dystopian: {
    icon: dystopianIcon,
    offIcon: dystopianOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Dystopian effect",
      deactive: "Remove dystopian effect",
    },
  },
  retroGame: {
    icon: retroGameIcon,
    offIcon: retroGameOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Retro game effect",
      deactive: "Remove retro game effect",
    },
  },
  ghostly: {
    icon: ghostlyIcon,
    offIcon: ghostlyOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Ghostly effect",
      deactive: "Remove ghostly effect",
    },
  },
  metallic: {
    icon: metallicIcon,
    offIcon: metallicOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Metallic effect",
      deactive: "Remove metallic effect",
    },
  },
  hypnotic: {
    icon: hypnoticIcon,
    offIcon: hypnoticOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Hypnotic effect",
      deactive: "Remove hypnotic effect",
    },
  },
  cyberpunk: {
    icon: cyberpunkIcon,
    offIcon: cyberpunkOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Cyberpunk effect",
      deactive: "Remove cyberpunk effect",
    },
  },
  windy: {
    icon: windyIcon,
    offIcon: windyOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Windy effect",
      deactive: "Remove windy effect",
    },
  },
  radio: {
    icon: radioIcon,
    offIcon: radioOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Radio effect",
      deactive: "Remove radio effect",
    },
  },
  explosion: {
    icon: explosionIcon,
    offIcon: explosionOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Explosion effect",
      deactive: "Remove explosion effect",
    },
  },
  whisper: {
    icon: whisperIcon,
    offIcon: whisperOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Whisper effect",
      deactive: "Remove whisper effect",
    },
  },
  submarine: {
    icon: submarineIcon,
    offIcon: submarineOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Submarine effect",
      deactive: "Remove submarine effect",
    },
  },
  windTunnel: {
    icon: windTunnelIcon,
    offIcon: windTunnelOffIcon,
    attributes: [
      { key: "width", value: "100%" },
      { key: "height", value: "100%" },
    ],
    hoverContent: {
      active: "Wind tunnel effect",
      deactive: "Remove wind tunnel effect",
    },
  },
  crushedBass: {
    icon: crushedBassIcon,
    offIcon: crushedBassOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Crushed bass effect",
      deactive: "Remove crushed bass effect",
    },
  },
  ethereal: {
    icon: etherealIcon,
    offIcon: etherealOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Ethereal effect",
      deactive: "Remove ethereal effect",
    },
  },
  electroSting: {
    icon: electroStingIcon,
    offIcon: electroStingOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Electro sting effect",
      deactive: "Remove electro sting effect",
    },
  },
  heartbeat: {
    icon: heartbeatIcon,
    offIcon: heartbeatOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Heartbeat effect",
      deactive: "Remove heartbeat effect",
    },
  },
  underworld: {
    icon: underworldIcon,
    offIcon: underworldOffIcon,
    attributes: [
      { key: "width", value: "100%" },
      { key: "height", value: "100%" },
    ],
    hoverContent: {
      active: "Underworld effect",
      deactive: "Remove underworld effect",
    },
  },
  sizzling: {
    icon: sizzlingIcon,
    offIcon: sizzlingOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Sizzling effect",
      deactive: "Remove sizzling effect",
    },
  },
  staticNoise: {
    icon: staticNoiseIcon,
    offIcon: staticNoiseOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Static noise effect",
      deactive: "Remove static noise effect",
    },
  },
  bubbly: {
    icon: bubblyIcon,
    offIcon: bubblyOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Bubbly effect",
      deactive: "Remove bubbly effect",
    },
  },
  thunder: {
    icon: thunderIcon,
    offIcon: thunderOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Thunder effect",
      deactive: "Remove thunder effect",
    },
  },
  echosOfThePast: {
    icon: echosOfThePastIcon,
    offIcon: echosOfThePastOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Echos of the past effect",
      deactive: "Remove echos of the past effect",
    },
  },
};

export default function AudioEffectsSection({
  socket,
  username,
  instance,
  isUser,
  handleAudioEffectChange,
  placement,
  referenceElement,
  padding,
  handleMute,
  muteStateRef,
  videoContainerRef,
  closeCallback,
  backgroundColor,
  secondaryBackgroundColor,
}: {
  socket: React.MutableRefObject<Socket>;
  username: string;
  instance: string;
  isUser: boolean;
  handleAudioEffectChange: (effect: AudioEffectTypes) => Promise<void>;
  placement: "above" | "below" | "left" | "right";
  referenceElement: React.RefObject<HTMLElement>;
  padding: number;
  handleMute: () => void;
  muteStateRef: React.MutableRefObject<boolean>;
  videoContainerRef?: React.RefObject<HTMLDivElement>;
  closeCallback?: () => void;
  backgroundColor?: string;
  secondaryBackgroundColor?: string;
}) {
  const [rerender, setRerender] = useState(0);
  const [cols, setCols] = useState(3);
  const [volumeState, setVolumeState] = useState<{
    from: "off" | "low" | "high" | "";
    to: "off" | "low" | "high";
  }>({
    from: "",
    to: muteStateRef.current ? "off" : "high",
  });
  const [audioMixEffectsActive, setAudioMixEffectsActive] = useState(false);
  const [panioActive, setPanioActive] = useState(false);

  const audioSectionRef = useRef<HTMLDivElement>(null);
  const audioMixEffectsButtonRef = useRef<HTMLButtonElement>(null);
  const pianoRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const newTo = muteStateRef.current ? "off" : "high";

    if (newTo !== volumeState.to) {
      setVolumeState((prev) => ({ from: prev.to, to: newTo }));
    }
  }, [muteStateRef.current]);

  const gridColumnsChange = () => {
    if (!audioSectionRef.current) return;

    const width = audioSectionRef.current.clientWidth;
    if (width < 300) {
      if (cols !== 3) setCols(3);
    } else if (width < 500) {
      if (cols !== 4) setCols(4);
    } else if (width < 700) {
      if (cols !== 5) setCols(5);
    } else if (width >= 700) {
      if (cols !== 6) setCols(6);
    }
  };

  const handleMessage = (event: any) => {
    switch (event.type) {
      case "effectChangeRequested":
        setRerender((prev) => prev + 1);
        break;
      case "clientEffectChanged":
        setRerender((prev) => prev + 1);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    socket.current.on("message", handleMessage);

    // Cleanup event listener on unmount
    return () => {
      socket.current.off("message", handleMessage);
    };
  }, []);

  return (
    <>
      <FgPanel
        content={
          <div
            ref={audioSectionRef}
            className={`smallScrollbar grid gap-1 min-w-[9.5rem] min-h-[9.5rem] h-full w-full overflow-y-auto py-2 ${
              cols === 3
                ? "grid-cols-3"
                : cols === 4
                ? "grid-cols-4"
                : cols === 5
                ? "grid-cols-5"
                : "grid-cols-6"
            }`}
          >
            <FgButton
              scrollingContainerRef={audioSectionRef}
              className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
              clickFunction={() => {
                setVolumeState((prev) => ({
                  from: prev.to,
                  to: muteStateRef.current ? "high" : "off",
                }));
                handleMute();
              }}
              contentFunction={() => (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 100.0001 100.00001'
                  width='90%'
                  height='90%'
                  fill='white'
                >
                  <VolumeSVG
                    volumeState={volumeState}
                    movingPath={volumeSVGPaths.low.right}
                    stationaryPaths={[
                      volumeSVGPaths.high.left,
                      volumeSVGPaths.high.middle,
                    ]}
                    color='white'
                  />
                  {volumeState.from === "" && volumeState.to === "off" && (
                    <path d={volumeSVGPaths.strike} />
                  )}
                </svg>
              )}
              hoverContent={
                <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                  {muteStateRef.current ? "Unmute" : "Mute"}
                </div>
              }
              options={{ hoverTimeoutDuration: 350 }}
            />
            <FgButton
              scrollingContainerRef={audioSectionRef}
              externalRef={audioMixEffectsButtonRef}
              className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
              clickFunction={() => {
                setAudioMixEffectsActive((prev) => !prev);
              }}
              contentFunction={() => {
                return (
                  <FgSVG
                    src={
                      audioMixEffectsActive
                        ? mixAudioEffectsOffIcon
                        : mixAudioEffectsIcon
                    }
                    className='flex items-center justify-center'
                    attributes={[
                      { key: "width", value: "90%" },
                      { key: "height", value: "90%" },
                      { key: "fill", value: "white" },
                      { key: "stroke", value: "white" },
                    ]}
                  />
                );
              }}
              hoverContent={
                <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                  {audioMixEffectsActive ? "Close mix effects" : "Mix effects"}
                </div>
              }
              options={{ hoverTimeoutDuration: 350 }}
            />
            <FgButton
              scrollingContainerRef={audioSectionRef}
              externalRef={pianoRef}
              className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
              clickFunction={() => {
                if (videoContainerRef?.current) {
                  if (
                    videoContainerRef.current.classList.contains("in-piano")
                  ) {
                    videoContainerRef.current.classList.remove("in-piano");
                  } else {
                    videoContainerRef.current.classList.add("in-piano");
                  }
                }
                setPanioActive((prev) => !prev);
              }}
              contentFunction={() => {
                return (
                  <FgSVG
                    src={panioActive ? panioOffIcon : panioIcon}
                    className='flex items-center justify-center'
                    attributes={[
                      { key: "width", value: "90%" },
                      { key: "height", value: "90%" },
                      { key: "fill", value: "white" },
                      { key: "stroke", value: "white" },
                    ]}
                  />
                );
              }}
              hoverContent={
                <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                  {panioActive ? "Close synth" : "Synth"}
                </div>
              }
              options={{ hoverTimeoutDuration: 350 }}
            />
            {Object.entries(audioEffectTemplates).map((effect) => {
              return (
                <AudioEffectButton
                  key={effect[0]}
                  username={username}
                  instance={instance}
                  isUser={isUser}
                  audioEffect={effect[0] as AudioEffectTypes}
                  audioEffectTemplate={effect[1]}
                  scrollingContainerRef={audioSectionRef}
                  handleAudioEffectChange={handleAudioEffectChange}
                />
              );
            })}
          </div>
        }
        initPosition={{
          referenceElement: referenceElement.current ?? undefined,
          placement: placement,
          padding: padding,
        }}
        initWidth={"204px"}
        initHeight={"190px"}
        minWidth={204}
        minHeight={190}
        resizeCallback={() => {
          gridColumnsChange();
        }}
        closeCallback={closeCallback ? () => closeCallback() : undefined}
        closePosition='topRight'
        shadow={{ top: true, bottom: true }}
        backgroundColor={backgroundColor}
        secondaryBackgroundColor={secondaryBackgroundColor}
      />
      {audioMixEffectsActive && (
        <Suspense fallback={<div>Loading...</div>}>
          <AudioMixEffectsPortal
            audioMixEffectsButtonRef={audioMixEffectsButtonRef}
            closeCallback={() => {
              setAudioMixEffectsActive(false);
            }}
          />
        </Suspense>
      )}
      {panioActive && (
        <Suspense fallback={<div>Loading...</div>}>
          <FgPiano
            isUser={isUser}
            closeCallback={() => {
              setPanioActive(false);
            }}
            referenceElement={pianoRef.current as HTMLElement}
          />
        </Suspense>
      )}
    </>
  );
}
