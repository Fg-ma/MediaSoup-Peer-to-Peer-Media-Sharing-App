import {
  EffectStylesType,
  PetsEffectTypes,
  HatsEffectTypes,
  MasksEffectTypes,
  MustachesEffectTypes,
  GlassesEffectTypes,
  BeardsEffectTypes,
  defaultCameraCurrentEffectsStyles,
} from "../context/CurrentEffectsStylesContext";
import BaseShader, { MeshJSON } from "../effects/visualEffects/lib/BaseShader";
import FaceLandmarks from "../effects/visualEffects/lib/FaceLandmarks";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  defaultCameraStreamEffects,
  ScreenEffectTypes,
} from "../context/StreamsContext";
import UserDevice from "../UserDevice";
import Deadbanding from "../effects/visualEffects/lib/Deadbanding";
import Render from "../effects/visualEffects/lib/render";

export type AssetTexsData = {
  [effectType in
    | BeardsEffectTypes
    | GlassesEffectTypes
    | MustachesEffectTypes
    | MasksEffectTypes
    | HatsEffectTypes
    | PetsEffectTypes]?: {
    url: string;
  };
};

export type AssetMeshesData = {
  [effectType in
    | BeardsEffectTypes
    | GlassesEffectTypes
    | MustachesEffectTypes
    | MasksEffectTypes
    | HatsEffectTypes
    | PetsEffectTypes]?: {
    url: string;
    data?: MeshJSON;
  };
};

export interface AssetData {
  image: AssetTexsData;
  diff: AssetTexsData;
  nor: AssetTexsData;
  metalRough: AssetTexsData;
  spec: AssetTexsData;
  emiss: AssetTexsData;
  trans: AssetTexsData;
  meshes: AssetMeshesData;
}

export const mustachesDataURLs: AssetData = {
  image: {
    disguiseMustache: {
      url: "/2DAssets/mustaches/disguiseMustache/disguiseMustache_512x512.png",
    },
    fullMustache: {
      url: "/2DAssets/mustaches/fullMustache/fullMustache_512x512.png",
    },
    mustache1: {
      url: "/2DAssets/mustaches/mustache1/mustache1_512x512.png",
    },
    mustache2: {
      url: "/2DAssets/mustaches/mustache2/mustache2_512x512.png",
    },
    mustache3: {
      url: "/2DAssets/mustaches/mustache3/mustache3_512x512.png",
    },
    mustache4: {
      url: "/2DAssets/mustaches/mustache4/mustache4_512x512.png",
    },
    nicodemusMustache: {
      url: "/2DAssets/mustaches/nicodemusMustache/nicodemusMustache_512x512.png",
    },
    pencilMustache: {
      url: "/2DAssets/mustaches/pencilMustache/pencilMustache_512x512.png",
    },
    spongebobMustache: {
      url: "/2DAssets/mustaches/spongebobMustache/spongebobMustache_512x512.png",
    },
    tinyMustache: {
      url: "/2DAssets/mustaches/tinyMustache/tinyMustache_512x512.png",
    },
    wingedMustache: {
      url: "/2DAssets/mustaches/wingedMustache/wingedMustache_512x512.png",
    },
  },
  diff: {
    disguiseMustache: {
      url: "/3DAssets/mustaches/disguiseMustache/texs/disguiseMustache_diff_256x256.png",
    },
    fullMustache: {
      url: "/3DAssets/mustaches/fullMustache/texs/fullMustache_diff_256x256.png",
    },
    mustache1: {
      url: "/3DAssets/mustaches/mustache1/texs/mustache1_diff_256x256.png",
    },
    mustache2: {
      url: "/3DAssets/mustaches/mustache2/texs/mustache2_diff_256x256.png",
    },
    mustache3: {
      url: "/3DAssets/mustaches/mustache3/texs/mustache3_diff_256x256.png",
    },
    mustache4: {
      url: "/3DAssets/mustaches/mustache4/texs/mustache4_diff_256x256.png",
    },
    nicodemusMustache: {
      url: "/3DAssets/mustaches/nicodemusMustache/texs/nicodemusMustache_diff_256x256.png",
    },
    pencilMustache: {
      url: "/3DAssets/mustaches/pencilMustache/texs/pencilMustache_diff_256x256.png",
    },
    spongebobMustache: {
      url: "/3DAssets/mustaches/spongebobMustache/texs/spongebobMustache_diff_256x256.png",
    },
    tinyMustache: {
      url: "/3DAssets/mustaches/tinyMustache/texs/tinyMustache_diff_256x256.png",
    },
    wingedMustache: {
      url: "/3DAssets/mustaches/wingedMustache/texs/wingedMustache_diff_256x256.png",
    },
  },
  nor: {
    fullMustache: {
      url: "/3DAssets/mustaches/fullMustache/texs/fullMustache_nor_256x256.png",
    },
    wingedMustache: {
      url: "/3DAssets/mustaches/wingedMustache/texs/wingedMustache_nor_256x256.png",
    },
  },
  metalRough: {
    fullMustache: {
      url: "/3DAssets/mustaches/fullMustache/texs/fullMustache_metalRough_256x256.png",
    },
    wingedMustache: {
      url: "/3DAssets/mustaches/wingedMustache/texs/wingedMustache_metalRough_256x256.png",
    },
  },
  spec: {},
  emiss: {},
  trans: {},
  meshes: {
    disguiseMustache: {
      url: "/3DAssets/mustaches/disguiseMustache/disguiseMustache.json",
    },
    fullMustache: {
      url: "/3DAssets/mustaches/fullMustache/fullMustache.json",
    },
    mustache1: {
      url: "/3DAssets/mustaches/mustache1/mustache1.json",
    },
    mustache2: {
      url: "/3DAssets/mustaches/mustache2/mustache2.json",
    },
    mustache3: {
      url: "/3DAssets/mustaches/mustache3/mustache3.json",
    },
    mustache4: {
      url: "/3DAssets/mustaches/mustache4/mustache4.json",
    },
    nicodemusMustache: {
      url: "/3DAssets/mustaches/nicodemusMustache/nicodemusMustache.json",
    },
    pencilMustache: {
      url: "/3DAssets/mustaches/pencilMustache/pencilMustache.json",
    },
    spongebobMustache: {
      url: "/3DAssets/mustaches/spongebobMustache/spongebobMustache.json",
    },
    tinyMustache: {
      url: "/3DAssets/mustaches/tinyMustache/tinyMustache.json",
    },
    wingedMustache: {
      url: "/3DAssets/mustaches/wingedMustache/wingedMustache.json",
    },
  },
};

export const beardsDataURLs: AssetData = {
  image: {
    chinBeard: {
      url: "/2DAssets/beards/chinBeard/chinBeard_512x512.png",
    },
    classicalCurlyBeard: {
      url: "/2DAssets/beards/classicalCurlyBeard/classicalCurlyBeard_512x512.png",
    },
    fullBeard: {
      url: "/2DAssets/beards/fullBeard/fullBeard_512x512.png",
    },
  },
  diff: {
    chinBeard: {
      url: "/3DAssets/beards/chinBeard/texs/chinBeard_diff_256x256.png",
    },
    classicalCurlyBeard: {
      url: "/3DAssets/beards/classicalCurlyBeard/texs/classicalCurlyBeard_diff_256x256.png",
    },
    fullBeard: {
      url: "/3DAssets/beards/fullBeard/texs/fullBeard_diff_256x256.png",
    },
  },
  nor: {
    chinBeard: {
      url: "/3DAssets/beards/chinBeard/texs/chinBeard_nor_256x256.png",
    },
    fullBeard: {
      url: "/3DAssets/beards/fullBeard/texs/fullBeard_nor_256x256.png",
    },
  },
  metalRough: {
    chinBeard: {
      url: "/3DAssets/beards/chinBeard/texs/chinBeard_metalRough_256x256.png",
    },
    fullBeard: {
      url: "/3DAssets/beards/fullBeard/texs/fullBeard_metalRough_256x256.png",
    },
  },
  spec: {
    chinBeard: {
      url: "/3DAssets/beards/chinBeard/texs/chinBeard_spec_256x256.png",
    },
  },
  emiss: {
    chinBeard: {
      url: "/3DAssets/beards/chinBeard/texs/chinBeard_emiss_256x256.png",
    },
  },
  trans: {},
  meshes: {
    chinBeard: { url: "/3DAssets/beards/chinBeard/chinBeard.json" },
    classicalCurlyBeard: {
      url: "/3DAssets/beards/classicalCurlyBeard/classicalCurlyBeard.json",
    },
    fullBeard: { url: "/3DAssets/beards/fullBeard/fullBeard.json" },
  },
};

