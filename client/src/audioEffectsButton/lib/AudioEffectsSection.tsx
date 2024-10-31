import React, { useState, useEffect, useRef, Suspense } from "react";
import { Socket } from "socket.io-client";
import { AudioEffectTypes } from "../../context/streamsContext/typeConstant";
import FgPanel from "../../fgPanel/FgPanel";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import AudioEffectButton from "./AudioEffectButton";

import VolumeSVG from "../../fgVolumeElement/lib/VolumeSVG";
import volumeSVGPaths from "../../fgVolumeElement/lib/volumeSVGPaths";
import mixAudioEffectsIcon from "../../../public/svgs/audioEffects/mixAudioEffectsIcon.svg";
import mixAudioEffectsOffIcon from "../../../public/svgs/audioEffects/mixAudioEffectsOffIcon.svg";
import panioIcon from "../../../public/svgs/audioEffects/panioIcon.svg";
import panioOffIcon from "../../../public/svgs/audioEffects/panioOffIcon.svg";
import soundBoardIcon from "../../../public/svgs/audioEffects/soundBoardIcon.svg";
import soundBoardOffIcon from "../../../public/svgs/audioEffects/soundBoardOffIcon.svg";

import robotIcon from "../../../public/svgs/audioEffects/robotIcon.svg";
import robotOffIcon from "../../../public/svgs/audioEffects/robotOffIcon.svg";
import echoIcon from "../../../public/svgs/audioEffects/echoIcon.svg";
import echoOffIcon from "../../../public/svgs/audioEffects/echoOffIcon.svg";
import alienIcon from "../../../public/svgs/audioEffects/alienIcon.svg";
import alienOffIcon from "../../../public/svgs/audioEffects/alienOffIcon.svg";
import underwaterIcon from "../../../public/svgs/audioEffects/underwaterIcon.svg";
import underwaterOffIcon from "../../../public/svgs/audioEffects/underwaterOffIcon.svg";
import telephoneIcon from "../../../public/svgs/audioEffects/telephoneIcon.svg";
import telephoneOffIcon from "../../../public/svgs/audioEffects/telephoneOffIcon.svg";
import spaceIcon from "../../../public/svgs/audioEffects/spaceIcon.svg";
import spaceOffIcon from "../../../public/svgs/audioEffects/spaceOffIcon.svg";
import distortionIcon from "../../../public/svgs/audioEffects/distortionIcon.svg";
import distortionOffIcon from "../../../public/svgs/audioEffects/distortionOffIcon.svg";
import vintageIcon from "../../../public/svgs/audioEffects/vintageIcon.svg";
import vintageOffIcon from "../../../public/svgs/audioEffects/vintageOffIcon.svg";
import psychedelicIcon from "../../../public/svgs/audioEffects/psychedelicIcon.svg";
import psychedelicOffIcon from "../../../public/svgs/audioEffects/psychedelicOffIcon.svg";
import deepBassIcon from "../../../public/svgs/audioEffects/deepBassIcon.svg";
import deepBassOffIcon from "../../../public/svgs/audioEffects/deepBassOffIcon.svg";
import highEnergyIcon from "../../../public/svgs/audioEffects/highEnergyIcon.svg";
import highEnergyOffIcon from "../../../public/svgs/audioEffects/highEnergyOffIcon.svg";
import ambientIcon from "../../../public/svgs/audioEffects/ambientIcon.svg";
import ambientOffIcon from "../../../public/svgs/audioEffects/ambientOffIcon.svg";
import glitchIcon from "../../../public/svgs/audioEffects/glitchIcon.svg";
import glitchOffIcon from "../../../public/svgs/audioEffects/glitchOffIcon.svg";
import muffledIcon from "../../../public/svgs/audioEffects/muffledIcon.svg";
import muffledOffIcon from "../../../public/svgs/audioEffects/muffledOffIcon.svg";
import crystalIcon from "../../../public/svgs/audioEffects/crystalIcon.svg";
import crystalOffIcon from "../../../public/svgs/audioEffects/crystalOffIcon.svg";
import heavyMetalIcon from "../../../public/svgs/audioEffects/heavyMetalIcon.svg";
import heavyMetalOffIcon from "../../../public/svgs/audioEffects/heavyMetalOffIcon.svg";
import dreamyIcon from "../../../public/svgs/audioEffects/dreamyIcon.svg";
import dreamyOffIcon from "../../../public/svgs/audioEffects/dreamyOffIcon.svg";
import horrorIcon from "../../../public/svgs/audioEffects/horrorIcon.svg";
import horrorOffIcon from "../../../public/svgs/audioEffects/horrorOffIcon.svg";
import sciFiIcon from "../../../public/svgs/audioEffects/sciFiIcon.svg";
import sciFiOffIcon from "../../../public/svgs/audioEffects/sciFiOffIcon.svg";
import dystopianIcon from "../../../public/svgs/audioEffects/dystopianIcon.svg";
import dystopianOffIcon from "../../../public/svgs/audioEffects/dystopianOffIcon.svg";
import retroGameIcon from "../../../public/svgs/audioEffects/retroGameIcon.svg";
import retroGameOffIcon from "../../../public/svgs/audioEffects/retroGameOffIcon.svg";
import ghostlyIcon from "../../../public/svgs/audioEffects/ghostlyIcon.svg";
import ghostlyOffIcon from "../../../public/svgs/audioEffects/ghostlyOffIcon.svg";
import metallicIcon from "../../../public/svgs/audioEffects/metallicIcon.svg";
import metallicOffIcon from "../../../public/svgs/audioEffects/metallicOffIcon.svg";
import hypnoticIcon from "../../../public/svgs/audioEffects/hypnoticIcon.svg";
import hypnoticOffIcon from "../../../public/svgs/audioEffects/hypnoticOffIcon.svg";
import cyberpunkIcon from "../../../public/svgs/audioEffects/cyberpunkIcon.svg";
import cyberpunkOffIcon from "../../../public/svgs/audioEffects/cyberpunkOffIcon.svg";
import windyIcon from "../../../public/svgs/audioEffects/windyIcon.svg";
import windyOffIcon from "../../../public/svgs/audioEffects/windyOffIcon.svg";
import radioIcon from "../../../public/svgs/audioEffects/radioIcon.svg";
import radioOffIcon from "../../../public/svgs/audioEffects/radioOffIcon.svg";
import explosionIcon from "../../../public/svgs/audioEffects/explosionIcon.svg";
import explosionOffIcon from "../../../public/svgs/audioEffects/explosionOffIcon.svg";
import whisperIcon from "../../../public/svgs/audioEffects/whisperIcon.svg";
import whisperOffIcon from "../../../public/svgs/audioEffects/whisperOffIcon.svg";
import submarineIcon from "../../../public/svgs/audioEffects/submarineIcon.svg";
import submarineOffIcon from "../../../public/svgs/audioEffects/submarineOffIcon.svg";
import windTunnelIcon from "../../../public/svgs/audioEffects/windTunnelIcon.svg";
import windTunnelOffIcon from "../../../public/svgs/audioEffects/windTunnelOffIcon.svg";
import crushedBassIcon from "../../../public/svgs/audioEffects/crushedBassIcon.svg";
import crushedBassOffIcon from "../../../public/svgs/audioEffects/crushedBassOffIcon.svg";
import etherealIcon from "../../../public/svgs/audioEffects/etherealIcon.svg";
import etherealOffIcon from "../../../public/svgs/audioEffects/etherealOffIcon.svg";
import electroStingIcon from "../../../public/svgs/audioEffects/electroStingIcon.svg";
import electroStingOffIcon from "../../../public/svgs/audioEffects/electroStingOffIcon.svg";
import heartbeatIcon from "../../../public/svgs/audioEffects/heartbeatIcon.svg";
import heartbeatOffIcon from "../../../public/svgs/audioEffects/heartbeatOffIcon.svg";
import underworldIcon from "../../../public/svgs/audioEffects/underworldIcon.svg";
import underworldOffIcon from "../../../public/svgs/audioEffects/underworldOffIcon.svg";
import sizzlingIcon from "../../../public/svgs/audioEffects/sizzlingIcon.svg";
import sizzlingOffIcon from "../../../public/svgs/audioEffects/sizzlingOffIcon.svg";
import staticNoiseIcon from "../../../public/svgs/audioEffects/staticNoiseIcon.svg";
import staticNoiseOffIcon from "../../../public/svgs/audioEffects/staticNoiseOffIcon.svg";
import bubblyIcon from "../../../public/svgs/audioEffects/bubblyIcon.svg";
import bubblyOffIcon from "../../../public/svgs/audioEffects/bubblyOffIcon.svg";
import thunderIcon from "../../../public/svgs/audioEffects/thunderIcon.svg";
import thunderOffIcon from "../../../public/svgs/audioEffects/thunderOffIcon.svg";
import echosOfThePastIcon from "../../../public/svgs/audioEffects/echosOfThePastIcon.svg";
import echosOfThePastOffIcon from "../../../public/svgs/audioEffects/echosOfThePastOffIcon.svg";

