import React, { useState } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import FgImage from "../../fgImage/FgImage";
import {
  useCurrentEffectsStylesContext,
  MasksEffectTypes,
  assetSizePositionMap,
} from "../../context/CurrentEffectsStylesContext";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";

import baseMask_512x512 from "../../../public/2DAssets/masks/baseMask/baseMask_512x512.png";
import baseMask_32x32 from "../../../public/2DAssets/masks/baseMask/baseMask_32x32.png";
import baseMaskIcon from "../../../public/svgs/visualEffects/masks/baseMask/baseMaskIcon.svg";
import baseMaskOffIcon from "../../../public/svgs/visualEffects/masks/baseMask/baseMaskOffIcon.svg";
import threeDim_baseMaskIcon from "../../../public/svgs/visualEffects/masks/baseMask/threeDim_baseMaskIcon.svg";
import threeDim_baseMaskOffIcon from "../../../public/svgs/visualEffects/masks/baseMask/threeDim_baseMaskOffIcon.svg";
import alienMask_512x512 from "../../../public/2DAssets/masks/alienMask/alienMask_512x512.png";
import alienMask_32x32 from "../../../public/2DAssets/masks/alienMask/alienMask_32x32.png";
import alienMask_off_512x512 from "../../../public/2DAssets/masks/alienMask/alienMask_off_512x512.png";
import alienMask_off_32x32 from "../../../public/2DAssets/masks/alienMask/alienMask_off_32x32.png";
import alienMask_threeDim_512x512 from "../../../public/2DAssets/masks/alienMask/alienMask_threeDim_512x512.png";
import alienMask_threeDim_32x32 from "../../../public/2DAssets/masks/alienMask/alienMask_threeDim_32x32.png";
import clownMask_512x512 from "../../../public/2DAssets/masks/clownMask/clownMask_512x512.png";
import clownMask_32x32 from "../../../public/2DAssets/masks/clownMask/clownMask_32x32.png";
import clownMask_off_512x512 from "../../../public/2DAssets/masks/clownMask/clownMask_off_512x512.png";
import clownMask_off_32x32 from "../../../public/2DAssets/masks/clownMask/clownMask_off_32x32.png";
import clownMask_threeDim_512x512 from "../../../public/2DAssets/masks/clownMask/clownMask_threeDim_512x512.png";
import clownMask_threeDim_32x32 from "../../../public/2DAssets/masks/clownMask/clownMask_threeDim_32x32.png";
import creatureMask_512x512 from "../../../public/2DAssets/masks/creatureMask/creatureMask_512x512.png";
import creatureMask_32x32 from "../../../public/2DAssets/masks/creatureMask/creatureMask_32x32.png";
import creatureMask_off_512x512 from "../../../public/2DAssets/masks/creatureMask/creatureMask_off_512x512.png";
import creatureMask_off_32x32 from "../../../public/2DAssets/masks/creatureMask/creatureMask_off_32x32.png";
import creatureMask_threeDim_512x512 from "../../../public/2DAssets/masks/creatureMask/creatureMask_threeDim_512x512.png";
import creatureMask_threeDim_32x32 from "../../../public/2DAssets/masks/creatureMask/creatureMask_threeDim_32x32.png";
import cyberMask_512x512 from "../../../public/2DAssets/masks/cyberMask/cyberMask_512x512.png";
import cyberMask_32x32 from "../../../public/2DAssets/masks/cyberMask/cyberMask_32x32.png";
import cyberMask_off_512x512 from "../../../public/2DAssets/masks/cyberMask/cyberMask_off_512x512.png";
import cyberMask_off_32x32 from "../../../public/2DAssets/masks/cyberMask/cyberMask_off_32x32.png";
import cyberMask_threeDim_512x512 from "../../../public/2DAssets/masks/cyberMask/cyberMask_threeDim_512x512.png";
import cyberMask_threeDim_32x32 from "../../../public/2DAssets/masks/cyberMask/cyberMask_threeDim_32x32.png";
import darkKnightMask_512x512 from "../../../public/2DAssets/masks/darkKnightMask/darkKnightMask_512x512.png";
import darkKnightMask_32x32 from "../../../public/2DAssets/masks/darkKnightMask/darkKnightMask_32x32.png";
import darkKnightMask_off_512x512 from "../../../public/2DAssets/masks/darkKnightMask/darkKnightMask_off_512x512.png";
import darkKnightMask_off_32x32 from "../../../public/2DAssets/masks/darkKnightMask/darkKnightMask_off_32x32.png";
import darkKnightMask_threeDim_512x512 from "../../../public/2DAssets/masks/darkKnightMask/darkKnightMask_threeDim_512x512.png";
import darkKnightMask_threeDim_32x32 from "../../../public/2DAssets/masks/darkKnightMask/darkKnightMask_threeDim_32x32.png";
import demonMask_512x512 from "../../../public/2DAssets/masks/demonMask/demonMask_512x512.png";
import demonMask_32x32 from "../../../public/2DAssets/masks/demonMask/demonMask_32x32.png";
import demonMask_off_512x512 from "../../../public/2DAssets/masks/demonMask/demonMask_off_512x512.png";
import demonMask_off_32x32 from "../../../public/2DAssets/masks/demonMask/demonMask_off_32x32.png";
import demonMask_threeDim_512x512 from "../../../public/2DAssets/masks/demonMask/demonMask_threeDim_512x512.png";
import demonMask_threeDim_32x32 from "../../../public/2DAssets/masks/demonMask/demonMask_threeDim_32x32.png";
import gasMask1_512x512 from "../../../public/2DAssets/masks/gasMask1/gasMask1_512x512.png";
import gasMask1_32x32 from "../../../public/2DAssets/masks/gasMask1/gasMask1_32x32.png";
import gasMask1_off_512x512 from "../../../public/2DAssets/masks/gasMask1/gasMask1_off_512x512.png";
import gasMask1_off_32x32 from "../../../public/2DAssets/masks/gasMask1/gasMask1_off_32x32.png";
import gasMask1_threeDim_512x512 from "../../../public/2DAssets/masks/gasMask1/gasMask1_threeDim_512x512.png";
import gasMask1_threeDim_32x32 from "../../../public/2DAssets/masks/gasMask1/gasMask1_threeDim_32x32.png";
import gasMask2_512x512 from "../../../public/2DAssets/masks/gasMask2/gasMask2_512x512.png";
import gasMask2_32x32 from "../../../public/2DAssets/masks/gasMask2/gasMask2_32x32.png";
import gasMask2_off_512x512 from "../../../public/2DAssets/masks/gasMask2/gasMask2_off_512x512.png";
import gasMask2_off_32x32 from "../../../public/2DAssets/masks/gasMask2/gasMask2_off_32x32.png";
import gasMask2_threeDim_512x512 from "../../../public/2DAssets/masks/gasMask2/gasMask2_threeDim_512x512.png";
import gasMask2_threeDim_32x32 from "../../../public/2DAssets/masks/gasMask2/gasMask2_threeDim_32x32.png";
import gasMask3_512x512 from "../../../public/2DAssets/masks/gasMask3/gasMask3_512x512.png";
import gasMask3_32x32 from "../../../public/2DAssets/masks/gasMask3/gasMask3_32x32.png";
import gasMask3_off_512x512 from "../../../public/2DAssets/masks/gasMask3/gasMask3_off_512x512.png";
import gasMask3_off_32x32 from "../../../public/2DAssets/masks/gasMask3/gasMask3_off_32x32.png";
import gasMask3_threeDim_512x512 from "../../../public/2DAssets/masks/gasMask3/gasMask3_threeDim_512x512.png";
import gasMask3_threeDim_32x32 from "../../../public/2DAssets/masks/gasMask3/gasMask3_threeDim_32x32.png";
import gasMask4_512x512 from "../../../public/2DAssets/masks/gasMask4/gasMask4_512x512.png";
import gasMask4_32x32 from "../../../public/2DAssets/masks/gasMask4/gasMask4_32x32.png";
import gasMask4_off_512x512 from "../../../public/2DAssets/masks/gasMask4/gasMask4_off_512x512.png";
import gasMask4_off_32x32 from "../../../public/2DAssets/masks/gasMask4/gasMask4_off_32x32.png";
import gasMask4_threeDim_512x512 from "../../../public/2DAssets/masks/gasMask4/gasMask4_threeDim_512x512.png";
import gasMask4_threeDim_32x32 from "../../../public/2DAssets/masks/gasMask4/gasMask4_threeDim_32x32.png";
import masqueradeMask_512x512 from "../../../public/2DAssets/masks/masqueradeMask/masqueradeMask_512x512.png";
import masqueradeMask_32x32 from "../../../public/2DAssets/masks/masqueradeMask/masqueradeMask_32x32.png";
import masqueradeMask_off_512x512 from "../../../public/2DAssets/masks/masqueradeMask/masqueradeMask_off_512x512.png";
import masqueradeMask_off_32x32 from "../../../public/2DAssets/masks/masqueradeMask/masqueradeMask_off_32x32.png";
import masqueradeMask_threeDim_512x512 from "../../../public/2DAssets/masks/masqueradeMask/masqueradeMask_threeDim_512x512.png";
import masqueradeMask_threeDim_32x32 from "../../../public/2DAssets/masks/masqueradeMask/masqueradeMask_threeDim_32x32.png";
import metalManMask_512x512 from "../../../public/2DAssets/masks/metalManMask/metalManMask_512x512.png";
import metalManMask_32x32 from "../../../public/2DAssets/masks/metalManMask/metalManMask_32x32.png";
import metalManMask_off_512x512 from "../../../public/2DAssets/masks/metalManMask/metalManMask_off_512x512.png";
import metalManMask_off_32x32 from "../../../public/2DAssets/masks/metalManMask/metalManMask_off_32x32.png";
import metalManMask_threeDim_512x512 from "../../../public/2DAssets/masks/metalManMask/metalManMask_threeDim_512x512.png";
import metalManMask_threeDim_32x32 from "../../../public/2DAssets/masks/metalManMask/metalManMask_threeDim_32x32.png";
import oniMask_512x512 from "../../../public/2DAssets/masks/oniMask/oniMask_512x512.png";
import oniMask_32x32 from "../../../public/2DAssets/masks/oniMask/oniMask_32x32.png";
import oniMask_off_512x512 from "../../../public/2DAssets/masks/oniMask/oniMask_off_512x512.png";
import oniMask_off_32x32 from "../../../public/2DAssets/masks/oniMask/oniMask_off_32x32.png";
import oniMask_threeDim_512x512 from "../../../public/2DAssets/masks/oniMask/oniMask_threeDim_512x512.png";
import oniMask_threeDim_32x32 from "../../../public/2DAssets/masks/oniMask/oniMask_threeDim_32x32.png";
import plagueDoctorMask_512x512 from "../../../public/2DAssets/masks/plagueDoctorMask/plagueDoctorMask_512x512.png";
import plagueDoctorMask_32x32 from "../../../public/2DAssets/masks/plagueDoctorMask/plagueDoctorMask_32x32.png";
import plagueDoctorMask_off_512x512 from "../../../public/2DAssets/masks/plagueDoctorMask/plagueDoctorMask_off_512x512.png";
import plagueDoctorMask_off_32x32 from "../../../public/2DAssets/masks/plagueDoctorMask/plagueDoctorMask_off_32x32.png";
import plagueDoctorMask_threeDim_512x512 from "../../../public/2DAssets/masks/plagueDoctorMask/plagueDoctorMask_threeDim_512x512.png";
import plagueDoctorMask_threeDim_32x32 from "../../../public/2DAssets/masks/plagueDoctorMask/plagueDoctorMask_threeDim_32x32.png";
import sixEyesMask_512x512 from "../../../public/2DAssets/masks/sixEyesMask/sixEyesMask_512x512.png";
import sixEyesMask_32x32 from "../../../public/2DAssets/masks/sixEyesMask/sixEyesMask_32x32.png";
import sixEyesMask_off_512x512 from "../../../public/2DAssets/masks/sixEyesMask/sixEyesMask_off_512x512.png";
import sixEyesMask_off_32x32 from "../../../public/2DAssets/masks/sixEyesMask/sixEyesMask_off_32x32.png";
import sixEyesMask_threeDim_512x512 from "../../../public/2DAssets/masks/sixEyesMask/sixEyesMask_threeDim_512x512.png";
import sixEyesMask_threeDim_32x32 from "../../../public/2DAssets/masks/sixEyesMask/sixEyesMask_threeDim_32x32.png";
import tenguMask_512x512 from "../../../public/2DAssets/masks/tenguMask/tenguMask_512x512.png";
import tenguMask_32x32 from "../../../public/2DAssets/masks/tenguMask/tenguMask_32x32.png";
import tenguMask_off_512x512 from "../../../public/2DAssets/masks/tenguMask/tenguMask_off_512x512.png";
import tenguMask_off_32x32 from "../../../public/2DAssets/masks/tenguMask/tenguMask_off_32x32.png";
import tenguMask_threeDim_512x512 from "../../../public/2DAssets/masks/tenguMask/tenguMask_threeDim_512x512.png";
import tenguMask_threeDim_32x32 from "../../../public/2DAssets/masks/tenguMask/tenguMask_threeDim_32x32.png";
import threeFaceMask_512x512 from "../../../public/2DAssets/masks/threeFaceMask/threeFaceMask_512x512.png";
import threeFaceMask_32x32 from "../../../public/2DAssets/masks/threeFaceMask/threeFaceMask_32x32.png";
import threeFaceMask_off_512x512 from "../../../public/2DAssets/masks/threeFaceMask/threeFaceMask_off_512x512.png";
import threeFaceMask_off_32x32 from "../../../public/2DAssets/masks/threeFaceMask/threeFaceMask_off_32x32.png";
import threeFaceMask_threeDim_512x512 from "../../../public/2DAssets/masks/threeFaceMask/threeFaceMask_threeDim_512x512.png";
import threeFaceMask_threeDim_32x32 from "../../../public/2DAssets/masks/threeFaceMask/threeFaceMask_threeDim_32x32.png";
import weldingMask_512x512 from "../../../public/2DAssets/masks/weldingMask/weldingMask_512x512.png";
import weldingMask_32x32 from "../../../public/2DAssets/masks/weldingMask/weldingMask_32x32.png";
import weldingMask_off_512x512 from "../../../public/2DAssets/masks/weldingMask/weldingMask_off_512x512.png";
import weldingMask_off_32x32 from "../../../public/2DAssets/masks/weldingMask/weldingMask_off_32x32.png";
import weldingMask_threeDim_512x512 from "../../../public/2DAssets/masks/weldingMask/weldingMask_threeDim_512x512.png";
import weldingMask_threeDim_32x32 from "../../../public/2DAssets/masks/weldingMask/weldingMask_threeDim_32x32.png";
import woodlandMask_512x512 from "../../../public/2DAssets/masks/woodlandMask/woodlandMask_512x512.png";
import woodlandMask_32x32 from "../../../public/2DAssets/masks/woodlandMask/woodlandMask_32x32.png";
import woodlandMask_off_512x512 from "../../../public/2DAssets/masks/woodlandMask/woodlandMask_off_512x512.png";
import woodlandMask_off_32x32 from "../../../public/2DAssets/masks/woodlandMask/woodlandMask_off_32x32.png";
import woodlandMask_threeDim_512x512 from "../../../public/2DAssets/masks/woodlandMask/woodlandMask_threeDim_512x512.png";
import woodlandMask_threeDim_32x32 from "../../../public/2DAssets/masks/woodlandMask/woodlandMask_threeDim_32x32.png";
import woodPaintedMask_512x512 from "../../../public/2DAssets/masks/woodPaintedMask/woodPaintedMask_512x512.png";
import woodPaintedMask_32x32 from "../../../public/2DAssets/masks/woodPaintedMask/woodPaintedMask_32x32.png";
import woodPaintedMask_off_512x512 from "../../../public/2DAssets/masks/woodPaintedMask/woodPaintedMask_off_512x512.png";
import woodPaintedMask_off_32x32 from "../../../public/2DAssets/masks/woodPaintedMask/woodPaintedMask_off_32x32.png";
import woodPaintedMask_threeDim_512x512 from "../../../public/2DAssets/masks/woodPaintedMask/woodPaintedMask_threeDim_512x512.png";
import woodPaintedMask_threeDim_32x32 from "../../../public/2DAssets/masks/woodPaintedMask/woodPaintedMask_threeDim_32x32.png";
import zombieMask_512x512 from "../../../public/2DAssets/masks/zombieMask/zombieMask_512x512.png";
import zombieMask_32x32 from "../../../public/2DAssets/masks/zombieMask/zombieMask_32x32.png";
import zombieMask_off_512x512 from "../../../public/2DAssets/masks/zombieMask/zombieMask_off_512x512.png";
import zombieMask_off_32x32 from "../../../public/2DAssets/masks/zombieMask/zombieMask_off_32x32.png";
import zombieMask_threeDim_512x512 from "../../../public/2DAssets/masks/zombieMask/zombieMask_threeDim_512x512.png";
import zombieMask_threeDim_32x32 from "../../../public/2DAssets/masks/zombieMask/zombieMask_threeDim_32x32.png";

