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

export type ImageEffectStylesType = {
  postProcess: {
    style: PostProcessEffectTypes;
  };
  hideBackground: {
    style: HideBackgroundEffectTypes;
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
  glasses: 2,
  beards: 3,
  mustaches: 4,
  masks: 5,
  hats: 6,
  pets: 7,
};
