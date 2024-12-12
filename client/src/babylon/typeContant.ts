import {
  BeardsEffectTypes,
  GlassesEffectTypes,
  HatsEffectTypes,
  MasksEffectTypes,
  MustachesEffectTypes,
  PetsEffectTypes,
} from "../context/effectsStylesContext/typeConstant";

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

export type MeshTypes = "2D" | "3D" | "gltf";

export type GizmoStateTypes = "position" | "scale" | "rotation" | "none";

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
