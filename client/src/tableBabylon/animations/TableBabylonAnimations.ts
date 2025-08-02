import { AbstractMesh } from "@babylonjs/core";
import TableBabylonScene from "../TableBabylonScene";

class TableBabylonAnimations {
  constructor(private tableBabylonScene: TableBabylonScene) {}

  togglePlayAnimationOnMesh = (mesh: AbstractMesh) => {
    const animationGroups = this.tableBabylonScene.scene.animationGroups;

    animationGroups.forEach((animGroup) => {
      if (
        mesh &&
        mesh.metadata.meshLabel !== undefined &&
        mesh.metadata.meshLabel === animGroup.metadata.meshLabel
      ) {
        if (animGroup.isPlaying) {
          animGroup.pause();
        } else {
          animGroup.play(false);
        }
      }
    });
  };
}

export default TableBabylonAnimations;