export const masksDataURLs: AssetData = {
  image: {
    alienMask: {
      url: "/2DAssets/masks/alienMask/alienMask_512x512.png",
    },
    baseMask: {
      url: "/2DAssets/masks/baseMask/baseMask_512x512.png",
    },
    clownMask: {
      url: "/2DAssets/masks/clownMask/clownMask_512x512.png",
    },
    creatureMask: {
      url: "/2DAssets/masks/creatureMask/creatureMask_512x512.png",
    },
    cyberMask: {
      url: "/2DAssets/masks/cyberMask/cyberMask_512x512.png",
    },
    darkKnightMask: {
      url: "/2DAssets/masks/darkKnightMask/darkKnightMask_512x512.png",
    },
    demonMask: {
      url: "/2DAssets/masks/demonMask/demonMask_512x512.png",
    },
    gasMask1: {
      url: "/2DAssets/masks/gasMask1/gasMask1_512x512.png",
    },
    gasMask2: {
      url: "/2DAssets/masks/gasMask2/gasMask2_512x512.png",
    },
    gasMask3: {
      url: "/2DAssets/masks/gasMask3/gasMask3_512x512.png",
    },
    gasMask4: {
      url: "/2DAssets/masks/gasMask4/gasMask4_512x512.png",
    },
    masqueradeMask: {
      url: "/2DAssets/masks/masqueradeMask/masqueradeMask_512x512.png",
    },
    metalManMask: {
      url: "/2DAssets/masks/metalManMask/metalManMask_512x512.png",
    },
    oniMask: {
      url: "/2DAssets/masks/oniMask/oniMask_512x512.png",
    },
    plagueDoctorMask: {
      url: "/2DAssets/masks/plagueDoctorMask/plagueDoctorMask_512x512.png",
    },
    sixEyesMask: {
      url: "/2DAssets/masks/sixEyesMask/sixEyesMask_512x512.png",
    },
    tenguMask: {
      url: "/2DAssets/masks/tenguMask/tenguMask_512x512.png",
    },
    threeFaceMask: {
      url: "/2DAssets/masks/threeFaceMask/threeFaceMask_512x512.png",
    },
    weldingMask: {
      url: "/2DAssets/masks/weldingMask/weldingMask_512x512.png",
    },
    woodlandMask: {
      url: "/2DAssets/masks/woodlandMask/woodlandMask_512x512.png",
    },
    woodPaintedMask: {
      url: "/2DAssets/masks/woodPaintedMask/woodPaintedMask_512x512.png",
    },
    zombieMask: {
      url: "/2DAssets/masks/zombieMask/zombieMask_512x512.png",
    },
  },
  diff: {
    alienMask: {
      url: "/3DAssets/masks/alienMask/texs/alienMask_diff_256x256.png",
    },
    baseMask: {
      url: "/3DAssets/masks/baseMask/texs/baseMask_diff_256x256.png",
    },
    clownMask: {
      url: "/3DAssets/masks/clownMask/texs/clownMask_diff_256x256.png",
    },
    creatureMask: {
      url: "/3DAssets/masks/creatureMask/texs/creatureMask_diff_256x256.png",
    },
    cyberMask: {
      url: "/3DAssets/masks/cyberMask/texs/cyberMask_diff_256x256.png",
    },
    darkKnightMask: {
      url: "/3DAssets/masks/darkKnightMask/texs/darkKnightMask_diff_256x256.png",
    },
    demonMask: {
      url: "/3DAssets/masks/demonMask/texs/demonMask_diff_256x256.png",
    },
    gasMask1: {
      url: "/3DAssets/masks/gasMask1/texs/gasMask1_diff_256x256.png",
    },
    gasMask2: {
      url: "/3DAssets/masks/gasMask2/texs/gasMask2_diff_256x256.png",
    },
    gasMask3: {
      url: "/3DAssets/masks/gasMask3/texs/gasMask3_diff_256x256.png",
    },
    gasMask4: {
      url: "/3DAssets/masks/gasMask4/texs/gasMask4_diff_256x256.png",
    },
    masqueradeMask: {
      url: "/3DAssets/masks/masqueradeMask/texs/masqueradeMask_diff_256x256.png",
    },
    metalManMask: {
      url: "/3DAssets/masks/metalManMask/texs/metalManMask_diff_256x256.png",
    },
    oniMask: {
      url: "/3DAssets/masks/oniMask/texs/oniMask_diff_256x256.png",
    },
    plagueDoctorMask: {
      url: "/3DAssets/masks/plagueDoctorMask/texs/plagueDoctorMask_diff_256x256.png",
    },
    sixEyesMask: {
      url: "/3DAssets/masks/sixEyesMask/texs/sixEyesMask_diff_256x256.png",
    },
    tenguMask: {
      url: "/3DAssets/masks/tenguMask/texs/tenguMask_diff_256x256.png",
    },
    threeFaceMask: {
      url: "/3DAssets/masks/threeFaceMask/texs/threeFaceMask_diff_256x256.png",
    },
    weldingMask: {
      url: "/3DAssets/masks/weldingMask/texs/weldingMask_diff_256x256.png",
    },
    woodlandMask: {
      url: "/3DAssets/masks/woodlandMask/texs/woodlandMask_diff_256x256.png",
    },
    woodPaintedMask: {
      url: "/3DAssets/masks/woodPaintedMask/texs/woodPaintedMask_diff_256x256.png",
    },
    zombieMask: {
      url: "/3DAssets/masks/zombieMask/texs/zombieMask_diff_256x256.png",
    },
  },
  nor: {
    alienMask: {
      url: "/3DAssets/masks/alienMask/texs/alienMask_nor_256x256.png",
    },
    clownMask: {
      url: "/3DAssets/masks/clownMask/texs/clownMask_nor_256x256.png",
    },
    creatureMask: {
      url: "/3DAssets/masks/creatureMask/texs/creatureMask_nor_256x256.png",
    },
    cyberMask: {
      url: "/3DAssets/masks/cyberMask/texs/cyberMask_nor_256x256.png",
    },
    darkKnightMask: {
      url: "/3DAssets/masks/darkKnightMask/texs/darkKnightMask_nor_256x256.png",
    },
    demonMask: {
      url: "/3DAssets/masks/demonMask/texs/demonMask_nor_256x256.png",
    },
    gasMask1: {
      url: "/3DAssets/masks/gasMask1/texs/gasMask1_nor_256x256.png",
    },
    gasMask2: {
      url: "/3DAssets/masks/gasMask2/texs/gasMask2_nor_256x256.png",
    },
    gasMask3: {
      url: "/3DAssets/masks/gasMask3/texs/gasMask3_nor_256x256.png",
    },
    gasMask4: {
      url: "/3DAssets/masks/gasMask4/texs/gasMask4_nor_256x256.png",
    },
    masqueradeMask: {
      url: "/3DAssets/masks/masqueradeMask/texs/masqueradeMask_nor_256x256.png",
    },
    metalManMask: {
      url: "/3DAssets/masks/metalManMask/texs/metalManMask_nor_256x256.png",
    },
    oniMask: {
      url: "/3DAssets/masks/oniMask/texs/oniMask_nor_256x256.png",
    },
    plagueDoctorMask: {
      url: "/3DAssets/masks/plagueDoctorMask/texs/plagueDoctorMask_nor_256x256.png",
    },
    sixEyesMask: {
      url: "/3DAssets/masks/sixEyesMask/texs/sixEyesMask_nor_256x256.png",
    },
    tenguMask: {
      url: "/3DAssets/masks/tenguMask/texs/tenguMask_nor_256x256.png",
    },
    threeFaceMask: {
      url: "/3DAssets/masks/threeFaceMask/texs/threeFaceMask_nor_256x256.png",
    },
    woodlandMask: {
      url: "/3DAssets/masks/woodlandMask/texs/woodlandMask_nor_256x256.png",
    },
    woodPaintedMask: {
      url: "/3DAssets/masks/woodPaintedMask/texs/woodPaintedMask_nor_256x256.png",
    },
    zombieMask: {
      url: "/3DAssets/masks/zombieMask/texs/zombieMask_nor_256x256.png",
    },
  },
  metalRough: {
    alienMask: {
      url: "/3DAssets/masks/alienMask/texs/alienMask_metalRough_256x256.png",
    },
    clownMask: {
      url: "/3DAssets/masks/clownMask/texs/clownMask_metalRough_256x256.png",
    },
    creatureMask: {
      url: "/3DAssets/masks/creatureMask/texs/creatureMask_metalRough_256x256.png",
    },
    cyberMask: {
      url: "/3DAssets/masks/cyberMask/texs/cyberMask_metalRough_256x256.png",
    },
    darkKnightMask: {
      url: "/3DAssets/masks/darkKnightMask/texs/darkKnightMask_metalRough_256x256.png",
    },
    demonMask: {
      url: "/3DAssets/masks/demonMask/texs/demonMask_metalRough_256x256.png",
    },
    gasMask1: {
      url: "/3DAssets/masks/gasMask1/texs/gasMask1_metalRough_256x256.png",
    },
    gasMask2: {
      url: "/3DAssets/masks/gasMask2/texs/gasMask2_metalRough_256x256.png",
    },
    gasMask3: {
      url: "/3DAssets/masks/gasMask3/texs/gasMask3_metalRough_256x256.png",
    },
    gasMask4: {
      url: "/3DAssets/masks/gasMask4/texs/gasMask4_metalRough_256x256.png",
    },
    masqueradeMask: {
      url: "/3DAssets/masks/masqueradeMask/texs/masqueradeMask_metalRough_256x256.png",
    },
    metalManMask: {
      url: "/3DAssets/masks/metalManMask/texs/metalManMask_metalRough_256x256.png",
    },
    oniMask: {
      url: "/3DAssets/masks/oniMask/texs/oniMask_metalRough_256x256.png",
    },
    plagueDoctorMask: {
      url: "/3DAssets/masks/plagueDoctorMask/texs/plagueDoctorMask_metalRough_256x256.png",
    },
    sixEyesMask: {
      url: "/3DAssets/masks/sixEyesMask/texs/sixEyesMask_metalRough_256x256.png",
    },
    tenguMask: {
      url: "/3DAssets/masks/tenguMask/texs/tenguMask_metalRough_256x256.png",
    },
    threeFaceMask: {
      url: "/3DAssets/masks/threeFaceMask/texs/threeFaceMask_metalRough_256x256.png",
    },
    woodlandMask: {
      url: "/3DAssets/masks/woodlandMask/texs/woodlandMask_metalRough_256x256.png",
    },
    woodPaintedMask: {
      url: "/3DAssets/masks/woodPaintedMask/texs/woodPaintedMask_metalRough_256x256.png",
    },
    zombieMask: {
      url: "/3DAssets/masks/zombieMask/texs/zombieMask_metalRough_256x256.png",
    },
  },
  spec: {},
  emiss: {
    alienMask: {
      url: "/3DAssets/masks/alienMask/texs/alienMask_emiss_256x256.png",
    },
    cyberMask: {
      url: "/3DAssets/masks/cyberMask/texs/cyberMask_emiss_256x256.png",
    },
    zombieMask: {
      url: "/3DAssets/masks/zombieMask/texs/zombieMask_emiss_256x256.png",
    },
  },
  trans: {},
  meshes: {
    alienMask: {
      url: "/3DAssets/masks/alienMask/alienMask.json",
    },
    baseMask: {
      url: "/3DAssets/masks/baseMask/baseMask.json",
    },
    clownMask: {
      url: "/3DAssets/masks/clownMask/clownMask.json",
    },
    creatureMask: {
      url: "/3DAssets/masks/creatureMask/creatureMask.json",
    },
    cyberMask: {
      url: "/3DAssets/masks/cyberMask/cyberMask.json",
    },
    darkKnightMask: {
      url: "/3DAssets/masks/darkKnightMask/darkKnightMask.json",
    },
    demonMask: {
      url: "/3DAssets/masks/demonMask/demonMask.json",
    },
    gasMask1: {
      url: "/3DAssets/masks/gasMask1/gasMask1.json",
    },
    gasMask2: {
      url: "/3DAssets/masks/gasMask2/gasMask2.json",
    },
    gasMask3: {
      url: "/3DAssets/masks/gasMask3/gasMask3.json",
    },
    gasMask4: {
      url: "/3DAssets/masks/gasMask4/gasMask4.json",
    },
    masqueradeMask: {
      url: "/3DAssets/masks/masqueradeMask/masqueradeMask.json",
    },
    metalManMask: {
      url: "/3DAssets/masks/metalManMask/metalManMask.json",
    },
    oniMask: {
      url: "/3DAssets/masks/oniMask/oniMask.json",
    },
    plagueDoctorMask: {
      url: "/3DAssets/masks/plagueDoctorMask/plagueDoctorMask.json",
    },
    sixEyesMask: {
      url: "/3DAssets/masks/sixEyesMask/sixEyesMask.json",
    },
    tenguMask: {
      url: "/3DAssets/masks/tenguMask/tenguMask.json",
    },
    threeFaceMask: {
      url: "/3DAssets/masks/threeFaceMask/threeFaceMask.json",
    },
    weldingMask: {
      url: "/3DAssets/masks/weldingMask/weldingMask.json",
    },
    woodlandMask: {
      url: "/3DAssets/masks/woodlandMask/woodlandMask.json",
    },
    woodPaintedMask: {
      url: "/3DAssets/masks/woodPaintedMask/woodPaintedMask.json",
    },
    zombieMask: {
      url: "/3DAssets/masks/zombieMask/zombieMask.json",
    },
  },
};

