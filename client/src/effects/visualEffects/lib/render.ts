import {
  FaceMesh,
  NormalizedLandmarkList,
  Results,
} from "@mediapipe/face_mesh";
import * as selfieSegmentation from "@mediapipe/selfie_segmentation";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  AudioEffectTypes,
} from "../../../context/StreamsContext";
import {
  assetSizePositionMap,
  CameraEffectStylesType,
  EffectStylesType,
  HideBackgroundEffectTypes,
} from "../../../context/CurrentEffectsStylesContext";
import BaseShader from "./BaseShader";
import FaceLandmarks, { CalculatedLandmarkInterface } from "./FaceLandmarks";
import UserDevice from "../../../UserDevice";

const hideBackgroundEffectImagesMap: {
  [hideBackgroundEffectType in HideBackgroundEffectTypes]?: string;
} = {
  beach: "/videoBackgrounds/beach_640x427.jpg",
  brickWall: "/videoBackgrounds/brickWall_640x427.jpg",
  butterflies: "/videoBackgrounds/butterflies_640x360.jpg",
  cafe: "/videoBackgrounds/cafe_427x640.jpg",
  chalkBoard: "/videoBackgrounds/chalkBoard_640x427.jpg",
  citySkyline: "/videoBackgrounds/citySkyline_640x331.jpg",
  cliffPalace:
    "/videoBackgrounds/cliffPalaceMesaVerdeNationalParkByAnselAdams_608x750.jpg",
  eveningMcDonaldLake:
    "/videoBackgrounds/eveningMcDonaldLakeGlacierNationalParkMontanaByAnselAdams_750x569.jpg",
  forest: "/videoBackgrounds/forest_640x427.jpg",
  halfDomeAppleOrchard:
    "/videoBackgrounds/halfDomeAppleOrchardYosemiteCaliforniaByAnselAdams_750x575.jpg",
  lake: "/videoBackgrounds/lake_640x457.jpg",
  library: "/videoBackgrounds/library_640x427.jpg",
  milkyWay: "/videoBackgrounds/milkyWay_640x349.jpg",
  mountains: "/videoBackgrounds/mountains_640x425.jpg",
  ocean: "/videoBackgrounds/ocean_640x427.jpg",
  oldFaithfulGeyser:
    "/videoBackgrounds/oldFaithfulGeyserYellowstoneNationalParkWyomingByAnselAdams_532x750.jpg",
  railroad: "/videoBackgrounds/railroad_640x414.jpg",
  rollingHills: "/videoBackgrounds/rollingHills_640x417.jpg",
  seaSideHouses: "/videoBackgrounds/seaSideHouses_640x390.jpg",
  snowCoveredMoutains: "/videoBackgrounds/snowCoveredMoutains_640x360.jpg",
  sunflowers: "/videoBackgrounds/sunflowers_640x427.jpg",
  sunset: "/videoBackgrounds/sunset_640x427.jpg",
  trees: "/videoBackgrounds/trees_640x426.jpg",
  windingRoad: "/videoBackgrounds/windingRoad_640x427.jpg",
};

class Render {
  private MAX_FRAME_PROCESSING_TIME: number;
  private FACE_MESH_DETECTION_INTERVAL: number;

  private finishedProcessingEffects = true;

  private frameCounter = 0;

  private offscreenCanvas: HTMLCanvasElement;
  private offscreenContext: CanvasRenderingContext2D | null;

  private lastFaceCountCheck: number;

  private segmenter: selfieSegmentation.SelfieSegmentation | undefined;
  private segmenterInitialized = false;
  private segmenterResults: selfieSegmentation.Results | undefined;

  private hideBackgroundCanvas: HTMLCanvasElement;
  private hideBackgroundCtx: CanvasRenderingContext2D | null;
  private hideBackgroundEffectImage: HTMLImageElement;
  private hideBackgroundCtxFillStyle = "#F56114";

  constructor(
    private id: string,
    private gl: WebGLRenderingContext | WebGL2RenderingContext,
    private baseShader: BaseShader,
    private faceLandmarks: FaceLandmarks | undefined,
    private video: HTMLVideoElement,
    private animationFrameId: number[],
    private effects: {
      [effectType in
        | CameraEffectTypes
        | ScreenEffectTypes
        | AudioEffectTypes]?: boolean | undefined;
    },
    private currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    private faceMesh: FaceMesh | undefined,
    private faceMeshResults: Results[] | undefined,
    private faceCounter: FaceMesh | undefined,
    private userDevice: UserDevice,
    private flipVideo: boolean
  ) {
    this.MAX_FRAME_PROCESSING_TIME =
      this.userDevice.getMaxFrameProcessingTime();
    this.FACE_MESH_DETECTION_INTERVAL =
      this.userDevice.getFaceMeshDetectionInterval();

    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenContext = this.offscreenCanvas.getContext("2d");

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.lastFaceCountCheck = performance.now();

    this.hideBackgroundEffectImage = new Image();

    this.hideBackgroundCanvas = document.createElement("canvas");
    this.hideBackgroundCtx = this.hideBackgroundCanvas.getContext("2d");
  }

