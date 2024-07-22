import { releaseAllTexturePositions } from "../effects/EffectsWebGL/lib/handleTexturePosition";
import { EffectStylesType } from "../context/CurrentEffectsStylesContext";
import BaseShader from "../effects/EffectsWebGL/lib/BaseShader";
import render from "../effects/EffectsWebGL/lib/render";
import FaceLandmarks from "../effects/EffectsWebGL/lib/FaceLandmarks";
import updateDeadbandingMaps from "../effects/EffectsWebGL/lib/updateDeadbandingMaps";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import { URLsTypes } from "./CameraMedia";

class ScreenMedia {
  // private username: string;
  // private table_id: string;
  // private screenId: string;
  // private canvas: HTMLCanvasElement;
  // private video: HTMLVideoElement;
  // private gl: WebGLRenderingContext | WebGL2RenderingContext;
  // private initScreenStream: MediaStream;
  // private currentEffectsStyles: React.MutableRefObject<EffectStylesType>;
  // private animationFrameId: number[];
  // private baseShader: BaseShader;
  // private faceLandmarks: FaceLandmarks;
  // private faceMeshResults: Results[];
  // private faceMesh: FaceMesh;
  // private effects: {
  //   blur?: boolean | undefined;
  //   tint?: boolean | undefined;
  //   ears?: boolean | undefined;
  //   glasses?: boolean | undefined;
  //   beards?: boolean | undefined;
  //   mustaches?: boolean | undefined;
  //   faceMasks?: boolean | undefined;
  // } = {};
  // constructor(
  //   username: string,
  //   table_id: string,
  //   screenId: string,
  //   initScreenStream: MediaStream,
  //   currentEffectsStyles: React.MutableRefObject<EffectStylesType>
  // ) {
  //   this.username = username;
  //   this.table_id = table_id;
  //   this.screenId = screenId;
  //   this.currentEffectsStyles = currentEffectsStyles;
  //   this.canvas = document.createElement("canvas");
  //   const gl =
  //     this.canvas.getContext("webgl2") || this.canvas.getContext("webgl");
  //   if (!gl) {
  //     throw new Error("WebGL is not supported");
  //   }
  //   this.gl = gl;
  //   this.initScreenStream = initScreenStream;
  //   const meshes = {
  //     mustache1: { meshURL: "/3DAssets/mustaches/mustache1.json" },
  //     mustache2: { meshURL: "/3DAssets/mustaches/mustache2.json" },
  //     mustache3: { meshURL: "/3DAssets/mustaches/mustache3.json" },
  //     mustache4: { meshURL: "/3DAssets/mustaches/mustache4.json" },
  //     disguiseMustache: { meshURL: "/3DAssets/mustaches/mustache1.json" },
  //     faceMask1: { meshURL: "/3DAssets/faceMasks/faceMask1.json" },
  //   };
  //   this.baseShader = new BaseShader(gl, {}, meshes);
  //   this.faceLandmarks = new FaceLandmarks(this.screenId, currentEffectsStyles);
  //   this.faceMeshResults = [];
  //   this.faceMesh = new FaceMesh({
  //     locateFile: (file) => {
  //       return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  //     },
  //   });
  //   this.faceMesh.setOptions({
  //     maxNumFaces: 2,
  //     refineLandmarks: true,
  //     minDetectionConfidence: 0.5,
  //     minTrackingConfidence: 0.5,
  //   });
  //   this.faceMesh.onResults((results) => {
  //     this.faceMeshResults[0] = results;
  //   });
  //   // Start video and render loop
  //   this.animationFrameId = [];
  //   this.video = document.createElement("video");
  //   this.video.srcObject = this.initScreenStream;
  //   this.video.addEventListener("play", () => {
  //     render(
  //       this.screenId,
  //       this.gl,
  //       this.baseShader,
  //       this.faceLandmarks,
  //       this.video,
  //       this.canvas,
  //       this.animationFrameId,
  //       {},
  //       this.currentEffectsStyles,
  //       this.faceMesh,
  //       this.faceMeshResults
  //     );
  //   });
  //   this.video.onloadedmetadata = () => {
  //     this.canvas.width = this.video.videoWidth;
  //     this.canvas.height = this.video.videoHeight;
  //     gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  //     this.video.play();
  //   };
  // }
  // getStream() {
  //   return this.canvas.captureStream();
  // }
  // getTrack() {
  //   return this.canvas.captureStream().getVideoTracks()[0];
  // }
  // async changeEffects(effects: {
  //   blur?: boolean | undefined;
  //   tint?: boolean | undefined;
  //   ears?: boolean | undefined;
  //   glasses?: boolean | undefined;
  //   beards?: boolean | undefined;
  //   mustaches?: boolean | undefined;
  //   faceMasks?: boolean | undefined;
  // }) {
  //   this.effects = effects;
  //   // Remove old animation frame
  //   if (this.animationFrameId[0]) {
  //     cancelAnimationFrame(this.animationFrameId[0]);
  //     delete this.animationFrameId[0];
  //   }
  //   releaseAllTexturePositions();
  //   await this.updateAtlases();
  //   updateDeadbandingMaps(
  //     this.screenId,
  //     this.effects,
  //     this.currentEffectsStyles
  //   );
  //   render(
  //     this.screenId,
  //     this.gl,
  //     this.baseShader,
  //     this.faceLandmarks,
  //     this.video,
  //     this.canvas,
  //     this.animationFrameId,
  //     this.effects,
  //     this.currentEffectsStyles,
  //     this.faceMesh,
  //     this.faceMeshResults
  //   );
  // }
  // private async updateAtlases() {
  //   const twoDimUrls = {
  //     [`${this.currentEffectsStyles.current[this.screenId].ears.style}Left`]:
  //       this.effects.ears
  //         ? `/2DAssets/ears/${
  //             this.currentEffectsStyles.current[this.screenId].ears.style
  //           }Left.png`
  //         : null,
  //     [`${this.currentEffectsStyles.current[this.screenId].ears.style}Right`]:
  //       this.effects.ears
  //         ? `/2DAssets/ears/${
  //             this.currentEffectsStyles.current[this.screenId].ears.style
  //           }Right.png`
  //         : null,
  //     [this.currentEffectsStyles.current[this.screenId].glasses.style]: this
  //       .effects.glasses
  //       ? `/2DAssets/glasses/${
  //           this.currentEffectsStyles.current[this.screenId].glasses.style
  //         }.png`
  //       : null,
  //     [this.currentEffectsStyles.current[this.screenId].beards.style]: this
  //       .effects.beards
  //       ? `/2DAssets/beards/${
  //           this.currentEffectsStyles.current[this.screenId].beards.style
  //         }.png`
  //       : null,
  //     [this.currentEffectsStyles.current[this.screenId].mustaches.style]: this
  //       .effects.mustaches
  //       ? `/2DAssets/mustaches/${
  //           this.currentEffectsStyles.current[this.screenId].mustaches.style
  //         }.png`
  //       : null,
  //   };
  //   const filteredTwoDimUrls: { [URLType in URLsTypes]?: string } =
  //     Object.fromEntries(
  //       Object.entries(twoDimUrls).filter(([key, value]) => value !== null)
  //     );
  //   const threeDimUrls = {
  //     // [`${currentEffectsStyles.current.ears.style}Left`]: effects.ears
  //     //   ? `/3DAssets/ears/${currentEffectsStyles.current.ears.style}Left.png`
  //     //   : null,
  //     // [`${currentEffectsStyles.current.ears.style}Right`]: effects.ears
  //     //   ? `/3DAssets/ears/${currentEffectsStyles.current.ears.style}Right.png`
  //     //   : null,
  //     // [currentEffectsStyles.current.glasses.style]: effects.glasses
  //     //   ? `/3DAssets/glasses/${currentEffectsStyles.current.glasses.style}.png`
  //     //   : null,
  //     // [currentEffectsStyles.current.beards.style]: effects.beards
  //     //   ? `/3DAssets/beards/${currentEffectsStyles.current.beards.style}.png`
  //     //   : null,
  //     [this.currentEffectsStyles.current[this.screenId].mustaches.style]:
  //       this.effects.mustaches &&
  //       this.currentEffectsStyles.current[this.screenId].mustaches.threeDim
  //         ? `/3DAssets/mustaches/${
  //             this.currentEffectsStyles.current[this.screenId].mustaches.style
  //           }.png`
  //         : null,
  //     [this.currentEffectsStyles.current[this.screenId].faceMasks.style]:
  //       this.effects.faceMasks &&
  //       this.currentEffectsStyles.current[this.screenId].faceMasks.threeDim
  //         ? `/3DAssets/faceMasks/${
  //             this.currentEffectsStyles.current[this.screenId].faceMasks.style
  //           }.png`
  //         : null,
  //   };
  //   const filteredThreeDimUrls: { [URLType in URLsTypes]?: string } =
  //     Object.fromEntries(
  //       Object.entries(threeDimUrls).filter(([key, value]) => value !== null)
  //     );
  //   await this.baseShader.createAtlasTexture("twoDim", filteredTwoDimUrls);
  //   await this.baseShader.createAtlasTexture("threeDim", filteredThreeDimUrls);
  // }
}

export default ScreenMedia;
