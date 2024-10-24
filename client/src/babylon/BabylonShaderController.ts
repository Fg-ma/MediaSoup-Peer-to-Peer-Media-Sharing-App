import {
  Engine,
  Scene,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  VideoTexture,
  UniversalCamera,
  Mesh,
  Color3,
  BlurPostProcess,
  Vector2,
  ImageProcessingPostProcess,
  Layer,
  DynamicTexture,
  Material,
  MotionBlurPostProcess,
  BlackAndWhitePostProcess,
  ChromaticAberrationPostProcess,
  SharpenPostProcess,
  TonemapPostProcess,
  TonemappingOperator,
  Effect,
  PostProcess,
} from "@babylonjs/core";

class BabylonShaderController {
  private time = 0;

  private nightVisionPostProcess: PostProcess | undefined;
  private bubbleChromaticPostProcess: PostProcess | undefined;
  private vintageTVPostProcess: PostProcess | undefined;
  private pixelationPostProcess: PostProcess | undefined;
  private tiltShiftPostProcess: PostProcess | undefined;
  private fisheyePostProcess: PostProcess | undefined;
  private prismaColorsPostProcess: PostProcess | undefined;

  private glitchActive = false;
  private minGlitchInterval = 2000; // 2 seconds in milliseconds
  private maxGlitchInterval = 10000; // 10 seconds in milliseconds

  constructor(
    private engine: Engine,
    private camera: UniversalCamera,
    private scene: Scene
  ) {
    // const motionblur = new MotionBlurPostProcess(
    //   "mb", // The name of the effect.
    //   this.scene, // The scene containing the objects to blur according to their velocity.
    //   1.0, // The required width/height ratio to downsize to before computing the render pass.
    //   this.camera // The camera to apply the render pass to.
    // );
    // const blackAndWhite = new BlackAndWhitePostProcess(
    //   "bw",
    //   1.0,
    //   this.camera,
    //   undefined,
    //   this.engine,
    //   false
    // );
    // const chromaticAberrationPostProcess = new ChromaticAberrationPostProcess(
    //   "ca",
    //   this.canvas.width,
    //   this.canvas.height,
    //   1,
    //   this.camera,
    //   undefined,
    //   this.engine,
    //   false
    // );
    // const sharpenPostProcess = new SharpenPostProcess(
    //   "s",
    //   1,
    //   this.camera,
    //   undefined,
    //   this.engine,
    //   false
    // );
    // const tonemapPostProcess = new TonemapPostProcess(
    //   "tonemap",
    //   TonemappingOperator.HejiDawson, // You can switch between Hable, Reinhard, or HejiDawson
    //   1.0, // Exposure adjustment
    //   this.camera // Attach it to your camera
    // );
    // this.loadShader("./src/babylon/nightVisionShader.glsl").then(
    //   (shaderCode) => {
    //     Effect.ShadersStore["nightVisionPixelShader"] = shaderCode;
    //     // Now set up the post-process
    //     this.nightVisionPostProcess = new PostProcess(
    //       "nightVision", // Name of the post-process
    //       "nightVision", // Fragment shader name (as stored in Effect.ShadersStore)
    //       ["time"], // Uniforms
    //       null, // No samplers needed since noise is procedural
    //       1.0, // Ratio
    //       this.camera // Camera to apply the post-process
    //     );
    //   }
    // );
    // this.loadShader("./src/babylon/bubbleChromaticShader.glsl").then(
    //   (shaderCode) => {
    //     Effect.ShadersStore["bubbleChromaticPixelShader"] = shaderCode;
    //     // Now set up the post-process
    //     this.bubbleChromaticPostProcess = new PostProcess(
    //       "BubbleChromatic",
    //       "bubbleChromatic",
    //       ["time"], // Add time as the only uniform
    //       null,
    //       1.0,
    //       this.camera
    //     );
    //   }
    // );
    // this.loadShader("./src/babylon/vintageTVShader.glsl").then((shaderCode) => {
    //   Effect.ShadersStore["vintageTVPixelShader"] = shaderCode;
    //   // Now set up the post-process
    //   this.vintageTVPostProcess = new PostProcess(
    //     "vintageTV", // Name of the effect
    //     "vintageTV", // Shader name
    //     ["time", "aspectRatio", "glitchActive"], // Uniforms passed to the shader
    //     null, // No samplers
    //     1.0, // Scale ratio
    //     this.camera // Apply the effect to the camera
    //   );
    // });
    // this.setGlitchInterval();
    // this.loadShader("./src/babylon/pixelationShader.glsl").then(
    //   (shaderCode) => {
    //     Effect.ShadersStore["pixelationPixelShader"] = shaderCode;
    //     this.pixelationPostProcess = new PostProcess(
    //       "pixelation", // Name of the post-process
    //       "pixelation", // Name of the fragment shader (as stored in Effect.ShadersStore)
    //       ["pixelSize", "resolution"], // Uniforms
    //       null, // No samplers needed since it's a 2D effect
    //       1.0, // Ratio
    //       this.camera // Camera to apply the post-process
    //     );
    //   }
    // );
    // this.loadShader("./src/babylon/tiltShiftShader.glsl").then((shaderCode) => {
    //   Effect.ShadersStore["tiltShiftPixelShader"] = shaderCode;
    //   this.tiltShiftPostProcess = new PostProcess(
    //     "tiltShift",
    //     "tiltShift",
    //     ["focusHeight", "focusWidth", "blurStrength"], // Shader uniforms
    //     null, // No texture required
    //     1.0, // Ratio for the render target size
    //     this.camera
    //   );
    // });
    // this.loadShader("./src/babylon/fisheyeShader.glsl").then((shaderCode) => {
    //   Effect.ShadersStore["fisheyePixelShader"] = shaderCode;
    //   this.fisheyePostProcess = new PostProcess(
    //     "fisheye",
    //     "fisheye", // shader name (to be defined later)
    //     null,
    //     ["distortionStrength", "fadeStart"], // uniforms and samplers
    //     1.0,
    //     this.camera
    //   );
    //   this.fisheyePostProcess.onApply = (effect) => {
    //     effect.setFloat("distortionStrength", 0.3);
    //     effect.setFloat("fadeStart", 0.95);
    //   };
    // });
    // this.loadShader("./src/babylon/prismaColorsShader.glsl").then(
    //   (shaderCode) => {
    //     Effect.ShadersStore["prismaColorsPixelShader"] = shaderCode;
    //     this.prismaColorsPostProcess = new PostProcess(
    //       "prismaColors",
    //       "prismaColors", // shader name (to be defined later)
    //       null,
    //       ["time"], // uniforms and samplers
    //       1.0,
    //       this.camera
    //     );
    //   }
    // );
  }

