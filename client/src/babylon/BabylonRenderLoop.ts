import {
  AbstractMesh,
  Scene,
  UniversalCamera,
  Vector3,
  DynamicTexture,
} from "@babylonjs/core";
import { NormalizedLandmarkListList } from "@mediapipe/face_mesh";
import {
  HideBackgroundEffectTypes,
  CameraEffectTypes,
} from "../../../universal/effectsTypeConstant";
import UserDevice from "../tools/userDevice/UserDevice";
import { hideBackgroundEffectImagesMap } from "./meshes";
import BabylonMeshes from "./BabylonMeshes";
import FaceLandmarks from "./FaceLandmarks";

class BabylonRenderLoop {
  private FACE_MESH_DETECTION_INTERVAL: number;
  private SELFIE_SEGMENTATION_DETECTION_INTERVAL: number;

  private frameCounter = 0;

  hideBackgroundCanvas: HTMLCanvasElement;
  private hideBackgroundCtx: CanvasRenderingContext2D | null;
  private hideBackgroundEffectImage: HTMLImageElement;
  private hideBackgroundCtxFillStyle = "#d40213";
  private tempHideBackgroundCanvas: OffscreenCanvas;
  private tempHideBackgroundCtx: OffscreenCanvasRenderingContext2D | null;

  private hidebackgroundType: "image" | "color" = "image";

  private _tempNosePos = { x: 0, y: 0 };
  private _tempShift = { x: 0, y: 0 };
  private tan: number;

  constructor(
    private flip: boolean,
    private scene: Scene,
    private camera: UniversalCamera,
    private faceLandmarks: FaceLandmarks | undefined,
    private aspect: number,
    private canvas: HTMLCanvasElement,
    private effects: {
      [effectType in CameraEffectTypes]?: boolean | undefined;
    },
    private faceMeshResults: NormalizedLandmarkListList[] | undefined,
    private selfieSegmentationResults: ImageData[] | undefined,
    private userDevice: React.MutableRefObject<UserDevice>,
    private hideBackgroundTexture: DynamicTexture | undefined,
    private backgroundMedia: HTMLVideoElement | HTMLImageElement,
    private babylonMeshes: BabylonMeshes,
  ) {
    this.tan = Math.tan(this.camera.fov / 2);

    this.FACE_MESH_DETECTION_INTERVAL =
      this.userDevice.current.getFaceMeshDetectionInterval();
    this.SELFIE_SEGMENTATION_DETECTION_INTERVAL =
      this.userDevice.current.getSelfieSegmentationDetectionInterval();
    this.hideBackgroundEffectImage = new Image();
    this.hideBackgroundEffectImage.crossOrigin = "anonymous";

    this.hideBackgroundCanvas = document.createElement("canvas");

    this.hideBackgroundCanvas.width =
      this.backgroundMedia instanceof HTMLVideoElement
        ? this.backgroundMedia.videoWidth
        : this.backgroundMedia.naturalWidth;
    this.hideBackgroundCanvas.height =
      this.backgroundMedia instanceof HTMLVideoElement
        ? this.backgroundMedia.videoHeight
        : this.backgroundMedia.naturalHeight;

    this.hideBackgroundCtx = this.hideBackgroundCanvas.getContext("2d", {
      alpha: true,
      willReadFrequently: true,
    });

    if (this.aspect > 1) {
      this.tempHideBackgroundCanvas = new OffscreenCanvas(
        320,
        320 / this.aspect,
      );
    } else {
      this.tempHideBackgroundCanvas = new OffscreenCanvas(
        320 * this.aspect,
        320,
      );
    }
    this.tempHideBackgroundCtx = this.tempHideBackgroundCanvas.getContext(
      "2d",
      { alpha: true, willReadFrequently: true },
    );

    setTimeout(() => {
      this.detectFaces();
    }, 1000);
  }

  renderLoop = () => {
    this.frameCounter++;

    if (
      !this.effects.pause &&
      this.effects.hideBackground &&
      this.frameCounter % this.SELFIE_SEGMENTATION_DETECTION_INTERVAL === 0
    ) {
      this.updateHideBackgroundCanvas();
    }

    if (
      !this.effects.pause &&
      this.frameCounter % this.FACE_MESH_DETECTION_INTERVAL === 0
    ) {
      this.detectFaces();
    }
  };

