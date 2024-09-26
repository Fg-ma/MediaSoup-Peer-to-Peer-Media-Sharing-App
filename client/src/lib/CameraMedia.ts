import {
  beardChinOffsetsMap,
  defaultBeard,
  defaultMask,
  defaultGlasses,
  defaultMustache,
  EffectStylesType,
  mustacheNoseOffsetsMap,
} from "../context/CurrentEffectsStylesContext";
import BaseShader from "../effects/visualEffects/lib/BaseShader";
import FaceLandmarks from "../effects/visualEffects/lib/FaceLandmarks";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  defaultCameraStreamEffects,
  ScreenEffectTypes,
} from "../context/StreamsContext";
import UserDevice from "../UserDevice";
import Deadbanding from "src/effects/visualEffects/lib/Deadbanding";
import Render from "../effects/visualEffects/lib/render";

export const mustachesDataURLs = {
  diff: {
    disguiseMustache: {
      meshURL: "/2DAssets/mustaches/disguiseMustache/disguiseMustache.json",
    },
    fullMustache: {
      meshURL: "/2DAssets/mustaches/fullMustache/fullMustache.json",
    },
    mustache1: { meshURL: "/3DAssets/mustaches/mustache1/mustache1.json" },
    mustache2: { meshURL: "/3DAssets/mustaches/mustache2/mustache2.json" },
    mustache3: { meshURL: "/3DAssets/mustaches/mustache3/mustache3.json" },
    mustache4: { meshURL: "/3DAssets/mustaches/mustache4/mustache4.json" },
    nicodemusMustache: {
      meshURL: "/3DAssets/mustaches/nicodemusMustache/nicodemusMustache.json",
    },
    pencilMustache: {
      meshURL: "/3DAssets/mustaches/pencilMustache/pencilMustache.json",
    },
    spongebobMustache: {
      meshURL: "/3DAssets/mustaches/spongebobMustache/spongebobMustache.json",
    },
    tinyMustache: {
      meshURL: "/3DAssets/mustaches/tinyMustache/tinyMustache.json",
    },
    wingedMustache: {
      meshURL: "/3DAssets/mustaches/wingedMustache/wingedMustache.json",
    },
  },
  meshes: {
    disguiseMustache: {
      meshURL: "/3DAssets/mustaches/disguiseMustache/disguiseMustache.json",
    },
    fullMustache: {
      meshURL: "/3DAssets/mustaches/fullMustache/fullMustache.json",
    },
    mustache1: { meshURL: "/3DAssets/mustaches/mustache1/mustache1.json" },
    mustache2: { meshURL: "/3DAssets/mustaches/mustache2/mustache2.json" },
    mustache3: { meshURL: "/3DAssets/mustaches/mustache3/mustache3.json" },
    mustache4: { meshURL: "/3DAssets/mustaches/mustache4/mustache4.json" },
    nicodemusMustache: {
      meshURL: "/3DAssets/mustaches/nicodemusMustache/nicodemusMustache.json",
    },
    pencilMustache: {
      meshURL: "/3DAssets/mustaches/pencilMustache/pencilMustache.json",
    },
    spongebobMustache: {
      meshURL: "/3DAssets/mustaches/spongebobMustache/spongebobMustache.json",
    },
    tinyMustache: {
      meshURL: "/3DAssets/mustaches/tinyMustache/tinyMustache.json",
    },
    wingedMustache: {
      meshURL: "/3DAssets/mustaches/wingedMustache/wingedMustache.json",
    },
  },
};

export const beardsDataURLs = {
  diff: {},
  meshes: {
    chinBeard: { meshURL: "/3DAssets/beards/chinBeard/chinBeard.json" },
    classicalCurlyBeard: {
      meshURL: "/3DAssets/beards/classicalCurlyBeard/classicalCurlyBeard.json",
    },
    fullBeard: { meshURL: "/3DAssets/beards/fullBeard/fullBeard.json" },
  },
};