  private loadShader = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load shader from ${url}`);
    }
    return await response.text();
  };

  // Function to start a glitch effect
  private startGlitch = () => {
    this.glitchActive = true;
    setTimeout(() => {
      this.glitchActive = false; // Disable glitch after 0.5 seconds
    }, 500); // Glitch duration
  };

  setGlitchInterval = () => {
    const glitchInterval =
      Math.random() * (this.maxGlitchInterval - this.minGlitchInterval) +
      this.minGlitchInterval;
    setTimeout(() => {
      this.startGlitch(); // Start the glitch
      this.setGlitchInterval(); // Set up the next glitch interval
    }, glitchInterval);
  };

  renderLoop = () => {
    this.time += this.engine.getDeltaTime() * 0.001;

    if (this.bubbleChromaticPostProcess) {
      this.bubbleChromaticPostProcess.onApply = (effect) => {
        effect.setFloat("time", this.time);
      };
    }

    if (this.nightVisionPostProcess) {
      this.nightVisionPostProcess.onApply = (effect) => {
        effect.setFloat("time", this.time * 0.004);
      };
    }

    if (this.vintageTVPostProcess) {
      this.vintageTVPostProcess.onApply = (effect) => {
        effect.setFloat("time", this.time);
        effect.setFloat("aspectRatio", this.engine.getAspectRatio(this.camera));
        effect.setBool("glitchActive", this.glitchActive);
      };
    }

    if (this.pixelationPostProcess) {
      this.pixelationPostProcess.onApply = (effect) => {
        effect.setFloat("pixelSize", 10.0); // Adjust this for stronger/weaker pixelation

        // Update the resolution uniform
        effect.setVector2(
          "resolution",
          new Vector2(
            this.engine.getRenderWidth(),
            this.engine.getRenderHeight()
          )
        );
      };
    }

    if (this.tiltShiftPostProcess) {
      this.tiltShiftPostProcess.onApply = (effect) => {
        // Set the parameters for the shader
        effect.setFloat("focusHeight", 0.5); // Change as needed
        effect.setFloat("focusWidth", 0.225); // Change as needed
        effect.setFloat("blurStrength", 0.25); // Change as needed
        effect.setVector2(
          "resolution",
          new Vector2(
            this.engine.getRenderWidth(),
            this.engine.getRenderHeight()
          )
        );
      };
    }

    if (this.prismaColorsPostProcess) {
      this.prismaColorsPostProcess.onApply = (effect) => {
        effect.setFloat("time", this.time);
      };
    }
  };
}

export default BabylonShaderController;