  private detectFaces = () => {
    if (
      !this.faceMeshResults ||
      !this.faceLandmarks ||
      this.faceMeshResults.length === 0
    ) {
      return;
    }

    const multiFaceLandmarks = this.faceMeshResults[0];
    const detectionTimedOut = this.faceLandmarks.getTimedOut();

    if (multiFaceLandmarks.length > 0) {
      if (detectionTimedOut) {
        this.faceLandmarks.setTimedOut(false);
      }
      this.faceLandmarks.update(multiFaceLandmarks);
      this.updateMeshPositionsScaleRotation();
    } else {
      if (!detectionTimedOut) {
        if (this.faceLandmarks.getTimeoutTimer() === undefined) {
          this.faceLandmarks.startTimeout();
        }
      } else {
        this.faceLandmarks.update(multiFaceLandmarks);
        this.updateMeshPositionsScaleRotation();
      }
    }
  };

  private updateHideBackgroundCanvas = () => {
    if (
      !this.hideBackgroundCanvas ||
      !this.hideBackgroundCtx ||
      !this.tempHideBackgroundCtx ||
      !this.selfieSegmentationResults ||
      !this.selfieSegmentationResults[0] ||
      !this.backgroundMedia
    ) {
      return;
    }

    const width = this.hideBackgroundCanvas.width;
    const height = this.hideBackgroundCanvas.height;

    // Clear both canvases
    this.hideBackgroundCtx.clearRect(0, 0, width, height);
    this.tempHideBackgroundCtx.clearRect(0, 0, width, height);

    // Step 1: Draw the original video/image feed (foreground + background)
    this.hideBackgroundCtx.globalCompositeOperation = "source-over";
    this.hideBackgroundCtx.drawImage(this.backgroundMedia, 0, 0, width, height);

    // Step 2: Apply the segmentation mask to keep only the person
    this.tempHideBackgroundCtx.putImageData(
      this.selfieSegmentationResults[0],
      0,
      0,
    );

    // Save person shape into alpha channel
    this.hideBackgroundCtx.globalCompositeOperation = "destination-out";
    this.hideBackgroundCtx.drawImage(
      this.tempHideBackgroundCanvas,
      0,
      0,
      this.tempHideBackgroundCanvas.width,
      this.tempHideBackgroundCanvas.height,
      0,
      0,
      width,
      height,
    );

    // Step 3: Draw background media/image behind the person
    this.hideBackgroundCtx.globalCompositeOperation = "destination-over";
    if (this.hidebackgroundType === "image") {
      const canvasAspect = width / height;
      const imageAspect =
        this.hideBackgroundEffectImage.naturalWidth /
        this.hideBackgroundEffectImage.naturalHeight;

      let sx = 0,
        sy = 0,
        sWidth = this.hideBackgroundEffectImage.naturalWidth,
        sHeight = this.hideBackgroundEffectImage.naturalHeight;

      if (imageAspect > canvasAspect) {
        sWidth = this.hideBackgroundEffectImage.naturalHeight * canvasAspect;
        sx = (this.hideBackgroundEffectImage.naturalWidth - sWidth) / 2;
      } else {
        sHeight = this.hideBackgroundEffectImage.naturalWidth / canvasAspect;
        sy = (this.hideBackgroundEffectImage.naturalHeight - sHeight) / 2;
      }

      this.hideBackgroundCtx.drawImage(
        this.hideBackgroundEffectImage,
        sx,
        sy,
        sWidth,
        sHeight,
        0,
        0,
        width,
        height,
      );
    } else {
      if (
        this.hideBackgroundCtx.fillStyle !== this.hideBackgroundCtxFillStyle
      ) {
        this.hideBackgroundCtx.fillStyle = this.hideBackgroundCtxFillStyle;
      }
      this.hideBackgroundCtx.fillRect(0, 0, width, height);
    }

    // Step 4: Update texture
    if (this.hideBackgroundTexture) {
      const textureCtx = this.hideBackgroundTexture.getContext();
      if (textureCtx) {
        textureCtx.clearRect(0, 0, width, height);

        if (this.flip) {
          textureCtx.save();
          textureCtx.translate(width, 0);
          textureCtx.scale(-1, 1);
          textureCtx.drawImage(this.hideBackgroundCanvas, 0, 0, width, height);
          textureCtx.restore();
        } else {
          textureCtx.drawImage(this.hideBackgroundCanvas, 0, 0, width, height);
        }

        this.hideBackgroundTexture.update();
      }
    }
  };

