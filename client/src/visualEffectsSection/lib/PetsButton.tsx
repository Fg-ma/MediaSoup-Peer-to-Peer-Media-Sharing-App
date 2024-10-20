import React, { useRef, useState } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import FgImage from "../../fgImage/FgImage";
import {
  assetSizePositionMap,
  PetsEffectTypes,
  useCurrentEffectsStylesContext,
} from "../../context/CurrentEffectsStylesContext";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";

import angryHamster_512x512 from "../../../public/2DAssets/pets/angryHamster/angryHamster_512x512.png";
import angryHamster_32x32 from "../../../public/2DAssets/pets/angryHamster/angryHamster_32x32.png";
import angryHamster_off_512x512 from "../../../public/2DAssets/pets/angryHamster/angryHamster_off_512x512.png";
import angryHamster_off_32x32 from "../../../public/2DAssets/pets/angryHamster/angryHamster_off_32x32.png";
import angryHamster_threeDim_512x512 from "../../../public/2DAssets/pets/angryHamster/angryHamster_threeDim_512x512.png";
import angryHamster_threeDim_32x32 from "../../../public/2DAssets/pets/angryHamster/angryHamster_threeDim_32x32.png";
import axolotl_512x512 from "../../../public/2DAssets/pets/axolotl/axolotl_512x512.png";
import axolotl_32x32 from "../../../public/2DAssets/pets/axolotl/axolotl_32x32.png";
import axolotl_off_512x512 from "../../../public/2DAssets/pets/axolotl/axolotl_off_512x512.png";
import axolotl_off_32x32 from "../../../public/2DAssets/pets/axolotl/axolotl_off_32x32.png";
import axolotl_threeDim_512x512 from "../../../public/2DAssets/pets/axolotl/axolotl_threeDim_512x512.png";
import axolotl_threeDim_32x32 from "../../../public/2DAssets/pets/axolotl/axolotl_threeDim_32x32.png";
import babyDragon_512x512 from "../../../public/2DAssets/pets/babyDragon/babyDragon_512x512.png";
import babyDragon_32x32 from "../../../public/2DAssets/pets/babyDragon/babyDragon_32x32.png";
import babyDragon_off_512x512 from "../../../public/2DAssets/pets/babyDragon/babyDragon_off_512x512.png";
import babyDragon_off_32x32 from "../../../public/2DAssets/pets/babyDragon/babyDragon_off_32x32.png";
import babyDragon_threeDim_512x512 from "../../../public/2DAssets/pets/babyDragon/babyDragon_threeDim_512x512.png";
import babyDragon_threeDim_32x32 from "../../../public/2DAssets/pets/babyDragon/babyDragon_threeDim_32x32.png";
import beardedDragon_512x512 from "../../../public/2DAssets/pets/beardedDragon/beardedDragon_512x512.png";
import beardedDragon_32x32 from "../../../public/2DAssets/pets/beardedDragon/beardedDragon_32x32.png";
import beardedDragon_off_512x512 from "../../../public/2DAssets/pets/beardedDragon/beardedDragon_off_512x512.png";
import beardedDragon_off_32x32 from "../../../public/2DAssets/pets/beardedDragon/beardedDragon_off_32x32.png";
import beardedDragon_threeDim_512x512 from "../../../public/2DAssets/pets/beardedDragon/beardedDragon_threeDim_512x512.png";
import beardedDragon_threeDim_32x32 from "../../../public/2DAssets/pets/beardedDragon/beardedDragon_threeDim_32x32.png";
import bird1_512x512 from "../../../public/2DAssets/pets/bird1/bird1_512x512.png";
import bird1_32x32 from "../../../public/2DAssets/pets/bird1/bird1_32x32.png";
import bird1_off_512x512 from "../../../public/2DAssets/pets/bird1/bird1_off_512x512.png";
import bird1_off_32x32 from "../../../public/2DAssets/pets/bird1/bird1_off_32x32.png";
import bird1_threeDim_512x512 from "../../../public/2DAssets/pets/bird1/bird1_threeDim_512x512.png";
import bird1_threeDim_32x32 from "../../../public/2DAssets/pets/bird1/bird1_threeDim_32x32.png";
import bird2_512x512 from "../../../public/2DAssets/pets/bird2/bird2_512x512.png";
import bird2_32x32 from "../../../public/2DAssets/pets/bird2/bird2_32x32.png";
import bird2_off_512x512 from "../../../public/2DAssets/pets/bird2/bird2_off_512x512.png";
import bird2_off_32x32 from "../../../public/2DAssets/pets/bird2/bird2_off_32x32.png";
import bird2_threeDim_512x512 from "../../../public/2DAssets/pets/bird2/bird2_threeDim_512x512.png";
import bird2_threeDim_32x32 from "../../../public/2DAssets/pets/bird2/bird2_threeDim_32x32.png";
import boxer_512x512 from "../../../public/2DAssets/pets/boxer/boxer_512x512.png";
import boxer_32x32 from "../../../public/2DAssets/pets/boxer/boxer_32x32.png";
import boxer_off_512x512 from "../../../public/2DAssets/pets/boxer/boxer_off_512x512.png";
import boxer_off_32x32 from "../../../public/2DAssets/pets/boxer/boxer_off_32x32.png";
import boxer_threeDim_512x512 from "../../../public/2DAssets/pets/boxer/boxer_threeDim_512x512.png";
import boxer_threeDim_32x32 from "../../../public/2DAssets/pets/boxer/boxer_threeDim_32x32.png";
import brain_512x512 from "../../../public/2DAssets/pets/brain/brain_512x512.png";
import brain_32x32 from "../../../public/2DAssets/pets/brain/brain_32x32.png";
import brain_off_512x512 from "../../../public/2DAssets/pets/brain/brain_off_512x512.png";
import brain_off_32x32 from "../../../public/2DAssets/pets/brain/brain_off_32x32.png";
import brain_threeDim_512x512 from "../../../public/2DAssets/pets/brain/brain_threeDim_512x512.png";
import brain_threeDim_32x32 from "../../../public/2DAssets/pets/brain/brain_threeDim_32x32.png";
import buddyHamster_512x512 from "../../../public/2DAssets/pets/buddyHamster/buddyHamster_512x512.png";
import buddyHamster_32x32 from "../../../public/2DAssets/pets/buddyHamster/buddyHamster_32x32.png";
import buddyHamster_off_512x512 from "../../../public/2DAssets/pets/buddyHamster/buddyHamster_off_512x512.png";
import buddyHamster_off_32x32 from "../../../public/2DAssets/pets/buddyHamster/buddyHamster_off_32x32.png";
import buddyHamster_threeDim_512x512 from "../../../public/2DAssets/pets/buddyHamster/buddyHamster_threeDim_512x512.png";
import buddyHamster_threeDim_32x32 from "../../../public/2DAssets/pets/buddyHamster/buddyHamster_threeDim_32x32.png";
import cat1_512x512 from "../../../public/2DAssets/pets/cat1/cat1_512x512.png";
import cat1_32x32 from "../../../public/2DAssets/pets/cat1/cat1_32x32.png";
import cat1_off_512x512 from "../../../public/2DAssets/pets/cat1/cat1_off_512x512.png";
import cat1_off_32x32 from "../../../public/2DAssets/pets/cat1/cat1_off_32x32.png";
import cat1_threeDim_512x512 from "../../../public/2DAssets/pets/cat1/cat1_threeDim_512x512.png";
import cat1_threeDim_32x32 from "../../../public/2DAssets/pets/cat1/cat1_threeDim_32x32.png";
import cat2_512x512 from "../../../public/2DAssets/pets/cat2/cat2_512x512.png";
import cat2_32x32 from "../../../public/2DAssets/pets/cat2/cat2_32x32.png";
import cat2_off_512x512 from "../../../public/2DAssets/pets/cat2/cat2_off_512x512.png";
import cat2_off_32x32 from "../../../public/2DAssets/pets/cat2/cat2_off_32x32.png";
import cat2_threeDim_512x512 from "../../../public/2DAssets/pets/cat2/cat2_threeDim_512x512.png";
import cat2_threeDim_32x32 from "../../../public/2DAssets/pets/cat2/cat2_threeDim_32x32.png";
import dodoBird_512x512 from "../../../public/2DAssets/pets/dodoBird/dodoBird_512x512.png";
import dodoBird_32x32 from "../../../public/2DAssets/pets/dodoBird/dodoBird_32x32.png";
import dodoBird_off_512x512 from "../../../public/2DAssets/pets/dodoBird/dodoBird_off_512x512.png";
import dodoBird_off_32x32 from "../../../public/2DAssets/pets/dodoBird/dodoBird_off_32x32.png";
import dodoBird_threeDim_512x512 from "../../../public/2DAssets/pets/dodoBird/dodoBird_threeDim_512x512.png";
import dodoBird_threeDim_32x32 from "../../../public/2DAssets/pets/dodoBird/dodoBird_threeDim_32x32.png";
import happyHamster_512x512 from "../../../public/2DAssets/pets/happyHamster/happyHamster_512x512.png";
import happyHamster_32x32 from "../../../public/2DAssets/pets/happyHamster/happyHamster_32x32.png";
import happyHamster_off_512x512 from "../../../public/2DAssets/pets/happyHamster/happyHamster_off_512x512.png";
import happyHamster_off_32x32 from "../../../public/2DAssets/pets/happyHamster/happyHamster_off_32x32.png";
import happyHamster_threeDim_512x512 from "../../../public/2DAssets/pets/happyHamster/happyHamster_threeDim_512x512.png";
import happyHamster_threeDim_32x32 from "../../../public/2DAssets/pets/happyHamster/happyHamster_threeDim_32x32.png";
import mechanicalGrasshopper_512x512 from "../../../public/2DAssets/pets/mechanicalGrasshopper/mechanicalGrasshopper_512x512.png";
import mechanicalGrasshopper_32x32 from "../../../public/2DAssets/pets/mechanicalGrasshopper/mechanicalGrasshopper_32x32.png";
import mechanicalGrasshopper_off_512x512 from "../../../public/2DAssets/pets/mechanicalGrasshopper/mechanicalGrasshopper_off_512x512.png";
import mechanicalGrasshopper_off_32x32 from "../../../public/2DAssets/pets/mechanicalGrasshopper/mechanicalGrasshopper_off_32x32.png";
import mechanicalGrasshopper_threeDim_512x512 from "../../../public/2DAssets/pets/mechanicalGrasshopper/mechanicalGrasshopper_threeDim_512x512.png";
import mechanicalGrasshopper_threeDim_32x32 from "../../../public/2DAssets/pets/mechanicalGrasshopper/mechanicalGrasshopper_threeDim_32x32.png";
import panda1_512x512 from "../../../public/2DAssets/pets/panda1/panda1_512x512.png";
import panda1_32x32 from "../../../public/2DAssets/pets/panda1/panda1_32x32.png";
import panda1_off_512x512 from "../../../public/2DAssets/pets/panda1/panda1_off_512x512.png";
import panda1_off_32x32 from "../../../public/2DAssets/pets/panda1/panda1_off_32x32.png";
import panda1_threeDim_512x512 from "../../../public/2DAssets/pets/panda1/panda1_threeDim_512x512.png";
import panda1_threeDim_32x32 from "../../../public/2DAssets/pets/panda1/panda1_threeDim_32x32.png";
import panda2_512x512 from "../../../public/2DAssets/pets/panda2/panda2_512x512.png";
import panda2_32x32 from "../../../public/2DAssets/pets/panda2/panda2_32x32.png";
import panda2_off_512x512 from "../../../public/2DAssets/pets/panda2/panda2_off_512x512.png";
import panda2_off_32x32 from "../../../public/2DAssets/pets/panda2/panda2_off_32x32.png";
import panda2_threeDim_512x512 from "../../../public/2DAssets/pets/panda2/panda2_threeDim_512x512.png";
import panda2_threeDim_32x32 from "../../../public/2DAssets/pets/panda2/panda2_threeDim_32x32.png";
import petRock_512x512 from "../../../public/2DAssets/pets/petRock/petRock_512x512.png";
import petRock_32x32 from "../../../public/2DAssets/pets/petRock/petRock_32x32.png";
import petRock_off_512x512 from "../../../public/2DAssets/pets/petRock/petRock_off_512x512.png";
import petRock_off_32x32 from "../../../public/2DAssets/pets/petRock/petRock_off_32x32.png";
import petRock_threeDim_512x512 from "../../../public/2DAssets/pets/petRock/petRock_threeDim_512x512.png";
import petRock_threeDim_32x32 from "../../../public/2DAssets/pets/petRock/petRock_threeDim_32x32.png";
import pig_512x512 from "../../../public/2DAssets/pets/pig/pig_512x512.png";
import pig_32x32 from "../../../public/2DAssets/pets/pig/pig_32x32.png";
import pig_off_512x512 from "../../../public/2DAssets/pets/pig/pig_off_512x512.png";
import pig_off_32x32 from "../../../public/2DAssets/pets/pig/pig_off_32x32.png";
import pig_threeDim_512x512 from "../../../public/2DAssets/pets/pig/pig_threeDim_512x512.png";
import pig_threeDim_32x32 from "../../../public/2DAssets/pets/pig/pig_threeDim_32x32.png";
import redFox1_512x512 from "../../../public/2DAssets/pets/redFox1/redFox1_512x512.png";
import redFox1_32x32 from "../../../public/2DAssets/pets/redFox1/redFox1_32x32.png";
import redFox1_off_512x512 from "../../../public/2DAssets/pets/redFox1/redFox1_off_512x512.png";
import redFox1_off_32x32 from "../../../public/2DAssets/pets/redFox1/redFox1_off_32x32.png";
import redFox1_threeDim_512x512 from "../../../public/2DAssets/pets/redFox1/redFox1_threeDim_512x512.png";
import redFox1_threeDim_32x32 from "../../../public/2DAssets/pets/redFox1/redFox1_threeDim_32x32.png";
import redFox2_512x512 from "../../../public/2DAssets/pets/redFox2/redFox2_512x512.png";
import redFox2_32x32 from "../../../public/2DAssets/pets/redFox2/redFox2_32x32.png";
import redFox2_off_512x512 from "../../../public/2DAssets/pets/redFox2/redFox2_off_512x512.png";
import redFox2_off_32x32 from "../../../public/2DAssets/pets/redFox2/redFox2_off_32x32.png";
import redFox2_threeDim_512x512 from "../../../public/2DAssets/pets/redFox2/redFox2_threeDim_512x512.png";
import redFox2_threeDim_32x32 from "../../../public/2DAssets/pets/redFox2/redFox2_threeDim_32x32.png";
import roboDog_512x512 from "../../../public/2DAssets/pets/roboDog/roboDog_512x512.png";
import roboDog_32x32 from "../../../public/2DAssets/pets/roboDog/roboDog_32x32.png";
import roboDog_off_512x512 from "../../../public/2DAssets/pets/roboDog/roboDog_off_512x512.png";
import roboDog_off_32x32 from "../../../public/2DAssets/pets/roboDog/roboDog_off_32x32.png";
import roboDog_threeDim_512x512 from "../../../public/2DAssets/pets/roboDog/roboDog_threeDim_512x512.png";
import roboDog_threeDim_32x32 from "../../../public/2DAssets/pets/roboDog/roboDog_threeDim_32x32.png";
import skeletonTRex_512x512 from "../../../public/2DAssets/pets/skeletonTRex/skeletonTRex_512x512.png";
import skeletonTRex_32x32 from "../../../public/2DAssets/pets/skeletonTRex/skeletonTRex_32x32.png";
import skeletonTRex_off_512x512 from "../../../public/2DAssets/pets/skeletonTRex/skeletonTRex_off_512x512.png";
import skeletonTRex_off_32x32 from "../../../public/2DAssets/pets/skeletonTRex/skeletonTRex_off_32x32.png";
import skeletonTRex_threeDim_512x512 from "../../../public/2DAssets/pets/skeletonTRex/skeletonTRex_threeDim_512x512.png";
import skeletonTRex_threeDim_32x32 from "../../../public/2DAssets/pets/skeletonTRex/skeletonTRex_threeDim_32x32.png";
import snail_512x512 from "../../../public/2DAssets/pets/snail/snail_512x512.png";
import snail_32x32 from "../../../public/2DAssets/pets/snail/snail_32x32.png";
import snail_off_512x512 from "../../../public/2DAssets/pets/snail/snail_off_512x512.png";
import snail_off_32x32 from "../../../public/2DAssets/pets/snail/snail_off_32x32.png";
import snail_threeDim_512x512 from "../../../public/2DAssets/pets/snail/snail_threeDim_512x512.png";
import snail_threeDim_32x32 from "../../../public/2DAssets/pets/snail/snail_threeDim_32x32.png";
import spinosaurus_512x512 from "../../../public/2DAssets/pets/spinosaurus/spinosaurus_512x512.png";
import spinosaurus_32x32 from "../../../public/2DAssets/pets/spinosaurus/spinosaurus_32x32.png";
import spinosaurus_off_512x512 from "../../../public/2DAssets/pets/spinosaurus/spinosaurus_off_512x512.png";
import spinosaurus_off_32x32 from "../../../public/2DAssets/pets/spinosaurus/spinosaurus_off_32x32.png";
import spinosaurus_threeDim_512x512 from "../../../public/2DAssets/pets/spinosaurus/spinosaurus_threeDim_512x512.png";
import spinosaurus_threeDim_32x32 from "../../../public/2DAssets/pets/spinosaurus/spinosaurus_threeDim_32x32.png";
import TRex_512x512 from "../../../public/2DAssets/pets/TRex/TRex_512x512.png";
import TRex_32x32 from "../../../public/2DAssets/pets/TRex/TRex_32x32.png";
import TRex_off_512x512 from "../../../public/2DAssets/pets/TRex/TRex_off_512x512.png";
import TRex_off_32x32 from "../../../public/2DAssets/pets/TRex/TRex_off_32x32.png";
import TRex_threeDim_512x512 from "../../../public/2DAssets/pets/TRex/TRex_threeDim_512x512.png";
import TRex_threeDim_32x32 from "../../../public/2DAssets/pets/TRex/TRex_threeDim_32x32.png";