export default function MasksButton({
  username,
  instance,
  type,
  videoId,
  isUser,
  handleVisualEffectChange,
  effectsDisabled,
  setEffectsDisabled,
}: {
  username: string;
  instance: string;
  type: "camera";
  videoId: string;
  isUser: boolean;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { currentEffectsStyles, remoteCurrentEffectsStyles } =
    useCurrentEffectsStylesContext();
  const { userStreamEffects, remoteStreamEffects } = useStreamsContext();

  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const [rerender, setRerender] = useState(false);

  const streamEffects = isUser
    ? userStreamEffects.current[type][videoId].masks
    : remoteStreamEffects.current[username][instance][type][videoId].masks;
  const effectsStyles = isUser
    ? currentEffectsStyles.current[type][videoId].masks
    : remoteCurrentEffectsStyles.current[username][instance][type][videoId]
        .masks;

  const masksEffects: {
    [key in MasksEffectTypes]: {
      image: string;
      imageSmall: string;
      icon?: string;
      iconOff?: string;
      imageOff?: string;
      imageOffSmall?: string;
      iconThreeDim?: string;
      imageThreeDim?: string;
      imageThreeDimSmall?: string;
      iconThreeDimOff?: string;
      imageThreeDimOff?: string;
      imageThreeDimOffSmall?: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  } = {
    baseMask: {
      image: baseMask_512x512,
      imageSmall: baseMask_32x32,
      icon: baseMaskIcon,
      iconOff: baseMaskOffIcon,
      iconThreeDim: threeDim_baseMaskIcon,
      iconThreeDimOff: threeDim_baseMaskOffIcon,
      flipped: false,
      bgColor: "white",
    },
    alienMask: {
      image: alienMask_512x512,
      imageSmall: alienMask_32x32,
      imageOff: alienMask_off_512x512,
      imageOffSmall: alienMask_off_32x32,
      imageThreeDim: alienMask_threeDim_512x512,
      imageThreeDimSmall: alienMask_threeDim_32x32,
      imageThreeDimOff: alienMask_512x512,
      imageThreeDimOffSmall: alienMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    clownMask: {
      image: clownMask_512x512,
      imageSmall: clownMask_32x32,
      imageOff: clownMask_off_512x512,
      imageOffSmall: clownMask_off_32x32,
      imageThreeDim: clownMask_threeDim_512x512,
      imageThreeDimSmall: clownMask_threeDim_32x32,
      imageThreeDimOff: clownMask_512x512,
      imageThreeDimOffSmall: clownMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    creatureMask: {
      image: creatureMask_512x512,
      imageSmall: creatureMask_32x32,
      imageOff: creatureMask_off_512x512,
      imageOffSmall: creatureMask_off_32x32,
      imageThreeDim: creatureMask_threeDim_512x512,
      imageThreeDimSmall: creatureMask_threeDim_32x32,
      imageThreeDimOff: creatureMask_512x512,
      imageThreeDimOffSmall: creatureMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    cyberMask: {
      image: cyberMask_512x512,
      imageSmall: cyberMask_32x32,
      imageOff: cyberMask_off_512x512,
      imageOffSmall: cyberMask_off_32x32,
      imageThreeDim: cyberMask_threeDim_512x512,
      imageThreeDimSmall: cyberMask_threeDim_32x32,
      imageThreeDimOff: cyberMask_512x512,
      imageThreeDimOffSmall: cyberMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    darkKnightMask: {
      image: darkKnightMask_512x512,
      imageSmall: darkKnightMask_32x32,
      imageOff: darkKnightMask_off_512x512,
      imageOffSmall: darkKnightMask_off_32x32,
      imageThreeDim: darkKnightMask_threeDim_512x512,
      imageThreeDimSmall: darkKnightMask_threeDim_32x32,
      imageThreeDimOff: darkKnightMask_512x512,
      imageThreeDimOffSmall: darkKnightMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    demonMask: {
      image: demonMask_512x512,
      imageSmall: demonMask_32x32,
      imageOff: demonMask_off_512x512,
      imageOffSmall: demonMask_off_32x32,
      imageThreeDim: demonMask_threeDim_512x512,
      imageThreeDimSmall: demonMask_threeDim_32x32,
      imageThreeDimOff: demonMask_512x512,
      imageThreeDimOffSmall: demonMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    gasMask1: {
      image: gasMask1_512x512,
      imageSmall: gasMask1_32x32,
      imageOff: gasMask1_off_512x512,
      imageOffSmall: gasMask1_off_32x32,
      imageThreeDim: gasMask1_threeDim_512x512,
      imageThreeDimSmall: gasMask1_threeDim_32x32,
      imageThreeDimOff: gasMask1_512x512,
      imageThreeDimOffSmall: gasMask1_32x32,
      flipped: false,
      bgColor: "white",
    },
    gasMask2: {
      image: gasMask2_512x512,
      imageSmall: gasMask2_32x32,
      imageOff: gasMask2_off_512x512,
      imageOffSmall: gasMask2_off_32x32,
      imageThreeDim: gasMask2_threeDim_512x512,
      imageThreeDimSmall: gasMask2_threeDim_32x32,
      imageThreeDimOff: gasMask2_512x512,
      imageThreeDimOffSmall: gasMask2_32x32,
      flipped: false,
      bgColor: "white",
    },
    gasMask3: {
      image: gasMask3_512x512,
      imageSmall: gasMask3_32x32,
      imageOff: gasMask3_off_512x512,
      imageOffSmall: gasMask3_off_32x32,
      imageThreeDim: gasMask3_threeDim_512x512,
      imageThreeDimSmall: gasMask3_threeDim_32x32,
      imageThreeDimOff: gasMask3_512x512,
      imageThreeDimOffSmall: gasMask3_32x32,
      flipped: false,
      bgColor: "white",
    },
    gasMask4: {
      image: gasMask4_512x512,
      imageSmall: gasMask4_32x32,
      imageOff: gasMask4_off_512x512,
      imageOffSmall: gasMask4_off_32x32,
      imageThreeDim: gasMask4_threeDim_512x512,
      imageThreeDimSmall: gasMask4_threeDim_32x32,
      imageThreeDimOff: gasMask4_512x512,
      imageThreeDimOffSmall: gasMask4_32x32,
      flipped: false,
      bgColor: "white",
    },
    masqueradeMask: {
      image: masqueradeMask_512x512,
      imageSmall: masqueradeMask_32x32,
      imageOff: masqueradeMask_off_512x512,
      imageOffSmall: masqueradeMask_off_32x32,
      imageThreeDim: masqueradeMask_threeDim_512x512,
      imageThreeDimSmall: masqueradeMask_threeDim_32x32,
      imageThreeDimOff: masqueradeMask_512x512,
      imageThreeDimOffSmall: masqueradeMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    metalManMask: {
      image: metalManMask_512x512,
      imageSmall: metalManMask_32x32,
      imageOff: metalManMask_off_512x512,
      imageOffSmall: metalManMask_off_32x32,
      imageThreeDim: metalManMask_threeDim_512x512,
      imageThreeDimSmall: metalManMask_threeDim_32x32,
      imageThreeDimOff: metalManMask_512x512,
      imageThreeDimOffSmall: metalManMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    oniMask: {
      image: oniMask_512x512,
      imageSmall: oniMask_32x32,
      imageOff: oniMask_off_512x512,
      imageOffSmall: oniMask_off_32x32,
      imageThreeDim: oniMask_threeDim_512x512,
      imageThreeDimSmall: oniMask_threeDim_32x32,
      imageThreeDimOff: oniMask_512x512,
      imageThreeDimOffSmall: oniMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    plagueDoctorMask: {
      image: plagueDoctorMask_512x512,
      imageSmall: plagueDoctorMask_32x32,
      imageOff: plagueDoctorMask_off_512x512,
      imageOffSmall: plagueDoctorMask_off_32x32,
      imageThreeDim: plagueDoctorMask_threeDim_512x512,
      imageThreeDimSmall: plagueDoctorMask_threeDim_32x32,
      imageThreeDimOff: plagueDoctorMask_512x512,
      imageThreeDimOffSmall: plagueDoctorMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    sixEyesMask: {
      image: sixEyesMask_512x512,
      imageSmall: sixEyesMask_32x32,
      imageOff: sixEyesMask_off_512x512,
      imageOffSmall: sixEyesMask_off_32x32,
      imageThreeDim: sixEyesMask_threeDim_512x512,
      imageThreeDimSmall: sixEyesMask_threeDim_32x32,
      imageThreeDimOff: sixEyesMask_512x512,
      imageThreeDimOffSmall: sixEyesMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    tenguMask: {
      image: tenguMask_512x512,
      imageSmall: tenguMask_32x32,
      imageOff: tenguMask_off_512x512,
      imageOffSmall: tenguMask_off_32x32,
      imageThreeDim: tenguMask_threeDim_512x512,
      imageThreeDimSmall: tenguMask_threeDim_32x32,
      imageThreeDimOff: tenguMask_512x512,
      imageThreeDimOffSmall: tenguMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    threeFaceMask: {
      image: threeFaceMask_512x512,
      imageSmall: threeFaceMask_32x32,
      imageOff: threeFaceMask_off_512x512,
      imageOffSmall: threeFaceMask_off_32x32,
      imageThreeDim: threeFaceMask_threeDim_512x512,
      imageThreeDimSmall: threeFaceMask_threeDim_32x32,
      imageThreeDimOff: threeFaceMask_512x512,
      imageThreeDimOffSmall: threeFaceMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    weldingMask: {
      image: weldingMask_512x512,
      imageSmall: weldingMask_32x32,
      imageOff: weldingMask_off_512x512,
      imageOffSmall: weldingMask_off_32x32,
      imageThreeDim: weldingMask_threeDim_512x512,
      imageThreeDimSmall: weldingMask_threeDim_32x32,
      imageThreeDimOff: weldingMask_512x512,
      imageThreeDimOffSmall: weldingMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    woodlandMask: {
      image: woodlandMask_512x512,
      imageSmall: woodlandMask_32x32,
      imageOff: woodlandMask_off_512x512,
      imageOffSmall: woodlandMask_off_32x32,
      imageThreeDim: woodlandMask_threeDim_512x512,
      imageThreeDimSmall: woodlandMask_threeDim_32x32,
      imageThreeDimOff: woodlandMask_512x512,
      imageThreeDimOffSmall: woodlandMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    woodPaintedMask: {
      image: woodPaintedMask_512x512,
      imageSmall: woodPaintedMask_32x32,
      imageOff: woodPaintedMask_off_512x512,
      imageOffSmall: woodPaintedMask_off_32x32,
      imageThreeDim: woodPaintedMask_threeDim_512x512,
      imageThreeDimSmall: woodPaintedMask_threeDim_32x32,
      imageThreeDimOff: woodPaintedMask_512x512,
      imageThreeDimOffSmall: woodPaintedMask_32x32,
      flipped: false,
      bgColor: "white",
    },
    zombieMask: {
      image: zombieMask_512x512,
      imageSmall: zombieMask_32x32,
      imageOff: zombieMask_off_512x512,
      imageOffSmall: zombieMask_off_32x32,
      imageThreeDim: zombieMask_threeDim_512x512,
      imageThreeDimSmall: zombieMask_threeDim_32x32,
      imageThreeDimOff: zombieMask_512x512,
      imageThreeDimOffSmall: zombieMask_32x32,
      flipped: false,
      bgColor: "white",
    },
  };

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => !prev);

    await handleVisualEffectChange("masks");

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: React.MouseEvent<Element, MouseEvent>) => {
    const target = event.target as HTMLElement;
    if (!effectsStyles || !target || !target.dataset.visualEffectsButtonValue) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .visualEffectsButtonValue as MasksEffectTypes;
    if (
      effectType in masksEffects &&
      (effectsStyles.style !== effectType || !streamEffects)
    ) {
      if (isUser) {
        if (currentEffectsStyles.current[type][videoId].masks) {
          currentEffectsStyles.current[type][videoId].masks.style = effectType;
          currentEffectsStyles.current[type][videoId].masks.transforms =
            assetSizePositionMap.masks[effectType];
        }
      } else {
        if (
          remoteCurrentEffectsStyles.current[username][instance][type][videoId]
            .masks
        ) {
          remoteCurrentEffectsStyles.current[username][instance][type][
            videoId
          ].masks.style = effectType;
          remoteCurrentEffectsStyles.current[username][instance][type][
            videoId
          ].masks.transforms = assetSizePositionMap.masks[effectType];
        }
      }

      await handleVisualEffectChange(
        "masks",
        isUser
          ? userStreamEffects.current[type][videoId].masks
          : remoteStreamEffects.current[username][instance][type][videoId].masks
      );
    }

    setEffectsDisabled(false);
    setCloseHoldToggle(true);
  };

  const doubleClickFunction = async () => {
    if (!effectsStyles) {
      return;
    }

    setEffectsDisabled(true);

    effectsStyles.threeDim = !effectsStyles.threeDim;

    setRerender((prev) => !prev);

    await handleVisualEffectChange("masks", streamEffects);

    setEffectsDisabled(false);
  };

  return (
    <FgButton
      clickFunction={clickFunction}
      holdFunction={holdFunction}
      contentFunction={() => {
        if (!effectsStyles) {
          return;
        }

        if (masksEffects[effectsStyles.style].icon) {
          const iconSrc =
            masksEffects[effectsStyles.style][
              effectsStyles.threeDim
                ? streamEffects
                  ? "iconThreeDimOff"
                  : "iconThreeDim"
                : streamEffects
                ? "iconOff"
                : "icon"
            ];

          if (iconSrc) {
            return (
              <FgSVG
                src={iconSrc}
                attributes={[
                  { key: "width", value: "95%" },
                  { key: "height", value: "95%" },
                ]}
                data-visual-effects-button-value={effectsStyles.style}
              />
            );
          }
        } else {
          const imageSrc =
            masksEffects[effectsStyles.style][
              effectsStyles.threeDim
                ? streamEffects
                  ? "imageThreeDimOff"
                  : "imageThreeDim"
                : streamEffects
                ? "imageOff"
                : "image"
            ];

          const imageLoadingSrc =
            masksEffects[effectsStyles.style][
              effectsStyles.threeDim
                ? streamEffects
                  ? "imageThreeDimOffSmall"
                  : "imageThreeDimSmall"
                : streamEffects
                ? "imageOffSmall"
                : "imageSmall"
            ];

          if (imageSrc) {
            return (
              <FgImage
                src={imageSrc}
                srcLoading={imageLoadingSrc}
                alt={effectsStyles.style}
                style={{ width: "90%", height: "90%" }}
                data-visual-effects-button-value={effectsStyles.style}
              />
            );
          }
        }
      }}
      doubleClickFunction={doubleClickFunction}
      holdContent={
        <div className='overflow-y-auto smallScrollbar max-h-48 mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'>
          {Object.entries(masksEffects).map(([masks, effect]) => (
            <div
              key={masks}
              className={`${
                masks === effectsStyles.style
                  ? "border-fg-secondary border-3 border-opacity-100"
                  : ""
              } ${effect.flipped && "scale-x-[-1]"} ${
                effect.bgColor === "white" && "bg-white border-fg-black-35"
              } ${
                effect.bgColor === "black" && "border-white"
              } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
              onClick={holdFunction}
              data-visual-effects-button-value={masks}
            >
              <FgImage
                src={effect.image}
                srcLoading={effect.imageSmall}
                alt={masks}
                style={{ width: "2.75rem", height: "2.75rem" }}
                data-visual-effects-button-value={masks}
              />
            </div>
          ))}
        </div>
      }
      hoverContent={
        <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
          Masks
        </div>
      }
      closeHoldToggle={closeHoldToggle}
      setCloseHoldToggle={setCloseHoldToggle}
      className='flex items-center justify-center min-w-10 w-10 aspect-square'
      options={{
        defaultDataValue: effectsStyles?.style,
        hoverTimeoutDuration: 750,
        disabled: effectsDisabled,
        holdKind: "toggle",
      }}
    />
  );
}