  swapHideBackgroundEffectImage = (
    hideBackgroundEffect: HideBackgroundEffectTypes,
  ) => {
    this.hidebackgroundType = "image";
    const src = hideBackgroundEffectImagesMap[hideBackgroundEffect];
    if (src && src !== this.hideBackgroundEffectImage.src)
      this.hideBackgroundEffectImage.src = src;
  };

  swapHideBackgroundContextFillColor = (color: string) => {
    this.hidebackgroundType = "color";
    if (this.hideBackgroundCtx) {
      this.hideBackgroundCtx.fillStyle = color;
      this.hideBackgroundCtxFillStyle = color;
    }
  };

  private positionsScreenSpaceToSceneSpace = (
    mesh: AbstractMesh,
    position: [number, number],
  ): [number, number, number] => {
    const zPosition = mesh.position.z;

    // Calculate the vertical and horizontal extents at the current zPosition
    const verticalExtent = this.tan * (Math.abs(zPosition) + 1);
    const horizontalExtent = verticalExtent * this.aspect;

    // Convert normalized screen coordinates to world coordinates
    return [
      position[0] * horizontalExtent * -1,
      position[1] * verticalExtent,
      zPosition,
    ];
  };

  private sceneSpaceToPositionsScreenSpace = (
    mesh: AbstractMesh,
  ): [number, number] => {
    const zPosition = mesh.position.z;

    // Calculate the vertical and horizontal extents at the current zPosition
    const verticalExtent = this.tan * (Math.abs(zPosition) + 1);
    const horizontalExtent = verticalExtent * this.aspect;

    // Reverse the conversion from world coordinates to normalized screen coordinates
    const screenX = (mesh.position.x / horizontalExtent) * -1;
    const screenY = mesh.position.y / verticalExtent;

    return [screenX, screenY];
  };

  private scaleScreenSpaceToSceneSpace = (
    mesh: AbstractMesh,
    scale: number,
  ) => {
    const zPosition = mesh.position.z; // distance from camera

    // Calculate the vertical and horizontal extents at the current zPosition
    const verticalExtent = this.tan * (Math.abs(zPosition) + 1);
    const horizontalExtent = verticalExtent * this.aspect;

    // Convert normalized screen coordinates to world coordinates
    return scale * Math.max(verticalExtent, horizontalExtent);
  };

  private directionalShift(
    shiftParallel: number,
    shiftPerpendicular: number,
    headAngle: number,
  ): { x: number; y: number } {
    const out = this._tempShift;
    out.x = Math.cos(headAngle) * shiftParallel;
    out.y = Math.sin(headAngle) * shiftParallel;

    const perp = headAngle + Math.PI / 2;
    out.x += Math.cos(perp) * shiftPerpendicular;
    out.y += Math.sin(perp) * shiftPerpendicular;

    return out;
  }

