import { NormalizedLandmarkListList } from "@mediapipe/face_mesh";
import {
  defaultCameraEffectsStyles,
  UserEffectsStylesType,
  CameraEffectTypes,
  defaultCameraEffects,
  UserEffectsType,
} from "../../../../universal/effectsTypeConstant";
import UserDevice from "../../lib/UserDevice";
import BabylonScene, {
  EffectType,
  validEffectTypes,
} from "../../babylon/BabylonScene";
import assetMeshes from "../../babylon/meshes";
import FaceLandmarks from "../../babylon/FaceLandmarks";
import Deadbanding from "../../babylon/Deadbanding";
import BabylonRenderLoopWorker from "../../babylon/BabylonRenderLoopWorker";

class CameraMedia {
  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;

  aspectRatio: number | undefined;

  private creationTime = Date.now();

  private faceLandmarks: FaceLandmarks;

  private faceMeshWorker: Worker;
  private faceMeshResults: NormalizedLandmarkListList[] = [];
  private faceMeshProcessing = [false];
  private faceDetectionWorker: Worker;
  private faceDetectionProcessing = [false];
  private selfieSegmentationWorker: Worker;
  private selfieSegmentationResults: ImageData[] = [];
  private selfieSegmentationProcessing = [false];

  private effects: {
    [cameraEffect in CameraEffectTypes]?: boolean;
  };

  private maxFaces: [number] = [1];

  babylonRenderLoopWorker: BabylonRenderLoopWorker | undefined;
  babylonScene: BabylonScene | undefined;

  constructor(
    private cameraId: string,
    private initCameraStream: MediaStream,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userDevice: React.MutableRefObject<UserDevice>,
    private deadbanding: React.MutableRefObject<Deadbanding>,
  ) {
    this.effects = {};

    this.userEffects.current.camera[this.cameraId] =
      structuredClone(defaultCameraEffects);

    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("babylonJS-canvas");

    if (!userEffectsStyles.current.camera[this.cameraId]) {
      userEffectsStyles.current.camera[this.cameraId] = structuredClone(
        defaultCameraEffectsStyles,
      );
    }

    this.faceLandmarks = new FaceLandmarks(
      false,
      "camera",
      this.cameraId,
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

    // Start video and render loop
    this.video = document.createElement("video");

    this.video.srcObject = this.initCameraStream;
    this.video.onloadedmetadata = () => {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;

      this.aspectRatio = this.video.videoWidth / this.video.videoHeight;

      this.video.play();

      this.babylonRenderLoopWorker = new BabylonRenderLoopWorker(
        true,
        this.faceLandmarks,
        this.aspectRatio ?? 1,
        this.video,
        this.faceMeshWorker,
        this.faceMeshProcessing,
        this.faceDetectionWorker,
        this.faceDetectionProcessing,
        this.selfieSegmentationWorker,
        this.selfieSegmentationProcessing,
        this.userDevice,
      );

      this.babylonScene = new BabylonScene(
        this.babylonRenderLoopWorker,
        "camera",
        this.aspectRatio,
        this.canvas,
        this.video,
        this.faceLandmarks,
        this.effects,
        this.faceMeshResults,
        this.selfieSegmentationResults,
        this.userDevice,
        this.maxFaces,
      );
    };
  }

  deconstructor() {
    // End initial stream
    this.initCameraStream.getTracks().forEach((track) => track.stop());

    // End video
    this.video.pause();
    this.video.srcObject = null;

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
  }

  private rectifyEffectMeshCount = () => {
    if (!this.babylonScene) return;

    for (const effect in this.effects) {
      if (
        !this.effects[effect as CameraEffectTypes] ||
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
          this.userEffectsStyles.current.camera[this.cameraId][
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

  private updateNeed = () => {
    this.babylonRenderLoopWorker?.removeAllNeed(this.cameraId);

    this.babylonRenderLoopWorker?.addNeed("faceDetection", this.cameraId);
    if (this.effects.hideBackground) {
      this.babylonRenderLoopWorker?.addNeed(
        "selfieSegmentation",
        this.cameraId,
      );
    }
    if (
      this.effects.masks &&
      this.userEffectsStyles.current.camera[this.cameraId].masks.style !==
        "baseMask"
    ) {
      this.babylonRenderLoopWorker?.addNeed(
        "smoothFaceLandmarks",
        this.cameraId,
      );
    }
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

  clearAllEffects = () => {
    if (!this.babylonScene) return;

    this.babylonRenderLoopWorker?.removeAllNeed(this.cameraId);

    Object.entries(this.effects).map(([effect, value]) => {
      if (value) {
        this.userEffects.current.camera[this.cameraId][effect as EffectType] =
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
            false,
          );
        } else {
          this.babylonScene?.deleteEffectMeshes(effect);
        }
      }
    });

    this.effects = structuredClone(defaultCameraEffects);

    this.deadbanding.current.update("capture", this.cameraId, this.effects);
  };

  changeEffects = (
    effect: CameraEffectTypes,
    tintColor?: string,
    blockStateChange: boolean = false,
  ) => {
    if (this.effects[effect] !== undefined) {
      if (!blockStateChange) {
        this.effects[effect] = !this.effects[effect];
      }
    } else {
      this.effects[effect] = true;
    }

    this.updateNeed();

    if (validEffectTypes.includes(effect as EffectType)) {
      if (
        effect !== "masks" ||
        this.userEffectsStyles.current.camera[this.cameraId].masks.style !==
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
    this.deadbanding.current.update("camera", this.cameraId, this.effects);

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

    if (effect === "pause") {
      this.babylonScene?.togglePauseEffect(this.effects[effect]);
    }

    if (effect === "hideBackground") {
      this.babylonScene?.toggleHideBackgroundPlane(this.effects[effect]);
    }

    if (effect === "postProcess") {
      this.babylonScene?.babylonShaderController.togglePostProcessEffectsActive(
        this.effects[effect],
      );
    }
  };

  drawNewEffect = (effect: EffectType) => {
    const currentStyle =
      this.userEffectsStyles.current.camera?.[this.cameraId]?.[effect];

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

  getStream = () => {
    return this.canvas.captureStream();
  };

  getTrack = () => {
    return this.canvas.captureStream().getVideoTracks()[0];
  };

  setTintColor = (newTintColor: string) => {
    this.babylonScene?.setTintColor(this.hexToNormalizedRgb(newTintColor));
  };

  getPaused = () => {
    return this.effects.pause ?? false;
  };

  getTimeEllapsed = () => {
    return Date.now() - this.creationTime;
  };
}

export default CameraMedia;
