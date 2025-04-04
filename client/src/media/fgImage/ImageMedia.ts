import { NormalizedLandmarkListList } from "@mediapipe/face_mesh";
import {
  UserEffectsStylesType,
  UserEffectsType,
  defaultImageEffects,
  defaultImageEffectsStyles,
  ImageEffectTypes,
  ImageEffectStylesType,
} from "../../../../universal/effectsTypeConstant";
import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import BabylonScene, {
  EffectType,
  validEffectTypes,
} from "../../babylon/BabylonScene";
import UserDevice from "../../lib/UserDevice";
import Deadbanding from "../../babylon/Deadbanding";
import { UserMediaType } from "../../context/mediaContext/typeConstant";
import FaceLandmarks from "../../babylon/FaceLandmarks";
import assetMeshes from "../../babylon/meshes";
import { StaticContentTypes } from "../../../../universal/typeConstant";

class ImageMedia {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;

  private fileChunks: Uint8Array[] = [];
  private totalSize = 0;
  private blobURL: string | undefined;

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
    public imageId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private getImage: (
      contentType: StaticContentTypes,
      contentId: string,
      key: string
    ) => void,
    private addMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void
    ) => void,
    private removeMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void
    ) => void,
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
    }
  ) {
    if (!this.userEffects.current.image[this.imageId]) {
      this.userEffects.current.image[this.imageId] =
        structuredClone(defaultImageEffects);
    }

    if (!this.userEffectsStyles.current.image[this.imageId]) {
      this.userEffectsStyles.current.image[this.imageId] = structuredClone(
        defaultImageEffectsStyles
      );
    }

    this.image = document.createElement("img");
    this.image.onloadedmetadata = () => {
      this.canvas.width = this.image.width;
      this.canvas.height = this.image.height;
    };

    this.getImage("image", this.imageId, this.filename);
    this.addMessageListener(this.getImageListener);

    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("babylonJS-canvas");
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.objectFit = "contain";

    this.faceLandmarks = new FaceLandmarks(
      true,
      "image",
      this.imageId,
      this.deadbanding
    );

    this.faceMeshWorker = new Worker(
      new URL("../../webWorkers/faceMeshWebWorker.worker", import.meta.url),
      {
        type: "module",
      }
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
        import.meta.url
      ),
      {
        type: "module",
      }
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
        import.meta.url
      ),
      {
        type: "module",
      }
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
  }

  deconstructor() {
    this.image.src = "";

    if (this.blobURL) URL.revokeObjectURL(this.blobURL);

    // Remove canvas element
    this.canvas.remove();

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

  addFaceCountChangeListener = (
    listener: (facesDetected: number) => void
  ): void => {
    this.faceCountChangeListeners.add(listener);
  };

  removeFaceCountChangeListener = (
    listener: (facesDetected: number) => void
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
          this.userEffectsStyles.current.image[this.imageId][
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
              meshData.initRotation
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

  private getImageListener = (message: IncomingTableStaticContentMessages) => {
    if (message.type === "chunk") {
      const { contentType, contentId, key } = message.header;

      if (
        contentType !== "image" ||
        contentId !== this.imageId ||
        key !== this.filename
      ) {
        return;
      }

      const chunkData = new Uint8Array(message.data.chunk.data);
      this.fileChunks.push(chunkData);
      this.totalSize += chunkData.length;
    } else if (message.type === "downloadComplete") {
      const { contentType, contentId, key } = message.header;

      if (
        contentType !== "image" ||
        contentId !== this.imageId ||
        key !== this.filename
      ) {
        return;
      }

      const mergedBuffer = new Uint8Array(this.totalSize);
      let offset = 0;

      for (const chunk of this.fileChunks) {
        mergedBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      const blob = new Blob([mergedBuffer], { type: this.mimeType });
      this.blobURL = URL.createObjectURL(blob);
      this.image.src = this.blobURL;

      this.babylonScene = new BabylonScene(
        this.imageId,
        "image",
        this.canvas,
        this.image,
        this.faceLandmarks,
        this.effects,
        this.userEffectsStyles.current.image[this.imageId],
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
        this.userMedia
      );

      this.removeMessageListener(this.getImageListener);

      this.updateAllEffects();
    }
  };

  downloadImage = () => {
    if (!this.blobURL) {
      return;
    }

    const link = document.createElement("a");
    link.href = this.blobURL;
    link.download = "downloaded-image.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  clearAllEffects = () => {
    if (!this.babylonScene) return;

    Object.entries(this.effects).map(([effect, value]) => {
      if (value) {
        this.userEffects.current.image[this.imageId][effect as EffectType] =
          false;

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
            false
          );
        } else {
          this.babylonScene?.deleteEffectMeshes(effect);
        }
      }
    });

    this.effects = structuredClone(defaultImageEffects);

    this.deadbanding.update("capture", this.imageId, this.effects);
  };

  updateAllEffects = (oldEffectStyles?: ImageEffectStylesType) => {
    if (!this.babylonScene) return;

    Object.entries(this.userEffects.current.image[this.imageId]).map(
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
              false
            );
          } else {
            this.babylonScene?.deleteEffectMeshes(effect);
          }
        } else if (!this.effects[effect as EffectType] && value) {
          this.effects[effect as EffectType] = true;

          if (validEffectTypes.includes(effect as EffectType)) {
            if (
              effect !== "masks" ||
              this.userEffectsStyles.current.image[this.imageId].masks.style !==
                "baseMask"
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
              this.userEffectsStyles.current.image[this.imageId][effect].color
            );
            this.babylonScene?.toggleTintPlane(
              this.effects[effect] ?? false,
              this.hexToNormalizedRgb(
                this.userEffectsStyles.current.image[this.imageId][effect].color
              )
            );
          }

          if (effect === "blur") {
            this.babylonScene?.toggleBlurEffect(this.effects[effect] ?? false);
          }

          if (effect === "hideBackground") {
            if (
              this.userEffectsStyles.current.image[this.imageId][effect]
                .style === "color"
            ) {
              this.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
                this.userEffectsStyles.current.image[this.imageId][effect].color
              );
            } else {
              this.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
                this.userEffectsStyles.current.image[this.imageId][effect].style
              );
            }

            this.babylonScene?.toggleHideBackgroundPlane(
              this.effects[effect] ?? false
            );
          }

          if (effect === "postProcess") {
            this.babylonScene?.babylonShaderController.swapPostProcessEffects(
              this.userEffectsStyles.current.image[this.imageId][effect].style
            );

            this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
              this.effects[effect] ?? false
            );
          }
        } else if (this.effects[effect as EffectType] && value) {
          if (
            validEffectTypes.includes(effect as EffectType) &&
            (!oldEffectStyles ||
              oldEffectStyles[effect as EffectType].style !==
                this.userEffectsStyles.current.image[this.imageId][
                  effect as EffectType
                ].style)
          ) {
            if (
              effect !== "masks" ||
              this.userEffectsStyles.current.image[this.imageId].masks.style !==
                "baseMask"
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
                this.userEffectsStyles.current.image[this.imageId][effect]
                  .color)
          ) {
            this.babylonScene?.toggleTintPlane(false);

            this.setTintColor(
              this.userEffectsStyles.current.image[this.imageId][effect].color
            );
            this.babylonScene?.toggleTintPlane(
              this.effects[effect] ?? false,
              this.hexToNormalizedRgb(
                this.userEffectsStyles.current.image[this.imageId][effect].color
              )
            );
          }

          if (
            effect === "hideBackground" &&
            (!oldEffectStyles ||
              oldEffectStyles[effect].color !==
                this.userEffectsStyles.current.image[this.imageId][effect]
                  .color ||
              oldEffectStyles[effect].style !==
                this.userEffectsStyles.current.image[this.imageId][effect]
                  .style)
          ) {
            this.babylonScene?.toggleHideBackgroundPlane(false);

            if (
              this.userEffectsStyles.current.image[this.imageId][effect]
                .style === "color"
            ) {
              this.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
                this.userEffectsStyles.current.image[this.imageId][effect].color
              );
            } else {
              this.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
                this.userEffectsStyles.current.image[this.imageId][effect].style
              );
            }
            this.babylonScene?.toggleHideBackgroundPlane(
              this.effects[effect] ?? false
            );
          }

          if (
            effect === "postProcess" &&
            (!oldEffectStyles ||
              oldEffectStyles[effect].style !==
                this.userEffectsStyles.current.image[this.imageId][effect]
                  .style)
          ) {
            this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
              false
            );

            this.babylonScene?.babylonShaderController.swapPostProcessEffects(
              this.userEffectsStyles.current.image[this.imageId][effect].style
            );
            this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
              this.effects[effect] ?? false
            );
          }
        }
      }
    );

    this.deadbanding.update("image", this.imageId, this.effects);

    this.babylonScene.imageAlreadyProcessed[0] = 1;
  };

  changeEffects = (
    effect: ImageEffectTypes,
    tintColor?: string,
    blockStateChange: boolean = false
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
        this.userEffectsStyles.current.image[this.imageId].masks.style !==
          "baseMask"
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
    this.deadbanding.update("image", this.imageId, this.effects);

    if (tintColor) {
      this.setTintColor(tintColor);
    }
    if (effect === "tint" && tintColor) {
      this.babylonScene?.toggleTintPlane(
        this.effects[effect],
        this.hexToNormalizedRgb(tintColor)
      );
    }

    if (effect === "blur") {
      this.babylonScene?.toggleBlurEffect(this.effects[effect]);
    }

    if (effect === "hideBackground") {
      this.babylonScene?.toggleHideBackgroundPlane(false);

      if (
        this.userEffectsStyles.current.image[this.imageId][effect].style ===
        "color"
      ) {
        this.babylonScene?.babylonRenderLoop.swapHideBackgroundContextFillColor(
          this.userEffectsStyles.current.image[this.imageId][effect].color
        );
      } else {
        this.babylonScene?.babylonRenderLoop.swapHideBackgroundEffectImage(
          this.userEffectsStyles.current.image[this.imageId][effect].style
        );
      }

      if (this.effects[effect]) {
        this.babylonScene?.toggleHideBackgroundPlane(true);
      }
    }

    if (effect === "postProcess") {
      this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
        this.effects[effect]
      );
    }

    this.babylonScene.imageAlreadyProcessed[0] = 1;
  };

  drawNewEffect = (effect: EffectType) => {
    const currentStyle =
      this.userEffectsStyles.current.image?.[this.imageId][effect];

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
        meshData.initRotation
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

export default ImageMedia;
