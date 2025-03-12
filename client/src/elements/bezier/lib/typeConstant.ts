export type ControlTypes = "inlineSymmetric" | "inline" | "free";

export interface ControlPoint {
  x: number;
  y: number;
  dragging: boolean;
}

export interface BezierPoint {
  type: "endPoint" | "splitPoint";
  x: number;
  y: number;
  selected: boolean;
  dragging: boolean;
  hovering: boolean;
  controlType: ControlTypes;
  controls: {
    controlOne: ControlPoint;
    controlTwo?: ControlPoint;
  };
}

export const cycleControlTypeMap: {
  [controlTypes in ControlTypes]: ControlTypes;
} = {
  free: "inlineSymmetric",
  inlineSymmetric: "inline",
  inline: "free",
};
