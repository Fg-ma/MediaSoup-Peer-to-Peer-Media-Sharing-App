import { PostProcessEffectTypes } from "../typeConstant";

export type ApplicationEffectTypes = "postProcess" | "blur" | "tint";

export const applicationEffectEncodingMap = {
  postProcess: 0,
  blur: 1,
  tint: 2,
};

export type ApplicationEffectStylesType = {
  postProcess: {
    style: PostProcessEffectTypes;
  };
  tint: {
    color: string;
  };
};

export const applicationEffectStylesEncodingMap = {
  postProcess: 0,
  tint: 1,
};