export const masksDataURLs = {
  diff: {},
  meshes: {
    alienMask: {
      meshURL: "/3DAssets/masks/alienMask/alienMask.json",
    },
    baseMask: {
      meshURL: "/3DAssets/masks/baseMask/baseMask.json",
    },
    clownMask: {
      meshURL: "/3DAssets/masks/clownMask/clownMask.json",
    },
    creatureMask: {
      meshURL: "/3DAssets/masks/creatureMask/creatureMask.json",
    },
    cyberMask: {
      meshURL: "/3DAssets/masks/cyberMask/cyberMask.json",
    },
    darkKnightMask: {
      meshURL: "/3DAssets/masks/darkKnightMask/darkKnightMask.json",
    },
    demonMask: {
      meshURL: "/3DAssets/masks/demonMask/demonMask.json",
    },
    gasMask1: {
      meshURL: "/3DAssets/masks/gasMask1/gasMask1.json",
    },
    gasMask2: {
      meshURL: "/3DAssets/masks/gasMask2/gasMask2.json",
    },
    gasMask3: {
      meshURL: "/3DAssets/masks/gasMask3/gasMask3.json",
    },
    gasMask4: {
      meshURL: "/3DAssets/masks/gasMask4/gasMask4.json",
    },
    masqueradeMask: {
      meshURL: "/3DAssets/masks/masqueradeMask/masqueradeMask.json",
    },
    metalManMask: {
      meshURL: "/3DAssets/masks/metalManMask/metalManMask.json",
    },
    oniMask: {
      meshURL: "/3DAssets/masks/oniMask/oniMask.json",
    },
    plagueDoctorMask: {
      meshURL: "/3DAssets/masks/plagueDoctorMask/plagueDoctorMask.json",
    },
    sixEyesMask: {
      meshURL: "/3DAssets/masks/sixEyesMask/sixEyesMask.json",
    },
    tenguMask: {
      meshURL: "/3DAssets/masks/tenguMask/tenguMask.json",
    },
    threeMask: {
      meshURL: "/3DAssets/masks/threeMask/threeMask.json",
    },
    weldingMask: {
      meshURL: "/3DAssets/masks/weldingMask/weldingMask.json",
    },
    woodlandMask: {
      meshURL: "/3DAssets/masks/woodlandMask/woodlandMask.json",
    },
    woodPaintedMask: {
      meshURL: "/3DAssets/masks/woodPaintedMask/woodPaintedMask.json",
    },
    zombieMask: {
      meshURL: "/3DAssets/masks/zombieMask/zombieMask.json",
    },
  },
};

export const glassesDataURLs = {
  diff: {},
  meshes: {
    defaultGlasses: {
      meshURL: "/3DAssets/glasses/defaultGlasses/defaultGlasses.json",
    },
    americaGlasses: {
      meshURL: "/3DAssets/glasses/americaGlasses/americaGlasses.json",
    },
    aviatorGoggles: {
      meshURL: "/3DAssets/glasses/aviatorGoggles/aviatorGoggles.json",
    },
    bloodyGlasses: {
      meshURL: "/3DAssets/glasses/bloodyGlasses/bloodyGlasses.json",
    },
    eyeProtectionGlasses: {
      meshURL:
        "/3DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses.json",
    },
    glasses1: { meshURL: "/3DAssets/glasses/glasses1/glasses1.json" },
    glasses2: { meshURL: "/3DAssets/glasses/glasses2/glasses2.json" },
    glasses3: { meshURL: "/3DAssets/glasses/glasses3/glasses3.json" },
    glasses4: { meshURL: "/3DAssets/glasses/glasses4/glasses4.json" },
    glasses5: { meshURL: "/3DAssets/glasses/glasses5/glasses5.json" },
    glasses6: { meshURL: "/3DAssets/glasses/glasses6/glasses6.json" },
    memeGlasses: { meshURL: "/3DAssets/glasses/memeGlasses/memeGlasses.json" },
    militaryTacticalGlasses: {
      meshURL:
        "/3DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses.json",
    },
    steampunkGlasses: {
      meshURL: "/3DAssets/glasses/steampunkGlasses/steampunkGlasses.json",
    },
    threeDGlasses: {
      meshURL: "/3DAssets/glasses/threeDGlasses/threeDGlasses.json",
    },
    toyGlasses: { meshURL: "/3DAssets/glasses/toyGlasses/toyGlasses.json" },
    shades: { meshURL: "/3DAssets/glasses/shades/shades.json" },
    VRGlasses: { meshURL: "/3DAssets/glasses/VRGlasses/VRGlasses.json" },
  },
};