  private processEffects = async () => {
    if (
      !this.faceMesh ||
      !this.faceMeshResults ||
      !this.faceLandmarks ||
      !(
        this.effects.glasses ||
        this.effects.beards ||
        this.effects.mustaches ||
        this.effects.masks ||
        this.effects.hats ||
        this.effects.pets
      )
    ) {
      this.finishedProcessingEffects = true;
      return;
    }

    this.frameCounter++;

    if (
      this.FACE_MESH_DETECTION_INTERVAL === 1 ||
      this.frameCounter % this.FACE_MESH_DETECTION_INTERVAL === 0
    ) {
      await this.detectFaces();
    }

    const calculatedLandmarks = this.faceLandmarks.getCalculatedLandmarks();

    for (const {
      faceId,
      landmarks,
    } of this.faceLandmarks.getFaceIdLandmarksPairs()) {
      const effectsStyles = this.currentEffectsStyles.current.camera[this.id];

      if (this.effects.glasses && effectsStyles.glasses) {
        await this.drawGlasses(faceId, effectsStyles, calculatedLandmarks);
      }

      if (this.effects.beards && effectsStyles.beards) {
        await this.drawBeards(
          faceId,
          effectsStyles,
          calculatedLandmarks,
          landmarks
        );
      }

      if (this.effects.mustaches && effectsStyles.mustaches) {
        await this.drawMustaches(
          faceId,
          effectsStyles,
          calculatedLandmarks,
          landmarks
        );
      }

      if (this.effects.masks) {
        await this.drawMasks(
          faceId,
          effectsStyles,
          calculatedLandmarks,
          landmarks
        );
      }

      if (this.effects.hats) {
        await this.drawHats(
          faceId,
          effectsStyles,
          calculatedLandmarks,
          landmarks
        );
      }

      if (this.effects.pets) {
        await this.drawPets(
          faceId,
          effectsStyles,
          calculatedLandmarks,
          landmarks
        );
      }
    }

    this.finishedProcessingEffects = true;
  };

  private detectFaces = async () => {
    if (!this.faceMeshResults || !this.faceLandmarks || !this.video) {
      return;
    }

    this.frameCounter = 0;

    try {
      // Set the dimensions of the offscreen canvas to a lower resolution
      const scaleFactor = 0.25; // Scale down to 25% of the original size
      this.offscreenCanvas.width = this.video.videoWidth * scaleFactor;
      this.offscreenCanvas.height = this.video.videoHeight * scaleFactor;

      // Clear the offscreen canvas before drawing
      this.offscreenContext?.clearRect(
        0,
        0,
        this.offscreenCanvas.width,
        this.offscreenCanvas.height
      );

      // Draw the video frame onto the offscreen canvas at the lower resolution
      this.offscreenContext?.drawImage(
        this.video,
        0,
        0,
        this.offscreenCanvas.width,
        this.offscreenCanvas.height
      );

      // Send the offscreen canvas to FaceMesh
      if (this.faceMesh) {
        await this.faceMesh.send({ image: this.offscreenCanvas });
      }
      if (
        performance.now() - this.lastFaceCountCheck > 5000 &&
        this.faceCounter
      ) {
        this.lastFaceCountCheck = performance.now();
        await this.faceCounter.send({ image: this.offscreenCanvas });
      }
    } catch (error) {
      console.error("Error sending video frame to faceMesh:", error);
      return;
    }

    if (this.faceMeshResults.length === 0) {
      return;
    }

    const multiFaceLandmarks = this.faceMeshResults[0].multiFaceLandmarks;
    const detectionTimedOut = this.faceLandmarks.getTimedOut();

    if (multiFaceLandmarks.length > 0) {
      if (detectionTimedOut) {
        this.faceLandmarks.setTimedOut(false);
      }
      this.faceLandmarks.update(multiFaceLandmarks);
    } else {
      if (!detectionTimedOut) {
        if (this.faceLandmarks.getTimeoutTimer() === undefined) {
          this.faceLandmarks.startTimeout();
        }
      } else {
        this.faceLandmarks.update(multiFaceLandmarks);
      }
    }
  };

