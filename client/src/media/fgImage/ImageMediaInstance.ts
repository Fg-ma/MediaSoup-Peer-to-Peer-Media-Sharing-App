import { NormalizedLandmarkListList } from "@mediapipe/face_mesh";
import {
  UserEffectsStylesType,
  UserEffectsType,
  defaultImageEffects,
  defaultImageEffectsStyles,
  ImageEffectTypes,
  ImageEffectStylesType,
} from "../../../../universal/effectsTypeConstant";
import BabylonScene, {
  EffectType,
  validEffectTypes,
} from "../../babylon/BabylonScene";
import UserDevice from "../../lib/UserDevice";
import Deadbanding from "../../babylon/Deadbanding";
import { UserMediaType } from "../../context/mediaContext/typeConstant";
import FaceLandmarks from "../../babylon/FaceLandmarks";
import assetMeshes from "../../babylon/meshes";
import ImageMedia, { ImageListenerTypes } from "./ImageMedia";

class ImageMediaInstance {
  instanceCanvas: HTMLCanvasElement;
  instanceImage: HTMLImageElement | undefined;

  babylonScene: BabylonScene | undefined;

  private effects: {
    [imageEffect in ImageEffectTypes]?: boolean;
  } = {};

  private maxFaces: [number] = [1];
  detectedFaces: number = 0;

  private faceLandmarks: FaceLandmarks;

  private faceMeshWorker: Worker;
  private faceMeshResults: NormalizedLandmarkListList[] = [];
  private faceMeshProcessing = [false];
  private faceDetectionWorker: Worker;
  private faceDetectionProcessing = [false];
  private selfieSegmentationWorker: Worker;
  private selfieSegmentationResults: ImageData[] = [];
  private selfieSegmentationProcessing = [false];

  private faceCountChangeListeners: Set<(facesDetected: number) => void> =
    new Set();

  forcingFaces = false;

  constructor(
    public imageMedia: ImageMedia,
    public imageInstanceId: string,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userDevice: UserDevice,
    private deadbanding: Deadbanding,
    private userMedia: React.MutableRefObject<UserMediaType>,
    public initPositioning: {
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    },
  ) {
    if (!this.userEffects.current.image[this.imageInstanceId]) {
      this.userEffects.current.image[this.imageInstanceId] =
        structuredClone(defaultImageEffects);
    }

    if (!this.userEffectsStyles.current.image[this.imageInstanceId]) {
      this.userEffectsStyles.current.image[this.imageInstanceId] =
        structuredClone(defaultImageEffectsStyles);
    }

    this.instanceCanvas = document.createElement("canvas");
    this.instanceCanvas.classList.add("babylonJS-canvas");
    this.instanceCanvas.style.height = "100%";
    this.instanceCanvas.style.width = "auto";
    this.instanceCanvas.style.objectFit = "contain";

    this.faceLandmarks = new FaceLandmarks(
      true,
      "image",
      this.imageInstanceId,
      this.deadbanding,
    );

    this.faceMeshWorker = new Worker(
      new URL("../../webWorkers/faceMeshWebWorker.worker", import.meta.url),
      {
        type: "module",
      },
    );

    this.faceMeshWorker.onmessage = (event) => {
      switch (event.data.message) {
        case "PROCESSED_FRAME":
          this.faceMeshProcessing[0] = false;
          if (event.data.results) {
            if (!this.faceMeshResults) {
              this.faceMeshResults = [];
            }
            this.faceMeshResults[0] = event.data.results;
          }
          break;
        default:
          break;
      }
    };

    this.faceDetectionWorker = new Worker(
      new URL(
        "../../webWorkers/faceDetectionWebWorker.worker",
        import.meta.url,
      ),
      {
        type: "module",
      },
    );

    this.faceDetectionWorker.onmessage = (event) => {
      switch (event.data.message) {
        case "FACES_DETECTED": {
          this.faceDetectionProcessing[0] = false;
          const detectedFaces = event.data.numFacesDetected;
          this.detectedFaces = detectedFaces === undefined ? 0 : detectedFaces;

          if (detectedFaces !== this.maxFaces[0]) {
            this.maxFaces[0] = detectedFaces;

            this.faceMeshWorker.postMessage({
              message: "CHANGE_MAX_FACES",
              newMaxFace: detectedFaces,
            });
            this.rectifyEffectMeshCount();

            this.faceCountChangeListeners.forEach((listener) => {
              listener(detectedFaces);
            });
          }
          break;
        }
        default:
          break;
      }
    };

    this.selfieSegmentationWorker = new Worker(
      new URL(
        "../../webWorkers/selfieSegmentationWebWorker.worker",
        import.meta.url,
      ),
      {
        type: "module",
      },
    );

    this.selfieSegmentationWorker.onmessage = (event) => {
      switch (event.data.message) {
        case "PROCESSED_FRAME":
          this.selfieSegmentationProcessing[0] = false;
          if (event.data.results) {
            this.selfieSegmentationResults[0] = event.data.results;
          }
          break;
        default:
          break;
      }
    };

    if (this.imageMedia.image) {
      this.instanceImage = this.imageMedia.image?.cloneNode(
        true,
      ) as HTMLImageElement;

      this.instanceImage.onload = () => {
        if (this.instanceImage) {
          this.instanceCanvas.width = this.instanceImage.width;
          this.instanceCanvas.height = this.instanceImage.height;
        }
      };

      if (this.instanceImage)
        this.babylonScene = new BabylonScene(
          this.imageInstanceId,
          "image",
          this.instanceCanvas,
          this.instanceImage,
          this.faceLandmarks,
          this.effects,
          this.userEffectsStyles.current.image[this.imageInstanceId],
          this.faceMeshWorker,
          this.faceMeshResults,
          this.faceMeshProcessing,
          this.faceDetectionWorker,
          this.faceDetectionProcessing,
          this.selfieSegmentationWorker,
          this.selfieSegmentationResults,
          this.selfieSegmentationProcessing,
          this.userDevice,
          this.maxFaces,
          this.userMedia,
        );
    }
    this.imageMedia.addImageListener(this.handleImageMessages);
  }