export const hatsDataURLs = {
  diff: {},
  meshes: {
    AsianConicalHat: {
      meshURL: "/3DAssets/hats/AsianConicalHat/AsianConicalHat.json",
    },
    aviatorHelmet: {
      meshURL: "/3DAssets/hats/aviatorHelmet/aviatorHelmet.json",
    },
    bicornHat: { meshURL: "/3DAssets/hats/bicornHat/bicornHat.json" },
    bicycleHelmet: {
      meshURL: "/3DAssets/hats/bicycleHelmet/bicycleHelmet.json",
    },
    captainsHat: { meshURL: "/3DAssets/hats/captainsHat/captainsHat.json" },
    chefHat: { meshURL: "/3DAssets/hats/chefHat/chefHat.json" },
    chickenHat: { meshURL: "/3DAssets/hats/chickenHat/chickenHat.json" },
    deadManHat: { meshURL: "/3DAssets/hats/deadManHat/deadManHat.json" },
    dogEars: { meshURL: "/3DAssets/hats/dogEars/dogEars.json" },
    flatCap: { meshURL: "/3DAssets/hats/flatCap/flatCap.json" },
    hardHat: { meshURL: "/3DAssets/hats/hardHat/hardHat.json" },
    hopliteHelmet: {
      meshURL: "/3DAssets/hats/hopliteHelmet/hopliteHelmet.json",
    },
    militaryHat: { meshURL: "/3DAssets/hats/militaryHat/militaryHat.json" },
    rabbitEars: { meshURL: "/3DAssets/hats/rabbitEars/rabbitEars.json" },
    roundEarsHat: { meshURL: "/3DAssets/hats/roundEarsHat/roundEarsHat.json" },
    santaHat: { meshURL: "/3DAssets/hats/santaHat/santaHat.json" },
    seamanHat: { meshURL: "/3DAssets/hats/seamanHat/seamanHat.json" },
    stylishHat: { meshURL: "/3DAssets/hats/stylishHat/stylishHat.json" },
    superMarioOdysseyHat: {
      meshURL: "/3DAssets/hats/superMarioOdysseyHat/superMarioOdysseyHat.json",
    },
    ushankaHat: { meshURL: "/3DAssets/hats/ushankaHat/ushankaHat.json" },
    vikingHelmet: { meshURL: "/3DAssets/hats/vikingHelmet/vikingHelmet.json" },
  },
};

export const petsDataURLs = {
  diff: {},
  meshes: {
    angryHamster: { meshURL: "/3DAssets/pets/angryHamster/angryHamster.json" },
    axolotl: { meshURL: "/3DAssets/pets/axolotl/axolotl.json" },
    babyDragon: { meshURL: "/3DAssets/pets/babyDragon/babyDragon.json" },
    beardedDragon: { meshURL: "/3DAssets/pets/babyDragon/babyDragon.json" },
    bird1: { meshURL: "/3DAssets/pets/bird1/bird1.json" },
    bird2: { meshURL: "/3DAssets/pets/bird2/bird2.json" },
    boxer: { meshURL: "/3DAssets/pets/boxer/boxer.json" },
    brain: { meshURL: "/3DAssets/pets/brain/brain.json" },
    buddyHamster: { meshURL: "/3DAssets/pets/buddyHamster/buddyHamster.json" },
    cat1: { meshURL: "/3DAssets/pets/cat1/cat1.json" },
    cat2: { meshURL: "/3DAssets/pets/cat2/cat2.json" },
    dodoBird: { meshURL: "/3DAssets/pets/dodoBird/dodoBird.json" },
    happyHamster: { meshURL: "/3DAssets/pets/happyHamster/happyHamster.json" },
    mechanicalGrasshopper: {
      meshURL:
        "/3DAssets/pets/mechanicalGrasshopper/mechanicalGrasshopper.json",
    },
    panda1: { meshURL: "/3DAssets/pets/panda1/panda1.json" },
    panda2: { meshURL: "/3DAssets/pets/panda2/panda2.json" },
    petRock: { meshURL: "/3DAssets/pets/petRock/petRock.json" },
    pig: { meshURL: "/3DAssets/pets/pig/pig.json" },
    redFox1: { meshURL: "/3DAssets/pets/redFox1/redFox1.json" },
    redFox2: { meshURL: "/3DAssets/pets/redFox2/redFox2.json" },
    roboDog: { meshURL: "/3DAssets/pets/roboDog/roboDog.json" },
    skeletonTRex: { meshURL: "/3DAssets/pets/skeletonTRex/skeletonTRex.json" },
    snail: { meshURL: "/3DAssets/pets/snail/snail.json" },
    spinosaurus: { meshURL: "/3DAssets/pets/spinosaurus/spinosaurus.json" },
    TRex: { meshURL: "/3DAssets/pets/TRex/TRex.json" },
  },
};

class CameraMedia {
  private username: string;
  private table_id: string;
  private cameraId: string;

  private canvas: HTMLCanvasElement;
  private video: HTMLVideoElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private initCameraStream: MediaStream;