  private updateMeshPositionsScaleRotation = () => {
    if (!this.faceLandmarks) {
      return;
    }

    const calculatedLandmarks = this.faceLandmarks.getCalculatedLandmarks();

    const usedTrackers: {
      beards: number[];
      glasses: number[];
      hats: number[];
      masks: number[];
      mustaches: number[];
      pets: number[];
    } = {
      beards: [],
      glasses: [],
      hats: [],
      masks: [],
      mustaches: [],
      pets: [],
    };

    for (const mesh of this.scene.meshes) {
      const MeshMetadata = mesh.metadata;

      if (
        MeshMetadata === null ||
        (MeshMetadata.positionStyle !== "faceTrack" &&
          MeshMetadata.positionStyle !== "landmarks")
      ) {
        continue;
      }

      const meshPosition = this.sceneSpaceToPositionsScreenSpace(mesh);
      let closestTrackerId: number | null = null;
      let closestDistance = Infinity;

      for (const {
        faceId,
        landmarks,
      } of this.faceLandmarks.getFaceIdLandmarksPairs()) {
        this._tempNosePos.x = landmarks[1].x;
        this._tempNosePos.y = landmarks[1].y;

        const distance = Math.hypot(
          this._tempNosePos.x - meshPosition[0],
          this._tempNosePos.y - meshPosition[1],
        );
        if (
          // @ts-expect-error: no types enforce in mesh metadata
          !usedTrackers[MeshMetadata.effectType].includes(faceId) &&
          distance < closestDistance
        ) {
          closestDistance = distance;
          closestTrackerId = faceId;
        }
      }

      if (closestTrackerId === null) {
        continue;
      }

      // @ts-expect-error: no types enforce in mesh metadata
      usedTrackers[MeshMetadata.effectType].push(closestTrackerId);

      if (MeshMetadata.positionStyle === "faceTrack") {
        let position: [number, number, number] | undefined;

        switch (MeshMetadata.defaultMeshPlacement) {
          case "forehead":
            position = this.positionsScreenSpaceToSceneSpace(
              mesh,
              calculatedLandmarks.foreheadPositions[closestTrackerId],
            );
            break;
          case "nose":
            position = this.positionsScreenSpaceToSceneSpace(
              mesh,
              calculatedLandmarks.nosePositions[closestTrackerId],
            );
            break;
          case "chin":
            position = this.positionsScreenSpaceToSceneSpace(
              mesh,
              calculatedLandmarks.chinPositions[closestTrackerId],
            );
            break;
          case "eyesCenter":
            position = this.positionsScreenSpaceToSceneSpace(
              mesh,
              calculatedLandmarks.eyesCenterPositions[closestTrackerId],
            );
            break;
          default:
            break;
        }

        if (!position) {
          continue;
        }

        // Offset the position
        const interocularScaleShift =
          calculatedLandmarks.interocularDistances[closestTrackerId] * 5;

        const offset = this.directionalShift(
          MeshMetadata.shiftX * interocularScaleShift,
          MeshMetadata.shiftY * interocularScaleShift,
          calculatedLandmarks.headRotationAngles[closestTrackerId],
        );
        position = [
          position[0] + offset.x,
          position[1] + offset.y,
          position[2],
        ];

        // Set the mesh position in world space
        mesh.position = new Vector3(position[0], position[1], position[2]);

        mesh.rotation = new Vector3(
          calculatedLandmarks.headPitchAngles[closestTrackerId],
          calculatedLandmarks.headYawAngles[closestTrackerId],
          calculatedLandmarks.headRotationAngles[closestTrackerId],
        );

        const interocularDistance = this.scaleScreenSpaceToSceneSpace(
          mesh,
          calculatedLandmarks.interocularDistances[closestTrackerId],
        );
        mesh.scaling = new Vector3(
          mesh.metadata.initScale[0] * interocularDistance,
          mesh.metadata.initScale[1] * interocularDistance,
          mesh.metadata.initScale[2] * interocularDistance,
        );
      } else if (MeshMetadata.positionStyle === "landmarks") {
        const faceLandmarkPairs = this.faceLandmarks.getFaceIdLandmarksPairs();

        this.babylonMeshes.updateFaceMesh(
          mesh,
          faceLandmarkPairs[closestTrackerId].landmarks.slice(0, -10),
        );
      }
    }

    for (const mesh of this.scene.meshes) {
      const MeshMetadata = mesh.metadata;

      if (MeshMetadata === null || MeshMetadata.positionStyle !== "faceTrack") {
        continue;
      }

      if (
        // @ts-expect-error: no types enforce in mesh metadata
        !usedTrackers[MeshMetadata.effectType].includes(MeshMetadata.faceId)
      ) {
        mesh.scaling = new Vector3(0, 0, 0);
      }
    }
  };
}

export default BabylonRenderLoop;