  deconstructor() {
    if (this.instanceImage) {
      this.instanceImage.src = "";
      this.instanceImage = undefined;
    }

    this.imageMedia.removeImageListener(this.handleImageMessages);

    // Remove canvas element
    this.instanceCanvas.remove();

    // Terminate workers to prevent memory leaks
    if (this.faceMeshWorker) {
      this.faceMeshWorker.terminate();
    }
    if (this.faceDetectionWorker) {
      this.faceDetectionWorker.terminate();
    }
    if (this.selfieSegmentationWorker) {
      this.selfieSegmentationWorker.terminate();
    }

    // Call the BabylonScene deconstructor
    this.babylonScene?.deconstructor();

    this.faceCountChangeListeners.clear();
  }

  private handleImageMessages = (event: ImageListenerTypes) => {
    switch (event.type) {
      case "downloadComplete":
        this.onDownloadComplete();
        break;
      default:
        break;
    }
  };

  private onDownloadComplete = () => {
    this.instanceImage = this.imageMedia.image?.cloneNode(
      true,
    ) as HTMLImageElement;

    this.instanceImage.onload = () => {
      if (this.instanceImage) {
        this.instanceCanvas.width = this.instanceImage.width;
        this.instanceCanvas.height = this.instanceImage.height;
      }
    };

    if (!this.babylonScene && this.instanceImage) {
      this.babylonScene = new BabylonScene(
        this.imageInstanceId,
        "image",
        this.instanceCanvas,
        this.instanceImage,
        this.faceLandmarks,
        this.effects,
        this.userEffectsStyles.current.image[this.imageInstanceId],
        this.faceMeshWorker,
        this.faceMeshResults,
        this.faceMeshProcessing,
        this.faceDetectionWorker,
        this.faceDetectionProcessing,
        this.selfieSegmentationWorker,
        this.selfieSegmentationResults,
        this.selfieSegmentationProcessing,
        this.userDevice,
        this.maxFaces,
        this.userMedia,
      );
    }

    this.updateAllEffects();
  };

  addFaceCountChangeListener = (
    listener: (facesDetected: number) => void,
  ): void => {
    this.faceCountChangeListeners.add(listener);
  };

  removeFaceCountChangeListener = (
    listener: (facesDetected: number) => void,
  ): void => {
    this.faceCountChangeListeners.delete(listener);
  };

