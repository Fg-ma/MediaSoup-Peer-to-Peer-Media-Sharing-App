import {
  Scene,
  Vector3,
  AbstractMesh,
  ActionManager,
  ExecuteCodeAction,
  GizmoManager,
  Color3,
  PointerDragBehavior,
  KeyboardEventTypes,
  HemisphericLight,
} from "@babylonjs/core";
import MeshLoaders from "./MeshLoaders";
import {
  DefaultMeshPlacementType,
  EffectType,
  PositionStyle,
} from "./BabylonScene";

export type MeshTypes = "2D" | "gltf";

type GizmoStateTypes = "position" | "scale" | "rotation" | "none";

class BabylonMeshes {
  meshes: {
    "2D": { [mesh: string]: AbstractMesh };
    "3D": { [mesh: string]: AbstractMesh | AbstractMesh[] };
  } = { "2D": {}, "3D": {} };
  private selectedMesh: AbstractMesh | null = null;

  private controlPressed = false;
  private shiftPressed = false;

  private meshLoaders: MeshLoaders;

  constructor(
    private scene: Scene,
    private ambientLightThreeDimMeshes: HemisphericLight | undefined,
    private ambientLightTwoDimMeshes: HemisphericLight | undefined
  ) {
    this.meshLoaders = new MeshLoaders(this.scene);

    this.scene.onKeyboardObservable.add((kbInfo) => {
      kbInfo.event.preventDefault();

      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          const keyDown = kbInfo.event.key.toLowerCase();
          switch (keyDown) {
            case "1":
              if (this.scene.debugLayer.isVisible()) {
                this.scene.debugLayer.hide();
              } else {
                this.scene.debugLayer.show();
              }
              break;
            case " ":
              if (this.selectedMesh) {
                this.togglePlayAnimationOnMesh(this.selectedMesh);
              } else {
                console.error("No mesh selected");
              }
              break;
            case "delete":
              if (this.selectedMesh) {
                this.deleteMesh(this.selectedMesh);
              } else {
                const meshUnderPointer = this.scene.meshUnderPointer;
                if (meshUnderPointer) {
                  this.deleteMesh(meshUnderPointer);
                }
              }
              break;
            case "escape":
              if (this.selectedMesh) {
                this.escapeMesh(this.selectedMesh);
              } else {
                console.error("No mesh selected");
              }
              break;
            case "control":
              this.controlPressed = true;
              break;
            case "shift":
              this.shiftPressed = true;
              break;
            case "g":
              if (this.controlPressed && this.shiftPressed) {
                if (this.selectedMesh) {
                  this.disableGizmo(this.selectedMesh);
                  this.selectedMesh.metadata.gizmoState = "position";

                  const meshLabel = this.selectedMesh.metadata.meshLabel;
                  if (meshLabel in this.meshes["3D"]) {
                    if (this.meshes["3D"][meshLabel] instanceof Array) {
                      for (const mesh of this.meshes["3D"][meshLabel]) {
                        if (mesh.metadata) {
                          mesh.metadata.gizmoState = "position";
                        }
                      }
                    } else {
                      this.meshes["3D"][meshLabel].metadata.gizmoState =
                        "position";
                    }
                  } else if (meshLabel in this.meshes["2D"]) {
                    if (this.meshes["2D"][meshLabel] instanceof Array) {
                      for (const mesh of this.meshes["2D"][meshLabel]) {
                        if (mesh.metadata) {
                          mesh.metadata.gizmoState = "position";
                        }
                      }
                    } else {
                      this.meshes["2D"][meshLabel].metadata.gizmoState =
                        "position";
                    }
                  }

                  this.enableGizmo("position", this.selectedMesh);
                } else {
                  console.error("No mesh selected");
                }
              }
              break;
            case "r":
              if (this.controlPressed && this.shiftPressed) {
                if (this.selectedMesh) {
                  this.disableGizmo(this.selectedMesh);
                  this.selectedMesh.metadata.gizmoState = "rotation";

                  const meshLabel = this.selectedMesh.metadata.meshLabel;
                  if (meshLabel in this.meshes["3D"]) {
                    if (this.meshes["3D"][meshLabel] instanceof Array) {
                      for (const mesh of this.meshes["3D"][meshLabel]) {
                        if (mesh.metadata) {
                          mesh.metadata.gizmoState = "rotation";
                        }
                      }
                    } else {
                      this.meshes["3D"][meshLabel].metadata.gizmoState =
                        "rotation";
                    }
                  } else if (meshLabel in this.meshes["2D"]) {
                    if (this.meshes["2D"][meshLabel] instanceof Array) {
                      for (const mesh of this.meshes["2D"][meshLabel]) {
                        if (mesh.metadata) {
                          mesh.metadata.gizmoState = "rotation";
                        }
                      }
                    } else {
                      this.meshes["2D"][meshLabel].metadata.gizmoState =
                        "rotation";
                    }
                  }

                  this.enableGizmo("rotation", this.selectedMesh);
                } else {
                  console.error("No mesh selected");
                }
              }
              break;
            case "s":
              if (this.controlPressed && this.shiftPressed) {
                if (this.selectedMesh) {
                  this.disableGizmo(this.selectedMesh);
                  this.selectedMesh.metadata.gizmoState = "scale";

                  const meshLabel = this.selectedMesh.metadata.meshLabel;
                  if (meshLabel in this.meshes["3D"]) {
                    if (this.meshes["3D"][meshLabel] instanceof Array) {
                      for (const mesh of this.meshes["3D"][meshLabel]) {
                        if (mesh.metadata) {
                          mesh.metadata.gizmoState = "scale";
                        }
                      }
                    } else {
                      this.meshes["3D"][meshLabel].metadata.gizmoState =
                        "scale";
                    }
                  } else if (meshLabel in this.meshes["2D"]) {
                    if (this.meshes["2D"][meshLabel] instanceof Array) {
                      for (const mesh of this.meshes["2D"][meshLabel]) {
                        if (mesh.metadata) {
                          mesh.metadata.gizmoState = "scale";
                        }
                      }
                    } else {
                      this.meshes["2D"][meshLabel].metadata.gizmoState =
                        "scale";
                    }
                  }

                  this.enableGizmo("scale", this.selectedMesh);
                } else {
                  console.error("No mesh selected");
                }
              }
              break;
            default:
              break;
          }
          break;
        case KeyboardEventTypes.KEYUP:
          const keyUp = kbInfo.event.key.toLowerCase();

          switch (keyUp) {
            case "control":
              this.controlPressed = false;
              break;
            case "shift":
              this.shiftPressed = false;
              break;
            default:
              break;
          }
          break;
      }
    });
  }

  private applyMeshAttributes = (
    mesh: AbstractMesh,
    position?: [number, number, number],
    scale?: [number, number, number],
    rotation?: [number, number, number]
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

  private applyMeshActions = (
    mesh: AbstractMesh,
    parentMesh?: AbstractMesh
  ) => {
    let clickTimeout: NodeJS.Timeout | undefined; // To hold the timeout for single click
    let doubleClickRegistered = false; // To check if double click was triggered
    let holdTimeout: NodeJS.Timeout | undefined = undefined;

    mesh.isPickable = true;

    this.scene.onBeforeRenderObservable.add(() => {
      mesh.refreshBoundingInfo({ applySkeleton: true }); // Update the bounding box of the mesh each frame
    });

    mesh.actionManager = new ActionManager(this.scene);

    // Handle single-click action with a slight delay
    mesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        // Start a timeout for single-click, which waits briefly to see if a double-click occurs
        clickTimeout = setTimeout(() => {
          // Only play animation if no double-click was registered
          if (!doubleClickRegistered) {
            if (
              !this.selectedMesh ||
              (this.selectedMesh !== mesh && this.selectedMesh !== parentMesh)
            ) {
              if (parentMesh) {
                this.selectedMesh = parentMesh;
              } else {
                this.selectedMesh = mesh;
              }
            }

            this.togglePlayAnimationOnMesh(this.selectedMesh);
          }

          // Reset the double-click registered flag
          doubleClickRegistered = false;
        }, 250); // Small delay to check for double click (in milliseconds)
      })
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
          !this.selectedMesh ||
          (this.selectedMesh !== mesh && this.selectedMesh !== parentMesh)
        ) {
          if (parentMesh) {
            this.selectedMesh = parentMesh;
          } else {
            this.selectedMesh = mesh;
          }
        }

        const meshMetaData = this.selectedMesh.metadata;

        // Handle gizmo toggle on double click
        const nextState = this.getNextGizmoState(meshMetaData.gizmoState);
        this.selectedMesh.metadata.gizmoState = nextState;

        if (
          meshMetaData &&
          meshMetaData.positionStyle !== undefined &&
          meshMetaData.manuallyTransformed !== undefined
        ) {
          if (nextState === "none" && !meshMetaData.manuallyTransformed) {
            meshMetaData.positionStyle = "faceTrack";
          } else {
            meshMetaData.positionStyle = "free";
          }
        }

        // Toggle gizmo state
        if (parentMesh) {
          this.disableGizmo(parentMesh);
        } else {
          this.disableGizmo(mesh);
        }

        if (nextState !== "none") {
          // Enable gizmo
          if (parentMesh) {
            this.enableGizmo(nextState, parentMesh);
          } else {
            this.enableGizmo(nextState, mesh);
          }
        }
      })
    );

    // Handle hold event (3 seconds)
    mesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickDownTrigger, () => {
        const meshMetaData = parentMesh ? parentMesh.metadata : mesh.metadata;
        if (
          meshMetaData &&
          meshMetaData.positionStyle !== undefined &&
          meshMetaData.manuallyTransformed !== undefined &&
          meshMetaData.gizmoState !== "position"
        ) {
          holdTimeout = setTimeout(() => {
            meshMetaData.gizmoState = "none";
            meshMetaData.positionStyle = "faceTrack";
            meshMetaData.manuallyTransformed = false;
            this.disableGizmo(parentMesh ? parentMesh : mesh);
          }, 2000);
        }
      })
    );

    mesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickUpTrigger, () => {
        if (holdTimeout) {
          clearTimeout(holdTimeout);
          holdTimeout = undefined;
        }
      })
    );
  };

  private togglePlayAnimationOnMesh = (mesh: AbstractMesh) => {
    const animationGroups = this.scene.animationGroups;

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

  private escapeMesh = (mesh: AbstractMesh) => {
    const meshMetaData = mesh.metadata;

    if (!meshMetaData) {
      return;
    }

    // Disable gizmo
    this.disableGizmo(mesh);

    // Reset gizmo state
    meshMetaData.gizmoState = "none";
    const meshLabel = meshMetaData.meshLabel;

    // Stop animations associated with the mesh
    const animationGroups = this.scene.animationGroups;
    animationGroups.forEach((animGroup) => {
      animGroup.targetedAnimations.forEach((targetedAnim) => {
        if (mesh) {
          // Compare the final node with the targeted animation's target
          if (
            meshMetaData.meshLabel !== undefined &&
            meshMetaData.meshLabel === targetedAnim.target.metadata.meshLabel
          ) {
            animGroup.stop(); // Stop the animation before removing the mesh
          }
        }
      });
    });

    this.selectedMesh = null;
  };

  // Helper function to determine the next gizmo state
  private getNextGizmoState = (
    currentState?: GizmoStateTypes
  ): GizmoStateTypes => {
    switch (currentState) {
      case "none":
        return "position";
      case "position":
        return "rotation";
      case "rotation":
        return "scale";
      case "scale":
        return "none";
      case undefined:
        return "position";
      default:
        return "none";
    }
  };

  // Helper function to register observables for any gizmo type
  private registerGizmoInteraction = (mesh: AbstractMesh, gizmo: any) => {
    gizmo.dragBehavior?.onDragObservable.add(() => {
      const meshMetaData = mesh.metadata;

      if (
        meshMetaData &&
        !meshMetaData.manuallyTransformed &&
        meshMetaData.manuallyTransformed !== undefined
      ) {
        meshMetaData.manuallyTransformed = true;
      }
    });
  };

  // Function to enable the position gizmo for a mesh
  private enableGizmo = (gizmoType: GizmoStateTypes, mesh: AbstractMesh) => {
    const meshMetaData = mesh.metadata;

    // Create a GizmoManager to manage gizmos in the scene
    const gizmoManager = new GizmoManager(this.scene);

    switch (gizmoType) {
      case "position":
        gizmoManager.positionGizmoEnabled = true;

        const positionGizmo = gizmoManager.gizmos.positionGizmo;
        if (positionGizmo) {
          positionGizmo.xGizmo.coloredMaterial.diffuseColor = new Color3(
            0.96078431,
            0.38039215,
            0.0784313725490196
          ); // Red for X axis
          positionGizmo.yGizmo.coloredMaterial.diffuseColor = new Color3(
            0.17254901,
            0.57254901,
            0.9607843137254902
          ); // Green for Y axis
          positionGizmo.zGizmo.coloredMaterial.diffuseColor = new Color3(
            0.30980392,
            0.6666666666666666,
            0.5333333333333333
          ); // Blue for Z axis

          if (
            meshMetaData &&
            !meshMetaData.manuallyTransformed &&
            meshMetaData.manuallyTransformed !== undefined
          ) {
            this.registerGizmoInteraction(mesh, positionGizmo.xGizmo);
            this.registerGizmoInteraction(mesh, positionGizmo.yGizmo);
            this.registerGizmoInteraction(mesh, positionGizmo.zGizmo);
          }
        }

        // Set the gizmo to use world space (fixed axes) instead of local space
        gizmoManager.gizmos.positionGizmo!.updateGizmoRotationToMatchAttachedMesh =
          false;
        gizmoManager.usePointerToAttachGizmos = false; // Disable auto attaching

        // Add dragging behavior along a specific plane (Y-axis constrained)
        let dragBehavior: PointerDragBehavior;
        dragBehavior = new PointerDragBehavior({
          dragPlaneNormal: new Vector3(0, 0, 1),
        });

        // Attach the drag behavior to the mesh
        mesh.addBehavior(dragBehavior);

        // Store the drag behavior in the mesh's metadata for later access
        meshMetaData.dragBehavior = dragBehavior;
        break;
      case "rotation":
        gizmoManager.rotationGizmoEnabled = true;

        const rotationGizmo = gizmoManager.gizmos.rotationGizmo;
        if (rotationGizmo) {
          rotationGizmo.xGizmo.coloredMaterial.diffuseColor = new Color3(
            0.96078431,
            0.38039215,
            0.0784313725490196
          ); // Red for X axis
          rotationGizmo.yGizmo.coloredMaterial.diffuseColor = new Color3(
            0.17254901,
            0.57254901,
            0.9607843137254902
          ); // Green for Y axis
          rotationGizmo.zGizmo.coloredMaterial.diffuseColor = new Color3(
            0.30980392,
            0.6666666666666666,
            0.5333333333333333
          ); // Blue for Z axis

          if (
            meshMetaData &&
            !meshMetaData.manuallyTransformed &&
            meshMetaData.manuallyTransformed !== undefined
          ) {
            this.registerGizmoInteraction(mesh, rotationGizmo.xGizmo);
            this.registerGizmoInteraction(mesh, rotationGizmo.yGizmo);
            this.registerGizmoInteraction(mesh, rotationGizmo.zGizmo);
          }
        }

        // Set the gizmo to use world space (fixed axes) instead of local space
        gizmoManager.gizmos.rotationGizmo!.updateGizmoRotationToMatchAttachedMesh =
          false;
        gizmoManager.usePointerToAttachGizmos = false; // Disable auto attaching
        break;
      case "scale":
        gizmoManager.scaleGizmoEnabled = true;

        const scaleGizmo = gizmoManager.gizmos.scaleGizmo;
        if (scaleGizmo) {
          scaleGizmo.xGizmo.coloredMaterial.diffuseColor = new Color3(
            0.96078431,
            0.38039215,
            0.0784313725490196
          ); // Red for X axis
          scaleGizmo.yGizmo.coloredMaterial.diffuseColor = new Color3(
            0.17254901,
            0.57254901,
            0.9607843137254902
          ); // Green for Y axis
          scaleGizmo.zGizmo.coloredMaterial.diffuseColor = new Color3(
            0.30980392,
            0.6666666666666666,
            0.5333333333333333
          ); // Blue for Z axis

          if (
            meshMetaData &&
            !meshMetaData.manuallyTransformed &&
            meshMetaData.manuallyTransformed !== undefined
          ) {
            this.registerGizmoInteraction(mesh, scaleGizmo.xGizmo);
            this.registerGizmoInteraction(mesh, scaleGizmo.yGizmo);
            this.registerGizmoInteraction(mesh, scaleGizmo.zGizmo);
          }
        }
        break;
    }

    // Attach the gizmo to the selected mesh
    gizmoManager.attachToMesh(mesh);

    // Store the gizmo manager in the mesh's metadata for later access
    mesh.metadata.gizmoManager = gizmoManager;
  };

  // Function to disable the position gizmo for a mesh
  private disableGizmo = (mesh: AbstractMesh) => {
    const meshMetaData = mesh.metadata;

    if (!meshMetaData) {
      return;
    }

    // Remove the drag behavior
    const dragBehavior = meshMetaData.dragBehavior;
    if (dragBehavior) {
      mesh.removeBehavior(dragBehavior);
    }

    const gizmoManager = meshMetaData.gizmoManager;

    const gizmos = ["xGizmo", "yGizmo", "zGizmo"];
    for (const gizmo of gizmos) {
      const currentGizmo =
        meshMetaData?.gizmoManager?.gizmos?.positionGizmo?.[gizmo];
      if (currentGizmo) {
        currentGizmo.dragBehavior?.onDragObservable.clear();
        currentGizmo.dragBehavior?.onDragStartObservable.clear();
        currentGizmo.dragBehavior?.onDragEndObservable.clear();
      }
    }

    if (gizmoManager) {
      // Detach the gizmo from the mesh and disable it
      gizmoManager.attachToMesh(null);
      gizmoManager.dispose(); // Clean up the gizmo manager
    }

    // Remove gizmo metadata to avoid memory leaks
    meshMetaData.gizmoManager = undefined;
    meshMetaData.dragBehavior = undefined;
  };

  loader = async (
    type: MeshTypes,
    meshLabel: string,
    meshName: string,
    defaultMeshPlacement: DefaultMeshPlacementType,
    meshPath: string,
    meshFile: string,
    faceId?: number,
    effectType?: EffectType,
    positionStyle?: PositionStyle,
    initPosition?: [number, number, number],
    initScale?: [number, number, number],
    initRotation?: [number, number, number]
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
        meshFile
      );

      for (const mesh of newMesh) {
        this.ambientLightThreeDimMeshes?.includedOnlyMeshes.push(mesh);
      }

      newMesh[0].metadata = {
        meshLabel,
        isGizmoEnabled: false,
        gizmoState: "none",
        meshType: "gltf",
        defaultMeshPlacement,
        faceId,
        effectType,
        initScale,
        positionStyle,
        manuallyTransformed: false,
      };
      this.meshes["3D"][meshLabel] = newMesh;

      // Check if the mesh is loaded
      if (newMesh) {
        this.applyMeshAttributes(
          newMesh[0],
          initPosition,
          initScale,
          initRotation
        );
        for (const mesh of newMesh) {
          this.applyMeshActions(mesh, newMesh[0]);
        }
      } else {
        console.error(`Mesh ${meshName} not found after loading.`);
      }
    }
    if (type === "2D") {
      const newMesh = await this.meshLoaders.load2D(
        meshLabel,
        meshPath,
        meshFile
      );

      this.ambientLightTwoDimMeshes?.includedOnlyMeshes.push(newMesh);

      newMesh.metadata = {
        meshLabel,
        isGizmoEnabled: false,
        gizmoState: "none",
        meshType: "2D",
        defaultMeshPlacement,
        faceId,
        effectType,
        initScale,
        positionStyle,
        manuallyTransformed: false,
      };
      this.meshes["2D"][meshLabel] = newMesh;

      // Check if the mesh is loaded
      if (newMesh) {
        this.applyMeshAttributes(
          newMesh,
          initPosition,
          initScale,
          initRotation
        );
        this.applyMeshActions(newMesh);
      } else {
        console.error(`Mesh ${meshName} not found after loading.`);
      }
    }
  };

  deleteMesh = (mesh: AbstractMesh) => {
    const meshMetaData = mesh.metadata;

    if (!meshMetaData || !mesh) {
      return;
    }

    this.disableGizmo(mesh);

    // Remove the mesh from the collection
    if (meshMetaData) {
      const meshLabel = meshMetaData.meshLabel;
      if (meshLabel in this.meshes["3D"]) {
        delete this.meshes["3D"][meshLabel];
      } else if (meshLabel in this.meshes["2D"]) {
        delete this.meshes["2D"][meshLabel];
      }
    }

    // Stop animations associated with the mesh
    const animationGroups = this.scene.animationGroups;
    animationGroups.forEach((animGroup) => {
      animGroup.targetedAnimations.forEach((targetedAnim) => {
        if (
          targetedAnim.target.metadata &&
          meshMetaData.meshLabel !== undefined &&
          meshMetaData.meshLabel === targetedAnim.target.metadata.meshLabel
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
    this.selectedMesh = null;
  };
}

export default BabylonMeshes;
