import {
  BeardsEffectTypes,
  GlassesEffectTypes,
  HatsEffectTypes,
  HideBackgroundEffectTypes,
  MasksEffectTypes,
  MustachesEffectTypes,
  PetsEffectTypes,
} from "../context/CurrentEffectsStylesContext";
import { MeshJSON } from "../effects/visualEffects/lib/BaseShader";

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

export type meshData = {
  defaultMeshPlacement: "forehead" | "eyesCenter" | "nose" | "chin";
  planeMesh: {
    meshLabel: string;
    meshPath: string;
    meshFile: string;
    size: number;
  };
  mesh: {
    meshType: string;
    meshLabel: string;
    meshPath: string;
    meshFile: string;
  };
};

export type MeshesData = {
  mustaches: {
    [mustacheType in MustachesEffectTypes]: meshData;
  };
  beards: {
    [beardType in BeardsEffectTypes]: meshData;
  };
  masks: {
    [maskType in MasksEffectTypes]: meshData;
  };
  glasses: {
    [glassesType in GlassesEffectTypes]: meshData;
  };
  hats: {
    [hatType in HatsEffectTypes]: meshData;
  };
  pets: {
    [petType in PetsEffectTypes]: meshData;
  };
};

const assetMeshes: MeshesData = {
  mustaches: {
    disguiseMustache: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "disguiseMustache_2D",
        meshPath: "/2DAssets/mustaches/disguiseMustache/",
        meshFile: "disguiseMustache_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "disguiseMustache_gltf",
        meshPath: "/3DAssets/mustaches/disguiseMustache/",
        meshFile: "disguiseMustache.gltf",
      },
    },
    fullMustache: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "fullMustache_2D",
        meshPath: "/2DAssets/mustaches/fullMustache/",
        meshFile: "fullMustache_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "fullMustache_gltf",
        meshPath: "/3DAssets/mustaches/fullMustache/",
        meshFile: "fullMustache.gltf",
      },
    },
    mustache1: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "mustache1_2D",
        meshPath: "/2DAssets/mustaches/mustache1/",
        meshFile: "mustache1_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "mustache1_gltf",
        meshPath: "/3DAssets/mustaches/mustache1/",
        meshFile: "mustache1.gltf",
      },
    },
    mustache2: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "mustache2_2D",
        meshPath: "/2DAssets/mustaches/mustache2/",
        meshFile: "mustache2_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "mustache2_gltf",
        meshPath: "/3DAssets/mustaches/mustache2/",
        meshFile: "mustache2.gltf",
      },
    },
    mustache3: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "mustache3_2D",
        meshPath: "/2DAssets/mustaches/mustache3/",
        meshFile: "mustache3_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "mustache3_gltf",
        meshPath: "/3DAssets/mustaches/mustache3/",
        meshFile: "mustache3.gltf",
      },
    },
    mustache4: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "mustache4_2D",
        meshPath: "/2DAssets/mustaches/mustache4/",
        meshFile: "mustache4_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "mustache4_gltf",
        meshPath: "/3DAssets/mustaches/mustache4/",
        meshFile: "mustache4.gltf",
      },
    },
    nicodemusMustache: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "nicodemusMustache_2D",
        meshPath: "/2DAssets/mustaches/nicodemusMustache/",
        meshFile: "nicodemusMustache_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "nicodemusMustache_gltf",
        meshPath: "/3DAssets/mustaches/nicodemusMustache/",
        meshFile: "nicodemusMustache.gltf",
      },
    },
    pencilMustache: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "pencilMustache_2D",
        meshPath: "/2DAssets/mustaches/pencilMustache/",
        meshFile: "pencilMustache_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "pencilMustache_gltf",
        meshPath: "/3DAssets/mustaches/pencilMustache/",
        meshFile: "pencilMustache.gltf",
      },
    },
    spongebobMustache: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "spongebobMustache_2D",
        meshPath: "/2DAssets/mustaches/spongebobMustache/",
        meshFile: "spongebobMustache_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "spongebobMustache_gltf",
        meshPath: "/3DAssets/mustaches/spongebobMustache/",
        meshFile: "spongebobMustache.gltf",
      },
    },
    tinyMustache: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "tinyMustache_2D",
        meshPath: "/2DAssets/mustaches/tinyMustache/",
        meshFile: "tinyMustache_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "tinyMustache_gltf",
        meshPath: "/3DAssets/mustaches/tinyMustache/",
        meshFile: "tinyMustache.gltf",
      },
    },
    wingedMustache: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "wingedMustache_2D",
        meshPath: "/2DAssets/mustaches/wingedMustache/",
        meshFile: "wingedMustache_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "wingedMustache_gltf",
        meshPath: "/3DAssets/mustaches/wingedMustache/",
        meshFile: "wingedMustache.gltf",
      },
    },
  },
  beards: {
    chinBeard: {
      defaultMeshPlacement: "chin",
      planeMesh: {
        meshLabel: "chinBeard_2D",
        meshPath: "/2DAssets/beards/chinBeard/",
        meshFile: "chinBeard_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "chinBeard_gltf",
        meshPath: "/3DAssets/beards/chinBeard/",
        meshFile: "chinBeard.gltf",
      },
    },
    classicalCurlyBeard: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "classicalCurlyBeard_2D",
        meshPath: "/2DAssets/beards/classicalCurlyBeard/",
        meshFile: "classicalCurlyBeard_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "classicalCurlyBeard_gltf",
        meshPath: "/3DAssets/beards/classicalCurlyBeard/",
        meshFile: "classicalCurlyBeard.gltf",
      },
    },
    fullBeard: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "fullBeard_2D",
        meshPath: "/2DAssets/beards/fullBeard/",
        meshFile: "fullBeard_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "fullBeard_gltf",
        meshPath: "/3DAssets/beards/fullBeard/",
        meshFile: "fullBeard.gltf",
      },
    },
  },
  masks: {
    alienMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "alienMask_2D",
        meshPath: "/2DAssets/masks/alienMask/",
        meshFile: "alienMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "alienMask_gltf",
        meshPath: "/3DAssets/masks/alienMask/",
        meshFile: "alienMask.gltf",
      },
    },
    baseMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "baseMask_2D",
        meshPath: "/2DAssets/masks/baseMask/",
        meshFile: "baseMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "baseMask_gltf",
        meshPath: "/3DAssets/masks/baseMask/",
        meshFile: "baseMask.gltf",
      },
    },
    clownMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "clownMask_2D",
        meshPath: "/2DAssets/masks/clownMask/",
        meshFile: "clownMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "clownMask_gltf",
        meshPath: "/3DAssets/masks/clownMask/",
        meshFile: "clownMask.gltf",
      },
    },
    creatureMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "creatureMask_2D",
        meshPath: "/2DAssets/masks/creatureMask/",
        meshFile: "creatureMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "creatureMask_gltf",
        meshPath: "/3DAssets/masks/creatureMask/",
        meshFile: "creatureMask.gltf",
      },
    },
    cyberMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "cyberMask_2D",
        meshPath: "/2DAssets/masks/cyberMask/",
        meshFile: "cyberMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "cyberMask_gltf",
        meshPath: "/3DAssets/masks/cyberMask/",
        meshFile: "cyberMask.gltf",
      },
    },
    darkKnightMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "darkKnightMask_2D",
        meshPath: "/2DAssets/masks/darkKnightMask/",
        meshFile: "darkKnightMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "darkKnightMask_gltf",
        meshPath: "/3DAssets/masks/darkKnightMask/",
        meshFile: "darkKnightMask.gltf",
      },
    },
    demonMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "demonMask_2D",
        meshPath: "/2DAssets/masks/demonMask/",
        meshFile: "demonMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "demonMask_gltf",
        meshPath: "/3DAssets/masks/demonMask/",
        meshFile: "demonMask.gltf",
      },
    },
    gasMask1: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "gasMask1_2D",
        meshPath: "/2DAssets/masks/gasMask1/",
        meshFile: "gasMask1_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "gasMask1_gltf",
        meshPath: "/3DAssets/masks/gasMask1/",
        meshFile: "gasMask1.gltf",
      },
    },
    gasMask2: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "gasMask2_2D",
        meshPath: "/2DAssets/masks/gasMask2/",
        meshFile: "gasMask2_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "gasMask2_gltf",
        meshPath: "/3DAssets/masks/gasMask2/",
        meshFile: "gasMask2.gltf",
      },
    },
    gasMask3: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "gasMask3_2D",
        meshPath: "/2DAssets/masks/gasMask3/",
        meshFile: "gasMask3_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "gasMask3_gltf",
        meshPath: "/3DAssets/masks/gasMask3/",
        meshFile: "gasMask3.gltf",
      },
    },
    gasMask4: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "gasMask4_2D",
        meshPath: "/2DAssets/masks/gasMask4/",
        meshFile: "gasMask4_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "gasMask4_gltf",
        meshPath: "/3DAssets/masks/gasMask4/",
        meshFile: "gasMask4.gltf",
      },
    },
    masqueradeMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "masqueradeMask_2D",
        meshPath: "/2DAssets/masks/masqueradeMask/",
        meshFile: "masqueradeMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "masqueradeMask_gltf",
        meshPath: "/3DAssets/masks/masqueradeMask/",
        meshFile: "masqueradeMask.gltf",
      },
    },
    metalManMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "metalManMask_2D",
        meshPath: "/2DAssets/masks/metalManMask/",
        meshFile: "metalManMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "metalManMask_gltf",
        meshPath: "/3DAssets/masks/metalManMask/",
        meshFile: "metalManMask.gltf",
      },
    },
    oniMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "oniMask_2D",
        meshPath: "/2DAssets/masks/oniMask/",
        meshFile: "oniMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "oniMask_gltf",
        meshPath: "/3DAssets/masks/oniMask/",
        meshFile: "oniMask.gltf",
      },
    },
    plagueDoctorMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "plagueDoctorMask_2D",
        meshPath: "/2DAssets/masks/plagueDoctorMask/",
        meshFile: "plagueDoctorMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "plagueDoctorMask_gltf",
        meshPath: "/3DAssets/masks/plagueDoctorMask/",
        meshFile: "plagueDoctorMask.gltf",
      },
    },
    sixEyesMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "sixEyesMask_2D",
        meshPath: "/2DAssets/masks/sixEyesMask/",
        meshFile: "sixEyesMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "sixEyesMask_gltf",
        meshPath: "/3DAssets/masks/sixEyesMask/",
        meshFile: "sixEyesMask.gltf",
      },
    },
    tenguMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "tenguMask_2D",
        meshPath: "/2DAssets/masks/tenguMask/",
        meshFile: "tenguMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "tenguMask_gltf",
        meshPath: "/3DAssets/masks/tenguMask/",
        meshFile: "tenguMask.gltf",
      },
    },
    threeFaceMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "threeFaceMask_2D",
        meshPath: "/2DAssets/masks/threeFaceMask/",
        meshFile: "threeFaceMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "threeFaceMask_gltf",
        meshPath: "/3DAssets/masks/threeFaceMask/",
        meshFile: "threeFaceMask.gltf",
      },
    },
    weldingMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "weldingMask_2D",
        meshPath: "/2DAssets/masks/weldingMask/",
        meshFile: "weldingMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "weldingMask_gltf",
        meshPath: "/3DAssets/masks/weldingMask/",
        meshFile: "weldingMask.gltf",
      },
    },
    woodlandMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "woodlandMask_2D",
        meshPath: "/2DAssets/masks/woodlandMask/",
        meshFile: "woodlandMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "woodlandMask_gltf",
        meshPath: "/3DAssets/masks/woodlandMask/",
        meshFile: "woodlandMask.gltf",
      },
    },
    woodPaintedMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "woodPaintedMask_2D",
        meshPath: "/2DAssets/masks/woodPaintedMask/",
        meshFile: "woodPaintedMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "woodPaintedMask_gltf",
        meshPath: "/3DAssets/masks/woodPaintedMask/",
        meshFile: "woodPaintedMask.gltf",
      },
    },
    zombieMask: {
      defaultMeshPlacement: "nose",
      planeMesh: {
        meshLabel: "zombieMask_2D",
        meshPath: "/2DAssets/masks/zombieMask/",
        meshFile: "zombieMask_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "zombieMask_gltf",
        meshPath: "/3DAssets/masks/zombieMask/",
        meshFile: "zombieMask.gltf",
      },
    },
  },
  glasses: {
    defaultGlasses: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "defaultGlasses_2D",
        meshPath: "/2DAssets/glasses/defaultGlasses/",
        meshFile: "defaultGlasses_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "defaultGlasses_gltf",
        meshPath: "/3DAssets/glasses/defaultGlasses/",
        meshFile: "defaultGlasses.gltf",
      },
    },
    AmericaGlasses: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "AmericaGlasses_2D",
        meshPath: "/2DAssets/glasses/AmericaGlasses/",
        meshFile: "AmericaGlasses_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "AmericaGlasses_gltf",
        meshPath: "/3DAssets/glasses/AmericaGlasses/",
        meshFile: "AmericaGlasses.gltf",
      },
    },
    aviatorGoggles: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "aviatorGoggles_2D",
        meshPath: "/2DAssets/glasses/aviatorGoggles/",
        meshFile: "aviatorGoggles_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "aviatorGoggles_gltf",
        meshPath: "/3DAssets/glasses/aviatorGoggles/",
        meshFile: "aviatorGoggles.gltf",
      },
    },
    bloodyGlasses: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "bloodyGlasses_2D",
        meshPath: "/2DAssets/glasses/bloodyGlasses/",
        meshFile: "bloodyGlasses_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "bloodyGlasses_gltf",
        meshPath: "/3DAssets/glasses/bloodyGlasses/",
        meshFile: "bloodyGlasses.gltf",
      },
    },
    eyeProtectionGlasses: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "eyeProtectionGlasses_2D",
        meshPath: "/2DAssets/glasses/eyeProtectionGlasses/",
        meshFile: "eyeProtectionGlasses_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "eyeProtectionGlasses_gltf",
        meshPath: "/3DAssets/glasses/eyeProtectionGlasses/",
        meshFile: "eyeProtectionGlasses.gltf",
      },
    },
    glasses1: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "glasses1_2D",
        meshPath: "/2DAssets/glasses/glasses1/",
        meshFile: "glasses1_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "glasses1_gltf",
        meshPath: "/3DAssets/glasses/glasses1/",
        meshFile: "glasses1.gltf",
      },
    },
    glasses2: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "glasses2_2D",
        meshPath: "/2DAssets/glasses/glasses2/",
        meshFile: "glasses2_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "glasses2_gltf",
        meshPath: "/3DAssets/glasses/glasses2/",
        meshFile: "glasses2.gltf",
      },
    },
    glasses3: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "glasses3_2D",
        meshPath: "/2DAssets/glasses/glasses3/",
        meshFile: "glasses3_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "glasses3_gltf",
        meshPath: "/3DAssets/glasses/glasses3/",
        meshFile: "glasses3.gltf",
      },
    },
    glasses4: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "glasses4_2D",
        meshPath: "/2DAssets/glasses/glasses4/",
        meshFile: "glasses4_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "glasses4_gltf",
        meshPath: "/3DAssets/glasses/glasses4/",
        meshFile: "glasses4.gltf",
      },
    },
    glasses5: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "glasses5_2D",
        meshPath: "/2DAssets/glasses/glasses5/",
        meshFile: "glasses5_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "glasses5_gltf",
        meshPath: "/3DAssets/glasses/glasses5/",
        meshFile: "glasses5.gltf",
      },
    },
    glasses6: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "glasses6_2D",
        meshPath: "/2DAssets/glasses/glasses6/",
        meshFile: "glasses6_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "glasses6_gltf",
        meshPath: "/3DAssets/glasses/glasses6/",
        meshFile: "glasses6.gltf",
      },
    },
    memeGlasses: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "memeGlasses_2D",
        meshPath: "/2DAssets/glasses/memeGlasses/",
        meshFile: "memeGlasses_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "memeGlasses_gltf",
        meshPath: "/3DAssets/glasses/memeGlasses/",
        meshFile: "memeGlasses.gltf",
      },
    },
    militaryTacticalGlasses: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "militaryTacticalGlasses_2D",
        meshPath: "/2DAssets/glasses/militaryTacticalGlasses/",
        meshFile: "militaryTacticalGlasses_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "militaryTacticalGlasses_gltf",
        meshPath: "/3DAssets/glasses/militaryTacticalGlasses/",
        meshFile: "militaryTacticalGlasses.gltf",
      },
    },
    steampunkGlasses: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "steampunkGlasses_2D",
        meshPath: "/2DAssets/glasses/steampunkGlasses/",
        meshFile: "steampunkGlasses_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "steampunkGlasses_gltf",
        meshPath: "/3DAssets/glasses/steampunkGlasses/",
        meshFile: "steampunkGlasses.gltf",
      },
    },
    threeDGlasses: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "threeDGlasses_2D",
        meshPath: "/2DAssets/glasses/threeDGlasses/",
        meshFile: "threeDGlasses_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "threeDGlasses_gltf",
        meshPath: "/3DAssets/glasses/threeDGlasses/",
        meshFile: "threeDGlasses.gltf",
      },
    },
    toyGlasses: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "toyGlasses_2D",
        meshPath: "/2DAssets/glasses/toyGlasses/",
        meshFile: "toyGlasses_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "toyGlasses_gltf",
        meshPath: "/3DAssets/glasses/toyGlasses/",
        meshFile: "toyGlasses.gltf",
      },
    },
    shades: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "shades_2D",
        meshPath: "/2DAssets/glasses/shades/",
        meshFile: "shades_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "shades_gltf",
        meshPath: "/3DAssets/glasses/shades/",
        meshFile: "shades.gltf",
      },
    },
    VRGlasses: {
      defaultMeshPlacement: "eyesCenter",
      planeMesh: {
        meshLabel: "VRGlasses_2D",
        meshPath: "/2DAssets/glasses/VRGlasses/",
        meshFile: "VRGlasses_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "VRGlasses_gltf",
        meshPath: "/3DAssets/glasses/VRGlasses/",
        meshFile: "VRGlasses.gltf",
      },
    },
  },
  hats: {
    AsianConicalHat: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "AsianConicalHat_2D",
        meshPath: "/2DAssets/hats/AsianConicalHat/",
        meshFile: "AsianConicalHat_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "AsianConicalHat_gltf",
        meshPath: "/3DAssets/hats/AsianConicalHat/",
        meshFile: "AsianConicalHat.gltf",
      },
    },
    aviatorHelmet: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "aviatorHelmet_2D",
        meshPath: "/2DAssets/hats/aviatorHelmet/",
        meshFile: "aviatorHelmet_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "aviatorHelmet_gltf",
        meshPath: "/3DAssets/hats/aviatorHelmet/",
        meshFile: "aviatorHelmet.gltf",
      },
    },
    bicornHat: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "bicornHat_2D",
        meshPath: "/2DAssets/hats/bicornHat/",
        meshFile: "bicornHat_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "bicornHat_gltf",
        meshPath: "/3DAssets/hats/bicornHat/",
        meshFile: "bicornHat.gltf",
      },
    },
    bicycleHelmet: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "bicycleHelmet_2D",
        meshPath: "/2DAssets/hats/bicycleHelmet/",
        meshFile: "bicycleHelmet_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "bicycleHelmet_gltf",
        meshPath: "/3DAssets/hats/bicycleHelmet/",
        meshFile: "bicycleHelmet.gltf",
      },
    },
    captainsHat: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "captainsHat_2D",
        meshPath: "/2DAssets/hats/captainsHat/",
        meshFile: "captainsHat_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "captainsHat_gltf",
        meshPath: "/3DAssets/hats/captainsHat/",
        meshFile: "captainsHat.gltf",
      },
    },
    chefHat: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "chefHat_2D",
        meshPath: "/2DAssets/hats/chefHat/",
        meshFile: "chefHat_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "chefHat_gltf",
        meshPath: "/3DAssets/hats/chefHat/",
        meshFile: "chefHat.gltf",
      },
    },
    chickenHat: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "chickenHat_2D",
        meshPath: "/2DAssets/hats/chickenHat/",
        meshFile: "chickenHat_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "chickenHat_gltf",
        meshPath: "/3DAssets/hats/chickenHat/",
        meshFile: "chickenHat.gltf",
      },
    },
    deadManHat: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "deadManHat_2D",
        meshPath: "/2DAssets/hats/deadManHat/",
        meshFile: "deadManHat_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "deadManHat_gltf",
        meshPath: "/3DAssets/hats/deadManHat/",
        meshFile: "deadManHat.gltf",
      },
    },
    dogEars: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "dogEars_2D",
        meshPath: "/2DAssets/hats/dogEars/",
        meshFile: "dogEars_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "dogEars_gltf",
        meshPath: "/3DAssets/hats/dogEars/",
        meshFile: "dogEars.gltf",
      },
    },
    flatCap: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "flatCap_2D",
        meshPath: "/2DAssets/hats/flatCap/",
        meshFile: "flatCap_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "flatCap_gltf",
        meshPath: "/3DAssets/hats/flatCap/",
        meshFile: "flatCap.gltf",
      },
    },
    hardHat: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "hardHat_2D",
        meshPath: "/2DAssets/hats/hardHat/",
        meshFile: "hardHat_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "hardHat_gltf",
        meshPath: "/3DAssets/hats/hardHat/",
        meshFile: "hardHat.gltf",
      },
    },
    hopliteHelmet: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "hopliteHelmet_2D",
        meshPath: "/2DAssets/hats/hopliteHelmet/",
        meshFile: "hopliteHelmet_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "hopliteHelmet_gltf",
        meshPath: "/3DAssets/hats/hopliteHelmet/",
        meshFile: "hopliteHelmet.gltf",
      },
    },
    militaryHat: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "militaryHat_2D",
        meshPath: "/2DAssets/hats/militaryHat/",
        meshFile: "militaryHat_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "militaryHat_gltf",
        meshPath: "/3DAssets/hats/militaryHat/",
        meshFile: "militaryHat.gltf",
      },
    },
    rabbitEars: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "rabbitEars_2D",
        meshPath: "/2DAssets/hats/rabbitEars/",
        meshFile: "rabbitEars_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "rabbitEars_gltf",
        meshPath: "/3DAssets/hats/rabbitEars/",
        meshFile: "rabbitEars.gltf",
      },
    },
    roundEarsHat: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "roundEarsHat_2D",
        meshPath: "/2DAssets/hats/roundEarsHat/",
        meshFile: "roundEarsHat_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "roundEarsHat_gltf",
        meshPath: "/3DAssets/hats/roundEarsHat/",
        meshFile: "roundEarsHat.gltf",
      },
    },
    santaHat: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "santaHat_2D",
        meshPath: "/2DAssets/hats/santaHat/",
        meshFile: "santaHat_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "santaHat_gltf",
        meshPath: "/3DAssets/hats/santaHat/",
        meshFile: "santaHat.gltf",
      },
    },
    seamanHat: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "seamanHat_2D",
        meshPath: "/2DAssets/hats/seamanHat/",
        meshFile: "seamanHat_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "seamanHat_gltf",
        meshPath: "/3DAssets/hats/seamanHat/",
        meshFile: "seamanHat.gltf",
      },
    },
    stylishHat: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "stylishHat_2D",
        meshPath: "/2DAssets/hats/stylishHat/",
        meshFile: "stylishHat_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "stylishHat_gltf",
        meshPath: "/3DAssets/hats/stylishHat/",
        meshFile: "stylishHat.gltf",
      },
    },
    superMarioOdysseyHat: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "superMarioOdysseyHat_2D",
        meshPath: "/2DAssets/hats/superMarioOdysseyHat/",
        meshFile: "superMarioOdysseyHat_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "superMarioOdysseyHat_gltf",
        meshPath: "/3DAssets/hats/superMarioOdysseyHat/",
        meshFile: "superMarioOdysseyHat.gltf",
      },
    },
    ushankaHat: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "ushankaHat_2D",
        meshPath: "/2DAssets/hats/ushankaHat/",
        meshFile: "ushankaHat_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "ushankaHat_gltf",
        meshPath: "/3DAssets/hats/ushankaHat/",
        meshFile: "ushankaHat.gltf",
      },
    },
    vikingHelmet: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "vikingHelmet_2D",
        meshPath: "/2DAssets/hats/vikingHelmet/",
        meshFile: "vikingHelmet_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "vikingHelmet_gltf",
        meshPath: "/3DAssets/hats/vikingHelmet/",
        meshFile: "vikingHelmet.gltf",
      },
    },
  },
  pets: {
    angryHamster: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "angryHamster_2D",
        meshPath: "/2DAssets/pets/angryHamster/",
        meshFile: "angryHamster_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "angryHamster_gltf",
        meshPath: "/3DAssets/pets/angryHamster/",
        meshFile: "angryHamster.gltf",
      },
    },
    axolotl: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "axolotl_2D",
        meshPath: "/2DAssets/pets/axolotl/",
        meshFile: "axolotl_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "axolotl_gltf",
        meshPath: "/3DAssets/pets/axolotl/",
        meshFile: "axolotl.gltf",
      },
    },
    babyDragon: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "babyDragon_2D",
        meshPath: "/2DAssets/pets/babyDragon/",
        meshFile: "babyDragon_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "babyDragon_gltf",
        meshPath: "/3DAssets/pets/babyDragon/",
        meshFile: "babyDragon.gltf",
      },
    },
    beardedDragon: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "beardedDragon_2D",
        meshPath: "/2DAssets/pets/beardedDragon/",
        meshFile: "beardedDragon_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "beardedDragon_gltf",
        meshPath: "/3DAssets/pets/beardedDragon/",
        meshFile: "beardedDragon.gltf",
      },
    },
    bird1: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "bird1_2D",
        meshPath: "/2DAssets/pets/bird1/",
        meshFile: "bird1_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "bird1_gltf",
        meshPath: "/3DAssets/pets/bird1/",
        meshFile: "bird1.gltf",
      },
    },
    bird2: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "bird2_2D",
        meshPath: "/2DAssets/pets/bird2/",
        meshFile: "bird2_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "bird2_gltf",
        meshPath: "/3DAssets/pets/bird2/",
        meshFile: "bird2.gltf",
      },
    },
    boxer: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "boxer_2D",
        meshPath: "/2DAssets/pets/boxer/",
        meshFile: "boxer_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "boxer_gltf",
        meshPath: "/3DAssets/pets/boxer/",
        meshFile: "boxer.gltf",
      },
    },
    brain: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "brain_2D",
        meshPath: "/2DAssets/pets/brain/",
        meshFile: "brain_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "brain_gltf",
        meshPath: "/3DAssets/pets/brain/",
        meshFile: "brain.gltf",
      },
    },
    buddyHamster: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "buddyHamster_2D",
        meshPath: "/2DAssets/pets/buddyHamster/",
        meshFile: "buddyHamster_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "buddyHamster_gltf",
        meshPath: "/3DAssets/pets/buddyHamster/",
        meshFile: "buddyHamster.gltf",
      },
    },
    cat1: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "cat1_2D",
        meshPath: "/2DAssets/pets/cat1/",
        meshFile: "cat1_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "cat1_gltf",
        meshPath: "/3DAssets/pets/cat1/",
        meshFile: "cat1.gltf",
      },
    },
    cat2: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "cat2_2D",
        meshPath: "/2DAssets/pets/cat2/",
        meshFile: "cat2_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "cat2_gltf",
        meshPath: "/3DAssets/pets/cat2/",
        meshFile: "cat2.gltf",
      },
    },
    dodoBird: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "dodoBird_2D",
        meshPath: "/2DAssets/pets/dodoBird/",
        meshFile: "dodoBird_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "dodoBird_gltf",
        meshPath: "/3DAssets/pets/dodoBird/",
        meshFile: "dodoBird.gltf",
      },
    },
    happyHamster: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "happyHamster_2D",
        meshPath: "/2DAssets/pets/happyHamster/",
        meshFile: "happyHamster_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "happyHamster_gltf",
        meshPath: "/3DAssets/pets/happyHamster/",
        meshFile: "happyHamster.gltf",
      },
    },
    mechanicalGrasshopper: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "mechanicalGrasshopper_2D",
        meshPath: "/2DAssets/pets/mechanicalGrasshopper/",
        meshFile: "mechanicalGrasshopper_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "mechanicalGrasshopper_gltf",
        meshPath: "/3DAssets/pets/mechanicalGrasshopper/",
        meshFile: "mechanicalGrasshopper.gltf",
      },
    },
    panda1: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "panda1_2D",
        meshPath: "/2DAssets/pets/panda1/",
        meshFile: "panda1_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "panda1_gltf",
        meshPath: "/3DAssets/pets/panda1/",
        meshFile: "panda1.gltf",
      },
    },
    panda2: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "panda2_2D",
        meshPath: "/2DAssets/pets/panda2/",
        meshFile: "panda2_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "panda2_gltf",
        meshPath: "/3DAssets/pets/panda2/",
        meshFile: "panda2.gltf",
      },
    },
    petRock: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "petRock_2D",
        meshPath: "/2DAssets/pets/petRock/",
        meshFile: "petRock_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "petRock_gltf",
        meshPath: "/3DAssets/pets/petRock/",
        meshFile: "petRock2.gltf",
      },
    },
    pig: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "pig_2D",
        meshPath: "/2DAssets/pets/pig/",
        meshFile: "pig_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "pig_gltf",
        meshPath: "/3DAssets/pets/pig/",
        meshFile: "pig.gltf",
      },
    },
    redFox1: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "redFox1_2D",
        meshPath: "/2DAssets/pets/redFox1/",
        meshFile: "redFox1_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "redFox1_gltf",
        meshPath: "/3DAssets/pets/redFox1/",
        meshFile: "redFox1.gltf",
      },
    },
    redFox2: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "redFox2_2D",
        meshPath: "/2DAssets/pets/redFox2/",
        meshFile: "redFox2_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "redFox2_gltf",
        meshPath: "/3DAssets/pets/redFox2/",
        meshFile: "redFox2.gltf",
      },
    },
    roboDog: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "roboDog_2D",
        meshPath: "/2DAssets/pets/roboDog/",
        meshFile: "roboDog_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "roboDog_gltf",
        meshPath: "/3DAssets/pets/roboDog/",
        meshFile: "roboDog.gltf",
      },
    },
    skeletonTRex: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "skeletonTRex_2D",
        meshPath: "/2DAssets/pets/skeletonTRex/",
        meshFile: "skeletonTRex_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "skeletonTRex_gltf",
        meshPath: "/3DAssets/pets/skeletonTRex/",
        meshFile: "skeletonTRex.gltf",
      },
    },
    snail: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "snail_2D",
        meshPath: "/2DAssets/pets/snail/",
        meshFile: "snail_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "snail_gltf",
        meshPath: "/3DAssets/pets/snail/",
        meshFile: "snail.gltf",
      },
    },
    spinosaurus: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "spinosaurus_2D",
        meshPath: "/2DAssets/pets/spinosaurus/",
        meshFile: "spinosaurus_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "spinosaurus_gltf",
        meshPath: "/3DAssets/pets/spinosaurus/",
        meshFile: "spinosaurus.gltf",
      },
    },
    TRex: {
      defaultMeshPlacement: "forehead",
      planeMesh: {
        meshLabel: "TRex_2D",
        meshPath: "/2DAssets/pets/TRex/",
        meshFile: "TRex_512x512.png",
        size: 512,
      },
      mesh: {
        meshType: "gltf",
        meshLabel: "TRex_gltf",
        meshPath: "/3DAssets/pets/TRex/",
        meshFile: "TRex2.gltf",
      },
    },
  },
};

export const hideBackgroundEffectImagesMap: {
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

export default assetMeshes;
