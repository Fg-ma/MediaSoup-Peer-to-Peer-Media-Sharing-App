import { KeyboardEventTypes, KeyboardInfo } from "@babylonjs/core";
import { MeshMetadata } from "../../../../universal/babylonTypeContant";
import TableBabylonScene from "../TableBabylonScene";

class TableBabylonKeyboard {
  constructor(private tableBabylonScene: TableBabylonScene) {
    this.tableBabylonScene.scene.onKeyboardObservable.add((kbInfo) => {
      kbInfo.event.preventDefault();

      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN: {
          this.handleKeyDown(kbInfo);
          break;
        }
        case KeyboardEventTypes.KEYUP: {
          this.handleKeyUp(kbInfo);
          break;
        }
      }
    });
  }

  handleKeyDown = (kbInfo: KeyboardInfo) => {
    const key = kbInfo.event.key.toLowerCase();
    const ctrl = kbInfo.event.ctrlKey;
    const shift = kbInfo.event.shiftKey;
    const selected = this.tableBabylonScene.selectedMesh;

    switch (key) {
      case "1":
        if (this.tableBabylonScene.scene.debugLayer.isVisible()) {
          this.tableBabylonScene.scene.debugLayer.hide();
        } else {
          this.tableBabylonScene.scene.debugLayer.show();
        }
        break;
      case " ":
        if (selected) {
          this.tableBabylonScene.tableBabylonAnimations.togglePlayAnimationOnMesh(
            selected,
          );
        }
        break;
      case "delete":
        if (selected) {
          this.tableBabylonScene.tableBabylonMeshes.deleteMesh(selected);
        } else {
          const meshUnderPointer =
            this.tableBabylonScene.scene.meshUnderPointer;
          if (meshUnderPointer) {
            this.tableBabylonScene.tableBabylonMeshes.deleteMesh(
              meshUnderPointer,
            );
          }
        }
        break;
      case "escape":
        if (selected) {
          this.tableBabylonScene.tableBabylonSelect.escapeMesh(selected);
        }
        break;
      case "g":
        if (ctrl && shift) {
          if (selected) {
            this.tableBabylonScene.tableBabylonGizmo.disableGizmo(selected);
            selected.metadata.gizmoState = "position";

            const meshLabel = selected.metadata.meshLabel;
            if (
              meshLabel in
              this.tableBabylonScene.tableBabylonMeshes.meshes["3D"]
            ) {
              if (
                this.tableBabylonScene.tableBabylonMeshes.meshes["3D"][
                  meshLabel
                ] instanceof Array
              ) {
                for (const mesh of this.tableBabylonScene.tableBabylonMeshes
                  .meshes["3D"][meshLabel]) {
                  if (mesh.metadata) {
                    mesh.metadata.gizmoState = "position";
                  }
                }
              } else {
                this.tableBabylonScene.tableBabylonMeshes.meshes["3D"][
                  meshLabel
                ].metadata.gizmoState = "position";
              }
            } else if (
              meshLabel in
              this.tableBabylonScene.tableBabylonMeshes.meshes["2D"]
            ) {
              if (
                this.tableBabylonScene.tableBabylonMeshes.meshes["2D"][
                  meshLabel
                ] instanceof Array
              ) {
                for (const mesh of this.tableBabylonScene.tableBabylonMeshes
                  .meshes["2D"][meshLabel]) {
                  if (mesh.metadata) {
                    mesh.metadata.gizmoState = "position";
                  }
                }
              } else {
                this.tableBabylonScene.tableBabylonMeshes.meshes["2D"][
                  meshLabel
                ].metadata.gizmoState = "position";
              }
            }

            this.tableBabylonScene.tableBabylonGizmo.enableGizmo(
              "position",
              selected,
            );
          } else {
            console.error("No mesh selected");
          }
        }
        break;
      case "r":
        if (ctrl && shift) {
          if (selected) {
            this.tableBabylonScene.tableBabylonGizmo.disableGizmo(selected);
            selected.metadata.gizmoState = "rotation";

            const meshLabel = selected.metadata.meshLabel;
            if (
              meshLabel in
              this.tableBabylonScene.tableBabylonMeshes.meshes["3D"]
            ) {
              if (
                this.tableBabylonScene.tableBabylonMeshes.meshes["3D"][
                  meshLabel
                ] instanceof Array
              ) {
                for (const mesh of this.tableBabylonScene.tableBabylonMeshes
                  .meshes["3D"][meshLabel]) {
                  if (mesh.metadata) {
                    mesh.metadata.gizmoState = "rotation";
                  }
                }
              } else {
                this.tableBabylonScene.tableBabylonMeshes.meshes["3D"][
                  meshLabel
                ].metadata.gizmoState = "rotation";
              }
            } else if (
              meshLabel in
              this.tableBabylonScene.tableBabylonMeshes.meshes["2D"]
            ) {
              if (
                this.tableBabylonScene.tableBabylonMeshes.meshes["2D"][
                  meshLabel
                ] instanceof Array
              ) {
                for (const mesh of this.tableBabylonScene.tableBabylonMeshes
                  .meshes["2D"][meshLabel]) {
                  if (mesh.metadata) {
                    mesh.metadata.gizmoState = "rotation";
                  }
                }
              } else {
                this.tableBabylonScene.tableBabylonMeshes.meshes["2D"][
                  meshLabel
                ].metadata.gizmoState = "rotation";
              }
            }

            this.tableBabylonScene.tableBabylonGizmo.enableGizmo(
              "rotation",
              selected,
            );
          } else {
            console.error("No mesh selected");
          }
        }
        break;
      case "k":
        if (ctrl && shift) {
          if (selected) {
            this.tableBabylonScene.tableBabylonGizmo.disableGizmo(selected);
            selected.metadata.gizmoState = "scale";

            const meshLabel = selected.metadata.meshLabel;
            if (
              meshLabel in
              this.tableBabylonScene.tableBabylonMeshes.meshes["3D"]
            ) {
              if (
                this.tableBabylonScene.tableBabylonMeshes.meshes["3D"][
                  meshLabel
                ] instanceof Array
              ) {
                for (const mesh of this.tableBabylonScene.tableBabylonMeshes
                  .meshes["3D"][meshLabel]) {
                  if (mesh.metadata) {
                    mesh.metadata.gizmoState = "scale";
                  }
                }
              } else {
                this.tableBabylonScene.tableBabylonMeshes.meshes["3D"][
                  meshLabel
                ].metadata.gizmoState = "scale";
              }
            } else if (
              meshLabel in
              this.tableBabylonScene.tableBabylonMeshes.meshes["2D"]
            ) {
              if (
                this.tableBabylonScene.tableBabylonMeshes.meshes["2D"][
                  meshLabel
                ] instanceof Array
              ) {
                for (const mesh of this.tableBabylonScene.tableBabylonMeshes
                  .meshes["2D"][meshLabel]) {
                  if (mesh.metadata) {
                    mesh.metadata.gizmoState = "scale";
                  }
                }
              } else {
                this.tableBabylonScene.tableBabylonMeshes.meshes["2D"][
                  meshLabel
                ].metadata.gizmoState = "scale";
              }
            }

            this.tableBabylonScene.tableBabylonGizmo.enableGizmo(
              "scale",
              selected,
            );
          } else {
            console.error("No mesh selected");
          }
        }
        break;
      case "w":
      case "a":
      case "s":
      case "d":
      case "arrowup":
      case "arrowleft":
      case "arrowdown":
      case "arrowright": {
        const directionMap: Record<string, "up" | "left" | "right" | "down"> = {
          w: "up",
          a: "left",
          s: "down",
          d: "right",
          arrowup: "up",
          arrowleft: "left",
          arrowdown: "down",
          arrowright: "right",
        };

        if (selected) {
          const meta = selected.metadata as MeshMetadata;
          if (meta?.type === "littleBuddy") {
            this.tableBabylonScene.littleBuddies[meta.userId][
              meta.meshLabel
            ].littleBuddyMovement.updateMovementDirection(
              "add",
              directionMap[key],
            );
          }
        }
        break;
      }
      case "shift":
        if (selected) {
          const meta = selected.metadata as MeshMetadata;

          if (meta.type === "littleBuddy") {
            this.tableBabylonScene.littleBuddies[meta.userId][
              meta.meshLabel
            ].littleBuddyMovement.toggleSprint(true);
          }
        }
        break;
      case "o":
        if (selected) {
          const meta = selected.metadata as MeshMetadata;

          if (meta.type === "littleBuddy") {
            this.tableBabylonScene.littleBuddies[meta.userId][
              meta.meshLabel
            ].littleBuddyMovement.updateSize("grow", shift ? "fast" : "slow");
          }
        }
        break;
      case "p":
        if (selected) {
          const meta = selected.metadata as MeshMetadata;

          if (meta.type === "littleBuddy") {
            this.tableBabylonScene.littleBuddies[meta.userId][
              meta.meshLabel
            ].littleBuddyMovement.updateSize("shrink", shift ? "fast" : "slow");
          }
        }
        break;
      default:
        break;
    }
  };

  handleKeyUp = (kbInfo: KeyboardInfo) => {
    const key = kbInfo.event.key.toLowerCase();
    const selected = this.tableBabylonScene.selectedMesh;

    switch (key) {
      case "w":
      case "a":
      case "s":
      case "d":
      case "arrowup":
      case "arrowleft":
      case "arrowdown":
      case "arrowright": {
        const directionMap: Record<string, "up" | "left" | "right" | "down"> = {
          w: "up",
          a: "left",
          s: "down",
          d: "right",
          arrowup: "up",
          arrowleft: "left",
          arrowdown: "down",
          arrowright: "right",
        };

        if (selected) {
          const meta = selected.metadata as MeshMetadata;
          if (meta?.type === "littleBuddy") {
            this.tableBabylonScene.littleBuddies[meta.userId][
              meta.meshLabel
            ].littleBuddyMovement.updateMovementDirection(
              "remove",
              directionMap[key],
            );
          }
        }
        break;
      }
      case "shift":
        if (selected) {
          const meta = selected.metadata as MeshMetadata;

          if (meta.type === "littleBuddy") {
            this.tableBabylonScene.littleBuddies[meta.userId][
              meta.meshLabel
            ].littleBuddyMovement.toggleSprint(false);
          }
        }
        break;
      default:
        break;
    }
  };
}

export default TableBabylonKeyboard;
