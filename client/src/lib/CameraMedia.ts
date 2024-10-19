import {
  EffectStylesType,
  defaultCameraCurrentEffectsStyles,
} from "../context/CurrentEffectsStylesContext";
import FaceLandmarks from "../effects/visualEffects/lib/FaceLandmarks";
import { NormalizedLandmarkListList } from "@mediapipe/face_mesh";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  defaultCameraStreamEffects,
  ScreenEffectTypes,
} from "../context/StreamsContext";
import UserDevice from "../UserDevice";
import Deadbanding from "../effects/visualEffects/lib/Deadbanding";
import BabylonScene from "../babylon/BabylonScene";
import assetMeshes from "../babylon/meshes";

class CameraMedia {
  canvas: HTMLCanvasElement;
  private video: HTMLVideoElement;

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

  private lastMeshes = {
    glasses: "",
    beards: "",
    mustaches: "",
    masks: "",
    hats: "",
    pets: "",
  };

  babylonScene: BabylonScene;

  constructor(
    private username: string,
    private table_id: string,
    private cameraId: string,
    private initCameraStream: MediaStream,
    private currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    private userStreamEffects: React.MutableRefObject<{
      camera: {
        [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
      };
      screen: {
        [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
      };
      audio: { [effectType in AudioEffectTypes]: boolean };
    }>,
    private userDevice: UserDevice,
    private deadbanding: Deadbanding
  ) {
    this.effects = {};

    this.userStreamEffects.current.camera[this.cameraId] =
      defaultCameraStreamEffects;

    this.canvas = document.createElement("canvas");

    this.initCameraStream = initCameraStream;

    if (!currentEffectsStyles.current.camera[this.cameraId]) {
      currentEffectsStyles.current.camera[this.cameraId] =
        defaultCameraCurrentEffectsStyles;
    }

    this.faceLandmarks = new FaceLandmarks(
      this.cameraId,
      this.currentEffectsStyles,
      this.deadbanding
    );

    this.faceMeshWorker = new Worker(
      new URL("./../webWorkers/faceMeshWebWorker.worker", import.meta.url),
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
      new URL("./../webWorkers/faceDetectionWebWorker.worker", import.meta.url),
      {
        type: "module",
      }
    );

    this.faceDetectionWorker.onmessage = (event) => {
      switch (event.data.message) {
        case "FACES_DETECTED":
          this.faceDetectionProcessing[0] = false;
          if (event.data.numFacesDetected) {
            this.faceMeshWorker.postMessage({
              message: "CHANGE_MAX_FACES",
              newMaxFace: event.data.numFacesDetected,
            });
          }
          break;
        default:
          break;
      }
    };

    this.selfieSegmentationWorker = new Worker(
      new URL(
        "./../webWorkers/selfieSegmentationWebWorker.worker",
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

    // Start video and render loop
    this.video = document.createElement("video");

    this.babylonScene = new BabylonScene(
      this.cameraId,
      this.canvas,
      this.video,
      this.faceLandmarks,
      this.effects,
      this.currentEffectsStyles,
      this.faceMeshWorker,
      this.faceMeshResults,
      this.faceMeshProcessing,
      this.faceDetectionWorker,
      this.faceDetectionProcessing,
      this.selfieSegmentationWorker,
      this.selfieSegmentationResults,
      this.selfieSegmentationProcessing,
      this.userDevice
    );

    this.video.srcObject = this.initCameraStream;
    this.video.onloadedmetadata = () => {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.video.play();
    };
  }

  deconstructor() {
    // End initial stream
    this.initCameraStream.getTracks().forEach((track) => track.stop());

    // End video
    this.video.pause();
    this.video.srcObject = null;

    this.canvas.remove();

    this.babylonScene.deconstructor();
  }

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

  async changeEffects(
    effect: CameraEffectTypes,
    tintColor?: string,
    blockStateChange: boolean = false
  ) {
    if (this.effects[effect] !== undefined) {
      if (!blockStateChange) {
        this.effects[effect] = !this.effects[effect];
      }
    } else {
      this.effects[effect] = true;
    }

    this.drawNewEffect(effect);

    this.deadbanding.update(this.cameraId, this.effects);

    if (tintColor) {
      this.setTintColor(tintColor);
    }
    if (effect === "tint" && tintColor) {
      this.babylonScene.toggleTintPlane(
        this.effects[effect],
        this.hexToNormalizedRgb(tintColor)
      );
    }

    if (effect === "blur") {
      this.babylonScene.toggleBlurEffect(this.effects[effect]);
    }

    if (effect === "pause") {
      this.babylonScene.togglePauseEffect(this.effects[effect]);
    }
  }

  drawNewEffect = (effect: CameraEffectTypes) => {
    const currentStyle =
      this.currentEffectsStyles.current.camera[this.cameraId][effect];

    // @ts-ignore
    const lastMesh: string = this.lastMeshes[effect];

    if (currentStyle.style === "" || !(effect in assetMeshes)) {
      return;
    }

    // @ts-ignore
    const meshData2D = assetMeshes[effect][currentStyle.style].planeMesh;
    // @ts-ignore
    const meshData3D = assetMeshes[effect][currentStyle.style].mesh;

    // Delete old meshes
    if (lastMesh) {
      this.babylonScene.deleteMesh(
        "2D",
        // @ts-ignore
        assetMeshes[effect][lastMesh].planeMesh.meshLabel
      );
      this.babylonScene.deleteMesh(
        meshData3D.meshType,
        // @ts-ignore
        assetMeshes[effect][lastMesh].mesh.meshLabel
      );
    }

    if (this.effects[effect]) {
      if (!currentStyle.threeDim) {
        console.log("wokr", this.babylonScene);
        this.babylonScene.createEffectMesh(
          "2D",
          meshData2D.meshLabel,
          "",
          // @ts-ignore
          assetMeshes[effect][currentStyle.style].defaultMeshPlacement,
          meshData2D.meshPath,
          meshData2D.meshFile,
          [0, 0, this.babylonScene.twoDimMeshesZCoord],
          meshData2D.initScale,
          meshData2D.initRotation
        );
      }
      if (currentStyle.threeDim) {
        this.babylonScene.createEffectMesh(
          meshData3D.meshType,
          meshData3D.meshLabel,
          "",
          // @ts-ignore
          assetMeshes[effect][currentStyle.style].defaultMeshPlacement,
          meshData3D.meshPath,
          meshData3D.meshFile,
          [0, 0, this.babylonScene.threeDimMeshesZCoord],
          meshData3D.initScale,
          meshData3D.initRotation
        );
      }
    }

    // @ts-ignore
    this.lastMeshes[effect] = currentStyle.style;
  };

  getStream() {
    return this.canvas.captureStream();
  }

  getTrack() {
    return this.canvas.captureStream().getVideoTracks()[0];
  }

  setTintColor(newTintColor: string) {
    this.babylonScene.setTintColor(this.hexToNormalizedRgb(newTintColor));
  }
}

export default CameraMedia;
