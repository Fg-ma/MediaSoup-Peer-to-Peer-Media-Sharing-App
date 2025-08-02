import { AbstractMesh } from "@babylonjs/core";
import TableBabylonScene from "../TableBabylonScene";

class TableBabylonSelect {
  constructor(private tableBabylonScene: TableBabylonScene) {}

  escapeMesh = (mesh: AbstractMesh) => {
    const meshMetadata = mesh.metadata;

    if (!meshMetadata) {
      return;
    }

    // Disable gizmo
    this.tableBabylonScene.tableBabylonGizmo.disableGizmo(mesh);

    // Reset gizmo state
    meshMetadata.gizmoState = "none";
    const meshLabel = meshMetadata.meshLabel;

    // Stop animations associated with the mesh
    const animationGroups = this.tableBabylonScene.scene.animationGroups;
    animationGroups.forEach((animGroup) => {
      animGroup.targetedAnimations.forEach((targetedAnim) => {
        if (mesh) {
          // Compare the final node with the targeted animation's target
          if (
            meshLabel !== undefined &&
            meshLabel === targetedAnim.target.metadata.meshLabel
          ) {
            animGroup.stop(); // Stop the animation before removing the mesh
          }
        }
      });
    });

    this.tableBabylonScene.selectedMesh = null;
  };
}

export default TableBabylonSelect;
