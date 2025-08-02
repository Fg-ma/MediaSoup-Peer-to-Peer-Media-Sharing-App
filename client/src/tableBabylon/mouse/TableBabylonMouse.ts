import {
  AbstractMesh,
  ActionManager,
  ExecuteCodeAction,
} from "@babylonjs/core";
import { MeshMetadata } from "../../../../universal/babylonTypeContant";
import TableBabylonScene from "../TableBabylonScene";

class TableBabylonMouse {
  constructor(private tableBabylonScene: TableBabylonScene) {}

  applyMouseActions = (mesh: AbstractMesh, parentMesh?: AbstractMesh) => {
    let clickTimeout: NodeJS.Timeout | undefined; // To hold the timeout for single click
    let doubleClickRegistered = false; // To check if double click was triggered
    let holdTimeout: NodeJS.Timeout | undefined = undefined;

    mesh.isPickable = true;

    this.tableBabylonScene.scene.onBeforeRenderObservable.add(() => {
      mesh.refreshBoundingInfo({ applySkeleton: true }); // Update the bounding box of the mesh each frame
    });

    mesh.actionManager = new ActionManager(this.tableBabylonScene.scene);

    // Handle single-click action with a slight delay
    mesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        // Start a timeout for single-click, which waits briefly to see if a double-click occurs
        clickTimeout = setTimeout(() => {
          // Only play animation if no double-click was registered
          if (!doubleClickRegistered) {
            if (
              !this.tableBabylonScene.selectedMesh ||
              (this.tableBabylonScene.selectedMesh !== mesh &&
                this.tableBabylonScene.selectedMesh !== parentMesh)
            ) {
              if (parentMesh) {
                this.tableBabylonScene.selectedMesh = parentMesh;
              } else {
                this.tableBabylonScene.selectedMesh = mesh;
              }
            }

            const meta = this.tableBabylonScene.selectedMesh
              .metadata as MeshMetadata;

            if (meta.flags.animation) {
              this.tableBabylonScene.tableBabylonAnimations.togglePlayAnimationOnMesh(
                this.tableBabylonScene.selectedMesh,
              );
            }
            if (meta.flags.audio) {
              this.tableBabylonScene.tableBabylonAudio.togglePlayAudioOnMesh(
                this.tableBabylonScene.selectedMesh,
              );
            }
            if (meta.type === "littleBuddy") {
              this.tableBabylonScene.littleBuddies[meta.userId][
                meta.meshLabel
              ].setSelected(true);
            }
          }

          // Reset the double-click registered flag
          doubleClickRegistered = false;
        }, 250); // Small delay to check for double click (in milliseconds)
      }),
    );

    // Handle double-clicks to toggle gizmo
    mesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnDoublePickTrigger, () => {
        // Mark double click as registered
        doubleClickRegistered = true;

        // Clear the single click timeout to prevent single-click action
        clearTimeout(clickTimeout);
        clickTimeout = undefined;

        if (
          !this.tableBabylonScene.selectedMesh ||
          (this.tableBabylonScene.selectedMesh !== mesh &&
            this.tableBabylonScene.selectedMesh !== parentMesh)
        ) {
          if (parentMesh) {
            this.tableBabylonScene.selectedMesh = parentMesh;
          } else {
            this.tableBabylonScene.selectedMesh = mesh;
          }
        }

        const meshMetadata = this.tableBabylonScene.selectedMesh
          .metadata as MeshMetadata;

        if (meshMetadata.flags.gizmo && meshMetadata.gizmo) {
          // Handle gizmo toggle on double click
          const nextState =
            this.tableBabylonScene.tableBabylonGizmo.getNextGizmoState(
              meshMetadata.gizmo.gizmoState,
            );
          this.tableBabylonScene.selectedMesh.metadata.gizmoState = nextState;

          // Toggle gizmo state
          if (parentMesh) {
            this.tableBabylonScene.tableBabylonGizmo.disableGizmo(parentMesh);
          } else {
            this.tableBabylonScene.tableBabylonGizmo.disableGizmo(mesh);
          }

          if (nextState !== "none") {
            // Enable gizmo
            if (parentMesh) {
              this.tableBabylonScene.tableBabylonGizmo.enableGizmo(
                nextState,
                parentMesh,
              );
            } else {
              this.tableBabylonScene.tableBabylonGizmo.enableGizmo(
                nextState,
                mesh,
              );
            }
          }
        }
      }),
    );

    // Handle hold event (3 seconds)
    mesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickDownTrigger, () => {
        const meshMetadata = parentMesh ? parentMesh.metadata : mesh.metadata;
        if (meshMetadata && meshMetadata.gizmoState !== "position") {
          holdTimeout = setTimeout(() => {
            meshMetadata.gizmoState = "none";
            this.tableBabylonScene.tableBabylonGizmo.disableGizmo(
              parentMesh ? parentMesh : mesh,
            );
          }, 2000);
        }
      }),
    );

    mesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickUpTrigger, () => {
        if (holdTimeout) {
          clearTimeout(holdTimeout);
          holdTimeout = undefined;
        }
      }),
    );
  };
}

export default TableBabylonMouse;