  private drawGlasses = async (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    calculatedLandmarks: CalculatedLandmarkInterface
  ) => {
    if (!this.faceLandmarks || !effectsStyles.glasses) {
      return;
    }

    const eyesCenterPosition = calculatedLandmarks.eyesCenterPositions[faceId];

    if (!effectsStyles.glasses.threeDim) {
      this.baseShader.drawEffect(
        effectsStyles.glasses.style,
        {
          x: 2 * eyesCenterPosition[0] - 1,
          y: -2 * eyesCenterPosition[1] + 1,
        },
        {
          x: 0,
          y: 0,
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.glasses[
            this.currentEffectsStyles.current.camera[this.id].glasses.style
          ].twoDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    } else {
      if (effectsStyles.glasses) {
        await this.baseShader.drawMesh(
          effectsStyles.glasses.style,
          {
            x: 2 * eyesCenterPosition[0] - 1,
            y: -2 * eyesCenterPosition[1] + 1,
          },
          {
            x: 0,
            y: 0,
          },
          calculatedLandmarks.interocularDistances[faceId] *
            assetSizePositionMap.glasses[
              this.currentEffectsStyles.current.camera[this.id].glasses.style
            ].threeDimScale,
          calculatedLandmarks.headRotationAngles[faceId],
          calculatedLandmarks.headYawAngles[faceId],
          calculatedLandmarks.headPitchAngles[faceId]
        );
      }
    }
  };

  private drawBeards = async (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    calculatedLandmarks: CalculatedLandmarkInterface,
    landmarks: NormalizedLandmarkList
  ) => {
    if (!this.faceLandmarks || !effectsStyles.beards) {
      return;
    }

    const chinPosition = landmarks[this.faceLandmarks.JAW_MID_POINT_INDEX];

    if (!effectsStyles.beards.threeDim) {
      const twoDimBeardOffset = calculatedLandmarks.twoDimBeardOffsets[faceId];

      this.baseShader.drawEffect(
        effectsStyles.beards.style,
        {
          x: 2 * chinPosition.x - 1,
          y: -2 * chinPosition.y + 1,
        },
        {
          x: twoDimBeardOffset[0],
          y: twoDimBeardOffset[1],
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.beards[
            this.currentEffectsStyles.current.camera[this.id].beards.style
          ].twoDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    } else {
      if (effectsStyles.beards) {
        const threeDimBeardOffset =
          calculatedLandmarks.threeDimBeardOffsets[faceId];
        await this.baseShader.drawMesh(
          effectsStyles.beards.style,
          {
            x: 2 * chinPosition.x - 1,
            y: -2 * chinPosition.y + 1,
          },
          {
            x: threeDimBeardOffset[0],
            y: threeDimBeardOffset[1],
          },
          calculatedLandmarks.interocularDistances[faceId] *
            assetSizePositionMap.beards[
              this.currentEffectsStyles.current.camera[this.id].beards.style
            ].threeDimScale,
          calculatedLandmarks.headRotationAngles[faceId],
          calculatedLandmarks.headYawAngles[faceId],
          calculatedLandmarks.headPitchAngles[faceId]
        );
      }
    }
  };

  private drawMustaches = async (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    calculatedLandmarks: CalculatedLandmarkInterface,
    landmarks: NormalizedLandmarkList
  ) => {
    if (!this.faceLandmarks || !effectsStyles.mustaches) {
      return;
    }

    const nosePosition = landmarks[this.faceLandmarks.NOSE_INDEX];

    if (!effectsStyles.mustaches.threeDim) {
      const twoDimMustacheOffset =
        calculatedLandmarks.twoDimMustacheOffsets[faceId];

      this.baseShader.drawEffect(
        effectsStyles.mustaches.style,
        {
          x: 2 * nosePosition.x - 1,
          y: -2 * nosePosition.y + 1,
        },
        {
          x: twoDimMustacheOffset[0],
          y: twoDimMustacheOffset[1],
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.mustaches[
            this.currentEffectsStyles.current.camera[this.id].mustaches.style
          ].twoDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    } else {
      const threeDimMustacheOffset =
        calculatedLandmarks.threeDimMustacheOffsets[faceId];

      await this.baseShader.drawMesh(
        effectsStyles.mustaches.style,
        {
          x: 2 * nosePosition.x - 1,
          y: -2 * nosePosition.y + 1,
        },
        {
          x: threeDimMustacheOffset[0],
          y: threeDimMustacheOffset[1],
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.mustaches[
            this.currentEffectsStyles.current.camera[this.id].mustaches.style
          ].threeDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    }
  };

  private drawMasks = async (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    calculatedLandmarks: CalculatedLandmarkInterface,
    landmarks: NormalizedLandmarkList
  ) => {
    if (!this.faceLandmarks || !effectsStyles.masks) {
      return;
    }

    const nosePosition = landmarks[this.faceLandmarks.NOSE_INDEX];

    if (effectsStyles.masks.style === "baseMask") {
      await this.baseShader.drawFaceMesh("baseMask", landmarks.slice(0, -10));
      return;
    }

    if (!effectsStyles.masks.threeDim) {
      this.baseShader.drawEffect(
        effectsStyles.masks.style,
        {
          x: 2 * nosePosition.x - 1,
          y: -2 * nosePosition.y + 1,
        },
        {
          x: 0,
          y: 0,
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.masks[
            this.currentEffectsStyles.current.camera[this.id].masks.style
          ].twoDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    } else {
      await this.baseShader.drawMesh(
        effectsStyles.masks.style,
        {
          x: 2 * nosePosition.x - 1,
          y: -2 * nosePosition.y + 1,
        },
        {
          x: 0,
          y: 0,
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.masks[
            this.currentEffectsStyles.current.camera[this.id].masks.style
          ].threeDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    }
  };

  private drawHats = async (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    calculatedLandmarks: CalculatedLandmarkInterface,
    landmarks: NormalizedLandmarkList
  ) => {
    if (!this.faceLandmarks || !effectsStyles.hats) {
      return;
    }

    const foreheadPosition = landmarks[this.faceLandmarks.FOREHEAD_INDEX];

    if (!effectsStyles.hats.threeDim) {
      this.baseShader.drawEffect(
        effectsStyles.hats.style,
        {
          x: 2 * foreheadPosition.x - 1,
          y: -2 * foreheadPosition.y + 1,
        },
        {
          x: 0,
          y: 0,
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.hats[
            this.currentEffectsStyles.current.camera[this.id].hats.style
          ].twoDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    } else {
      await this.baseShader.drawMesh(
        effectsStyles.hats.style,
        {
          x: 2 * foreheadPosition.x - 1,
          y: -2 * foreheadPosition.y + 1,
        },
        {
          x: 0,
          y: 0,
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.hats[
            this.currentEffectsStyles.current.camera[this.id].hats.style
          ].threeDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    }
  };

  private drawPets = async (
    faceId: string,
    effectsStyles: CameraEffectStylesType,
    calculatedLandmarks: CalculatedLandmarkInterface,
    landmarks: NormalizedLandmarkList
  ) => {
    if (!this.faceLandmarks || !effectsStyles.pets) {
      return;
    }

    const foreheadPosition = landmarks[this.faceLandmarks.FOREHEAD_INDEX];

    if (!effectsStyles.pets.threeDim) {
      this.baseShader.drawEffect(
        effectsStyles.pets.style,
        {
          x: 2 * foreheadPosition.x - 1,
          y: -2 * foreheadPosition.y + 1,
        },
        {
          x: 0,
          y: 0,
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.pets[
            this.currentEffectsStyles.current.camera[this.id].pets.style
          ].twoDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    } else {
      await this.baseShader.drawMesh(
        effectsStyles.pets.style,
        {
          x: 2 * foreheadPosition.x - 1,
          y: -2 * foreheadPosition.y + 1,
        },
        {
          x: 0,
          y: 0,
        },
        calculatedLandmarks.interocularDistances[faceId] *
          assetSizePositionMap.pets[
            this.currentEffectsStyles.current.camera[this.id].pets.style
          ].threeDimScale,
        calculatedLandmarks.headRotationAngles[faceId],
        calculatedLandmarks.headYawAngles[faceId],
        calculatedLandmarks.headPitchAngles[faceId]
      );
    }
  };

  private loadSegmenter = async () => {
    this.hideBackgroundCanvas.width = this.video.videoWidth;
    this.hideBackgroundCanvas.height = this.video.videoHeight;

    this.segmenter = new selfieSegmentation.SelfieSegmentation({
      locateFile: (path: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${path}`,
    });

    // Initialize the segmenter and set options
    try {
      await this.segmenter.initialize().then(() => {
        this.segmenterInitialized = true;
      });
    } catch (error) {
      console.error("Error initializing segmenter:", error);
      return;
    }
    this.segmenter.setOptions({
      modelSelection: 1, // Use the landscape model (0 for general)
      selfieMode: false,
    });

    // Attach the onResults callback
    this.segmenter.onResults((results) => {
      this.segmenterResults = results;
    });
  };

  private hideBackgroundEffect = async () => {
    if (this.segmenter === undefined) {
      await this.loadSegmenter();
    }

    if (this.segmenter === undefined || !this.segmenterInitialized) {
      return;
    }

    // Set the dimensions of the offscreen canvas to a lower resolution
    const scaleFactor = 0.25; // Scale down to 25% of the original size
    this.offscreenCanvas.width = this.video.videoWidth * scaleFactor;
    this.offscreenCanvas.height = this.video.videoHeight * scaleFactor;

    // Clear the offscreen canvas before drawing
    this.offscreenContext?.clearRect(
      0,
      0,
      this.offscreenCanvas.width,
      this.offscreenCanvas.height
    );

    // Draw the video frame onto the offscreen canvas at the lower resolution
    this.offscreenContext?.drawImage(
      this.video,
      0,
      0,
      this.offscreenCanvas.width,
      this.offscreenCanvas.height
    );

    // Send the image data to the segmenter
    try {
      await this.segmenter.send({ image: this.offscreenCanvas });
    } catch (error) {
      console.error("Error sending image to segmenter:", error);
    }
  };

  private updateHideBackgroundCanvas = () => {
    if (
      !this.hideBackgroundCanvas ||
      !this.hideBackgroundCtx ||
      !this.segmenterResults
    ) {
      return;
    }

    this.hideBackgroundCtx.clearRect(
      0,
      0,
      this.hideBackgroundCanvas.width,
      this.hideBackgroundCanvas.height
    );

    this.hideBackgroundCtx.drawImage(
      this.segmenterResults.segmentationMask,
      0,
      0,
      this.hideBackgroundCanvas.width,
      this.hideBackgroundCanvas.height
    );
    this.hideBackgroundCtx.globalCompositeOperation = "source-in";
    this.hideBackgroundCtx.drawImage(
      this.video,
      0,
      0,
      this.hideBackgroundCanvas.width,
      this.hideBackgroundCanvas.height
    );

    this.hideBackgroundCtx.globalCompositeOperation = "destination-over";

    if (
      this.currentEffectsStyles.current.camera[this.id].hideBackground.style !==
      "color"
    ) {
      this.hideBackgroundCtx.drawImage(
        this.hideBackgroundEffectImage,
        0,
        0,
        this.hideBackgroundCanvas.width,
        this.hideBackgroundCanvas.height
      );
    } else {
      if (
        this.hideBackgroundCtx.fillStyle !== this.hideBackgroundCtxFillStyle
      ) {
        this.hideBackgroundCtx.fillStyle = this.hideBackgroundCtxFillStyle;
      }

      this.hideBackgroundCtx.fillRect(
        0,
        0,
        this.hideBackgroundCanvas.width,
        this.hideBackgroundCanvas.height
      );
    }
  };

  loop = () => {
    const startTime = performance.now();

    // Clear the canvas and update the video texture
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    if (!this.effects.hideBackground) {
      this.baseShader.updateVideoTexture(this.video, this.flipVideo);
    } else {
      this.hideBackgroundEffect();
      this.updateHideBackgroundCanvas();
      if (this.hideBackgroundCanvas) {
        this.baseShader.updateVideoTexture(
          this.hideBackgroundCanvas,
          this.flipVideo
        );
      }
    }

    // Abort processing if the previous frame took too long
    if (performance.now() - startTime > this.MAX_FRAME_PROCESSING_TIME) {
      this.animationFrameId[0] = requestAnimationFrame(this.loop);
      return;
    }

    if (!this.effects.pause && this.finishedProcessingEffects) {
      this.finishedProcessingEffects = false;
      this.processEffects();
    }

    this.animationFrameId[0] = requestAnimationFrame(this.loop);
  };

  updateFlipVideo = (newFlipVideo: boolean) => {
    this.flipVideo = newFlipVideo;
  };

  swapHideBackgroundEffectImage = (
    hideBackgroundEffect: HideBackgroundEffectTypes
  ) => {
    const src = hideBackgroundEffectImagesMap[hideBackgroundEffect];
    if (src) this.hideBackgroundEffectImage.src = src;
  };

  swapHideBackgroundContextFillColor = (color: string) => {
    if (this.hideBackgroundCtx) {
      this.hideBackgroundCtx.fillStyle = color;
      this.hideBackgroundCtxFillStyle = color;
    }
  };
}

export default Render;