const AudioMixEffectsPortal = React.lazy(
  () => import("./AudioMixEffectsPortal")
);
const FgPiano = React.lazy(() => import("../../fgPiano/FgPiano"));
const FgSoundBoard = React.lazy(
  () => import("../../fgSoundBoard/FgSoundBoard")
);

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
  closeLabelElement,
  closeCallback,
  backgroundColor,
  secondaryBackgroundColor,
}: {
  socket: React.MutableRefObject<Socket>;
  username: string;
  instance: string;
  isUser: boolean;
  handleAudioEffectChange: (effect: AudioEffectTypes) => void;
  placement: "above" | "below" | "left" | "right";
  referenceElement: React.RefObject<HTMLElement>;
  padding: number;
  handleMute: () => void;
  muteStateRef: React.MutableRefObject<boolean>;
  videoContainerRef?: React.RefObject<HTMLDivElement>;
  closeLabelElement?: React.ReactElement;
  closeCallback?: () => void;
  backgroundColor?: string;
  secondaryBackgroundColor?: string;
}) {
  const [rerender, setRerender] = useState(false);
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
  const [soundBoardActive, setSoundBoardActive] = useState(false);

  const audioSectionRef = useRef<HTMLDivElement>(null);
  const audioMixEffectsButtonRef = useRef<HTMLButtonElement>(null);
  const pianoRef = useRef<HTMLButtonElement>(null);
  const soundBoardButtonRef = useRef<HTMLButtonElement>(null);

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
        setRerender((prev) => !prev);
        break;
      case "clientEffectChanged":
        setRerender((prev) => !prev);
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

  const audioEffectChange = (effect: AudioEffectTypes) => {
    handleAudioEffectChange(effect);

    setRerender((prev) => !prev);
  };

  const closeSoundBoardCallback = () => {
    setSoundBoardActive(false);
  };

  return (
    <>
      <FgPanel
        content={
          <div
            ref={audioSectionRef}
            className={`small-vertical-scroll-bar grid gap-1 min-w-[9.5rem] min-h-[9.5rem] h-full w-full overflow-y-auto py-2 ${
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
            <FgButton
              scrollingContainerRef={audioSectionRef}
              externalRef={soundBoardButtonRef}
              className='border-gray-300 flex items-center justify-center min-w-12 max-w-24 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
              clickFunction={() => {
                setSoundBoardActive((prev) => !prev);
              }}
              contentFunction={() => {
                return (
                  <FgSVG
                    src={soundBoardActive ? soundBoardOffIcon : soundBoardIcon}
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
                  {soundBoardActive ? "Close sound board" : "Sound board"}
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
                  handleAudioEffectChange={audioEffectChange}
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
        closeLabelElement={closeLabelElement}
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
      {soundBoardActive && (
        <Suspense fallback={<div>Loading...</div>}>
          <FgSoundBoard
            soundBoardButtonRef={soundBoardButtonRef.current ?? undefined}
            closeCallback={closeSoundBoardCallback}
          />
        </Suspense>
      )}
    </>
  );
}
