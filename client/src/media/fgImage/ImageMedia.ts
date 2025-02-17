import { NormalizedLandmarkListList } from "@mediapipe/face_mesh";
import {
  UserEffectsStylesType,
  UserStreamEffectsType,
  defaultImageStreamEffects,
  defaultImageEffectsStyles,
  ImageEffectTypes,
} from "../../context/effectsContext/typeConstant";
import {
  IncomingTableStaticContentMessages,
  TableContentTypes,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import BabylonScene, {
  EffectType,
  validEffectTypes,
} from "../../babylon/BabylonScene";
import UserDevice from "../../lib/UserDevice";
import Deadbanding from "../../babylon/Deadbanding";
import { UserMediaType } from "../../context/mediaContext/typeConstant";
import FaceLandmarks from "../../babylon/FaceLandmarks";
import assetMeshes from "../../babylon/meshes";

class ImageMedia {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;

  filename: string;
  mimeType: TableTopStaticMimeType;

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

  initPositioning: {
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  };

  constructor(
    private imageId: string,
    filename: string,
    mimeType: TableTopStaticMimeType,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>,
    private getImage: (
      contentType: TableContentTypes,
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
    initPositioning: {
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
    this.filename = filename;
    this.mimeType = mimeType;
    this.initPositioning = initPositioning;

    if (!this.userStreamEffects.current.image[this.imageId]) {
      this.userStreamEffects.current.image[this.imageId] = structuredClone(
        defaultImageStreamEffects
      );
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

  deconstructor() {
    this.image.src = "";
  }

  private getImageListener = (message: IncomingTableStaticContentMessages) => {
    if (message.type === "chunk") {
      const chunkData = new Uint8Array(message.data.chunk.data);
      this.fileChunks.push(chunkData);
      this.totalSize += chunkData.length;
    } else if (message.type === "downloadComplete") {
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
        this.userEffectsStyles,
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

      for (const effect in this.userStreamEffects.current.image[this.imageId]) {
        if (
          this.userStreamEffects.current.image[this.imageId][
            effect as ImageEffectTypes
          ]
        ) {
          if (effect === "hideBackground") {
            this.babylonScene.babylonRenderLoop.swapHideBackgroundEffectImage(
              this.userEffectsStyles.current.image[this.imageId].hideBackground
                .style
            );

            this.changeEffects(effect as ImageEffectTypes);
          } else if (effect === "postProcess") {
            this.babylonScene.babylonShaderController.swapPostProcessEffects(
              this.userEffectsStyles.current.image[this.imageId].postProcess
                .style
            );

            this.changeEffects(effect as ImageEffectTypes);
          } else if (effect === "tint") {
            this.setTintColor(
              this.userEffectsStyles.current.image[this.imageId].tint.color
            );
            this.changeEffects(
              effect as ImageEffectTypes,
              this.userEffectsStyles.current.image[this.imageId].tint.color
            );
          } else {
            this.changeEffects(effect as ImageEffectTypes);
          }
        }
      }
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
      this.babylonScene?.toggleHideBackgroundPlane(this.effects[effect]);
    }

    if (effect === "postProcess") {
      this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
        this.effects[effect]
      );
    }

    this.babylonScene.imageAlreadyProcessed = 1;
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
}

export default ImageMedia;