export const glassesDataURLs: AssetData = {
  image: {
    defaultGlasses: {
      url: "/2DAssets/glasses/defaultGlasses/defaultGlasses_512x512.png",
    },
    AmericaGlasses: {
      url: "/2DAssets/glasses/AmericaGlasses/AmericaGlasses_512x512.png",
    },
    aviatorGoggles: {
      url: "/2DAssets/glasses/aviatorGoggles/aviatorGoggles_512x512.png",
    },
    bloodyGlasses: {
      url: "/2DAssets/glasses/bloodyGlasses/bloodyGlasses_512x512.png",
    },
    eyeProtectionGlasses: {
      url: "/2DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses_512x512.png",
    },
    glasses1: {
      url: "/2DAssets/glasses/glasses1/glasses1_512x512.png",
    },
    glasses2: {
      url: "/2DAssets/glasses/glasses2/glasses2_512x512.png",
    },
    glasses3: {
      url: "/2DAssets/glasses/glasses3/glasses3_512x512.png",
    },
    glasses4: {
      url: "/2DAssets/glasses/glasses4/glasses4_512x512.png",
    },
    glasses5: {
      url: "/2DAssets/glasses/glasses5/glasses5_512x512.png",
    },
    glasses6: {
      url: "/2DAssets/glasses/glasses6/glasses6_512x512.png",
    },
    memeGlasses: {
      url: "/2DAssets/glasses/memeGlasses/memeGlasses_512x512.png",
    },
    militaryTacticalGlasses: {
      url: "/2DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses_512x512.png",
    },
    steampunkGlasses: {
      url: "/2DAssets/glasses/steampunkGlasses/steampunkGlasses_512x512.png",
    },
    threeDGlasses: {
      url: "/2DAssets/glasses/threeDGlasses/threeDGlasses_512x512.png",
    },
    toyGlasses: {
      url: "/2DAssets/glasses/toyGlasses/toyGlasses_512x512.png",
    },
    shades: {
      url: "/2DAssets/glasses/shades/shades_512x512.png",
    },
    VRGlasses: {
      url: "/2DAssets/glasses/VRGlasses/VRGlasses_512x512.png",
    },
  },
  diff: {
    defaultGlasses: {
      url: "/3DAssets/glasses/defaultGlasses/texs/defaultGlasses_diff_256x256.png",
    },
    AmericaGlasses: {
      url: "/3DAssets/glasses/AmericaGlasses/texs/AmericaGlasses_diff_256x256.png",
    },
    aviatorGoggles: {
      url: "/3DAssets/glasses/aviatorGoggles/texs/aviatorGoggles_diff_256x256.png",
    },
    bloodyGlasses: {
      url: "/3DAssets/glasses/bloodyGlasses/texs/bloodyGlasses_diff_256x256.png",
    },
    eyeProtectionGlasses: {
      url: "/3DAssets/glasses/eyeProtectionGlasses/texs/eyeProtectionGlasses_diff_256x256.png",
    },
    glasses1: {
      url: "/3DAssets/glasses/glasses1/texs/glasses1_diff_256x256.png",
    },
    glasses2: {
      url: "/3DAssets/glasses/glasses2/texs/glasses2_diff_256x256.png",
    },
    glasses3: {
      url: "/3DAssets/glasses/glasses3/texs/glasses3_diff_256x256.png",
    },
    glasses4: {
      url: "/3DAssets/glasses/glasses4/texs/glasses4_diff_256x256.png",
    },
    glasses5: {
      url: "/3DAssets/glasses/glasses5/texs/glasses5_diff_256x256.png",
    },
    glasses6: {
      url: "/3DAssets/glasses/glasses6/texs/glasses6_diff_256x256.png",
    },
    memeGlasses: {
      url: "/3DAssets/glasses/memeGlasses/texs/memeGlasses_diff_32x32.png",
    },
    militaryTacticalGlasses: {
      url: "/3DAssets/glasses/militaryTacticalGlasses/texs/militaryTacticalGlasses_diff_256x256.png",
    },
    steampunkGlasses: {
      url: "/3DAssets/glasses/steampunkGlasses/texs/steampunkGlasses_diff_256x256.png",
    },
    threeDGlasses: {
      url: "/3DAssets/glasses/threeDGlasses/texs/threeDGlasses_diff_256x256.png",
    },
    toyGlasses: {
      url: "/3DAssets/glasses/toyGlasses/texs/toyGlasses_diff_256x256.png",
    },
    shades: {
      url: "/3DAssets/glasses/shades/texs/shades_diff_256x256.png",
    },
    VRGlasses: {
      url: "/3DAssets/glasses/VRGlasses/texs/VRGlasses_diff_256x256.png",
    },
  },
  nor: {
    aviatorGoggles: {
      url: "/3DAssets/glasses/aviatorGoggles/texs/aviatorGoggles_nor_256x256.png",
    },
    bloodyGlasses: {
      url: "/3DAssets/glasses/bloodyGlasses/texs/bloodyGlasses_nor_256x256.png",
    },
    eyeProtectionGlasses: {
      url: "/3DAssets/glasses/eyeProtectionGlasses/texs/eyeProtectionGlasses_nor_256x256.png",
    },
    glasses1: {
      url: "/3DAssets/glasses/glasses1/texs/glasses1_nor_256x256.png",
    },
    glasses6: {
      url: "/3DAssets/glasses/glasses6/texs/glasses6_nor_256x256.png",
    },
    militaryTacticalGlasses: {
      url: "/3DAssets/glasses/militaryTacticalGlasses/texs/militaryTacticalGlasses_nor_256x256.png",
    },
    steampunkGlasses: {
      url: "/3DAssets/glasses/steampunkGlasses/texs/steampunkGlasses_nor_256x256.png",
    },
    toyGlasses: {
      url: "/3DAssets/glasses/toyGlasses/texs/toyGlasses_nor_256x256.png",
    },
  },
  metalRough: {
    aviatorGoggles: {
      url: "/3DAssets/glasses/aviatorGoggles/texs/aviatorGoggles_metalRough_256x256.png",
    },
    bloodyGlasses: {
      url: "/3DAssets/glasses/bloodyGlasses/texs/bloodyGlasses_metalRough_256x256.png",
    },
    eyeProtectionGlasses: {
      url: "/3DAssets/glasses/eyeProtectionGlasses/texs/eyeProtectionGlasses_metalRough_256x256.png",
    },
    glasses1: {
      url: "/3DAssets/glasses/glasses1/texs/glasses1_metalRough_256x256.png",
    },
    glasses6: {
      url: "/3DAssets/glasses/glasses6/texs/glasses6_metalRough_256x256.png",
    },
    militaryTacticalGlasses: {
      url: "/3DAssets/glasses/militaryTacticalGlasses/texs/militaryTacticalGlasses_metalRough_256x256.png",
    },
    steampunkGlasses: {
      url: "/3DAssets/glasses/steampunkGlasses/texs/steampunkGlasses_metalRough_256x256.png",
    },
    toyGlasses: {
      url: "/3DAssets/glasses/toyGlasses/texs/toyGlasses_metalRough_256x256.png",
    },
  },
  spec: {
    militaryTacticalGlasses: {
      url: "/3DAssets/glasses/militaryTacticalGlasses/texs/militaryTacticalGlasses_spec_256x256.png",
    },
  },
  emiss: {
    glasses1: {
      url: "/3DAssets/glasses/glasses1/texs/glasses1_emiss_256x256.png",
    },
  },
  trans: {
    bloodyGlasses: {
      url: "/3DAssets/glasses/bloodyGlasses/texs/bloodyGlasses_trans_256x256.png",
    },
    glasses6: {
      url: "/3DAssets/glasses/glasses6/texs/glasses6_trans_256x256.png",
    },
  },
  meshes: {
    defaultGlasses: {
      url: "/3DAssets/glasses/defaultGlasses/defaultGlasses.json",
    },
    AmericaGlasses: {
      url: "/3DAssets/glasses/AmericaGlasses/AmericaGlasses.json",
    },
    aviatorGoggles: {
      url: "/3DAssets/glasses/aviatorGoggles/aviatorGoggles.json",
    },
    bloodyGlasses: {
      url: "/3DAssets/glasses/bloodyGlasses/bloodyGlasses.json",
    },
    eyeProtectionGlasses: {
      url: "/3DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses.json",
    },
    glasses1: { url: "/3DAssets/glasses/glasses1/glasses1.json" },
    glasses2: { url: "/3DAssets/glasses/glasses2/glasses2.json" },
    glasses3: { url: "/3DAssets/glasses/glasses3/glasses3.json" },
    glasses4: { url: "/3DAssets/glasses/glasses4/glasses4.json" },
    glasses5: { url: "/3DAssets/glasses/glasses5/glasses5.json" },
    glasses6: { url: "/3DAssets/glasses/glasses6/glasses6.json" },
    memeGlasses: { url: "/3DAssets/glasses/memeGlasses/memeGlasses.json" },
    militaryTacticalGlasses: {
      url: "/3DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses.json",
    },
    steampunkGlasses: {
      url: "/3DAssets/glasses/steampunkGlasses/steampunkGlasses.json",
    },
    threeDGlasses: {
      url: "/3DAssets/glasses/threeDGlasses/threeDGlasses.json",
    },
    toyGlasses: { url: "/3DAssets/glasses/toyGlasses/toyGlasses.json" },
    shades: { url: "/3DAssets/glasses/shades/shades.json" },
    VRGlasses: { url: "/3DAssets/glasses/VRGlasses/VRGlasses.json" },
  },
};

