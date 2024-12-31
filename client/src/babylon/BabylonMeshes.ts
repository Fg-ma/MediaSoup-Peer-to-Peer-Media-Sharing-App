import { NormalizedLandmarkList } from "@mediapipe/face_mesh";
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
  Texture,
  VertexData,
  Mesh,
  StandardMaterial,
  UniversalCamera,
  IAxisDragGizmo,
} from "@babylonjs/core";
import { Delaunay } from "d3-delaunay";
import { UserMediaType } from "../context/mediaContext/typeConstant";
import MeshLoaders from "./MeshLoaders";
import {
  DefaultMeshPlacementType,
  EffectType,
  PositionStyle,
} from "./BabylonScene";
import { baseMaskData } from "./meshes";
import { GizmoStateTypes, MeshJSON, MeshTypes, Point3D } from "./typeContant";

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
    private camera: UniversalCamera,
    private canvas: HTMLCanvasElement,
    private ambientLightThreeDimMeshes: HemisphericLight | undefined,
    private ambientLightTwoDimMeshes: HemisphericLight | undefined,
    private threeDimMeshesZCoord: number,
    private userMedia: React.MutableRefObject<UserMediaType>
  ) {
    this.meshLoaders = new MeshLoaders(this.scene);

    this.scene.onKeyboardObservable.add((kbInfo) => {
      kbInfo.event.preventDefault();

      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN: {
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
        }
        case KeyboardEventTypes.KEYUP: {
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
            this.togglePlayAudioOnMesh(this.selectedMesh);
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

  private togglePlayAudioOnMesh = (mesh: AbstractMesh) => {
    const meshMetaData = mesh.metadata;

    if (meshMetaData.audioURL === undefined) {
      return;
    }

    this.userMedia.current.audio?.audioEffects.fgAssetSoundEffects.toggleAudio(
      meshMetaData.audioURL
    );
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
            meshLabel !== undefined &&
            meshLabel === targetedAnim.target.metadata.meshLabel
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
  private registerGizmoInteraction = (
    mesh: AbstractMesh,
    gizmo: IAxisDragGizmo
  ) => {
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
      case "position": {
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
        const dragBehavior = new PointerDragBehavior({
          dragPlaneNormal: new Vector3(0, 0, 1),
        });

        // Attach the drag behavior to the mesh
        mesh.addBehavior(dragBehavior);

        // Store the drag behavior in the mesh's metadata for later access
        meshMetaData.dragBehavior = dragBehavior;
        break;
      }
      case "rotation": {
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
      }
      case "scale": {
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
    shiftX?: number,
    shiftY?: number,
    audioURL?: string,
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
        shiftX,
        shiftY,
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
        shiftX,
        shiftY,
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

  private loadMeshJSON = async (url: string): Promise<MeshJSON | undefined> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return await response.json();
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return undefined;
    }
  };

  private getTriangles = (
    geometryPoints: Point3D[],
    uvPoints: number[],
    zPosition: number
  ) => {
    const geometryDelaunay = Delaunay.from(
      geometryPoints,
      (p) => p.x,
      (p) => p.y
    );
    const geometryTrianglesIndices = geometryDelaunay.triangles;

    const numVertices = geometryPoints.length;
    const geometryTriangles: number[][] = []; // Changed to 2D array
    const uvTriangles: number[] = [];
    const vertexNormals: Float32Array = new Float32Array(numVertices * 3).fill(
      0
    );
    const indices: number[] = [];

    // Calculate face normals and accumulate them for vertex normals
    for (let i = 0; i < geometryTrianglesIndices.length; i += 3) {
      const index0 = geometryTrianglesIndices[i];
      const index1 = geometryTrianglesIndices[i + 1];
      const index2 = geometryTrianglesIndices[i + 2];

      indices.push(i, i + 1, i + 2);

      const v0 = geometryPoints[index0];
      const v1 = geometryPoints[index1];
      const v2 = geometryPoints[index2];

      const edge1x = v1.x - v0.x;
      const edge1y = v1.y - v0.y;
      const edge1z = v1.z - v0.z;

      const edge2x = v2.x - v0.x;
      const edge2y = v2.y - v0.y;
      const edge2z = v2.z - v0.z;

      const normalX = edge1y * edge2z - edge1z * edge2y;
      const normalY = edge1z * edge2x - edge1x * edge2z;
      const normalZ = edge1x * edge2y - edge1y * edge2x;

      const length = Math.sqrt(
        normalX * normalX + normalY * normalY + normalZ * normalZ
      );
      const invLength = 1 / length;
      const normalizedNormalX = normalX * invLength;
      const normalizedNormalY = normalY * invLength;
      const normalizedNormalZ = normalZ * invLength;

      // Accumulate normals for vertices
      vertexNormals[index0 * 3] += normalizedNormalX;
      vertexNormals[index0 * 3 + 1] += normalizedNormalY;
      vertexNormals[index0 * 3 + 2] += normalizedNormalZ;

      vertexNormals[index1 * 3] += normalizedNormalX;
      vertexNormals[index1 * 3 + 1] += normalizedNormalY;
      vertexNormals[index1 * 3 + 2] += normalizedNormalZ;

      vertexNormals[index2 * 3] += normalizedNormalX;
      vertexNormals[index2 * 3 + 1] += normalizedNormalY;
      vertexNormals[index2 * 3 + 2] += normalizedNormalZ;

      // Store vertex positions in triangles as 2D arrays
      geometryTriangles.push(
        [
          -this.screenSpaceToSceneSpaceX(zPosition, v0.x),
          this.screenSpaceToSceneSpaceY(zPosition, v0.y),
          v0.z,
        ],
        [
          -this.screenSpaceToSceneSpaceX(zPosition, v1.x),
          this.screenSpaceToSceneSpaceY(zPosition, v1.y),
          v1.z,
        ],
        [
          -this.screenSpaceToSceneSpaceX(zPosition, v2.x),
          this.screenSpaceToSceneSpaceY(zPosition, v2.y),
          v2.z,
        ]
      );

      // Store UV coords
      uvTriangles.push(
        uvPoints[index0 * 2],
        -uvPoints[index0 * 2 + 1],
        uvPoints[index1 * 2],
        -uvPoints[index1 * 2 + 1],
        uvPoints[index2 * 2],
        -uvPoints[index2 * 2 + 1]
      );
    }

    // Normalize vertex normals
    for (let i = 0; i < numVertices; i++) {
      const nx = vertexNormals[i * 3];
      const ny = vertexNormals[i * 3 + 1];
      const nz = vertexNormals[i * 3 + 2];
      const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const invLength = 1 / length;
      vertexNormals[i * 3] *= invLength;
      vertexNormals[i * 3 + 1] *= invLength;
      vertexNormals[i * 3 + 2] *= invLength;
    }

    // Flatten vertex normals into an array, repeating for each vertex in each triangle
    const normals: number[] = [];
    for (let i = 0; i < geometryTrianglesIndices.length; i++) {
      const vertexIndex = geometryTrianglesIndices[i];
      normals.push(
        -vertexNormals[vertexIndex * 3],
        -vertexNormals[vertexIndex * 3 + 1],
        vertexNormals[vertexIndex * 3 + 2]
      );
    }

    return { geometryTriangles, uvTriangles, normals, indices };
  };

  // Transform X coordinate from screen space to scene space
  private screenSpaceToSceneSpaceX = (zPosition: number, value: number) => {
    const cameraFOV = this.camera.fov; // FOV in radians
    const aspectRatio = this.canvas.width / this.canvas.height;

    // Calculate the vertical extent at the current zPosition
    const verticalExtent = Math.tan(cameraFOV / 2) * Math.abs(zPosition);

    // Calculate horizontal extent based on aspect ratio
    const horizontalExtent = verticalExtent * aspectRatio;

    // Convert normalized screen X coordinate to world X coordinate
    return value * horizontalExtent;
  };

  // Transform Y coordinate from screen space to scene space
  private screenSpaceToSceneSpaceY = (zPosition: number, value: number) => {
    const cameraFOV = this.camera.fov; // FOV in radians

    // Calculate the vertical extent at the current zPosition
    const verticalExtent = Math.tan(cameraFOV / 2) * (Math.abs(zPosition) + 4);

    // Convert normalized screen Y coordinate to world Y coordinate
    return value * verticalExtent;
  };

  createFaceMesh = async (
    faceId: number,
    liveLandmarks: NormalizedLandmarkList
  ) => {
    // Load uv mesh data
    if (!baseMaskData.data) {
      baseMaskData.data = await this.loadMeshJSON(baseMaskData["3Durl"]);
    }

    // Get the triangles
    const { geometryTriangles, uvTriangles, normals, indices } =
      this.getTriangles(
        liveLandmarks,
        baseMaskData.data!.uv_faces,
        this.threeDimMeshesZCoord
      );

    // Flatten the geometry data for Babylon.js
    const vertices = geometryTriangles.flat();
    const uvs = uvTriangles.flat();
    const normalData = normals.flat();

    // Create Babylon.js Mesh
    const faceMesh = new Mesh("faceMesh", this.scene);
    faceMesh.position = new Vector3(0, 0, this.threeDimMeshesZCoord);

    faceMesh.metadata = {
      meshLabel: `baseMask.${faceId}`,
      isGizmoEnabled: false,
      gizmoState: "none",
      meshType: "3D",
      faceId,
      effectType: "masks",
      positionStyle: "landmarks",
      manuallyTransformed: false,
    };

    // Define vertex data
    const vertexData = new VertexData();
    vertexData.positions = vertices;
    vertexData.indices = indices;
    vertexData.uvs = uvs;
    vertexData.normals = normalData;

    // Apply vertex data to the mesh
    vertexData.applyToMesh(faceMesh);

    // Create material with texture
    const material = new StandardMaterial("faceMaterial", this.scene);
    material.diffuseTexture = new Texture(baseMaskData["2Durl"], this.scene);
    material.diffuseTexture.hasAlpha = true;
    material.backFaceCulling = false; // Disable back-face culling
    faceMesh.material = material;

    this.ambientLightTwoDimMeshes?.includedOnlyMeshes.push(faceMesh);
  };

  updateFaceMesh = async (
    mesh: AbstractMesh,
    liveLandmarks: NormalizedLandmarkList
  ) => {
    // Load uv mesh data
    if (!baseMaskData.data) {
      baseMaskData.data = await this.loadMeshJSON(baseMaskData["3Durl"]);
    }

    // Get the triangles
    const { geometryTriangles, uvTriangles, normals, indices } =
      this.getTriangles(
        liveLandmarks,
        baseMaskData.data!.uv_faces,
        mesh.position.z
      );

    // Flatten the geometry data for Babylon.js
    const vertices = geometryTriangles.flat();
    const uvs = uvTriangles.flat();
    const normalData = normals.flat();

    // Define vertex data
    const vertexData = new VertexData();
    vertexData.positions = vertices;
    vertexData.indices = indices;
    vertexData.uvs = uvs;
    vertexData.normals = normalData;

    // Apply vertex data to the mesh
    vertexData.applyToMesh(mesh as Mesh);
  };
}

export default BabylonMeshes;