  private rectifyEffectMeshCount = () => {
    if (!this.babylonScene) {
      return;
    }

    for (const effect in this.effects) {
      if (
        !this.effects[effect as ImageEffectTypes] ||
        !validEffectTypes.includes(effect as EffectType)
      ) {
        continue;
      }

      let count = 0;

      for (const mesh of this.babylonScene.scene.meshes) {
        if (mesh.metadata && mesh.metadata.effectType === effect) {
          count++;
        }
      }

      if (count < this.maxFaces[0]) {
        const currentEffectStyle =
          this.userEffectsStyles.current.image[this.imageInstanceId][
            effect as EffectType
          ];

        if (effect === "masks" && currentEffectStyle.style === "baseMask") {
          for (let i = count; i < this.maxFaces[0]; i++) {
            this.babylonScene.babylonMeshes.createFaceMesh(i, []);
          }
        } else {
          for (let i = count; i < this.maxFaces[0]; i++) {
            const meshData =
              // @ts-expect-error: ts can't verify effect and style correlation
              assetMeshes[effect as EffectType][currentEffectStyle.style];

            this.babylonScene.createMesh(
              meshData.meshType,
              meshData.meshLabel + "." + i,
              "",
              meshData.defaultMeshPlacement,
              meshData.meshPath,
              meshData.meshFile,
              i,
              effect as EffectType,
              "faceTrack",
              meshData.transforms.offsetX,
              meshData.transforms.offsetY,
              meshData.soundEffectPath,
              [0, 0, this.babylonScene.threeDimMeshesZCoord],
              meshData.initScale,
              meshData.initRotation,
            );
          }
        }
      } else if (count > this.maxFaces[0]) {
        for (let i = this.maxFaces[0]; i < count; i++) {
          for (const mesh of this.babylonScene.scene.meshes) {
            if (
              mesh.metadata &&
              mesh.metadata.effectType === effect &&
              mesh.metadata.faceId === i
            ) {
              this.babylonScene.babylonMeshes.deleteMesh(mesh);
            }
          }
        }
      }
    }
  };

  clearAllEffects = () => {
    if (!this.babylonScene) return;

    Object.entries(this.effects).map(([effect, value]) => {
      if (value) {
        this.userEffects.current.image[this.imageInstanceId][
          effect as EffectType
        ] = false;

        if (effect === "tint") {
          this.babylonScene?.toggleTintPlane(false);
        } else if (effect === "blur") {
          this.babylonScene?.toggleBlurEffect(false);
        } else if (effect === "pause") {
          this.babylonScene?.togglePauseEffect(false);
        } else if (effect === "hideBackground") {
          this.babylonScene?.toggleHideBackgroundPlane(false);
        } else if (effect === "postProcess") {
          this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
            false,
          );
        } else {
          this.babylonScene?.deleteEffectMeshes(effect);
        }
      }
    });

    this.effects = structuredClone(defaultImageEffects);