export const hatsDataURLs: AssetData = {
  image: {
    AsianConicalHat: {
      url: "/2DAssets/hats/AsianConicalHat/AsianConicalHat_512x512.png",
    },
    aviatorHelmet: {
      url: "/2DAssets/hats/aviatorHelmet/aviatorHelmet_512x512.png",
    },
    bicornHat: {
      url: "/2DAssets/hats/bicornHat/bicornHat_512x512.png",
    },
    bicycleHelmet: {
      url: "/2DAssets/hats/bicycleHelmet/bicycleHelmet_512x512.png",
    },
    captainsHat: {
      url: "/2DAssets/hats/captainsHat/captainsHat_512x512.png",
    },
    chefHat: {
      url: "/2DAssets/hats/chefHat/chefHat_512x512.png",
    },
    chickenHat: {
      url: "/2DAssets/hats/chickenHat/chickenHat_512x512.png",
    },
    deadManHat: {
      url: "/2DAssets/hats/deadManHat/deadManHat_512x512.png",
    },
    dogEars: {
      url: "/2DAssets/hats/dogEars/dogEars_512x512.png",
    },
    flatCap: {
      url: "/2DAssets/hats/flatCap/flatCap_512x512.png",
    },
    hardHat: {
      url: "/2DAssets/hats/hardHat/hardHat_512x512.png",
    },
    hopliteHelmet: {
      url: "/2DAssets/hats/hopliteHelmet/hopliteHelmet_512x512.png",
    },
    militaryHat: {
      url: "/2DAssets/hats/militaryHat/militaryHat_512x512.png",
    },
    rabbitEars: {
      url: "/2DAssets/hats/rabbitEars/rabbitEars_512x512.png",
    },
    roundEarsHat: {
      url: "/2DAssets/hats/roundEarsHat/roundEarsHat_512x512.png",
    },
    santaHat: {
      url: "/2DAssets/hats/santaHat/santaHat_512x512.png",
    },
    seamanHat: {
      url: "/2DAssets/hats/seamanHat/seamanHat_512x512.png",
    },
    stylishHat: {
      url: "/2DAssets/hats/stylishHat/stylishHat_512x512.png",
    },
    superMarioOdysseyHat: {
      url: "/2DAssets/hats/superMarioOdysseyHat/superMarioOdysseyHat_512x512.png",
    },
    ushankaHat: {
      url: "/2DAssets/hats/ushankaHat/ushankaHat_512x512.png",
    },
    vikingHelmet: {
      url: "/2DAssets/hats/vikingHelmet/vikingHelmet_512x512.png",
    },
  },
  diff: {
    AsianConicalHat: {
      url: "/3DAssets/hats/AsianConicalHat/texs/AsianConicalHat_diff_256x256.png",
    },
    aviatorHelmet: {
      url: "/3DAssets/hats/aviatorHelmet/texs/aviatorHelmet_diff_256x256.png",
    },
    bicornHat: {
      url: "/3DAssets/hats/bicornHat/texs/bicornHat_diff_256x256.png",
    },
    bicycleHelmet: {
      url: "/3DAssets/hats/bicycleHelmet/texs/bicycleHelmet_diff_256x256.png",
    },
    captainsHat: {
      url: "/3DAssets/hats/captainsHat/texs/captainsHat_diff_256x256.png",
    },
    chefHat: {
      url: "/3DAssets/hats/chefHat/texs/chefHat_diff_256x256.png",
    },
    chickenHat: {
      url: "/3DAssets/hats/chickenHat/texs/chickenHat_diff_256x256.png",
    },
    deadManHat: {
      url: "/3DAssets/hats/deadManHat/texs/deadManHat_diff_256x256.png",
    },
    dogEars: {
      url: "/3DAssets/hats/dogEars/texs/dogEars_diff_256x256.png",
    },
    flatCap: {
      url: "/3DAssets/hats/flatCap/texs/flatCap_diff_256x256.png",
    },
    hardHat: {
      url: "/3DAssets/hats/hardHat/texs/hardHat_diff_256x256.png",
    },
    hopliteHelmet: {
      url: "/3DAssets/hats/hopliteHelmet/texs/hopliteHelmet_diff_256x256.png",
    },
    militaryHat: {
      url: "/3DAssets/hats/militaryHat/texs/militaryHat_diff_256x256.png",
    },
    rabbitEars: {
      url: "/3DAssets/hats/rabbitEars/texs/rabbitEars_diff_128x128.png",
    },
    roundEarsHat: {
      url: "/3DAssets/hats/roundEarsHat/texs/roundEarsHat_diff_256x256.png",
    },
    santaHat: {
      url: "/3DAssets/hats/santaHat/texs/santaHat_diff_256x256.png",
    },
    seamanHat: {
      url: "/3DAssets/hats/seamanHat/texs/seamanHat_diff_256x256.png",
    },
    stylishHat: {
      url: "/3DAssets/hats/stylishHat/texs/stylishHat_diff_256x256.png",
    },
    superMarioOdysseyHat: {
      url: "/3DAssets/hats/superMarioOdysseyHat/texs/superMarioOdysseyHat_diff_256x256.png",
    },
    ushankaHat: {
      url: "/3DAssets/hats/ushankaHat/texs/ushankaHat_diff_256x256.png",
    },
    vikingHelmet: {
      url: "/3DAssets/hats/vikingHelmet/texs/vikingHelmet_diff_256x256.png",
    },
  },
  nor: {
    AsianConicalHat: {
      url: "/3DAssets/hats/AsianConicalHat/texs/AsianConicalHat_nor_256x256.png",
    },
    aviatorHelmet: {
      url: "/3DAssets/hats/aviatorHelmet/texs/aviatorHelmet_nor_256x256.png",
    },
    bicycleHelmet: {
      url: "/3DAssets/hats/bicycleHelmet/texs/bicycleHelmet_nor_256x256.png",
    },
    chickenHat: {
      url: "/3DAssets/hats/chickenHat/texs/chickenHat_nor_256x256.png",
    },
    deadManHat: {
      url: "/3DAssets/hats/deadManHat/texs/deadManHat_nor_256x256.png",
    },
    hardHat: { url: "/3DAssets/hats/hardHat/texs/hardHat_nor_256x256.png" },
    hopliteHelmet: {
      url: "/3DAssets/hats/hopliteHelmet/texs/hopliteHelmet_nor_256x256.png",
    },
    militaryHat: {
      url: "/3DAssets/hats/militaryHat/texs/militaryHat_nor_256x256.png",
    },
    santaHat: {
      url: "/3DAssets/hats/santaHat/texs/santaHat_nor_256x256.png",
    },
    seamanHat: {
      url: "/3DAssets/hats/seamanHat/texs/seamanHat_nor_256x256.png",
    },
    superMarioOdysseyHat: {
      url: "/3DAssets/hats/superMarioOdysseyHat/texs/superMarioOdysseyHat_nor_256x256.png",
    },
    vikingHelmet: {
      url: "/3DAssets/hats/vikingHelmet/texs/vikingHelmet_nor_256x256.png",
    },
  },
  metalRough: {
    AsianConicalHat: {
      url: "/3DAssets/hats/AsianConicalHat/texs/AsianConicalHat_metalRough_256x256.png",
    },
    bicornHat: {
      url: "/3DAssets/hats/bicornHat/texs/bicornHat_metalRough_256x256.png",
    },
    bicycleHelmet: {
      url: "/3DAssets/hats/bicycleHelmet/texs/bicycleHelmet_metalRough_256x256.png",
    },
    chickenHat: {
      url: "/3DAssets/hats/chickenHat/texs/chickenHat_metalRough_256x256.png",
    },
    deadManHat: {
      url: "/3DAssets/hats/deadManHat/texs/deadManHat_metalRough_256x256.png",
    },
    flatCap: {
      url: "/3DAssets/hats/flatCap/texs/flatCap_metalRough_256x256.png",
    },
    hardHat: {
      url: "/3DAssets/hats/hardHat/texs/hardHat_metalRough_256x256.png",
    },
    hopliteHelmet: {
      url: "/3DAssets/hats/hopliteHelmet/texs/hopliteHelmet_metalRough_256x256.png",
    },
    militaryHat: {
      url: "/3DAssets/hats/militaryHat/texs/militaryHat_metalRough_256x256.png",
    },
    santaHat: {
      url: "/3DAssets/hats/santaHat/texs/santaHat_metalRough_256x256.png",
    },
    seamanHat: {
      url: "/3DAssets/hats/seamanHat/texs/seamanHat_metalRough_256x256.png",
    },
    superMarioOdysseyHat: {
      url: "/3DAssets/hats/superMarioOdysseyHat/texs/superMarioOdysseyHat_metalRough_256x256.png",
    },
  },
  spec: {
    hardHat: {
      url: "/3DAssets/hats/hardHat/texs/hardHat_spec_256x256.png",
    },
    seamanHat: {
      url: "/3DAssets/hats/seamanHat/texs/seamanHat_spec_256x256.png",
    },
  },
  emiss: {},
  trans: {},
  meshes: {
    AsianConicalHat: {
      url: "/3DAssets/hats/AsianConicalHat/AsianConicalHat.json",
    },
    aviatorHelmet: {
      url: "/3DAssets/hats/aviatorHelmet/aviatorHelmet.json",
    },
    bicornHat: { url: "/3DAssets/hats/bicornHat/bicornHat.json" },
    bicycleHelmet: {
      url: "/3DAssets/hats/bicycleHelmet/bicycleHelmet.json",
    },
    captainsHat: { url: "/3DAssets/hats/captainsHat/captainsHat.json" },
    chefHat: { url: "/3DAssets/hats/chefHat/chefHat.json" },
    chickenHat: { url: "/3DAssets/hats/chickenHat/chickenHat.json" },
    deadManHat: { url: "/3DAssets/hats/deadManHat/deadManHat.json" },
    dogEars: { url: "/3DAssets/hats/dogEars/dogEars.json" },
    flatCap: { url: "/3DAssets/hats/flatCap/flatCap.json" },
    hardHat: { url: "/3DAssets/hats/hardHat/hardHat.json" },
    hopliteHelmet: {
      url: "/3DAssets/hats/hopliteHelmet/hopliteHelmet.json",
    },
    militaryHat: { url: "/3DAssets/hats/militaryHat/militaryHat.json" },
    rabbitEars: { url: "/3DAssets/hats/rabbitEars/rabbitEars.json" },
    roundEarsHat: { url: "/3DAssets/hats/roundEarsHat/roundEarsHat.json" },
    santaHat: { url: "/3DAssets/hats/santaHat/santaHat.json" },
    seamanHat: { url: "/3DAssets/hats/seamanHat/seamanHat.json" },
    stylishHat: { url: "/3DAssets/hats/stylishHat/stylishHat.json" },
    superMarioOdysseyHat: {
      url: "/3DAssets/hats/superMarioOdysseyHat/superMarioOdysseyHat.json",
    },
    ushankaHat: { url: "/3DAssets/hats/ushankaHat/ushankaHat.json" },
    vikingHelmet: { url: "/3DAssets/hats/vikingHelmet/vikingHelmet.json" },
  },
};

