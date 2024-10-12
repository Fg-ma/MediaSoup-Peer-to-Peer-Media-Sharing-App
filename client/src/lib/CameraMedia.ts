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
import { FaceMesh, NormalizedLandmarkListList } from "@mediapipe/face_mesh";
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
    size: number;
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
  diffuse: AssetTexsData;
  normal: AssetTexsData;
  transmissionRoughnessMetallic: AssetTexsData;
  specular: AssetTexsData;
  emission: AssetTexsData;
  meshes: AssetMeshesData;
}

export const mustachesDataURLs: AssetData = {
  image: {
    disguiseMustache: {
      url: "/2DAssets/mustaches/disguiseMustache/disguiseMustache_512x512.png",
      size: 512,
    },
    fullMustache: {
      url: "/2DAssets/mustaches/fullMustache/fullMustache_512x512.png",
      size: 512,
    },
    mustache1: {
      url: "/2DAssets/mustaches/mustache1/mustache1_512x512.png",
      size: 512,
    },
    mustache2: {
      url: "/2DAssets/mustaches/mustache2/mustache2_512x512.png",
      size: 512,
    },
    mustache3: {
      url: "/2DAssets/mustaches/mustache3/mustache3_512x512.png",
      size: 512,
    },
    mustache4: {
      url: "/2DAssets/mustaches/mustache4/mustache4_512x512.png",
      size: 512,
    },
    nicodemusMustache: {
      url: "/2DAssets/mustaches/nicodemusMustache/nicodemusMustache_512x512.png",
      size: 512,
    },
    pencilMustache: {
      url: "/2DAssets/mustaches/pencilMustache/pencilMustache_512x512.png",
      size: 512,
    },
    spongebobMustache: {
      url: "/2DAssets/mustaches/spongebobMustache/spongebobMustache_512x512.png",
      size: 512,
    },
    tinyMustache: {
      url: "/2DAssets/mustaches/tinyMustache/tinyMustache_512x512.png",
      size: 512,
    },
    wingedMustache: {
      url: "/2DAssets/mustaches/wingedMustache/wingedMustache_512x512.png",
      size: 512,
    },
  },
  diffuse: {
    disguiseMustache: {
      url: "/3DAssets/mustaches/disguiseMustache/texs/disguiseMustache_diff_256x256.png",
      size: 256,
    },
    fullMustache: {
      url: "/3DAssets/mustaches/fullMustache/texs/fullMustache_diff_256x256.png",
      size: 256,
    },
    mustache1: {
      url: "/3DAssets/mustaches/mustache1/texs/mustache1_diff_256x256.png",
      size: 256,
    },
    mustache2: {
      url: "/3DAssets/mustaches/mustache2/texs/mustache2_diff_256x256.png",
      size: 256,
    },
    mustache3: {
      url: "/3DAssets/mustaches/mustache3/texs/mustache3_diff_256x256.png",
      size: 256,
    },
    mustache4: {
      url: "/3DAssets/mustaches/mustache4/texs/mustache4_diff_256x256.png",
      size: 256,
    },
    nicodemusMustache: {
      url: "/3DAssets/mustaches/nicodemusMustache/texs/nicodemusMustache_diff_256x256.png",
      size: 256,
    },
    pencilMustache: {
      url: "/3DAssets/mustaches/pencilMustache/texs/pencilMustache_diff_256x256.png",
      size: 256,
    },
    spongebobMustache: {
      url: "/3DAssets/mustaches/spongebobMustache/texs/spongebobMustache_diff_256x256.png",
      size: 256,
    },
    tinyMustache: {
      url: "/3DAssets/mustaches/tinyMustache/texs/tinyMustache_diff_256x256.png",
      size: 256,
    },
    wingedMustache: {
      url: "/3DAssets/mustaches/wingedMustache/texs/wingedMustache_diff_256x256.png",
      size: 256,
    },
  },
  normal: {
    fullMustache: {
      url: "/3DAssets/mustaches/fullMustache/texs/fullMustache_nor_256x256.png",
      size: 256,
    },
    wingedMustache: {
      url: "/3DAssets/mustaches/wingedMustache/texs/wingedMustache_nor_256x256.png",
      size: 256,
    },
  },
  transmissionRoughnessMetallic: {
    fullMustache: {
      url: "/3DAssets/mustaches/fullMustache/texs/fullMustache_transRoughMetal_256x256.png",
      size: 256,
    },
    wingedMustache: {
      url: "/3DAssets/mustaches/wingedMustache/texs/wingedMustache_transRoughMetal_256x256.png",
      size: 256,
    },
  },
  specular: {},
  emission: {},
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
      size: 512,
    },
    classicalCurlyBeard: {
      url: "/2DAssets/beards/classicalCurlyBeard/classicalCurlyBeard_512x512.png",
      size: 512,
    },
    fullBeard: {
      url: "/2DAssets/beards/fullBeard/fullBeard_512x512.png",
      size: 512,
    },
  },
  diffuse: {
    chinBeard: {
      url: "/3DAssets/beards/chinBeard/texs/chinBeard_diff_256x256.png",
      size: 256,
    },
    classicalCurlyBeard: {
      url: "/3DAssets/beards/classicalCurlyBeard/texs/classicalCurlyBeard_diff_256x256.png",
      size: 256,
    },
    fullBeard: {
      url: "/3DAssets/beards/fullBeard/texs/fullBeard_diff_256x256.png",
      size: 256,
    },
  },
  normal: {
    chinBeard: {
      url: "/3DAssets/beards/chinBeard/texs/chinBeard_nor_256x256.png",
      size: 256,
    },
    fullBeard: {
      url: "/3DAssets/beards/fullBeard/texs/fullBeard_nor_256x256.png",
      size: 256,
    },
  },
  transmissionRoughnessMetallic: {
    chinBeard: {
      url: "/3DAssets/beards/chinBeard/texs/chinBeard_transRoughMetal_256x256.png",
      size: 256,
    },
    fullBeard: {
      url: "/3DAssets/beards/fullBeard/texs/fullBeard_transRoughMetal_256x256.png",
      size: 256,
    },
  },
  specular: {
    chinBeard: {
      url: "/3DAssets/beards/chinBeard/texs/chinBeard_spec_256x256.png",
      size: 256,
    },
  },
  emission: {
    chinBeard: {
      url: "/3DAssets/beards/chinBeard/texs/chinBeard_emiss_256x256.png",
      size: 256,
    },
  },
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
      size: 512,
    },
    baseMask: {
      url: "/2DAssets/masks/baseMask/baseMask_512x512.png",
      size: 512,
    },
    clownMask: {
      url: "/2DAssets/masks/clownMask/clownMask_512x512.png",
      size: 512,
    },
    creatureMask: {
      url: "/2DAssets/masks/creatureMask/creatureMask_512x512.png",
      size: 512,
    },
    cyberMask: {
      url: "/2DAssets/masks/cyberMask/cyberMask_512x512.png",
      size: 512,
    },
    darkKnightMask: {
      url: "/2DAssets/masks/darkKnightMask/darkKnightMask_512x512.png",
      size: 512,
    },
    demonMask: {
      url: "/2DAssets/masks/demonMask/demonMask_512x512.png",
      size: 512,
    },
    gasMask1: {
      url: "/2DAssets/masks/gasMask1/gasMask1_512x512.png",
      size: 512,
    },
    gasMask2: {
      url: "/2DAssets/masks/gasMask2/gasMask2_512x512.png",
      size: 512,
    },
    gasMask3: {
      url: "/2DAssets/masks/gasMask3/gasMask3_512x512.png",
      size: 512,
    },
    gasMask4: {
      url: "/2DAssets/masks/gasMask4/gasMask4_512x512.png",
      size: 512,
    },
    masqueradeMask: {
      url: "/2DAssets/masks/masqueradeMask/masqueradeMask_512x512.png",
      size: 512,
    },
    metalManMask: {
      url: "/2DAssets/masks/metalManMask/metalManMask_512x512.png",
      size: 512,
    },
    oniMask: {
      url: "/2DAssets/masks/oniMask/oniMask_512x512.png",
      size: 512,
    },
    plagueDoctorMask: {
      url: "/2DAssets/masks/plagueDoctorMask/plagueDoctorMask_512x512.png",
      size: 512,
    },
    sixEyesMask: {
      url: "/2DAssets/masks/sixEyesMask/sixEyesMask_512x512.png",
      size: 512,
    },
    tenguMask: {
      url: "/2DAssets/masks/tenguMask/tenguMask_512x512.png",
      size: 512,
    },
    threeFaceMask: {
      url: "/2DAssets/masks/threeFaceMask/threeFaceMask_512x512.png",
      size: 512,
    },
    weldingMask: {
      url: "/2DAssets/masks/weldingMask/weldingMask_512x512.png",
      size: 512,
    },
    woodlandMask: {
      url: "/2DAssets/masks/woodlandMask/woodlandMask_512x512.png",
      size: 512,
    },
    woodPaintedMask: {
      url: "/2DAssets/masks/woodPaintedMask/woodPaintedMask_512x512.png",
      size: 512,
    },
    zombieMask: {
      url: "/2DAssets/masks/zombieMask/zombieMask_512x512.png",
      size: 512,
    },
  },
  diffuse: {
    alienMask: {
      url: "/3DAssets/masks/alienMask/texs/alienMask_diff_256x256.png",
      size: 256,
    },
    baseMask: {
      url: "/3DAssets/masks/baseMask/texs/baseMask_diff_256x256.png",
      size: 256,
    },
    clownMask: {
      url: "/3DAssets/masks/clownMask/texs/clownMask_diff_256x256.png",
      size: 256,
    },
    creatureMask: {
      url: "/3DAssets/masks/creatureMask/texs/creatureMask_diff_256x256.png",
      size: 256,
    },
    cyberMask: {
      url: "/3DAssets/masks/cyberMask/texs/cyberMask_diff_256x256.png",
      size: 256,
    },
    darkKnightMask: {
      url: "/3DAssets/masks/darkKnightMask/texs/darkKnightMask_diff_256x256.png",
      size: 256,
    },
    demonMask: {
      url: "/3DAssets/masks/demonMask/texs/demonMask_diff_256x256.png",
      size: 256,
    },
    gasMask1: {
      url: "/3DAssets/masks/gasMask1/texs/gasMask1_diff_256x256.png",
      size: 256,
    },
    gasMask2: {
      url: "/3DAssets/masks/gasMask2/texs/gasMask2_diff_256x256.png",
      size: 256,
    },
    gasMask3: {
      url: "/3DAssets/masks/gasMask3/texs/gasMask3_diff_256x256.png",
      size: 256,
    },
    gasMask4: {
      url: "/3DAssets/masks/gasMask4/texs/gasMask4_diff_256x256.png",
      size: 256,
    },
    masqueradeMask: {
      url: "/3DAssets/masks/masqueradeMask/texs/masqueradeMask_diff_256x256.png",
      size: 256,
    },
    metalManMask: {
      url: "/3DAssets/masks/metalManMask/texs/metalManMask_diff_256x256.png",
      size: 256,
    },
    oniMask: {
      url: "/3DAssets/masks/oniMask/texs/oniMask_diff_256x256.png",
      size: 256,
    },
    plagueDoctorMask: {
      url: "/3DAssets/masks/plagueDoctorMask/texs/plagueDoctorMask_diff_256x256.png",
      size: 256,
    },
    sixEyesMask: {
      url: "/3DAssets/masks/sixEyesMask/texs/sixEyesMask_diff_256x256.png",
      size: 256,
    },
    tenguMask: {
      url: "/3DAssets/masks/tenguMask/texs/tenguMask_diff_256x256.png",
      size: 256,
    },
    threeFaceMask: {
      url: "/3DAssets/masks/threeFaceMask/texs/threeFaceMask_diff_256x256.png",
      size: 256,
    },
    weldingMask: {
      url: "/3DAssets/masks/weldingMask/texs/weldingMask_diff_256x256.png",
      size: 256,
    },
    woodlandMask: {
      url: "/3DAssets/masks/woodlandMask/texs/woodlandMask_diff_256x256.png",
      size: 256,
    },
    woodPaintedMask: {
      url: "/3DAssets/masks/woodPaintedMask/texs/woodPaintedMask_diff_256x256.png",
      size: 256,
    },
    zombieMask: {
      url: "/3DAssets/masks/zombieMask/texs/zombieMask_diff_256x256.png",
      size: 256,
    },
  },
  normal: {
    alienMask: {
      url: "/3DAssets/masks/alienMask/texs/alienMask_nor_256x256.png",
      size: 256,
    },
    clownMask: {
      url: "/3DAssets/masks/clownMask/texs/clownMask_nor_256x256.png",
      size: 256,
    },
    creatureMask: {
      url: "/3DAssets/masks/creatureMask/texs/creatureMask_nor_256x256.png",
      size: 256,
    },
    cyberMask: {
      url: "/3DAssets/masks/cyberMask/texs/cyberMask_nor_256x256.png",
      size: 256,
    },
    darkKnightMask: {
      url: "/3DAssets/masks/darkKnightMask/texs/darkKnightMask_nor_256x256.png",
      size: 256,
    },
    demonMask: {
      url: "/3DAssets/masks/demonMask/texs/demonMask_nor_256x256.png",
      size: 256,
    },
    gasMask1: {
      url: "/3DAssets/masks/gasMask1/texs/gasMask1_nor_256x256.png",
      size: 256,
    },
    gasMask2: {
      url: "/3DAssets/masks/gasMask2/texs/gasMask2_nor_256x256.png",
      size: 256,
    },
    gasMask3: {
      url: "/3DAssets/masks/gasMask3/texs/gasMask3_nor_256x256.png",
      size: 256,
    },
    gasMask4: {
      url: "/3DAssets/masks/gasMask4/texs/gasMask4_nor_256x256.png",
      size: 256,
    },
    masqueradeMask: {
      url: "/3DAssets/masks/masqueradeMask/texs/masqueradeMask_nor_256x256.png",
      size: 256,
    },
    metalManMask: {
      url: "/3DAssets/masks/metalManMask/texs/metalManMask_nor_256x256.png",
      size: 256,
    },
    oniMask: {
      url: "/3DAssets/masks/oniMask/texs/oniMask_nor_256x256.png",
      size: 256,
    },
    plagueDoctorMask: {
      url: "/3DAssets/masks/plagueDoctorMask/texs/plagueDoctorMask_nor_256x256.png",
      size: 256,
    },
    sixEyesMask: {
      url: "/3DAssets/masks/sixEyesMask/texs/sixEyesMask_nor_256x256.png",
      size: 256,
    },
    tenguMask: {
      url: "/3DAssets/masks/tenguMask/texs/tenguMask_nor_256x256.png",
      size: 256,
    },
    threeFaceMask: {
      url: "/3DAssets/masks/threeFaceMask/texs/threeFaceMask_nor_256x256.png",
      size: 256,
    },
    woodlandMask: {
      url: "/3DAssets/masks/woodlandMask/texs/woodlandMask_nor_256x256.png",
      size: 256,
    },
    woodPaintedMask: {
      url: "/3DAssets/masks/woodPaintedMask/texs/woodPaintedMask_nor_256x256.png",
      size: 256,
    },
    zombieMask: {
      url: "/3DAssets/masks/zombieMask/texs/zombieMask_nor_256x256.png",
      size: 256,
    },
  },
  transmissionRoughnessMetallic: {
    alienMask: {
      url: "/3DAssets/masks/alienMask/texs/alienMask_transRoughMetal_256x256.png",
      size: 256,
    },
    clownMask: {
      url: "/3DAssets/masks/clownMask/texs/clownMask_transRoughMetal_256x256.png",
      size: 256,
    },
    creatureMask: {
      url: "/3DAssets/masks/creatureMask/texs/creatureMask_transRoughMetal_256x256.png",
      size: 256,
    },
    cyberMask: {
      url: "/3DAssets/masks/cyberMask/texs/cyberMask_transRoughMetal_256x256.png",
      size: 256,
    },
    darkKnightMask: {
      url: "/3DAssets/masks/darkKnightMask/texs/darkKnightMask_transRoughMetal_256x256.png",
      size: 256,
    },
    demonMask: {
      url: "/3DAssets/masks/demonMask/texs/demonMask_transRoughMetal_256x256.png",
      size: 256,
    },
    gasMask1: {
      url: "/3DAssets/masks/gasMask1/texs/gasMask1_transRoughMetal_256x256.png",
      size: 256,
    },
    gasMask2: {
      url: "/3DAssets/masks/gasMask2/texs/gasMask2_transRoughMetal_256x256.png",
      size: 256,
    },
    gasMask3: {
      url: "/3DAssets/masks/gasMask3/texs/gasMask3_transRoughMetal_256x256.png",
      size: 256,
    },
    gasMask4: {
      url: "/3DAssets/masks/gasMask4/texs/gasMask4_transRoughMetal_256x256.png",
      size: 256,
    },
    masqueradeMask: {
      url: "/3DAssets/masks/masqueradeMask/texs/masqueradeMask_transRoughMetal_256x256.png",
      size: 256,
    },
    metalManMask: {
      url: "/3DAssets/masks/metalManMask/texs/metalManMask_transRoughMetal_256x256.png",
      size: 256,
    },
    oniMask: {
      url: "/3DAssets/masks/oniMask/texs/oniMask_transRoughMetal_256x256.png",
      size: 256,
    },
    plagueDoctorMask: {
      url: "/3DAssets/masks/plagueDoctorMask/texs/plagueDoctorMask_transRoughMetal_256x256.png",
      size: 256,
    },
    sixEyesMask: {
      url: "/3DAssets/masks/sixEyesMask/texs/sixEyesMask_transRoughMetal_256x256.png",
      size: 256,
    },
    tenguMask: {
      url: "/3DAssets/masks/tenguMask/texs/tenguMask_transRoughMetal_256x256.png",
      size: 256,
    },
    threeFaceMask: {
      url: "/3DAssets/masks/threeFaceMask/texs/threeFaceMask_transRoughMetal_256x256.png",
      size: 256,
    },
    woodlandMask: {
      url: "/3DAssets/masks/woodlandMask/texs/woodlandMask_transRoughMetal_256x256.png",
      size: 256,
    },
    woodPaintedMask: {
      url: "/3DAssets/masks/woodPaintedMask/texs/woodPaintedMask_transRoughMetal_256x256.png",
      size: 256,
    },
    zombieMask: {
      url: "/3DAssets/masks/zombieMask/texs/zombieMask_transRoughMetal_256x256.png",
      size: 256,
    },
  },
  specular: {},
  emission: {
    cyberMask: {
      url: "/3DAssets/masks/cyberMask/texs/cyberMask_emiss_256x256.png",
      size: 256,
    },
  },
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
      size: 512,
    },
    AmericaGlasses: {
      url: "/2DAssets/glasses/AmericaGlasses/AmericaGlasses_512x512.png",
      size: 512,
    },
    aviatorGoggles: {
      url: "/2DAssets/glasses/aviatorGoggles/aviatorGoggles_512x512.png",
      size: 512,
    },
    bloodyGlasses: {
      url: "/2DAssets/glasses/bloodyGlasses/bloodyGlasses_512x512.png",
      size: 512,
    },
    eyeProtectionGlasses: {
      url: "/2DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses_512x512.png",
      size: 512,
    },
    glasses1: {
      url: "/2DAssets/glasses/glasses1/glasses1_512x512.png",
      size: 512,
    },
    glasses2: {
      url: "/2DAssets/glasses/glasses2/glasses2_512x512.png",
      size: 512,
    },
    glasses3: {
      url: "/2DAssets/glasses/glasses3/glasses3_512x512.png",
      size: 512,
    },
    glasses4: {
      url: "/2DAssets/glasses/glasses4/glasses4_512x512.png",
      size: 512,
    },
    glasses5: {
      url: "/2DAssets/glasses/glasses5/glasses5_512x512.png",
      size: 512,
    },
    glasses6: {
      url: "/2DAssets/glasses/glasses6/glasses6_512x512.png",
      size: 512,
    },
    memeGlasses: {
      url: "/2DAssets/glasses/memeGlasses/memeGlasses_512x512.png",
      size: 512,
    },
    militaryTacticalGlasses: {
      url: "/2DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses_512x512.png",
      size: 512,
    },
    steampunkGlasses: {
      url: "/2DAssets/glasses/steampunkGlasses/steampunkGlasses_512x512.png",
      size: 512,
    },
    threeDGlasses: {
      url: "/2DAssets/glasses/threeDGlasses/threeDGlasses_512x512.png",
      size: 512,
    },
    toyGlasses: {
      url: "/2DAssets/glasses/toyGlasses/toyGlasses_512x512.png",
      size: 512,
    },
    shades: {
      url: "/2DAssets/glasses/shades/shades_512x512.png",
      size: 512,
    },
    VRGlasses: {
      url: "/2DAssets/glasses/VRGlasses/VRGlasses_512x512.png",
      size: 512,
    },
  },
  diffuse: {
    defaultGlasses: {
      url: "/3DAssets/glasses/defaultGlasses/texs/defaultGlasses_diff_256x256.png",
      size: 256,
    },
    AmericaGlasses: {
      url: "/3DAssets/glasses/AmericaGlasses/texs/AmericaGlasses_diff_256x256.png",
      size: 256,
    },
    aviatorGoggles: {
      url: "/3DAssets/glasses/aviatorGoggles/texs/aviatorGoggles_diff_256x256.png",
      size: 256,
    },
    bloodyGlasses: {
      url: "/3DAssets/glasses/bloodyGlasses/texs/bloodyGlasses_diff_256x256.png",
      size: 256,
    },
    eyeProtectionGlasses: {
      url: "/3DAssets/glasses/eyeProtectionGlasses/texs/eyeProtectionGlasses_diff_256x256.png",
      size: 256,
    },
    glasses1: {
      url: "/3DAssets/glasses/glasses1/texs/glasses1_diff_256x256.png",
      size: 256,
    },
    glasses2: {
      url: "/3DAssets/glasses/glasses2/texs/glasses2_diff_256x256.png",
      size: 256,
    },
    glasses3: {
      url: "/3DAssets/glasses/glasses3/texs/glasses3_diff_256x256.png",
      size: 256,
    },
    glasses4: {
      url: "/3DAssets/glasses/glasses4/texs/glasses4_diff_256x256.png",
      size: 256,
    },
    glasses5: {
      url: "/3DAssets/glasses/glasses5/texs/glasses5_diff_256x256.png",
      size: 256,
    },
    glasses6: {
      url: "/3DAssets/glasses/glasses6/texs/glasses6_diff_256x256.png",
      size: 256,
    },
    memeGlasses: {
      url: "/3DAssets/glasses/memeGlasses/texs/memeGlasses_diff_32x32.png",
      size: 32,
    },
    militaryTacticalGlasses: {
      url: "/3DAssets/glasses/militaryTacticalGlasses/texs/militaryTacticalGlasses_diff_256x256.png",
      size: 256,
    },
    steampunkGlasses: {
      url: "/3DAssets/glasses/steampunkGlasses/texs/steampunkGlasses_diff_256x256.png",
      size: 256,
    },
    threeDGlasses: {
      url: "/3DAssets/glasses/threeDGlasses/texs/threeDGlasses_diff_256x256.png",
      size: 256,
    },
    toyGlasses: {
      url: "/3DAssets/glasses/toyGlasses/texs/toyGlasses_diff_256x256.png",
      size: 256,
    },
    shades: {
      url: "/3DAssets/glasses/shades/texs/shades_diff_256x256.png",
      size: 256,
    },
    VRGlasses: {
      url: "/3DAssets/glasses/VRGlasses/texs/VRGlasses_diff_256x256.png",
      size: 256,
    },
  },
  normal: {
    aviatorGoggles: {
      url: "/3DAssets/glasses/aviatorGoggles/texs/aviatorGoggles_nor_256x256.png",
      size: 256,
    },
    bloodyGlasses: {
      url: "/3DAssets/glasses/bloodyGlasses/texs/bloodyGlasses_nor_256x256.png",
      size: 256,
    },
    eyeProtectionGlasses: {
      url: "/3DAssets/glasses/eyeProtectionGlasses/texs/eyeProtectionGlasses_nor_256x256.png",
      size: 256,
    },
    glasses6: {
      url: "/3DAssets/glasses/glasses6/texs/glasses6_nor_256x256.png",
      size: 256,
    },
    militaryTacticalGlasses: {
      url: "/3DAssets/glasses/militaryTacticalGlasses/texs/militaryTacticalGlasses_nor_256x256.png",
      size: 256,
    },
    steampunkGlasses: {
      url: "/3DAssets/glasses/steampunkGlasses/texs/steampunkGlasses_nor_256x256.png",
      size: 256,
    },
    toyGlasses: {
      url: "/3DAssets/glasses/toyGlasses/texs/toyGlasses_nor_256x256.png",
      size: 256,
    },
  },
  transmissionRoughnessMetallic: {
    aviatorGoggles: {
      url: "/3DAssets/glasses/aviatorGoggles/texs/aviatorGoggles_transRoughMetal_256x256.png",
      size: 256,
    },
    bloodyGlasses: {
      url: "/3DAssets/glasses/bloodyGlasses/texs/bloodyGlasses_transRoughMetal_256x256.png",
      size: 256,
    },
    eyeProtectionGlasses: {
      url: "/3DAssets/glasses/eyeProtectionGlasses/texs/eyeProtectionGlasses_transRoughMetal_256x256.png",
      size: 256,
    },
    glasses1: {
      url: "/3DAssets/glasses/glasses1/texs/glasses1_transRoughMetal_256x256.png",
      size: 256,
    },
    glasses6: {
      url: "/3DAssets/glasses/glasses6/texs/glasses6_transRoughMetal_256x256.png",
      size: 256,
    },
    militaryTacticalGlasses: {
      url: "/3DAssets/glasses/militaryTacticalGlasses/texs/militaryTacticalGlasses_transRoughMetal_256x256.png",
      size: 256,
    },
    steampunkGlasses: {
      url: "/3DAssets/glasses/steampunkGlasses/texs/steampunkGlasses_transRoughMetal_256x256.png",
      size: 256,
    },
    toyGlasses: {
      url: "/3DAssets/glasses/toyGlasses/texs/toyGlasses_transRoughMetal_256x256.png",
      size: 256,
    },
  },
  specular: {
    militaryTacticalGlasses: {
      url: "/3DAssets/glasses/militaryTacticalGlasses/texs/militaryTacticalGlasses_spec_256x256.png",
      size: 256,
    },
  },
  emission: {
    glasses1: {
      url: "/3DAssets/glasses/glasses1/texs/glasses1_emiss_256x256.png",
      size: 256,
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
      size: 512,
    },
    aviatorHelmet: {
      url: "/2DAssets/hats/aviatorHelmet/aviatorHelmet_512x512.png",
      size: 512,
    },
    bicornHat: {
      url: "/2DAssets/hats/bicornHat/bicornHat_512x512.png",
      size: 512,
    },
    bicycleHelmet: {
      url: "/2DAssets/hats/bicycleHelmet/bicycleHelmet_512x512.png",
      size: 512,
    },
    captainsHat: {
      url: "/2DAssets/hats/captainsHat/captainsHat_512x512.png",
      size: 512,
    },
    chefHat: {
      url: "/2DAssets/hats/chefHat/chefHat_512x512.png",
      size: 512,
    },
    chickenHat: {
      url: "/2DAssets/hats/chickenHat/chickenHat_512x512.png",
      size: 512,
    },
    deadManHat: {
      url: "/2DAssets/hats/deadManHat/deadManHat_512x512.png",
      size: 512,
    },
    dogEars: {
      url: "/2DAssets/hats/dogEars/dogEars_512x512.png",
      size: 512,
    },
    flatCap: {
      url: "/2DAssets/hats/flatCap/flatCap_512x512.png",
      size: 512,
    },
    hardHat: {
      url: "/2DAssets/hats/hardHat/hardHat_512x512.png",
      size: 512,
    },
    hopliteHelmet: {
      url: "/2DAssets/hats/hopliteHelmet/hopliteHelmet_512x512.png",
      size: 512,
    },
    militaryHat: {
      url: "/2DAssets/hats/militaryHat/militaryHat_512x512.png",
      size: 512,
    },
    rabbitEars: {
      url: "/2DAssets/hats/rabbitEars/rabbitEars_512x512.png",
      size: 512,
    },
    roundEarsHat: {
      url: "/2DAssets/hats/roundEarsHat/roundEarsHat_512x512.png",
      size: 512,
    },
    santaHat: {
      url: "/2DAssets/hats/santaHat/santaHat_512x512.png",
      size: 512,
    },
    seamanHat: {
      url: "/2DAssets/hats/seamanHat/seamanHat_512x512.png",
      size: 512,
    },
    stylishHat: {
      url: "/2DAssets/hats/stylishHat/stylishHat_512x512.png",
      size: 512,
    },
    superMarioOdysseyHat: {
      url: "/2DAssets/hats/superMarioOdysseyHat/superMarioOdysseyHat_512x512.png",
      size: 512,
    },
    ushankaHat: {
      url: "/2DAssets/hats/ushankaHat/ushankaHat_512x512.png",
      size: 512,
    },
    vikingHelmet: {
      url: "/2DAssets/hats/vikingHelmet/vikingHelmet_512x512.png",
      size: 512,
    },
  },
  diffuse: {
    AsianConicalHat: {
      url: "/3DAssets/hats/AsianConicalHat/texs/AsianConicalHat_diff_256x256.png",
      size: 256,
    },
    aviatorHelmet: {
      url: "/3DAssets/hats/aviatorHelmet/texs/aviatorHelmet_diff_256x256.png",
      size: 256,
    },
    bicornHat: {
      url: "/3DAssets/hats/bicornHat/texs/bicornHat_diff_256x256.png",
      size: 256,
    },
    bicycleHelmet: {
      url: "/3DAssets/hats/bicycleHelmet/texs/bicycleHelmet_diff_256x256.png",
      size: 256,
    },
    captainsHat: {
      url: "/3DAssets/hats/captainsHat/texs/captainsHat_diff_256x256.png",
      size: 256,
    },
    chefHat: {
      url: "/3DAssets/hats/chefHat/texs/chefHat_diff_256x256.png",
      size: 256,
    },
    chickenHat: {
      url: "/3DAssets/hats/chickenHat/texs/chickenHat_diff_256x256.png",
      size: 256,
    },
    deadManHat: {
      url: "/3DAssets/hats/deadManHat/texs/deadManHat_diff_256x256.png",
      size: 256,
    },
    dogEars: {
      url: "/3DAssets/hats/dogEars/texs/dogEars_diff_256x256.png",
      size: 256,
    },
    flatCap: {
      url: "/3DAssets/hats/flatCap/texs/flatCap_diff_256x256.png",
      size: 256,
    },
    hardHat: {
      url: "/3DAssets/hats/hardHat/texs/hardHat_diff_256x256.png",
      size: 256,
    },
    hopliteHelmet: {
      url: "/3DAssets/hats/hopliteHelmet/texs/hopliteHelmet_diff_256x256.png",
      size: 256,
    },
    militaryHat: {
      url: "/3DAssets/hats/militaryHat/texs/militaryHat_diff_256x256.png",
      size: 256,
    },
    rabbitEars: {
      url: "/3DAssets/hats/rabbitEars/texs/rabbitEars_diff_128x128.png",
      size: 128,
    },
    roundEarsHat: {
      url: "/3DAssets/hats/roundEarsHat/texs/roundEarsHat_diff_256x256.png",
      size: 256,
    },
    santaHat: {
      url: "/3DAssets/hats/santaHat/texs/santaHat_diff_256x256.png",
      size: 256,
    },
    seamanHat: {
      url: "/3DAssets/hats/seamanHat/texs/seamanHat_diff_256x256.png",
      size: 256,
    },
    stylishHat: {
      url: "/3DAssets/hats/stylishHat/texs/stylishHat_diff_256x256.png",
      size: 256,
    },
    superMarioOdysseyHat: {
      url: "/3DAssets/hats/superMarioOdysseyHat/texs/superMarioOdysseyHat_diff_256x256.png",
      size: 256,
    },
    ushankaHat: {
      url: "/3DAssets/hats/ushankaHat/texs/ushankaHat_diff_256x256.png",
      size: 256,
    },
    vikingHelmet: {
      url: "/3DAssets/hats/vikingHelmet/texs/vikingHelmet_diff_256x256.png",
      size: 256,
    },
  },
  normal: {
    AsianConicalHat: {
      url: "/3DAssets/hats/AsianConicalHat/texs/AsianConicalHat_nor_256x256.png",
      size: 256,
    },
    aviatorHelmet: {
      url: "/3DAssets/hats/aviatorHelmet/texs/aviatorHelmet_nor_256x256.png",
      size: 256,
    },
    bicycleHelmet: {
      url: "/3DAssets/hats/bicycleHelmet/texs/bicycleHelmet_nor_256x256.png",
      size: 256,
    },
    chickenHat: {
      url: "/3DAssets/hats/chickenHat/texs/chickenHat_nor_256x256.png",
      size: 256,
    },
    deadManHat: {
      url: "/3DAssets/hats/deadManHat/texs/deadManHat_nor_256x256.png",
      size: 256,
    },
    hardHat: {
      url: "/3DAssets/hats/hardHat/texs/hardHat_nor_256x256.png",
      size: 256,
    },
    hopliteHelmet: {
      url: "/3DAssets/hats/hopliteHelmet/texs/hopliteHelmet_nor_256x256.png",
      size: 256,
    },
    militaryHat: {
      url: "/3DAssets/hats/militaryHat/texs/militaryHat_nor_256x256.png",
      size: 256,
    },
    santaHat: {
      url: "/3DAssets/hats/santaHat/texs/santaHat_nor_256x256.png",
      size: 256,
    },
    seamanHat: {
      url: "/3DAssets/hats/seamanHat/texs/seamanHat_nor_256x256.png",
      size: 256,
    },
    superMarioOdysseyHat: {
      url: "/3DAssets/hats/superMarioOdysseyHat/texs/superMarioOdysseyHat_nor_256x256.png",
      size: 256,
    },
    vikingHelmet: {
      url: "/3DAssets/hats/vikingHelmet/texs/vikingHelmet_nor_256x256.png",
      size: 256,
    },
  },
  transmissionRoughnessMetallic: {
    AsianConicalHat: {
      url: "/3DAssets/hats/AsianConicalHat/texs/AsianConicalHat_transRoughMetal_256x256.png",
      size: 256,
    },
    bicycleHelmet: {
      url: "/3DAssets/hats/bicycleHelmet/texs/bicycleHelmet_transRoughMetal_256x256.png",
      size: 256,
    },
    chickenHat: {
      url: "/3DAssets/hats/chickenHat/texs/chickenHat_transRoughMetal_256x256.png",
      size: 256,
    },
    deadManHat: {
      url: "/3DAssets/hats/deadManHat/texs/deadManHat_transRoughMetal_256x256.png",
      size: 256,
    },
    flatCap: {
      url: "/3DAssets/hats/flatCap/texs/flatCap_transRoughMetal_256x256.png",
      size: 256,
    },
    hardHat: {
      url: "/3DAssets/hats/hardHat/texs/hardHat_transRoughMetal_256x256.png",
      size: 256,
    },
    hopliteHelmet: {
      url: "/3DAssets/hats/hopliteHelmet/texs/hopliteHelmet_transRoughMetal_256x256.png",
      size: 256,
    },
    militaryHat: {
      url: "/3DAssets/hats/militaryHat/texs/militaryHat_transRoughMetal_256x256.png",
      size: 256,
    },
    santaHat: {
      url: "/3DAssets/hats/santaHat/texs/santaHat_transRoughMetal_256x256.png",
      size: 256,
    },
    seamanHat: {
      url: "/3DAssets/hats/seamanHat/texs/seamanHat_transRoughMetal_256x256.png",
      size: 256,
    },
    superMarioOdysseyHat: {
      url: "/3DAssets/hats/superMarioOdysseyHat/texs/superMarioOdysseyHat_transRoughMetal_256x256.png",
      size: 256,
    },
  },
  specular: {
    hardHat: {
      url: "/3DAssets/hats/hardHat/texs/hardHat_spec_256x256.png",
      size: 256,
    },
    seamanHat: {
      url: "/3DAssets/hats/seamanHat/texs/seamanHat_spec_256x256.png",
      size: 256,
    },
  },
  emission: {},
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
      size: 512,
    },
    axolotl: {
      url: "/2DAssets/pets/axolotl/axolotl_512x512.png",
      size: 512,
    },
    babyDragon: {
      url: "/2DAssets/pets/babyDragon/babyDragon_512x512.png",
      size: 512,
    },
    beardedDragon: {
      url: "/2DAssets/pets/beardedDragon/beardedDragon_512x512.png",
      size: 512,
    },
    bird1: { url: "/2DAssets/pets/bird1/bird1_512x512.png", size: 512 },
    bird2: { url: "/2DAssets/pets/bird2/bird2_512x512.png", size: 512 },
    boxer: { url: "/2DAssets/pets/boxer/boxer_512x512.png", size: 512 },
    brain: { url: "/2DAssets/pets/brain/brain_512x512.png", size: 512 },
    buddyHamster: {
      url: "/2DAssets/pets/buddyHamster/buddyHamster_512x512.png",
      size: 512,
    },
    cat1: { url: "/2DAssets/pets/cat1/cat1_512x512.png", size: 512 },
    cat2: { url: "/2DAssets/pets/cat2/cat2_512x512.png", size: 512 },
    dodoBird: {
      url: "/2DAssets/pets/dodoBird/dodoBird_512x512.png",
      size: 512,
    },
    happyHamster: {
      url: "/2DAssets/pets/happyHamster/happyHamster_512x512.png",
      size: 512,
    },
    mechanicalGrasshopper: {
      url: "/2DAssets/pets/mechanicalGrasshopper/mechanicalGrasshopper_512x512.png",
      size: 512,
    },
    panda1: { url: "/2DAssets/pets/panda1/panda1_512x512.png", size: 512 },
    panda2: { url: "/2DAssets/pets/panda2/panda2_512x512.png", size: 512 },
    petRock: {
      url: "/2DAssets/pets/petRock/petRock_512x512.png",
      size: 512,
    },
    pig: { url: "/2DAssets/pets/pig/pig_512x512.png", size: 512 },
    redFox1: {
      url: "/2DAssets/pets/redFox1/redFox1_512x512.png",
      size: 512,
    },
    redFox2: {
      url: "/2DAssets/pets/redFox2/redFox2_512x512.png",
      size: 512,
    },
    roboDog: {
      url: "/2DAssets/pets/roboDog/roboDog_512x512.png",
      size: 512,
    },
    skeletonTRex: {
      url: "/2DAssets/pets/skeletonTRex/skeletonTRex_512x512.png",
      size: 512,
    },
    snail: { url: "/2DAssets/pets/snail/snail_512x512.png", size: 512 },
    spinosaurus: {
      url: "/2DAssets/pets/spinosaurus/spinosaurus_512x512.png",
      size: 512,
    },
    TRex: { url: "/2DAssets/pets/TRex/TRex_512x512.png", size: 512 },
  },
  diffuse: {
    angryHamster: {
      url: "/3DAssets/pets/angryHamster/texs/angryHamster_diff_256x256.png",
      size: 256,
    },
    axolotl: {
      url: "/3DAssets/pets/axolotl/texs/axolotl_diff_256x256.png",
      size: 256,
    },
    babyDragon: {
      url: "/3DAssets/pets/babyDragon/texs/babyDragon_diff_256x256.png",
      size: 256,
    },
    beardedDragon: {
      url: "/3DAssets/pets/beardedDragon/texs/beardedDragon_diff_256x256.png",
      size: 256,
    },
    bird1: {
      url: "/3DAssets/pets/bird1/texs/bird1_diff_256x256.png",
      size: 256,
    },
    bird2: {
      url: "/3DAssets/pets/bird2/texs/bird2_diff_256x256.png",
      size: 256,
    },
    boxer: {
      url: "/3DAssets/pets/boxer/texs/boxer_diff_256x256.png",
      size: 256,
    },
    brain: {
      url: "/3DAssets/pets/brain/texs/brain_diff_256x256.png",
      size: 256,
    },
    buddyHamster: {
      url: "/3DAssets/pets/buddyHamster/texs/buddyHamster_diff_256x256.png",
      size: 256,
    },
    cat1: { url: "/3DAssets/pets/cat1/texs/cat1_diff_256x256.png", size: 256 },
    cat2: { url: "/3DAssets/pets/cat2/texs/cat2_diff_256x256.png", size: 256 },
    dodoBird: {
      url: "/3DAssets/pets/dodoBird/texs/dodoBird_diff_256x256.png",
      size: 256,
    },
    happyHamster: {
      url: "/3DAssets/pets/happyHamster/texs/happyHamster_diff_256x256.png",
      size: 256,
    },
    mechanicalGrasshopper: {
      url: "/3DAssets/pets/mechanicalGrasshopper/texs/mechanicalGrasshopper_diff_256x256.png",
      size: 256,
    },
    panda1: {
      url: "/3DAssets/pets/panda1/texs/panda1_diff_256x256.png",
      size: 256,
    },
    panda2: {
      url: "/3DAssets/pets/panda2/texs/panda2_diff_256x256.png",
      size: 256,
    },
    petRock: {
      url: "/3DAssets/pets/petRock/texs/petRock_diff_256x256.png",
      size: 256,
    },
    pig: { url: "/3DAssets/pets/pig/texs/pig_diff_256x256.png", size: 256 },
    redFox1: {
      url: "/3DAssets/pets/redFox1/texs/redFox1_diff_256x256.png",
      size: 256,
    },
    redFox2: {
      url: "/3DAssets/pets/redFox2/texs/redFox2_diff_256x256.png",
      size: 256,
    },
    roboDog: {
      url: "/3DAssets/pets/roboDog/texs/roboDog_diff_256x256.png",
      size: 256,
    },
    skeletonTRex: {
      url: "/3DAssets/pets/skeletonTRex/texs/skeletonTRex_diff_64x64.png",
      size: 64,
    },
    snail: {
      url: "/3DAssets/pets/snail/texs/snail_diff_256x256.png",
      size: 256,
    },
    spinosaurus: {
      url: "/3DAssets/pets/spinosaurus/texs/spinosaurus_diff_256x256.png",
      size: 256,
    },
    TRex: { url: "/3DAssets/pets/TRex/texs/TRex_diff_256x256.png", size: 256 },
  },
  normal: {
    angryHamster: {
      url: "/3DAssets/pets/angryHamster/texs/angryHamster_nor_256x256.png",
      size: 256,
    },
    axolotl: {
      url: "/3DAssets/pets/axolotl/texs/axolotl_nor_256x256.png",
      size: 256,
    },
    babyDragon: {
      url: "/3DAssets/pets/babyDragon/texs/babyDragon_nor_256x256.png",
      size: 256,
    },
    brain: {
      url: "/3DAssets/pets/brain/texs/brain_nor_256x256.png",
      size: 256,
    },
    buddyHamster: {
      url: "/3DAssets/pets/buddyHamster/texs/buddyHamster_nor_256x256.png",
      size: 256,
    },
    happyHamster: {
      url: "/3DAssets/pets/happyHamster/texs/happyHamster_nor_256x256.png",
      size: 256,
    },
    mechanicalGrasshopper: {
      url: "/3DAssets/pets/mechanicalGrasshopper/texs/mechanicalGrasshopper_nor_256x256.png",
      size: 256,
    },
    snail: {
      url: "/3DAssets/pets/snail/texs/snail_nor_256x256.png",
      size: 256,
    },
    TRex: { url: "/3DAssets/pets/TRex/texs/TRex_nor_256x256.png", size: 256 },
  },
  transmissionRoughnessMetallic: {
    axolotl: {
      url: "/3DAssets/pets/axolotl/texs/axolotl_transRoughMetal_256x256.png",
      size: 256,
    },
    babyDragon: {
      url: "/3DAssets/pets/babyDragon/texs/babyDragon_transRoughMetal_256x256.png",
      size: 256,
    },
    boxer: {
      url: "/3DAssets/pets/boxer/texs/boxer_transRoughMetal_256x256.png",
      size: 256,
    },
    buddyHamster: {
      url: "/3DAssets/pets/buddyHamster/texs/buddyHamster_transRoughMetal_256x256.png",
      size: 256,
    },
    dodoBird: {
      url: "/3DAssets/pets/dodoBird/texs/dodoBird_transRoughMetal_256x256.png",
      size: 256,
    },
    happyHamster: {
      url: "/3DAssets/pets/happyHamster/texs/happyHamster_transRoughMetal_256x256.png",
      size: 256,
    },
    mechanicalGrasshopper: {
      url: "/3DAssets/pets/mechanicalGrasshopper/texs/mechanicalGrasshopper_transRoughMetal_256x256.png",
      size: 256,
    },
    roboDog: {
      url: "/3DAssets/pets/roboDog/texs/roboDog_transRoughMetal_256x256.png",
      size: 256,
    },
    snail: {
      url: "/3DAssets/pets/snail/texs/snail_transRoughMetal_256x256.png",
      size: 256,
    },
  },
  specular: {
    angryHamster: {
      url: "/3DAssets/pets/angryHamster/texs/angryHamster_spec_256x256.png",
      size: 256,
    },
    boxer: {
      url: "/3DAssets/pets/boxer/texs/boxer_spec_256x256.png",
      size: 256,
    },
    brain: {
      url: "/3DAssets/pets/brain/texs/brain_spec_256x256.png",
      size: 256,
    },
    TRex: { url: "/3DAssets/pets/TRex/texs/TRex_spec_256x256.png", size: 256 },
  },
  emission: {
    mechanicalGrasshopper: {
      url: "/3DAssets/pets/mechanicalGrasshopper/texs/mechanicalGrasshopper_emiss_256x256.png",
      size: 256,
    },
  },
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
  diffuse: {
    ...mustachesDataURLs.diffuse,
    ...beardsDataURLs.diffuse,
    ...masksDataURLs.diffuse,
    ...glassesDataURLs.diffuse,
    ...hatsDataURLs.diffuse,
    ...petsDataURLs.diffuse,
  },
  normal: {
    ...mustachesDataURLs.normal,
    ...beardsDataURLs.normal,
    ...masksDataURLs.normal,
    ...glassesDataURLs.normal,
    ...hatsDataURLs.normal,
    ...petsDataURLs.normal,
  },
  transmissionRoughnessMetallic: {
    ...mustachesDataURLs.transmissionRoughnessMetallic,
    ...beardsDataURLs.transmissionRoughnessMetallic,
    ...masksDataURLs.transmissionRoughnessMetallic,
    ...glassesDataURLs.transmissionRoughnessMetallic,
    ...hatsDataURLs.transmissionRoughnessMetallic,
    ...petsDataURLs.transmissionRoughnessMetallic,
  },
  specular: {
    ...mustachesDataURLs.specular,
    ...beardsDataURLs.specular,
    ...masksDataURLs.specular,
    ...glassesDataURLs.specular,
    ...hatsDataURLs.specular,
    ...petsDataURLs.specular,
  },
  emission: {
    ...mustachesDataURLs.emission,
    ...beardsDataURLs.emission,
    ...masksDataURLs.emission,
    ...glassesDataURLs.emission,
    ...hatsDataURLs.emission,
    ...petsDataURLs.emission,
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

  private faceMeshWorker: Worker;
  private faceMeshResults: NormalizedLandmarkListList[] = [];
  private faceDetectionWorker: Worker;

  private effects: {
    [cameraEffect in CameraEffectTypes]?: boolean;
  };

  private tintColor = "#F56114";

  private userDevice: UserDevice;

  private deadbanding: Deadbanding;

  render: Render;

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
    this.baseShader.createAtlasTexture("material", {});

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
          if (event.data.results) {
            const multiFaceLandmarks = [];
            for (const result of event.data.results) {
              multiFaceLandmarks.push(result.scaledMesh);
            }
            if (!this.faceMeshResults) {
              this.faceMeshResults = [];
            }
            this.faceMeshResults[0] = multiFaceLandmarks;
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
      this.faceMeshWorker,
      this.faceMeshResults,
      this.faceDetectionWorker,
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

    const twoDimAtlasImages: { [key: string]: { url: string; size: number } } =
      {};

    if (glassesStyles && this.effects.glasses) {
      const glassesImage = glassesDataURLs.image[glassesStyles.style];

      if (glassesImage) {
        twoDimAtlasImages[glassesStyles.style] = glassesImage;
      }
    }
    if (beardStyles && this.effects.beards) {
      const beardImage = beardsDataURLs.image[beardStyles.style];

      if (beardImage) {
        twoDimAtlasImages[beardStyles.style] = beardImage;
      }
    }
    if (mustacheStyles && this.effects.mustaches) {
      const mustacheImage = mustachesDataURLs.image[mustacheStyles.style];

      if (mustacheImage) {
        twoDimAtlasImages[mustacheStyles.style] = mustacheImage;
      }
    }
    if (maskStyles && this.effects.masks) {
      const maskImage = masksDataURLs.image[maskStyles.style];

      if (maskImage) {
        twoDimAtlasImages[maskStyles.style] = maskImage;
      }
    }
    if (hatStyles && this.effects.hats) {
      const hatImage = hatsDataURLs.image[hatStyles.style];

      if (hatImage) {
        twoDimAtlasImages[hatStyles.style] = hatImage;
      }
    }
    if (petStyles && this.effects.pets) {
      const petImage = petsDataURLs.image[petStyles.style];

      if (petImage) {
        twoDimAtlasImages[petStyles.style] = petImage;
      }
    }

    const threeDimAtlasImages: {
      [key: string]: { url: string; size: number };
    } = {};
    const materialAtlasImages: {
      [key: string]: {
        texs: {
          normal?: { url: string; size: number };
          transmissionRoughnessMetallic?: { url: string; size: number };
          specular?: { url: string; size: number };
          emission?: { url: string; size: number };
        };
        size?: number;
        top?: number;
        left?: number;
      };
    } = {};

    if (glassesStyles && glassesStyles.threeDim && this.effects.glasses) {
      const glassesImage = glassesDataURLs.diffuse[glassesStyles.style];

      if (glassesImage) {
        threeDimAtlasImages[glassesStyles.style] = glassesImage;
      }

      const normalImage = glassesDataURLs.normal[glassesStyles.style];
      const transmissionRoughnessMetallicImage =
        glassesDataURLs.transmissionRoughnessMetallic[glassesStyles.style];
      const specularImage = glassesDataURLs.specular[glassesStyles.style];
      const emissionImage = glassesDataURLs.emission[glassesStyles.style];

      if (!materialAtlasImages[glassesStyles.style]) {
        materialAtlasImages[glassesStyles.style] = { texs: {} };
      }

      if (normalImage) {
        materialAtlasImages[glassesStyles.style].texs.normal = normalImage;
      }
      if (transmissionRoughnessMetallicImage) {
        materialAtlasImages[
          glassesStyles.style
        ].texs.transmissionRoughnessMetallic =
          transmissionRoughnessMetallicImage;
      }
      if (specularImage) {
        materialAtlasImages[glassesStyles.style].texs.specular = specularImage;
      }
      if (emissionImage) {
        materialAtlasImages[glassesStyles.style].texs.emission = emissionImage;
      }
    }
    if (beardStyles && beardStyles.threeDim && this.effects.beards) {
      const beardImage = beardsDataURLs.diffuse[beardStyles.style];

      if (beardImage) {
        threeDimAtlasImages[beardStyles.style] = beardImage;
      }

      const normalImage = beardsDataURLs.normal[beardStyles.style];
      const transmissionRoughnessMetallicImage =
        beardsDataURLs.transmissionRoughnessMetallic[beardStyles.style];
      const specularImage = beardsDataURLs.specular[beardStyles.style];
      const emissionImage = beardsDataURLs.emission[beardStyles.style];

      if (!materialAtlasImages[beardStyles.style]) {
        materialAtlasImages[beardStyles.style] = { texs: {} };
      }

      if (normalImage) {
        materialAtlasImages[beardStyles.style].texs.normal = normalImage;
      }
      if (transmissionRoughnessMetallicImage) {
        materialAtlasImages[
          beardStyles.style
        ].texs.transmissionRoughnessMetallic =
          transmissionRoughnessMetallicImage;
      }
      if (specularImage) {
        materialAtlasImages[beardStyles.style].texs.specular = specularImage;
      }
      if (emissionImage) {
        materialAtlasImages[beardStyles.style].texs.emission = emissionImage;
      }
    }
    if (mustacheStyles && mustacheStyles.threeDim && this.effects.mustaches) {
      const mustacheImage = mustachesDataURLs.diffuse[mustacheStyles.style];

      if (mustacheImage) {
        threeDimAtlasImages[mustacheStyles.style] = mustacheImage;
      }

      const normalImage = mustachesDataURLs.normal[mustacheStyles.style];
      const transmissionRoughnessMetallicImage =
        mustachesDataURLs.transmissionRoughnessMetallic[mustacheStyles.style];
      const specularImage = mustachesDataURLs.specular[mustacheStyles.style];
      const emissionImage = mustachesDataURLs.emission[mustacheStyles.style];

      if (!materialAtlasImages[mustacheStyles.style]) {
        materialAtlasImages[mustacheStyles.style] = { texs: {} };
      }

      if (normalImage) {
        materialAtlasImages[mustacheStyles.style].texs.normal = normalImage;
      }
      if (transmissionRoughnessMetallicImage) {
        materialAtlasImages[
          mustacheStyles.style
        ].texs.transmissionRoughnessMetallic =
          transmissionRoughnessMetallicImage;
      }
      if (specularImage) {
        materialAtlasImages[mustacheStyles.style].texs.specular = specularImage;
      }
      if (emissionImage) {
        materialAtlasImages[mustacheStyles.style].texs.emission = emissionImage;
      }
    }
    if (maskStyles && maskStyles.threeDim && this.effects.masks) {
      const maskImage = masksDataURLs.diffuse[maskStyles.style];

      if (maskImage) {
        threeDimAtlasImages[maskStyles.style] = maskImage;
      }

      const normalImage = masksDataURLs.normal[maskStyles.style];
      const transmissionRoughnessMetallicImage =
        masksDataURLs.transmissionRoughnessMetallic[maskStyles.style];
      const specularImage = masksDataURLs.specular[maskStyles.style];
      const emissionImage = masksDataURLs.emission[maskStyles.style];

      if (!materialAtlasImages[maskStyles.style]) {
        materialAtlasImages[maskStyles.style] = { texs: {} };
      }

      if (normalImage) {
        materialAtlasImages[maskStyles.style].texs.normal = normalImage;
      }
      if (transmissionRoughnessMetallicImage) {
        materialAtlasImages[
          maskStyles.style
        ].texs.transmissionRoughnessMetallic =
          transmissionRoughnessMetallicImage;
      }
      if (specularImage) {
        materialAtlasImages[maskStyles.style].texs.specular = specularImage;
      }
      if (emissionImage) {
        materialAtlasImages[maskStyles.style].texs.emission = emissionImage;
      }
    }
    if (hatStyles && hatStyles.threeDim && this.effects.hats) {
      const hatImage = hatsDataURLs.diffuse[hatStyles.style];

      if (hatImage) {
        threeDimAtlasImages[hatStyles.style] = hatImage;
      }

      const normalImage = hatsDataURLs.normal[hatStyles.style];
      const transmissionRoughnessMetallicImage =
        hatsDataURLs.transmissionRoughnessMetallic[hatStyles.style];
      const specularImage = hatsDataURLs.specular[hatStyles.style];
      const emissionImage = hatsDataURLs.emission[hatStyles.style];

      if (!materialAtlasImages[hatStyles.style]) {
        materialAtlasImages[hatStyles.style] = { texs: {} };
      }

      if (normalImage) {
        materialAtlasImages[hatStyles.style].texs.normal = normalImage;
      }
      if (transmissionRoughnessMetallicImage) {
        materialAtlasImages[
          hatStyles.style
        ].texs.transmissionRoughnessMetallic =
          transmissionRoughnessMetallicImage;
      }
      if (specularImage) {
        materialAtlasImages[hatStyles.style].texs.specular = specularImage;
      }
      if (emissionImage) {
        materialAtlasImages[hatStyles.style].texs.emission = emissionImage;
      }
    }
    if (petStyles && petStyles.threeDim && this.effects.pets) {
      const petImage = petsDataURLs.diffuse[petStyles.style];

      if (petImage) {
        threeDimAtlasImages[petStyles.style] = petImage;
      }

      const normalImage = petsDataURLs.normal[petStyles.style];
      const transmissionRoughnessMetallicImage =
        petsDataURLs.transmissionRoughnessMetallic[petStyles.style];
      const specularImage = petsDataURLs.specular[petStyles.style];
      const emissionImage = petsDataURLs.emission[petStyles.style];

      if (!materialAtlasImages[petStyles.style]) {
        materialAtlasImages[petStyles.style] = { texs: {} };
      }

      if (normalImage) {
        materialAtlasImages[petStyles.style].texs.normal = normalImage;
      }
      if (transmissionRoughnessMetallicImage) {
        materialAtlasImages[
          petStyles.style
        ].texs.transmissionRoughnessMetallic =
          transmissionRoughnessMetallicImage;
      }
      if (specularImage) {
        materialAtlasImages[petStyles.style].texs.specular = specularImage;
      }
      if (emissionImage) {
        materialAtlasImages[petStyles.style].texs.emission = emissionImage;
      }
    }

    await this.baseShader.updateAtlasTexture("twoDim", twoDimAtlasImages);
    await this.baseShader.updateAtlasTexture("threeDim", threeDimAtlasImages);
    await this.baseShader.updateAtlasTexture("material", materialAtlasImages);
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
