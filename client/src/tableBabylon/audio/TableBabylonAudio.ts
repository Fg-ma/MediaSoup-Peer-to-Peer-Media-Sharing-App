import { AbstractMesh } from "@babylonjs/core";
import { MeshMetadata } from "../../../../universal/babylonTypeContant";

class TableBabylonAudio {
  constructor() {}

  togglePlayAudioOnMesh = (mesh: AbstractMesh) => {
    const meshMetadata = mesh.metadata as MeshMetadata;

    if (meshMetadata.audio?.audioURL === undefined) {
      return;
    }
  };
}

export default TableBabylonAudio;