export const petsDataURLs: AssetData = {
  image: {
    angryHamster: {
      url: "/2DAssets/pets/angryHamster/angryHamster_512x512.png",
    },
    axolotl: {
      url: "/2DAssets/pets/axolotl/axolotl_512x512.png",
    },
    babyDragon: {
      url: "/2DAssets/pets/babyDragon/babyDragon_512x512.png",
    },
    beardedDragon: {
      url: "/2DAssets/pets/beardedDragon/beardedDragon_512x512.png",
    },
    bird1: { url: "/2DAssets/pets/bird1/bird1_512x512.png" },
    bird2: { url: "/2DAssets/pets/bird2/bird2_512x512.png" },
    boxer: { url: "/2DAssets/pets/boxer/boxer_512x512.png" },
    brain: { url: "/2DAssets/pets/brain/brain_512x512.png" },
    buddyHamster: {
      url: "/2DAssets/pets/buddyHamster/buddyHamster_512x512.png",
    },
    cat1: { url: "/2DAssets/pets/cat1/cat1_512x512.png" },
    cat2: { url: "/2DAssets/pets/cat2/cat2_512x512.png" },
    dodoBird: {
      url: "/2DAssets/pets/dodoBird/dodoBird_512x512.png",
    },
    happyHamster: {
      url: "/2DAssets/pets/happyHamster/happyHamster_512x512.png",
    },
    mechanicalGrasshopper: {
      url: "/2DAssets/pets/mechanicalGrasshopper/mechanicalGrasshopper_512x512.png",
    },
    panda1: { url: "/2DAssets/pets/panda1/panda1_512x512.png" },
    panda2: { url: "/2DAssets/pets/panda2/panda2_512x512.png" },
    petRock: {
      url: "/2DAssets/pets/petRock/petRock_512x512.png",
    },
    pig: { url: "/2DAssets/pets/pig/pig_512x512.png" },
    redFox1: {
      url: "/2DAssets/pets/redFox1/redFox1_512x512.png",
    },
    redFox2: {
      url: "/2DAssets/pets/redFox2/redFox2_512x512.png",
    },
    roboDog: {
      url: "/2DAssets/pets/roboDog/roboDog_512x512.png",
    },
    skeletonTRex: {
      url: "/2DAssets/pets/skeletonTRex/skeletonTRex_512x512.png",
    },
    snail: { url: "/2DAssets/pets/snail/snail_512x512.png" },
    spinosaurus: {
      url: "/2DAssets/pets/spinosaurus/spinosaurus_512x512.png",
    },
    TRex: { url: "/2DAssets/pets/TRex/TRex_512x512.png" },
  },
  diff: {
    angryHamster: {
      url: "/3DAssets/pets/angryHamster/texs/angryHamster_diff_256x256.png",
    },
    axolotl: {
      url: "/3DAssets/pets/axolotl/texs/axolotl_diff_256x256.png",
    },
    babyDragon: {
      url: "/3DAssets/pets/babyDragon/texs/babyDragon_diff_256x256.png",
    },
    beardedDragon: {
      url: "/3DAssets/pets/beardedDragon/texs/beardedDragon_diff_256x256.png",
    },
    bird1: { url: "/3DAssets/pets/bird1/texs/bird1_diff_256x256.png" },
    bird2: { url: "/3DAssets/pets/bird2/texs/bird2_diff_256x256.png" },
    boxer: { url: "/3DAssets/pets/boxer/texs/boxer_diff_256x256.png" },
    brain: { url: "/3DAssets/pets/brain/texs/brain_diff_256x256.png" },
    buddyHamster: {
      url: "/3DAssets/pets/buddyHamster/texs/buddyHamster_diff_256x256.png",
    },
    cat1: { url: "/3DAssets/pets/cat1/texs/cat1_diff_256x256.png" },
    cat2: { url: "/3DAssets/pets/cat2/texs/cat2_diff_256x256.png" },
    dodoBird: {
      url: "/3DAssets/pets/dodoBird/texs/dodoBird_diff_256x256.png",
    },
    happyHamster: {
      url: "/3DAssets/pets/happyHamster/texs/happyHamster_diff_256x256.png",
    },
    mechanicalGrasshopper: {
      url: "/3DAssets/pets/mechanicalGrasshopper/texs/mechanicalGrasshopper_diff_256x256.png",
    },
    panda1: { url: "/3DAssets/pets/panda1/texs/panda1_diff_256x256.png" },
    panda2: { url: "/3DAssets/pets/panda2/texs/panda2_diff_256x256.png" },
    petRock: {
      url: "/3DAssets/pets/petRock/texs/petRock_diff_256x256.png",
    },
    pig: { url: "/3DAssets/pets/pig/texs/pig_diff_256x256.png" },
    redFox1: {
      url: "/3DAssets/pets/redFox1/texs/redFox1_diff_256x256.png",
    },
    redFox2: {
      url: "/3DAssets/pets/redFox2/texs/redFox2_diff_256x256.png",
    },
    roboDog: {
      url: "/3DAssets/pets/roboDog/texs/roboDog_diff_256x256.png",
    },
    skeletonTRex: {
      url: "/3DAssets/pets/skeletonTRex/texs/skeletonTRex_diff_64x64.png",
    },
    snail: { url: "/3DAssets/pets/snail/texs/snail_diff_256x256.png" },
    spinosaurus: {
      url: "/3DAssets/pets/spinosaurus/texs/spinosaurus_diff_256x256.png",
    },
    TRex: { url: "/3DAssets/pets/TRex/texs/TRex_diff_256x256.png" },
  },
  nor: {
    angryHamster: {
      url: "/3DAssets/pets/angryHamster/texs/angryHamster_nor_256x256.png",
    },
    axolotl: { url: "/3DAssets/pets/axolotl/texs/axolotl_nor_256x256.png" },
    babyDragon: {
      url: "/3DAssets/pets/babyDragon/texs/babyDragon_nor_256x256.png",
    },
    brain: { url: "/3DAssets/pets/brain/texs/brain_nor_256x256.png" },
    buddyHamster: {
      url: "/3DAssets/pets/buddyHamster/texs/buddyHamster_nor_256x256.png",
    },
    happyHamster: {
      url: "/3DAssets/pets/happyHamster/texs/happyHamster_nor_256x256.png",
    },
    mechanicalGrasshopper: {
      url: "/3DAssets/pets/mechanicalGrasshopper/texs/mechanicalGrasshopper_nor_256x256.png",
    },
    snail: { url: "/3DAssets/pets/snail/texs/snail_nor_256x256.png" },
    TRex: { url: "/3DAssets/pets/TRex/texs/TRex_nor_256x256.png" },
  },
  metalRough: {
    axolotl: {
      url: "/3DAssets/pets/axolotl/texs/axolotl_metalRough_256x256.png",
    },
    babyDragon: {
      url: "/3DAssets/pets/babyDragon/texs/babyDragon_metalRough_256x256.png",
    },
    boxer: {
      url: "/3DAssets/pets/boxer/texs/boxer_metalRough_256x256.png",
    },
    buddyHamster: {
      url: "/3DAssets/pets/buddyHamster/texs/buddyHamster_metalRough_256x256.png",
    },
    dodoBird: {
      url: "/3DAssets/pets/dodoBird/texs/dodoBird_metalRough_256x256.png",
    },
    happyHamster: {
      url: "/3DAssets/pets/happyHamster/texs/happyHamster_metalRough_256x256.png",
    },
    mechanicalGrasshopper: {
      url: "/3DAssets/pets/mechanicalGrasshopper/texs/mechanicalGrasshopper_metalRough_256x256.png",
    },
    roboDog: {
      url: "/3DAssets/pets/roboDog/texs/roboDog_metalRough_256x256.png",
    },
    snail: {
      url: "/3DAssets/pets/snail/texs/snail_metalRough_256x256.png",
    },
  },
  spec: {
    angryHamster: {
      url: "/3DAssets/pets/angryHamster/texs/angryHamster_spec_256x256.png",
    },
    boxer: { url: "/3DAssets/pets/boxer/texs/boxer_spec_256x256.png" },
    brain: { url: "/3DAssets/pets/brain/texs/brain_spec_256x256.png" },
    TRex: { url: "/3DAssets/pets/TRex/texs/TRex_spec_256x256.png" },
  },
  emiss: {
    mechanicalGrasshopper: {
      url: "/3DAssets/pets/mechanicalGrasshopper/texs/mechanicalGrasshopper_emiss_256x256.png",
    },
  },
  trans: {},
  meshes: {
    angryHamster: { url: "/3DAssets/pets/angryHamster/angryHamster.json" },
    axolotl: { url: "/3DAssets/pets/axolotl/axolotl.json" },
    babyDragon: { url: "/3DAssets/pets/babyDragon/babyDragon.json" },
    beardedDragon: { url: "/3DAssets/pets/beardedDragon/beardedDragon.json" },
    bird1: { url: "/3DAssets/pets/bird1/bird1.json" },
    bird2: { url: "/3DAssets/pets/bird2/bird2.json" },
    boxer: { url: "/3DAssets/pets/boxer/boxer.json" },
    brain: { url: "/3DAssets/pets/brain/brain.json" },
    buddyHamster: { url: "/3DAssets/pets/buddyHamster/buddyHamster.json" },
    cat1: { url: "/3DAssets/pets/cat1/cat1.json" },
    cat2: { url: "/3DAssets/pets/cat2/cat2.json" },
    dodoBird: { url: "/3DAssets/pets/dodoBird/dodoBird.json" },
    happyHamster: { url: "/3DAssets/pets/happyHamster/happyHamster.json" },
    mechanicalGrasshopper: {
      url: "/3DAssets/pets/mechanicalGrasshopper/mechanicalGrasshopper.json",
    },
    panda1: { url: "/3DAssets/pets/panda1/panda1.json" },
    panda2: { url: "/3DAssets/pets/panda2/panda2.json" },
    petRock: { url: "/3DAssets/pets/petRock/petRock.json" },
    pig: { url: "/3DAssets/pets/pig/pig.json" },
    redFox1: { url: "/3DAssets/pets/redFox1/redFox1.json" },
    redFox2: { url: "/3DAssets/pets/redFox2/redFox2.json" },
    roboDog: { url: "/3DAssets/pets/roboDog/roboDog.json" },
    skeletonTRex: { url: "/3DAssets/pets/skeletonTRex/skeletonTRex.json" },
    snail: { url: "/3DAssets/pets/snail/snail.json" },
    spinosaurus: { url: "/3DAssets/pets/spinosaurus/spinosaurus.json" },
    TRex: { url: "/3DAssets/pets/TRex/TRex.json" },
  },
};

