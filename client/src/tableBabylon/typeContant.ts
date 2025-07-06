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
