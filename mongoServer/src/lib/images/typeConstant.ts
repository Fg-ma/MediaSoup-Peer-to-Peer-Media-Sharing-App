import {
  BeardsEffectTypes,
  GlassesEffectTypes,
  HatsEffectTypes,
  HideBackgroundEffectTypes,
  MasksEffectTypes,
  MustachesEffectTypes,
  PetsEffectTypes,
  PostProcessEffectTypes,
} from "../typeConstant";

export type ImageEffectTypes =
  | "postProcess"
  | "hideBackground"
  | "blur"
  | "tint"
  | "glasses"
  | "beards"
  | "mustaches"
  | "masks"
  | "hats"
  | "pets";

export const imageEffectEncodingMap = {
  postProcess: 0,
  hideBackground: 1,
  blur: 2,
  tint: 3,
  glasses: 4,
  beards: 5,
  mustaches: 6,
  masks: 7,
  hats: 8,
  pets: 9,
};

export type ImageEffectStylesType = {
  postProcess: {
    style: PostProcessEffectTypes;
  };
  hideBackground: {
    style: HideBackgroundEffectTypes;
    color: string;
  };
  tint: {
    color: string;
  };
  glasses: {
    style: GlassesEffectTypes;
  };
  beards: {
    style: BeardsEffectTypes;
  };
  mustaches: {
    style: MustachesEffectTypes;
  };
  masks: {
    style: MasksEffectTypes;
  };
  hats: {
    style: HatsEffectTypes;
  };
  pets: {
    style: PetsEffectTypes;
  };
};

export const imageEffectStylesEncodingMap = {
  postProcess: 0,
  hideBackground: 1,
  tint: 2,
  glasses: 3,
  beards: 4,
  mustaches: 5,
  masks: 6,
  hats: 7,
  pets: 8,
};