export const assetData: AssetData = {
  image: {
    ...mustachesDataURLs.image,
    ...beardsDataURLs.image,
    ...masksDataURLs.image,
    ...glassesDataURLs.image,
    ...hatsDataURLs.image,
    ...petsDataURLs.image,
  },
  diff: {
    ...mustachesDataURLs.diff,
    ...beardsDataURLs.diff,
    ...masksDataURLs.diff,
    ...glassesDataURLs.diff,
    ...hatsDataURLs.diff,
    ...petsDataURLs.diff,
  },
  nor: {
    ...mustachesDataURLs.nor,
    ...beardsDataURLs.nor,
    ...masksDataURLs.nor,
    ...glassesDataURLs.nor,
    ...hatsDataURLs.nor,
    ...petsDataURLs.nor,
  },
  metalRough: {
    ...mustachesDataURLs.metalRough,
    ...beardsDataURLs.metalRough,
    ...masksDataURLs.metalRough,
    ...glassesDataURLs.metalRough,
    ...hatsDataURLs.metalRough,
    ...petsDataURLs.metalRough,
  },
  spec: {
    ...mustachesDataURLs.spec,
    ...beardsDataURLs.spec,
    ...masksDataURLs.spec,
    ...glassesDataURLs.spec,
    ...hatsDataURLs.spec,
    ...petsDataURLs.spec,
  },
  emiss: {
    ...mustachesDataURLs.emiss,
    ...beardsDataURLs.emiss,
    ...masksDataURLs.emiss,
    ...glassesDataURLs.emiss,
    ...hatsDataURLs.emiss,
    ...petsDataURLs.emiss,
  },
  trans: {
    ...mustachesDataURLs.trans,
    ...beardsDataURLs.trans,
    ...masksDataURLs.trans,
    ...glassesDataURLs.trans,
    ...hatsDataURLs.trans,
    ...petsDataURLs.trans,
  },
  meshes: {
    ...mustachesDataURLs.meshes,
    ...beardsDataURLs.meshes,
    ...masksDataURLs.meshes,
    ...glassesDataURLs.meshes,
    ...hatsDataURLs.meshes,
    ...petsDataURLs.meshes,
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
  private faceCounter: FaceMesh;

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
      currentEffectsStyles.current.camera[this.cameraId] =
        defaultCameraCurrentEffectsStyles;
    }

    this.baseShader = new BaseShader(gl, this.effects);

    this.baseShader.setTintColor(this.tintColor);
    this.baseShader.createAtlasTexture("twoDim", {});
    this.baseShader.createAtlasTexture("threeDim", {});
    this.baseShader.createAtlasTexture("normal", {});
    this.baseShader.createAtlasTexture("metallicRoughness", {});
    this.baseShader.createAtlasTexture("specular", {});
    this.baseShader.createAtlasTexture("transmission", {});

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

    let maxNumFaces = 1;
    this.faceMesh.setOptions({
      maxNumFaces: maxNumFaces,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.faceMesh.onResults((results) => {
      this.faceMeshResults[0] = results;
    });

    this.faceCounter = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });
    this.faceCounter.setOptions({
      maxNumFaces: 10,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.faceCounter.onResults((results) => {
      if (maxNumFaces !== results.multiFaceLandmarks.length) {
        maxNumFaces = results.multiFaceLandmarks.length;
        this.faceMesh.setOptions({
          maxNumFaces: results.multiFaceLandmarks.length,
        });
      }
    });

    // Start video and render loop
    this.video = document.createElement("video");

    this.render = new Render(
      this.cameraId,
      this.gl,
      this.baseShader,
      this.faceLandmarks,
      this.video,
      this.animationFrameId,
      this.effects,
      this.currentEffectsStyles,
      this.faceMesh,
      this.faceMeshResults,
      this.faceCounter,
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
      const glassesURL = glassesDataURLs.image[glassesStyles.style]?.url;

      if (glassesURL) {
        twoDimUrls[glassesStyles.style] = glassesURL;
      }
    }
    if (beardStyles && this.effects.beards) {
      const beardURL = beardsDataURLs.image[beardStyles.style]?.url;

      if (beardURL) {
        twoDimUrls[beardStyles.style] = beardURL;
      }
    }
    if (mustacheStyles && this.effects.mustaches) {
      const mustacheURL = mustachesDataURLs.image[mustacheStyles.style]?.url;

      if (mustacheURL) {
        twoDimUrls[mustacheStyles.style] = mustacheURL;
      }
    }
    if (maskStyles && this.effects.masks) {
      const maskURL = masksDataURLs.image[maskStyles.style]?.url;

      if (maskURL) {
        twoDimUrls[maskStyles.style] = maskURL;
      }
    }
    if (hatStyles && this.effects.hats) {
      const hatURL = hatsDataURLs.image[hatStyles.style]?.url;

      if (hatURL) {
        twoDimUrls[hatStyles.style] = hatURL;
      }
    }
    if (petStyles && this.effects.pets) {
      const petURL = petsDataURLs.image[petStyles.style]?.url;

      if (petURL) {
        twoDimUrls[petStyles.style] = petURL;
      }
    }

    const threeDimUrls: { [key: string]: string } = {};

    if (glassesStyles && glassesStyles.threeDim && this.effects.glasses) {
      const glassesURL = glassesDataURLs.diff[glassesStyles.style]?.url;

      if (glassesURL) {
        threeDimUrls[glassesStyles.style] = glassesURL;
      }
    }
    if (beardStyles && beardStyles.threeDim && this.effects.beards) {
      const beardURL = beardsDataURLs.diff[beardStyles.style]?.url;

      if (beardURL) {
        threeDimUrls[beardStyles.style] = beardURL;
      }
    }
    if (mustacheStyles && mustacheStyles.threeDim && this.effects.mustaches) {
      const mustacheURL = mustachesDataURLs.diff[mustacheStyles.style]?.url;

      if (mustacheURL) {
        threeDimUrls[mustacheStyles.style] = mustacheURL;
      }
    }
    if (maskStyles && maskStyles.threeDim && this.effects.masks) {
      const maskURL = masksDataURLs.diff[maskStyles.style]?.url;

      if (maskURL) {
        threeDimUrls[maskStyles.style] = maskURL;
      }
    }
    if (hatStyles && hatStyles.threeDim && this.effects.hats) {
      const hatURL = hatsDataURLs.diff[hatStyles.style]?.url;

      if (hatURL) {
        threeDimUrls[hatStyles.style] = hatURL;
      }
    }
    if (petStyles && petStyles.threeDim && this.effects.pets) {
      const petURL = petsDataURLs.diff[petStyles.style]?.url;

      if (petURL) {
        threeDimUrls[petStyles.style] = petURL;
      }
    }

    const normalUrls: { [key: string]: string } = {};

    if (glassesStyles && glassesStyles.threeDim && this.effects.glasses) {
      const glassesURL = glassesDataURLs.nor[glassesStyles.style]?.url;

      if (glassesURL) {
        normalUrls[glassesStyles.style] = glassesURL;
      }
    }
    if (beardStyles && beardStyles.threeDim && this.effects.beards) {
      const beardURL = beardsDataURLs.nor[beardStyles.style]?.url;

      if (beardURL) {
        normalUrls[beardStyles.style] = beardURL;
      }
    }
    if (mustacheStyles && mustacheStyles.threeDim && this.effects.mustaches) {
      const mustacheURL = mustachesDataURLs.nor[mustacheStyles.style]?.url;

      if (mustacheURL) {
        normalUrls[mustacheStyles.style] = mustacheURL;
      }
    }
    if (maskStyles && maskStyles.threeDim && this.effects.masks) {
      const maskURL = masksDataURLs.nor[maskStyles.style]?.url;

      if (maskURL) {
        normalUrls[maskStyles.style] = maskURL;
      }
    }
    if (hatStyles && hatStyles.threeDim && this.effects.hats) {
      const hatURL = hatsDataURLs.nor[hatStyles.style]?.url;

      if (hatURL) {
        normalUrls[hatStyles.style] = hatURL;
      }
    }
    if (petStyles && petStyles.threeDim && this.effects.pets) {
      const petURL = petsDataURLs.nor[petStyles.style]?.url;

      if (petURL) {
        normalUrls[petStyles.style] = petURL;
      }
    }

    const metallicRoughnessUrls: { [key: string]: string } = {};

    if (glassesStyles && glassesStyles.threeDim && this.effects.glasses) {
      const glassesURL = glassesDataURLs.metalRough[glassesStyles.style]?.url;

      if (glassesURL) {
        metallicRoughnessUrls[glassesStyles.style] = glassesURL;
      }
    }
    if (beardStyles && beardStyles.threeDim && this.effects.beards) {
      const beardURL = beardsDataURLs.metalRough[beardStyles.style]?.url;

      if (beardURL) {
        metallicRoughnessUrls[beardStyles.style] = beardURL;
      }
    }
    if (mustacheStyles && mustacheStyles.threeDim && this.effects.mustaches) {
      const mustacheURL =
        mustachesDataURLs.metalRough[mustacheStyles.style]?.url;

      if (mustacheURL) {
        metallicRoughnessUrls[mustacheStyles.style] = mustacheURL;
      }
    }
    if (maskStyles && maskStyles.threeDim && this.effects.masks) {
      const maskURL = masksDataURLs.metalRough[maskStyles.style]?.url;

      if (maskURL) {
        metallicRoughnessUrls[maskStyles.style] = maskURL;
      }
    }
    if (hatStyles && hatStyles.threeDim && this.effects.hats) {
      const hatURL = hatsDataURLs.metalRough[hatStyles.style]?.url;

      if (hatURL) {
        metallicRoughnessUrls[hatStyles.style] = hatURL;
      }
    }
    if (petStyles && petStyles.threeDim && this.effects.pets) {
      const petURL = petsDataURLs.metalRough[petStyles.style]?.url;

      if (petURL) {
        metallicRoughnessUrls[petStyles.style] = petURL;
      }
    }

    const specularUrls: { [key: string]: string } = {};

    if (glassesStyles && glassesStyles.threeDim && this.effects.glasses) {
      const glassesURL = glassesDataURLs.spec[glassesStyles.style]?.url;

      if (glassesURL) {
        specularUrls[glassesStyles.style] = glassesURL;
      }
    }
    if (beardStyles && beardStyles.threeDim && this.effects.beards) {
      const beardURL = beardsDataURLs.spec[beardStyles.style]?.url;

      if (beardURL) {
        specularUrls[beardStyles.style] = beardURL;
      }
    }
    if (mustacheStyles && mustacheStyles.threeDim && this.effects.mustaches) {
      const mustacheURL = mustachesDataURLs.spec[mustacheStyles.style]?.url;

      if (mustacheURL) {
        specularUrls[mustacheStyles.style] = mustacheURL;
      }
    }
    if (maskStyles && maskStyles.threeDim && this.effects.masks) {
      const maskURL = masksDataURLs.spec[maskStyles.style]?.url;

      if (maskURL) {
        specularUrls[maskStyles.style] = maskURL;
      }
    }
    if (hatStyles && hatStyles.threeDim && this.effects.hats) {
      const hatURL = hatsDataURLs.spec[hatStyles.style]?.url;

      if (hatURL) {
        specularUrls[hatStyles.style] = hatURL;
      }
    }
    if (petStyles && petStyles.threeDim && this.effects.pets) {
      const petURL = petsDataURLs.spec[petStyles.style]?.url;

      if (petURL) {
        specularUrls[petStyles.style] = petURL;
      }
    }

    const transmissionUrls: { [key: string]: string } = {};

    if (glassesStyles && glassesStyles.threeDim && this.effects.glasses) {
      const glassesURL = glassesDataURLs.trans[glassesStyles.style]?.url;

      if (glassesURL) {
        transmissionUrls[glassesStyles.style] = glassesURL;
      }
    }
    if (beardStyles && beardStyles.threeDim && this.effects.beards) {
      const beardURL = beardsDataURLs.trans[beardStyles.style]?.url;

      if (beardURL) {
        transmissionUrls[beardStyles.style] = beardURL;
      }
    }
    if (mustacheStyles && mustacheStyles.threeDim && this.effects.mustaches) {
      const mustacheURL = mustachesDataURLs.trans[mustacheStyles.style]?.url;

      if (mustacheURL) {
        transmissionUrls[mustacheStyles.style] = mustacheURL;
      }
    }
    if (maskStyles && maskStyles.threeDim && this.effects.masks) {
      const maskURL = masksDataURLs.trans[maskStyles.style]?.url;

      if (maskURL) {
        transmissionUrls[maskStyles.style] = maskURL;
      }
    }
    if (hatStyles && hatStyles.threeDim && this.effects.hats) {
      const hatURL = hatsDataURLs.trans[hatStyles.style]?.url;

      if (hatURL) {
        transmissionUrls[hatStyles.style] = hatURL;
      }
    }
    if (petStyles && petStyles.threeDim && this.effects.pets) {
      const petURL = petsDataURLs.trans[petStyles.style]?.url;

      if (petURL) {
        transmissionUrls[petStyles.style] = petURL;
      }
    }

    await this.baseShader.updateAtlasTexture("twoDim", twoDimUrls);
    await this.baseShader.updateAtlasTexture("threeDim", threeDimUrls);
    await this.baseShader.updateAtlasTexture("normal", normalUrls);
    await this.baseShader.updateAtlasTexture(
      "metallicRoughness",
      metallicRoughnessUrls
    );
    await this.baseShader.updateAtlasTexture("specular", specularUrls);
    await this.baseShader.updateAtlasTexture("transmission", transmissionUrls);
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