const petsLabels: {
  [petsEffectType in PetsEffectTypes]: string;
} = {
  angryHamster: "Angry hamster",
  axolotl: "Axolotl",
  babyDragon: "Baby dragon",
  beardedDragon: "Bearded dragon",
  bird1: "Bird 1",
  bird2: "Bird 2",
  boxer: "Boxer",
  brain: "Brain",
  buddyHamster: "Buddy hamster",
  cat1: "Cat 1",
  cat2: "Cat 2",
  dodoBird: "Dodo bird",
  happyHamster: "Happy hamster",
  mechanicalGrasshopper: "Mechanical grasshopper",
  panda1: "Panda 1",
  panda2: "Panda 2",
  petRock: "Pet rock",
  pig: "Pig",
  redFox1: "Red fox 1",
  redFox2: "Red fox 2",
  roboDog: "Robo dog",
  skeletonTRex: "Skeleton T-Rex",
  snail: "Snail",
  spinosaurus: "Spinosaurus",
  TRex: "T-Rex",
};

export default function PetsButton({
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
  const petsContainerRef = useRef<HTMLDivElement>(null);

  const streamEffects = isUser
    ? userStreamEffects.current[type][videoId].pets
    : remoteStreamEffects.current[username][instance][type][videoId].pets;
  const effectsStyles = isUser
    ? currentEffectsStyles.current[type][videoId].pets
    : remoteCurrentEffectsStyles.current[username][instance][type][videoId]
        .pets;

  const petsEffects: {
    [key in PetsEffectTypes]: {
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
    angryHamster: {
      image: angryHamster_512x512,
      imageSmall: angryHamster_32x32,
      imageOff: angryHamster_off_512x512,
      imageOffSmall: angryHamster_off_32x32,
      imageThreeDim: angryHamster_threeDim_512x512,
      imageThreeDimSmall: angryHamster_threeDim_32x32,
      imageThreeDimOff: angryHamster_512x512,
      imageThreeDimOffSmall: angryHamster_32x32,
      flipped: false,
      bgColor: "white",
    },
    axolotl: {
      image: axolotl_512x512,
      imageSmall: axolotl_32x32,
      imageOff: axolotl_off_512x512,
      imageOffSmall: axolotl_off_32x32,
      imageThreeDim: axolotl_threeDim_512x512,
      imageThreeDimSmall: axolotl_threeDim_32x32,
      imageThreeDimOff: axolotl_512x512,
      imageThreeDimOffSmall: axolotl_32x32,
      flipped: false,
      bgColor: "white",
    },
    babyDragon: {
      image: babyDragon_512x512,
      imageSmall: babyDragon_32x32,
      imageOff: babyDragon_off_512x512,
      imageOffSmall: babyDragon_off_32x32,
      imageThreeDim: babyDragon_threeDim_512x512,
      imageThreeDimSmall: babyDragon_threeDim_32x32,
      imageThreeDimOff: babyDragon_512x512,
      imageThreeDimOffSmall: babyDragon_32x32,
      flipped: false,
      bgColor: "white",
    },
    beardedDragon: {
      image: beardedDragon_512x512,
      imageSmall: beardedDragon_32x32,
      imageOff: beardedDragon_off_512x512,
      imageOffSmall: beardedDragon_off_32x32,
      imageThreeDim: beardedDragon_threeDim_512x512,
      imageThreeDimSmall: beardedDragon_threeDim_32x32,
      imageThreeDimOff: beardedDragon_512x512,
      imageThreeDimOffSmall: beardedDragon_32x32,
      flipped: false,
      bgColor: "white",
    },
    bird1: {
      image: bird1_512x512,
      imageSmall: bird1_32x32,
      imageOff: bird1_off_512x512,
      imageOffSmall: bird1_off_32x32,
      imageThreeDim: bird1_threeDim_512x512,
      imageThreeDimSmall: bird1_threeDim_32x32,
      imageThreeDimOff: bird1_512x512,
      imageThreeDimOffSmall: bird1_32x32,
      flipped: false,
      bgColor: "white",
    },
    bird2: {
      image: bird2_512x512,
      imageSmall: bird2_32x32,
      imageOff: bird2_off_512x512,
      imageOffSmall: bird2_off_32x32,
      imageThreeDim: bird2_threeDim_512x512,
      imageThreeDimSmall: bird2_threeDim_32x32,
      imageThreeDimOff: bird2_512x512,
      imageThreeDimOffSmall: bird2_32x32,
      flipped: false,
      bgColor: "white",
    },
    boxer: {
      image: boxer_512x512,
      imageSmall: boxer_32x32,
      imageOff: boxer_off_512x512,
      imageOffSmall: boxer_off_32x32,
      imageThreeDim: boxer_threeDim_512x512,
      imageThreeDimSmall: boxer_threeDim_32x32,
      imageThreeDimOff: boxer_512x512,
      imageThreeDimOffSmall: boxer_32x32,
      flipped: false,
      bgColor: "white",
    },
    brain: {
      image: brain_512x512,
      imageSmall: brain_32x32,
      imageOff: brain_off_512x512,
      imageOffSmall: brain_off_32x32,
      imageThreeDim: brain_threeDim_512x512,
      imageThreeDimSmall: brain_threeDim_32x32,
      imageThreeDimOff: brain_512x512,
      imageThreeDimOffSmall: brain_32x32,
      flipped: false,
      bgColor: "white",
    },
    buddyHamster: {
      image: buddyHamster_512x512,
      imageSmall: buddyHamster_32x32,
      imageOff: buddyHamster_off_512x512,
      imageOffSmall: buddyHamster_off_32x32,
      imageThreeDim: buddyHamster_threeDim_512x512,
      imageThreeDimSmall: buddyHamster_threeDim_32x32,
      imageThreeDimOff: buddyHamster_512x512,
      imageThreeDimOffSmall: buddyHamster_32x32,
      flipped: false,
      bgColor: "white",
    },
    cat1: {
      image: cat1_512x512,
      imageSmall: cat1_32x32,
      imageOff: cat1_off_512x512,
      imageOffSmall: cat1_off_32x32,
      imageThreeDim: cat1_threeDim_512x512,
      imageThreeDimSmall: cat1_threeDim_32x32,
      imageThreeDimOff: cat1_512x512,
      imageThreeDimOffSmall: cat1_32x32,
      flipped: false,
      bgColor: "white",
    },
    cat2: {
      image: cat2_512x512,
      imageSmall: cat2_32x32,
      imageOff: cat2_off_512x512,
      imageOffSmall: cat2_off_32x32,
      imageThreeDim: cat2_threeDim_512x512,
      imageThreeDimSmall: cat2_threeDim_32x32,
      imageThreeDimOff: cat2_512x512,
      imageThreeDimOffSmall: cat2_32x32,
      flipped: false,
      bgColor: "white",
    },
    dodoBird: {
      image: dodoBird_512x512,
      imageSmall: dodoBird_32x32,
      imageOff: dodoBird_off_512x512,
      imageOffSmall: dodoBird_off_32x32,
      imageThreeDim: dodoBird_threeDim_512x512,
      imageThreeDimSmall: dodoBird_threeDim_32x32,
      imageThreeDimOff: dodoBird_512x512,
      imageThreeDimOffSmall: dodoBird_32x32,
      flipped: false,
      bgColor: "white",
    },
    happyHamster: {
      image: happyHamster_512x512,
      imageSmall: happyHamster_32x32,
      imageOff: happyHamster_off_512x512,
      imageOffSmall: happyHamster_off_32x32,
      imageThreeDim: happyHamster_threeDim_512x512,
      imageThreeDimSmall: happyHamster_threeDim_32x32,
      imageThreeDimOff: happyHamster_512x512,
      imageThreeDimOffSmall: happyHamster_32x32,
      flipped: false,
      bgColor: "white",
    },
    mechanicalGrasshopper: {
      image: mechanicalGrasshopper_512x512,
      imageSmall: mechanicalGrasshopper_32x32,
      imageOff: mechanicalGrasshopper_off_512x512,
      imageOffSmall: mechanicalGrasshopper_off_32x32,
      imageThreeDim: mechanicalGrasshopper_threeDim_512x512,
      imageThreeDimSmall: mechanicalGrasshopper_threeDim_32x32,
      imageThreeDimOff: mechanicalGrasshopper_512x512,
      imageThreeDimOffSmall: mechanicalGrasshopper_32x32,
      flipped: false,
      bgColor: "white",
    },
    panda1: {
      image: panda1_512x512,
      imageSmall: panda1_32x32,
      imageOff: panda1_off_512x512,
      imageOffSmall: panda1_off_32x32,
      imageThreeDim: panda1_threeDim_512x512,
      imageThreeDimSmall: panda1_threeDim_32x32,
      imageThreeDimOff: panda1_512x512,
      imageThreeDimOffSmall: panda1_32x32,
      flipped: false,
      bgColor: "white",
    },
    panda2: {
      image: panda2_512x512,
      imageSmall: panda2_32x32,
      imageOff: panda2_off_512x512,
      imageOffSmall: panda2_off_32x32,
      imageThreeDim: panda2_threeDim_512x512,
      imageThreeDimSmall: panda2_threeDim_32x32,
      imageThreeDimOff: panda2_512x512,
      imageThreeDimOffSmall: panda2_32x32,
      flipped: false,
      bgColor: "white",
    },
    petRock: {
      image: petRock_512x512,
      imageSmall: petRock_32x32,
      imageOff: petRock_off_512x512,
      imageOffSmall: petRock_off_32x32,
      imageThreeDim: petRock_threeDim_512x512,
      imageThreeDimSmall: petRock_threeDim_32x32,
      imageThreeDimOff: petRock_512x512,
      imageThreeDimOffSmall: petRock_32x32,
      flipped: false,
      bgColor: "white",
    },
    pig: {
      image: pig_512x512,
      imageSmall: pig_32x32,
      imageOff: pig_off_512x512,
      imageOffSmall: pig_off_32x32,
      imageThreeDim: pig_threeDim_512x512,
      imageThreeDimSmall: pig_threeDim_32x32,
      imageThreeDimOff: pig_512x512,
      imageThreeDimOffSmall: pig_32x32,
      flipped: false,
      bgColor: "white",
    },
    redFox1: {
      image: redFox1_512x512,
      imageSmall: redFox1_32x32,
      imageOff: redFox1_off_512x512,
      imageOffSmall: redFox1_off_32x32,
      imageThreeDim: redFox1_threeDim_512x512,
      imageThreeDimSmall: redFox1_threeDim_32x32,
      imageThreeDimOff: redFox1_512x512,
      imageThreeDimOffSmall: redFox1_32x32,
      flipped: false,
      bgColor: "white",
    },
    redFox2: {
      image: redFox2_512x512,
      imageSmall: redFox2_32x32,
      imageOff: redFox2_off_512x512,
      imageOffSmall: redFox2_off_32x32,
      imageThreeDim: redFox2_threeDim_512x512,
      imageThreeDimSmall: redFox2_threeDim_32x32,
      imageThreeDimOff: redFox2_512x512,
      imageThreeDimOffSmall: redFox2_32x32,
      flipped: false,
      bgColor: "white",
    },
    roboDog: {
      image: roboDog_512x512,
      imageSmall: roboDog_32x32,
      imageOff: roboDog_off_512x512,
      imageOffSmall: roboDog_off_32x32,
      imageThreeDim: roboDog_threeDim_512x512,
      imageThreeDimSmall: roboDog_threeDim_32x32,
      imageThreeDimOff: roboDog_512x512,
      imageThreeDimOffSmall: roboDog_32x32,
      flipped: false,
      bgColor: "white",
    },
    skeletonTRex: {
      image: skeletonTRex_512x512,
      imageSmall: skeletonTRex_32x32,
      imageOff: skeletonTRex_off_512x512,
      imageOffSmall: skeletonTRex_off_32x32,
      imageThreeDim: skeletonTRex_threeDim_512x512,
      imageThreeDimSmall: skeletonTRex_threeDim_32x32,
      imageThreeDimOff: skeletonTRex_512x512,
      imageThreeDimOffSmall: skeletonTRex_32x32,
      flipped: false,
      bgColor: "white",
    },
    snail: {
      image: snail_512x512,
      imageSmall: snail_32x32,
      imageOff: snail_off_512x512,
      imageOffSmall: snail_off_32x32,
      imageThreeDim: snail_threeDim_512x512,
      imageThreeDimSmall: snail_threeDim_32x32,
      imageThreeDimOff: snail_512x512,
      imageThreeDimOffSmall: snail_32x32,
      flipped: false,
      bgColor: "white",
    },
    spinosaurus: {
      image: spinosaurus_512x512,
      imageSmall: spinosaurus_32x32,
      imageOff: spinosaurus_off_512x512,
      imageOffSmall: spinosaurus_off_32x32,
      imageThreeDim: spinosaurus_threeDim_512x512,
      imageThreeDimSmall: spinosaurus_threeDim_32x32,
      imageThreeDimOff: spinosaurus_512x512,
      imageThreeDimOffSmall: spinosaurus_32x32,
      flipped: false,
      bgColor: "white",
    },
    TRex: {
      image: TRex_512x512,
      imageSmall: TRex_32x32,
      imageOff: TRex_off_512x512,
      imageOffSmall: TRex_off_32x32,
      imageThreeDim: TRex_threeDim_512x512,
      imageThreeDimSmall: TRex_threeDim_32x32,
      imageThreeDimOff: TRex_512x512,
      imageThreeDimOffSmall: TRex_32x32,
      flipped: false,
      bgColor: "white",
    },
  };

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => !prev);

    await handleVisualEffectChange("pets");

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: React.MouseEvent<Element, MouseEvent>) => {
    const target = event.target as HTMLElement;
    if (!effectsStyles || !target || !target.dataset.visualEffectsButtonValue) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .visualEffectsButtonValue as PetsEffectTypes;
    if (
      effectType in petsEffects &&
      (effectsStyles.style !== effectType || !streamEffects)
    ) {
      if (isUser) {
        if (currentEffectsStyles.current[type][videoId].pets) {
          currentEffectsStyles.current[type][videoId].pets.style = effectType;
          currentEffectsStyles.current[type][videoId].pets.transforms =
            assetSizePositionMap.pets[effectType];
        }
      } else {
        if (
          remoteCurrentEffectsStyles.current[username][instance][type][videoId]
            .pets
        ) {
          remoteCurrentEffectsStyles.current[username][instance][type][
            videoId
          ].pets.style = effectType;
          remoteCurrentEffectsStyles.current[username][instance][type][
            videoId
          ].pets.transforms = assetSizePositionMap.pets[effectType];
        }
      }

      await handleVisualEffectChange(
        "pets",
        isUser
          ? userStreamEffects.current[type][videoId].pets
          : remoteStreamEffects.current[username][instance][type][videoId].pets
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

    await handleVisualEffectChange("pets", streamEffects);

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

        if (petsEffects[effectsStyles.style].icon) {
          const iconSrc =
            petsEffects[effectsStyles.style][
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
            petsEffects[effectsStyles.style][
              effectsStyles.threeDim
                ? streamEffects
                  ? "imageThreeDimOff"
                  : "imageThreeDim"
                : streamEffects
                ? "imageOff"
                : "image"
            ];

          const imageLoadingSrc =
            petsEffects[effectsStyles.style][
              effectsStyles?.threeDim
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
        <div
          ref={petsContainerRef}
          className='overflow-y-auto smallScrollbar max-h-48 mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'
        >
          {Object.entries(petsEffects).map(([pet, effect]) => (
            <FgButton
              key={pet}
              contentFunction={() => (
                <div
                  className={`${
                    pet === effectsStyles.style
                      ? "border-fg-secondary border-3 border-opacity-100"
                      : ""
                  } ${effect.flipped && "scale-x-[-1]"} ${
                    effect.bgColor === "white" && "bg-white border-fg-black-35"
                  } ${
                    effect.bgColor === "black" && "border-white"
                  } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
                  onClick={holdFunction}
                  data-visual-effects-button-value={pet}
                >
                  <FgImage
                    src={effect.image}
                    srcLoading={effect.imageSmall}
                    alt={pet}
                    style={{ width: "2.75rem", height: "2.75rem" }}
                    data-visual-effects-button-value={pet}
                  />
                </div>
              )}
              hoverContent={
                <div className='mb-2 w-max py-1 px-2 text-black font-K2D text-sm bg-white shadow-lg rounded-md relative bottom-0'>
                  {petsLabels[pet as PetsEffectTypes]}
                </div>
              }
              scrollingContainerRef={petsContainerRef}
              options={{
                hoverZValue: 999999999999999,
                hoverTimeoutDuration: 750,
              }}
            />
          ))}
        </div>
      }
      hoverContent={
        <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
          Pets
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
