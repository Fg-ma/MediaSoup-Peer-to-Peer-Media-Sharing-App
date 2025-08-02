import {
  BeardsEffectTypes,
  GlassesEffectTypes,
  HatsEffectTypes,
  MasksEffectTypes,
  MustachesEffectTypes,
  PetsEffectTypes,
} from "./effectsTypeConstant";

export interface MeshJSON {
  vertex_faces: number[];
  uv_faces: number[];
  normals: number[];
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export type MeshTypes = "2D" | "3D" | "gltf" | "littleBuddy";

export type GizmoStateTypes = "position" | "scale" | "rotation" | "none";

export type MeshMetadata = {
  type: MeshTypes;
  userId: string;
  meshLabel: string;
  flags: {
    gizmo: boolean;
    moveable: boolean;
    scaleable: boolean;
    rotateable: boolean;
    audio: boolean;
    animation: boolean;
  };
  gizmo?: {
    isGizmoEnabled: boolean;
    gizmoState: GizmoStateTypes;
  };
  audio?: {
    audioURL: string;
    audioLoaded: boolean;
  };
  positioning: {
    initScale: number;
    manuallyTransformed: boolean;
  };
};

export type meshData = {
  defaultMeshPlacement: "forehead" | "eyesCenter" | "nose" | "chin";
  meshType: string;
  meshLabel: string;
  meshPath: string;
  meshFile: string;
  initScale: [number, number, number];
  initRotation: [number, number, number];
  soundEffectPath: string | undefined;
  transforms: {
    offsetX: number;
    offsetY: number;
  };
};

export type MeshesData = {
  mustaches: {
    [mustacheType in MustachesEffectTypes]: meshData;
  };
  beards: {
    [beardType in BeardsEffectTypes]: meshData;
  };
  masks: {
    [maskType in MasksEffectTypes]: meshData;
  };
  glasses: {
    [glassesType in GlassesEffectTypes]: meshData;
  };
  hats: {
    [hatType in HatsEffectTypes]: meshData;
  };
  pets: {
    [petType in PetsEffectTypes]: meshData;
  };
};
