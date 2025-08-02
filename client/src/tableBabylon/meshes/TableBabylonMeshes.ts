import { Vector3, AbstractMesh } from "@babylonjs/core";
import MeshLoaders from "./MeshLoaders";
import { MeshTypes } from "../../../../universal/babylonTypeContant";
import TableBabylonScene from "../TableBabylonScene";

class TableBabylonMeshes {
  meshes: {
    "2D": { [mesh: string]: AbstractMesh };
    "3D": { [mesh: string]: AbstractMesh | AbstractMesh[] };
  } = { "2D": {}, "3D": {} };

  private meshLoaders: MeshLoaders;

  constructor(private tableBabylonScene: TableBabylonScene) {
    this.meshLoaders = new MeshLoaders(this.tableBabylonScene.scene);
  }

  private applyMeshAttributes = (
    mesh: AbstractMesh,
    position?: [number, number, number],
    scale?: [number, number, number],
    rotation?: [number, number, number],
  ) => {
    if (position) {
      mesh.position = new Vector3(position[0], position[1], position[2]);
    } else {
      mesh.position = new Vector3(0, 0, 0);
    }
    if (scale) {
      mesh.scaling = new Vector3(scale[0], scale[1], scale[2]);
    } else {
      mesh.scaling = new Vector3(1, 1, 1);
    }
    if (rotation) {
      mesh.rotation = new Vector3(rotation[0], rotation[1], rotation[2]);
    } else {
      mesh.rotation = new Vector3(0, 0, 0);
    }
  };

  createMesh = async (
    type: MeshTypes,
    meshLabel: string,
    meshName: string,
    meshPath: string,
    meshFile: string,
    audioURL?: string,
    initPosition?: [number, number, number],
    initScale?: [number, number, number],
    initRotation?: [number, number, number],
  ) => {
    if (type === "2D") {
      if (this.meshes["2D"][meshLabel]) {
        this.deleteMesh(this.meshes["2D"][meshLabel]);
      }
    } else {
      if (this.meshes["3D"][meshLabel]) {
        const meshes = this.meshes["3D"][meshLabel];
        if (meshes instanceof Array) {
          for (const mesh of meshes) {
            this.deleteMesh(mesh);
          }
        } else {
          this.deleteMesh(meshes);
        }
      }
    }

    if (type === "gltf") {
      const newMesh = await this.meshLoaders.loadGLTF(
        meshLabel,
        meshName,
        meshPath,
        meshFile,
      );

      for (const mesh of newMesh) {
        this.tableBabylonScene.ambientLightThreeDimMeshes?.includedOnlyMeshes.push(
          mesh,
        );
      }

      newMesh[0].metadata = {
        meshLabel,
        isGizmoEnabled: false,
        gizmoState: "none",
        meshType: "gltf",
        initScale,
        manuallyTransformed: false,
        audioURL,
        audioLoaded: false,
      };
      this.meshes["3D"][meshLabel] = newMesh;

      // Check if the mesh is loaded
      if (newMesh) {
        this.applyMeshAttributes(
          newMesh[0],
          initPosition,
          initScale,
          initRotation,
        );
        for (const mesh of newMesh) {
          this.tableBabylonScene.tableBabylonMouse.applyMouseActions(
            mesh,
            newMesh[0],
          );
        }
      } else {
        console.error(`Mesh ${meshName} not found after loading.`);
      }
    }
    if (type === "2D") {
      const newMesh = await this.meshLoaders.load2D(
        meshLabel,
        meshPath,
        meshFile,
      );

      this.tableBabylonScene.ambientLightTwoDimMeshes?.includedOnlyMeshes.push(
        newMesh,
      );

      newMesh.metadata = {
        meshLabel,
        isGizmoEnabled: false,
        gizmoState: "none",
        meshType: "2D",
        initScale,
        manuallyTransformed: false,
        audioURL,
        audioLoaded: false,
      };
      this.meshes["2D"][meshLabel] = newMesh;

      // Check if the mesh is loaded
      if (newMesh) {
        this.applyMeshAttributes(
          newMesh,
          initPosition,
          initScale,
          initRotation,
        );
        this.tableBabylonScene.tableBabylonMouse.applyMouseActions(newMesh);
      } else {
        console.error(`Mesh ${meshName} not found after loading.`);
      }
    }
  };

  deleteMesh = (
    meshDesc: { type: MeshTypes; meshLabel: string } | AbstractMesh,
  ) => {
    let meshes =
      meshDesc instanceof AbstractMesh
        ? [meshDesc]
        : this.meshes[meshDesc.type === "2D" ? "2D" : "3D"][meshDesc.meshLabel];

    if (!meshes) {
      return;
    }

    if (!(meshes instanceof Array)) {
      meshes = [meshes];
    }

    for (const mesh of meshes) {
      const meshMetadata = mesh.metadata;

      if (!meshMetadata || !mesh) {
        return;
      }

      this.tableBabylonScene.tableBabylonGizmo.disableGizmo(mesh);

      // Remove the mesh from the collection
      if (meshMetadata) {
        const meshLabel = meshMetadata.meshLabel;
        if (meshLabel in this.meshes["3D"]) {
          delete this.meshes["3D"][meshLabel];
        } else if (meshLabel in this.meshes["2D"]) {
          delete this.meshes["2D"][meshLabel];
        }
      }

      // Stop animations associated with the mesh
      const animationGroups = this.tableBabylonScene.scene.animationGroups;
      animationGroups.forEach((animGroup) => {
        animGroup.targetedAnimations.forEach((targetedAnim) => {
          if (
            targetedAnim.target.metadata &&
            meshMetadata.meshLabel !== undefined &&
            meshMetadata.meshLabel === targetedAnim.target.metadata.meshLabel
          ) {
            animGroup.stop(); // Stop the animation before removing the mesh
          }
        });
      });

      // Check if the selected mesh has a parent
      const parentMesh = mesh.parent;

      if (parentMesh) {
        // Remove all child meshes of the parent
        parentMesh.getChildMeshes().forEach((childMesh) => {
          childMesh.dispose(); // Dispose the child mesh
        });

        // Remove the parent mesh itself
        parentMesh.dispose(); // Dispose the parent mesh
      }

      // Remove the selected mesh if it has no parent
      mesh.dispose(); // Dispose the selected mesh

      // Clear the selected mesh reference
      this.tableBabylonScene.selectedMesh = null;
    }
  };
}

export default TableBabylonMeshes;
