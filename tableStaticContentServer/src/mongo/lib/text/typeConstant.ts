import { PostProcessEffectTypes } from "../typeConstant";

export type TextEffectTypes = "postProcess" | "blur" | "tint";

export const textEffectEncodingMap = {
  postProcess: 0,
  blur: 1,
  tint: 2,
};

export type TextEffectStylesType = {
  postProcess: {
    style: PostProcessEffectTypes;
  };
};

export const textEffectStylesEncodingMap = {
  postProcess: 0,
};