    this.deadbanding.update("capture", this.imageInstanceId, this.effects);
  };

  updateAllEffects = (oldEffectStyles?: ImageEffectStylesType) => {
    if (!this.babylonScene) return;

    Object.entries(this.userEffects.current.image[this.imageInstanceId]).map(
      ([effect, value]) => {
        if (this.effects[effect as EffectType] && !value) {
          this.effects[effect as ImageEffectTypes] = false;

          if (effect === "tint") {
            this.babylonScene?.toggleTintPlane(false);
          } else if (effect === "blur") {
            this.babylonScene?.toggleBlurEffect(false);
          } else if (effect === "hideBackground") {
            this.babylonScene?.toggleHideBackgroundPlane(false);
          } else if (effect === "postProcess") {
            this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
              false,
            );
          } else {
            this.babylonScene?.deleteEffectMeshes(effect);
          }
        } else if (!this.effects[effect as EffectType] && value) {
          this.effects[effect as EffectType] = true;

          if (validEffectTypes.includes(effect as EffectType)) {
            if (
              effect !== "masks" ||
              this.userEffectsStyles.current.image[this.imageInstanceId].masks
                .style !== "baseMask"
            ) {
              this.drawNewEffect(effect as EffectType);
            } else {
              this.babylonScene?.deleteEffectMeshes(effect);

              if (this.effects[effect]) {
                for (let i = 0; i < this.maxFaces[0]; i++) {
                  this.babylonScene?.babylonMeshes.createFaceMesh(i, []);
                }
              }
            }
          }

          if (effect === "tint") {
            this.setTintColor(
              this.userEffectsStyles.current.image[this.imageInstanceId][effect]
                .color,
            );
            this.babylonScene?.toggleTintPlane(
              this.effects[effect] ?? false,
              this.hexToNormalizedRgb(
                this.userEffectsStyles.current.image[this.imageInstanceId][
                  effect
                ].color,
              ),
            );
          }

          if (effect === "blur") {
            this.babylonScene?.toggleBlurEffect(this.effects[effect] ?? false);
          }

          if (effect === "hideBackground") {
            if (
              this.userEffectsStyles.current.image[this.imageInstanceId][effect]
                .style === "color"
            ) {
              this.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
                this.userEffectsStyles.current.image[this.imageInstanceId][
                  effect
                ].color,
              );
            } else {
              this.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
                this.userEffectsStyles.current.image[this.imageInstanceId][
                  effect
                ].style,
              );
            }

            this.babylonScene?.toggleHideBackgroundPlane(
              this.effects[effect] ?? false,
            );
          }

          if (effect === "postProcess") {
            this.babylonScene?.babylonShaderController.swapPostProcessEffects(
              this.userEffectsStyles.current.image[this.imageInstanceId][effect]
                .style,
            );

            this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
              this.effects[effect] ?? false,
            );
          }
        } else if (this.effects[effect as EffectType] && value) {
          if (
            validEffectTypes.includes(effect as EffectType) &&
            (!oldEffectStyles ||
              oldEffectStyles[effect as EffectType].style !==
                this.userEffectsStyles.current.image[this.imageInstanceId][
                  effect as EffectType
                ].style)
          ) {
            if (
              effect !== "masks" ||
              this.userEffectsStyles.current.image[this.imageInstanceId].masks
                .style !== "baseMask"
            ) {
              this.babylonScene?.deleteEffectMeshes(effect);

              this.drawNewEffect(effect as EffectType);
            } else {
              this.babylonScene?.deleteEffectMeshes(effect);

              if (this.effects[effect]) {
                for (let i = 0; i < this.maxFaces[0]; i++) {
                  this.babylonScene?.babylonMeshes.createFaceMesh(i, []);
                }
              }
            }
          }

          if (
            effect === "tint" &&
            (!oldEffectStyles ||
              oldEffectStyles[effect].color !==
                this.userEffectsStyles.current.image[this.imageInstanceId][
                  effect
                ].color)
          ) {
            this.babylonScene?.toggleTintPlane(false);

            this.setTintColor(
              this.userEffectsStyles.current.image[this.imageInstanceId][effect]
                .color,
            );
            this.babylonScene?.toggleTintPlane(
              this.effects[effect] ?? false,
              this.hexToNormalizedRgb(
                this.userEffectsStyles.current.image[this.imageInstanceId][
                  effect
                ].color,
              ),
            );
          }

          if (
            effect === "hideBackground" &&
            (!oldEffectStyles ||
              oldEffectStyles[effect].color !==
                this.userEffectsStyles.current.image[this.imageInstanceId][
                  effect
                ].color ||
              oldEffectStyles[effect].style !==
                this.userEffectsStyles.current.image[this.imageInstanceId][
                  effect
                ].style)
          ) {
            this.babylonScene?.toggleHideBackgroundPlane(false);

            if (
              this.userEffectsStyles.current.image[this.imageInstanceId][effect]
                .style === "color"
            ) {
              this.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
                this.userEffectsStyles.current.image[this.imageInstanceId][
                  effect
                ].color,
              );
            } else {
              this.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
                this.userEffectsStyles.current.image[this.imageInstanceId][
                  effect
                ].style,
              );
            }
            this.babylonScene?.toggleHideBackgroundPlane(
              this.effects[effect] ?? false,
            );
          }

          if (
            effect === "postProcess" &&
            (!oldEffectStyles ||
              oldEffectStyles[effect].style !==
                this.userEffectsStyles.current.image[this.imageInstanceId][
                  effect
                ].style)
          ) {
            this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
              false,
            );

            this.babylonScene?.babylonShaderController.swapPostProcessEffects(
              this.userEffectsStyles.current.image[this.imageInstanceId][effect]
                .style,
            );
            this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
              this.effects[effect] ?? false,
            );
          }
        }
      },
    );

    this.deadbanding.update("image", this.imageInstanceId, this.effects);

    this.babylonScene.imageAlreadyProcessed[0] = 1;
  };

  changeEffects = (
    effect: ImageEffectTypes,
    tintColor?: string,
    blockStateChange: boolean = false,
  ) => {
    if (!this.babylonScene) return;

    if (this.effects[effect] !== undefined) {
      if (!blockStateChange) {
        this.effects[effect] = !this.effects[effect];
      }
    } else {
      this.effects[effect] = true;
    }

    if (validEffectTypes.includes(effect as EffectType)) {
      if (
        effect !== "masks" ||
        this.userEffectsStyles.current.image[this.imageInstanceId].masks
          .style !== "baseMask"
      ) {
        this.drawNewEffect(effect as EffectType);
      } else {
        this.babylonScene?.deleteEffectMeshes(effect);

        if (this.effects[effect]) {
          for (let i = 0; i < this.maxFaces[0]; i++) {
            this.babylonScene?.babylonMeshes.createFaceMesh(i, []);
          }
        }
      }
    }
    this.deadbanding.update("image", this.imageInstanceId, this.effects);

    if (tintColor) {
      this.setTintColor(tintColor);
    }
    if (effect === "tint" && tintColor) {
      this.babylonScene?.toggleTintPlane(
        this.effects[effect],
        this.hexToNormalizedRgb(tintColor),
      );
    }

    if (effect === "blur") {
      this.babylonScene?.toggleBlurEffect(this.effects[effect]);
    }

    if (effect === "hideBackground") {
      this.babylonScene?.toggleHideBackgroundPlane(false);

      if (
        this.userEffectsStyles.current.image[this.imageInstanceId][effect]
          .style === "color"
      ) {
        this.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
          this.userEffectsStyles.current.image[this.imageInstanceId][effect]
            .color,
        );
      } else {
        this.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
          this.userEffectsStyles.current.image[this.imageInstanceId][effect]
            .style,
        );
      }

      if (this.effects[effect]) {
        this.babylonScene?.toggleHideBackgroundPlane(true);
      }
    }

    if (effect === "postProcess") {
      this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
        this.effects[effect],
      );
    }

    this.babylonScene.imageAlreadyProcessed[0] = 1;
  };

  drawNewEffect = (effect: EffectType) => {
    const currentStyle =
      this.userEffectsStyles.current.image?.[this.imageInstanceId][effect];

    if (!currentStyle) {
      return;
    }

    // @ts-expect-error: ts can't verify effect and style correlation
    const meshData = assetMeshes[effect][currentStyle.style];

    // Delete old meshes
    this.babylonScene?.deleteEffectMeshes(effect);

    if (this.effects[effect]) {
      this.babylonScene?.createEffectMeshes(
        meshData.meshType,
        meshData.meshLabel,
        "",
        meshData.defaultMeshPlacement,
        meshData.meshPath,
        meshData.meshFile,
        effect,
        "faceTrack",
        meshData.transforms.offsetX,
        meshData.transforms.offsetY,
        meshData.soundEffectPath,
        [0, 0, this.babylonScene.threeDimMeshesZCoord],
        meshData.initScale,
        meshData.initRotation,
      );
    }
  };

  setTintColor = (newTintColor: string) => {
    this.babylonScene?.setTintColor(this.hexToNormalizedRgb(newTintColor));
  };

  private hexToNormalizedRgb = (hex: string): [number, number, number] => {
    // Remove the leading '#' if present
    hex = hex.replace(/^#/, "");

    // Parse the r, g, b values from the hex string
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r / 255, g / 255, b / 255];
  };

  forceRedetectFaces = () => {
    if (this.babylonScene) this.babylonScene.imageAlreadyProcessed[0] = 1;
  };
}

export default ImageMediaInstance;