  private currentEffectsStyles: React.MutableRefObject<EffectStylesType>;
  private userStreamEffects: React.MutableRefObject<{
    camera: {
      [cameraId: string]: { [effectType in CameraEffectTypes]?: boolean };
    };
    screen: {
      [screenId: string]: { [effectType in ScreenEffectTypes]?: boolean };
    };
    audio: { [effectType in AudioEffectTypes]?: boolean };
  }>;

  private animationFrameId: number[] = [];

  private baseShader: BaseShader;
  private faceLandmarks: FaceLandmarks;

  private faceMeshResults: Results[];
  private faceMesh: FaceMesh;

  private effects: {
    [cameraEffect in CameraEffectTypes]?: boolean;
  };

  private tintColor = "#F56114";

  private userDevice: UserDevice;

  private deadbanding: Deadbanding;

  private render: Render;

  constructor(
    username: string,
    table_id: string,
    cameraId: string,
    initCameraStream: MediaStream,
    currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    userStreamEffects: React.MutableRefObject<{
      camera: {
        [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
      };
      screen: {
        [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
      };
      audio: { [effectType in AudioEffectTypes]: boolean };
    }>,
    userDevice: UserDevice,
    deadbanding: Deadbanding
  ) {
    this.username = username;
    this.table_id = table_id;
    this.cameraId = cameraId;
    this.currentEffectsStyles = currentEffectsStyles;
    this.userStreamEffects = userStreamEffects;
    this.userDevice = userDevice;
    this.deadbanding = deadbanding;

    this.effects = {};

    this.userStreamEffects.current.camera[this.cameraId] =
      defaultCameraStreamEffects;

    this.canvas = document.createElement("canvas");
    const gl =
      this.canvas.getContext("webgl2") || this.canvas.getContext("webgl");

    if (!gl) {
      throw new Error("WebGL is not supported");
    }

    this.gl = gl;

    this.initCameraStream = initCameraStream;

    if (!currentEffectsStyles.current.camera[this.cameraId]) {
      currentEffectsStyles.current.camera[this.cameraId] = {
        glasses: { style: defaultGlasses, threeDim: false },
        beards: {
          style: defaultBeard,
          threeDim: false,
          chinOffset: beardChinOffsetsMap[defaultBeard],
        },
        mustaches: {
          style: defaultMustache,
          threeDim: false,
          noseOffset: mustacheNoseOffsetsMap[defaultMustache],
        },
        masks: {
          style: defaultMask,
          threeDim: true,
        },
      };
    }

    this.baseShader = new BaseShader(gl, this.effects, meshes);

    this.baseShader.setTintColor(this.tintColor);
    this.baseShader.createAtlasTexture("twoDim", {});
    this.baseShader.createAtlasTexture("threeDim", {});

    this.faceLandmarks = new FaceLandmarks(
      this.cameraId,
      this.currentEffectsStyles,
      this.deadbanding
    );

    this.faceMeshResults = [];
    this.faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });
    this.faceMesh.setOptions({
      maxNumFaces: 2,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    this.faceMesh.onResults((results) => {
      this.faceMeshResults[0] = results;
    });

    // Start video and render loop
    this.video = document.createElement("video");

    this.render = new Render(
      this.cameraId,
      this.gl,
      this.baseShader,
      this.faceLandmarks,
      this.video,
      this.canvas,
      this.animationFrameId,
      this.effects,
      this.currentEffectsStyles,
      this.faceMesh,
      this.faceMeshResults,
      this.userDevice,
      false
    );

    this.video.srcObject = this.initCameraStream;
    this.video.addEventListener("play", () => {
      this.render.loop();
    });
    this.video.onloadedmetadata = () => {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.video.play();
    };
  }

  deconstructor() {
    // End render loop
    if (this.animationFrameId[0]) {
      cancelAnimationFrame(this.animationFrameId[0]);
      delete this.animationFrameId[0];
    }

    // End initial stream
    this.initCameraStream.getTracks().forEach((track) => track.stop());

    // End video
    this.video.pause();
    this.video.srcObject = null;

    // Deconstruct base shader
    this.baseShader.deconstructor();

    // Clear gl canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    if (this.canvas) {
      const contextAttributes = this.gl.getContextAttributes();
      if (contextAttributes && contextAttributes.preserveDrawingBuffer) {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      }
      const ext = this.gl.getExtension("WEBGL_lose_context");
      if (ext) {
        ext.loseContext();
      }
    }
    this.canvas.remove();
  }

  private async updateAtlases() {
    const twoDimUrls: { [key: string]: string } = {};
    const glassesStyles =
      this.currentEffectsStyles.current.camera[this.cameraId].glasses;
    const beardStyles =
      this.currentEffectsStyles.current.camera[this.cameraId].beards;
    const mustacheStyles =
      this.currentEffectsStyles.current.camera[this.cameraId].mustaches;
    const maskStyles =
      this.currentEffectsStyles.current.camera[this.cameraId].masks;
    const hatStyles =
      this.currentEffectsStyles.current.camera[this.cameraId].hats;
    const petStyles =
      this.currentEffectsStyles.current.camera[this.cameraId].pets;

    if (glassesStyles && this.effects.glasses) {
      twoDimUrls[
        glassesStyles.style
      ] = `/2DAssets/glasses/${glassesStyles.style}/${glassesStyles.style}.png`;
    }
    if (beardStyles && this.effects.beards) {
      twoDimUrls[
        beardStyles.style
      ] = `/2DAssets/beards/${beardStyles.style}/${beardStyles.style}.png`;
    }
    if (mustacheStyles && this.effects.mustaches) {
      twoDimUrls[
        mustacheStyles.style
      ] = `/2DAssets/mustaches/${mustacheStyles.style}/${mustacheStyles.style}.png`;
    }
    if (maskStyles && this.effects.masks) {
      twoDimUrls[
        maskStyles.style
      ] = `/2DAssets/masks/${maskStyles.style}/${maskStyles.style}.png`;
    }
    if (hatStyles && this.effects.hats) {
      twoDimUrls[
        hatStyles.style
      ] = `/2DAssets/hats/${hatStyles.style}/${hatStyles.style}.png`;
    }
    if (petStyles && this.effects.pets) {
      twoDimUrls[
        petStyles.style
      ] = `/2DAssets/pets/${petStyles.style}/${petStyles.style}.png`;
    }

    const threeDimUrls: { [key: string]: string } = {};

    if (glassesStyles && glassesStyles.threeDim && this.effects.glasses) {
      threeDimUrls[
        glassesStyles.style
      ] = `/3DAssets/glasses/${glassesStyles.style}/texs/${glassesStyles.style}_diff.png`;
    }
    if (beardStyles && beardStyles.threeDim && this.effects.beards) {
      threeDimUrls[
        beardStyles.style
      ] = `/3DAssets/beards/${beardStyles.style}/texs/${beardStyles.style}_diff.png`;
    }
    if (mustacheStyles && mustacheStyles.threeDim && this.effects.mustaches) {
      threeDimUrls[
        mustacheStyles.style
      ] = `/3DAssets/mustaches/${mustacheStyles.style}/texs/${mustacheStyles.style}_diff.png`;
    }
    if (maskStyles && this.effects.masks) {
      threeDimUrls[
        maskStyles.style
      ] = `/3DAssets/masks/${maskStyles.style}/texs/${maskStyles.style}_diff.png`;
    }
    if (hatStyles && this.effects.hats) {
      threeDimUrls[
        hatStyles.style
      ] = `/3DAssets/hats/${hatStyles.style}/texs/${hatStyles.style}_diff.png`;
    }
    if (petStyles && this.effects.pets) {
      threeDimUrls[
        petStyles.style
      ] = `/3DAssets/pets/${petStyles.style}/texs/${petStyles.style}_diff.png`;
    }

    await this.baseShader.updateAtlasTexture("twoDim", twoDimUrls);
    await this.baseShader.updateAtlasTexture("threeDim", threeDimUrls);
  }

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

    await this.updateAtlases();

    this.deadbanding.update(this.cameraId, this.effects);

    if (tintColor) {
      this.setTintColor(tintColor);
    }
    if (effect === "tint" && !blockStateChange) {
      this.baseShader.toggleTintEffect();
    }

    if (effect === "blur") {
      this.baseShader.toggleBlurEffect();
    }

    if (effect === "pause") {
      this.baseShader.setPause(this.effects[effect]);
    }

    // Remove old animation frame
    if (this.animationFrameId[0]) {
      cancelAnimationFrame(this.animationFrameId[0]);
      delete this.animationFrameId[0];
    }

    this.render.loop();
  }

  getStream() {
    return this.canvas.captureStream();
  }

  getTrack() {
    return this.canvas.captureStream().getVideoTracks()[0];
  }

  setTintColor(newTintColor: string) {
    this.baseShader.setTintColor(newTintColor);
  }
}

export default CameraMedia;
