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
      meshURL:
        "/3DAssets/mustaches/disguiseMustache/texs/disguiseMustache_diff.png",
    },
    fullMustache: {
      meshURL: "/3DAssets/mustaches/fullMustache/texs/fullMustache_diff.png",
    },
    mustache1: {
      meshURL: "/3DAssets/mustaches/mustache1/texs/mustache1_diff.png",
    },
    mustache2: {
      meshURL: "/3DAssets/mustaches/mustache2/texs/mustache2_diff.png",
    },
    mustache3: {
      meshURL: "/3DAssets/mustaches/mustache3/texs/mustache3_diff.png",
    },
    mustache4: {
      meshURL: "/3DAssets/mustaches/mustache4/texs/mustache4_diff.png",
    },
    nicodemusMustache: {
      meshURL:
        "/3DAssets/mustaches/nicodemusMustache/texs/nicodemusMustache_diff.png",
    },
    pencilMustache: {
      meshURL:
        "/3DAssets/mustaches/pencilMustache/texs/pencilMustache_diff.png",
    },
    spongebobMustache: {
      meshURL:
        "/3DAssets/mustaches/spongebobMustache/texs/spongebobMustache_diff.png",
    },
    tinyMustache: {
      meshURL: "/3DAssets/mustaches/tinyMustache/texs/tinyMustache_diff.png",
    },
    wingedMustache: {
      meshURL:
        "/3DAssets/mustaches/wingedMustache/texs/wingedMustache_diff.png",
    },
  },
  nor: {
    fullMustache: {
      meshURL: "/3DAssets/mustaches/fullMustache/texs/fullMustache_nor.png",
    },
    wingedMustache: {
      meshURL: "/3DAssets/mustaches/wingedMustache/texs/wingedMustache_nor.png",
    },
  },
  disp: {},
  metalRough: {
    fullMustache: {
      meshURL:
        "/3DAssets/mustaches/fullMustache/texs/fullMustache_metalRough.png",
    },
    wingedMustache: {
      meshURL:
        "/3DAssets/mustaches/wingedMustache/texs/wingedMustache_metalRough.png",
    },
  },
  spec: {},
  emiss: {},
  meshes: {
    disguiseMustache: {
      meshURL:
        "/3DAssets/mustaches/disguiseMustache/texs/disguiseMustache_diff.png",
    },
    fullMustache: {
      meshURL: "/3DAssets/mustaches/fullMustache/texs/fullMustache_diff.png",
    },
    mustache1: {
      meshURL: "/3DAssets/mustaches/mustache1/texs/mustache1_diff.png",
    },
    mustache2: {
      meshURL: "/3DAssets/mustaches/mustache2/texs/mustache2_diff.png",
    },
    mustache3: {
      meshURL: "/3DAssets/mustaches/mustache3/texs/mustache3_diff.png",
    },
    mustache4: {
      meshURL: "/3DAssets/mustaches/mustache4/texs/mustache4_diff.png",
    },
    nicodemusMustache: {
      meshURL:
        "/3DAssets/mustaches/nicodemusMustache/texs/nicodemusMustache_diff.png",
    },
    pencilMustache: {
      meshURL:
        "/3DAssets/mustaches/pencilMustache/texs/pencilMustache_diff.png",
    },
    spongebobMustache: {
      meshURL:
        "/3DAssets/mustaches/spongebobMustache/texs/spongebobMustache_diff.png",
    },
    tinyMustache: {
      meshURL: "/3DAssets/mustaches/tinyMustache/texs/tinyMustache_diff.png",
    },
    wingedMustache: {
      meshURL:
        "/3DAssets/mustaches/wingedMustache/texs/wingedMustache_diff.png",
    },
  },
};

export const beardsDataURLs = {
  diff: {
    chinBeard: {
      meshURL: "/3DAssets/beards/chinBeard/texs/chinBeard_diff.png",
    },
    classicalCurlyBeard: {
      meshURL:
        "/3DAssets/beards/classicalCurlyBeard/texs/classicalCurlyBeard_diff.png",
    },
    fullBeard: {
      meshURL: "/3DAssets/beards/fullBeard/texs/fullBeard_diff.png",
    },
  },
  nor: {
    chinBeard: { meshURL: "/3DAssets/beards/chinBeard/texs/chinBeard_nor.png" },
    fullBeard: { meshURL: "/3DAssets/beards/fullBeard/texs/fullBeard_nor.png" },
  },
  disp: {
    chinBeard: {
      meshURL: "/3DAssets/beards/chinBeard/texs/chinBeard_disp.png",
    },
  },
  metalRough: {
    chinBeard: {
      meshURL: "/3DAssets/beards/chinBeard/texs/chinBeard_metalRough.png",
    },
    fullBeard: {
      meshURL: "/3DAssets/beards/fullBeard/texs/fullBeard_metalRough.png",
    },
  },
  spec: {
    chinBeard: {
      meshURL: "/3DAssets/beards/chinBeard/texs/chinBeard_spec.png",
    },
  },
  emiss: {
    chinBeard: {
      meshURL: "/3DAssets/beards/chinBeard/texs/chinBeard_emiss.png",
    },
  },
  meshes: {
    chinBeard: { meshURL: "/3DAssets/beards/chinBeard/chinBeard.json" },
    classicalCurlyBeard: {
      meshURL: "/3DAssets/beards/classicalCurlyBeard/classicalCurlyBeard.json",
    },
    fullBeard: { meshURL: "/3DAssets/beards/fullBeard/fullBeard.json" },
  },
};

export const masksDataURLs = {
  diff: {
    alienMask: {
      meshURL: "/3DAssets/masks/alienMask/texs/alienMask_diff.png",
    },
    baseMask: {
      meshURL: "/3DAssets/masks/baseMask/texs/baseMask_diff.png",
    },
    clownMask: {
      meshURL: "/3DAssets/masks/clownMask/texs/clownMask_diff.png",
    },
    creatureMask: {
      meshURL: "/3DAssets/masks/creatureMask/texs/creatureMask_diff.png",
    },
    cyberMask: {
      meshURL: "/3DAssets/masks/cyberMask/texs/cyberMask_diff.png",
    },
    darkKnightMask: {
      meshURL: "/3DAssets/masks/darkKnightMask/texs/darkKnightMask_diff.png",
    },
    demonMask: {
      meshURL: "/3DAssets/masks/demonMask/texs/demonMask_diff.png",
    },
    gasMask1: {
      meshURL: "/3DAssets/masks/gasMask1/texs/gasMask1_diff.png",
    },
    gasMask2: {
      meshURL: "/3DAssets/masks/gasMask2/texs/gasMask2_diff.png",
    },
    gasMask3: {
      meshURL: "/3DAssets/masks/gasMask3/texs/gasMask3_diff.png",
    },
    gasMask4: {
      meshURL: "/3DAssets/masks/gasMask4/texs/gasMask4_diff.png",
    },
    masqueradeMask: {
      meshURL: "/3DAssets/masks/masqueradeMask/texs/masqueradeMask_diff.png",
    },
    metalManMask: {
      meshURL: "/3DAssets/masks/metalManMask/texs/metalManMask_diff.png",
    },
    oniMask: {
      meshURL: "/3DAssets/masks/oniMask/texs/oniMask_diff.png",
    },
    plagueDoctorMask: {
      meshURL:
        "/3DAssets/masks/plagueDoctorMask/texs/plagueDoctorMask_diff.png",
    },
    sixEyesMask: {
      meshURL: "/3DAssets/masks/sixEyesMask/texs/sixEyesMask_diff.png",
    },
    tenguMask: {
      meshURL: "/3DAssets/masks/tenguMask/texs/tenguMask_diff.png",
    },
    threeMask: {
      meshURL: "/3DAssets/masks/threeMask/texs/threeMask_diff.png",
    },
    weldingMask: {
      meshURL: "/3DAssets/masks/weldingMask/texs/weldingMask_diff.png",
    },
    woodlandMask: {
      meshURL: "/3DAssets/masks/woodlandMask/texs/woodlandMask_diff.png",
    },
    woodPaintedMask: {
      meshURL: "/3DAssets/masks/woodPaintedMask/texs/woodPaintedMask_diff.png",
    },
    zombieMask: {
      meshURL: "/3DAssets/masks/zombieMask/texs/zombieMask_diff.png",
    },
  },
  nor: {
    alienMask: {
      meshURL: "/3DAssets/masks/alienMask/texs/alienMask_diff.png",
    },
    clownMask: {
      meshURL: "/3DAssets/masks/clownMask/texs/clownMask_diff.png",
    },
    creatureMask: {
      meshURL: "/3DAssets/masks/creatureMask/texs/creatureMask_diff.png",
    },
    cyberMask: {
      meshURL: "/3DAssets/masks/cyberMask/texs/cyberMask_diff.png",
    },
    darkKnightMask: {
      meshURL: "/3DAssets/masks/darkKnightMask/texs/darkKnightMask_diff.png",
    },
    demonMask: {
      meshURL: "/3DAssets/masks/demonMask/texs/demonMask_diff.png",
    },
    gasMask1: {
      meshURL: "/3DAssets/masks/gasMask1/texs/gasMask1_diff.png",
    },
    gasMask2: {
      meshURL: "/3DAssets/masks/gasMask2/texs/gasMask2_diff.png",
    },
    gasMask3: {
      meshURL: "/3DAssets/masks/gasMask3/texs/gasMask3_diff.png",
    },
    gasMask4: {
      meshURL: "/3DAssets/masks/gasMask4/texs/gasMask4_diff.png",
    },
    masqueradeMask: {
      meshURL: "/3DAssets/masks/masqueradeMask/texs/masqueradeMask_diff.png",
    },
    metalManMask: {
      meshURL: "/3DAssets/masks/metalManMask/texs/metalManMask_diff.png",
    },
    oniMask: {
      meshURL: "/3DAssets/masks/oniMask/texs/oniMask_diff.png",
    },
    plagueDoctorMask: {
      meshURL:
        "/3DAssets/masks/plagueDoctorMask/texs/plagueDoctorMask_diff.png",
    },
    sixEyesMask: {
      meshURL: "/3DAssets/masks/sixEyesMask/texs/sixEyesMask_diff.png",
    },
    tenguMask: {
      meshURL: "/3DAssets/masks/tenguMask/texs/tenguMask_diff.png",
    },
    threeMask: {
      meshURL: "/3DAssets/masks/threeMask/texs/threeMask_diff.png",
    },
    woodlandMask: {
      meshURL: "/3DAssets/masks/woodlandMask/texs/woodlandMask_diff.png",
    },
    woodPaintedMask: {
      meshURL: "/3DAssets/masks/woodPaintedMask/texs/woodPaintedMask_diff.png",
    },
    zombieMask: {
      meshURL: "/3DAssets/masks/zombieMask/texs/zombieMask_diff.png",
    },
  },
  disp: {},
  metalRough: {
    alienMask: {
      meshURL: "/3DAssets/masks/alienMask/texs/alienMask_diff.png",
    },
    clownMask: {
      meshURL: "/3DAssets/masks/clownMask/texs/clownMask_diff.png",
    },
    creatureMask: {
      meshURL: "/3DAssets/masks/creatureMask/texs/creatureMask_diff.png",
    },
    cyberMask: {
      meshURL: "/3DAssets/masks/cyberMask/texs/cyberMask_diff.png",
    },
    darkKnightMask: {
      meshURL: "/3DAssets/masks/darkKnightMask/texs/darkKnightMask_diff.png",
    },
    demonMask: {
      meshURL: "/3DAssets/masks/demonMask/texs/demonMask_diff.png",
    },
    gasMask1: {
      meshURL: "/3DAssets/masks/gasMask1/texs/gasMask1_diff.png",
    },
    gasMask2: {
      meshURL: "/3DAssets/masks/gasMask2/texs/gasMask2_diff.png",
    },
    gasMask3: {
      meshURL: "/3DAssets/masks/gasMask3/texs/gasMask3_diff.png",
    },
    gasMask4: {
      meshURL: "/3DAssets/masks/gasMask4/texs/gasMask4_diff.png",
    },
    masqueradeMask: {
      meshURL: "/3DAssets/masks/masqueradeMask/texs/masqueradeMask_diff.png",
    },
    metalManMask: {
      meshURL: "/3DAssets/masks/metalManMask/texs/metalManMask_diff.png",
    },
    oniMask: {
      meshURL: "/3DAssets/masks/oniMask/texs/oniMask_diff.png",
    },
    plagueDoctorMask: {
      meshURL:
        "/3DAssets/masks/plagueDoctorMask/texs/plagueDoctorMask_diff.png",
    },
    sixEyesMask: {
      meshURL: "/3DAssets/masks/sixEyesMask/texs/sixEyesMask_diff.png",
    },
    tenguMask: {
      meshURL: "/3DAssets/masks/tenguMask/texs/tenguMask_diff.png",
    },
    threeMask: {
      meshURL: "/3DAssets/masks/threeMask/texs/threeMask_diff.png",
    },
    woodlandMask: {
      meshURL: "/3DAssets/masks/woodlandMask/texs/woodlandMask_diff.png",
    },
    woodPaintedMask: {
      meshURL: "/3DAssets/masks/woodPaintedMask/texs/woodPaintedMask_diff.png",
    },
    zombieMask: {
      meshURL: "/3DAssets/masks/zombieMask/texs/zombieMask_diff.png",
    },
  },
  spec: {},
  emiss: {
    alienMask: {
      meshURL: "/3DAssets/masks/alienMask/texs/alienMask_diff.png",
    },
    cyberMask: {
      meshURL: "/3DAssets/masks/cyberMask/texs/cyberMask_diff.png",
    },
    zombieMask: {
      meshURL: "/3DAssets/masks/zombieMask/texs/zombieMask_diff.png",
    },
  },
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
  diff: {
    defaultGlasses: {
      meshURL: "/3DAssets/glasses/defaultGlasses/texs/defaultGlasses_diff.png",
    },
    americaGlasses: {
      meshURL: "/3DAssets/glasses/americaGlasses/texs/americaGlasses_diff.png",
    },
    aviatorGoggles: {
      meshURL: "/3DAssets/glasses/aviatorGoggles/texs/aviatorGoggles_diff.png",
    },
    bloodyGlasses: {
      meshURL: "/3DAssets/glasses/bloodyGlasses/texs/bloodyGlasses_diff.png",
    },
    eyeProtectionGlasses: {
      meshURL:
        "/3DAssets/glasses/eyeProtectionGlasses/texs/eyeProtectionGlasses_diff.png",
    },
    glasses1: { meshURL: "/3DAssets/glasses/glasses1/texs/glasses1_diff.png" },
    glasses2: { meshURL: "/3DAssets/glasses/glasses2/texs/glasses2_diff.png" },
    glasses3: { meshURL: "/3DAssets/glasses/glasses3/texs/glasses3_diff.png" },
    glasses4: { meshURL: "/3DAssets/glasses/glasses4/texs/glasses4_diff.png" },
    glasses5: { meshURL: "/3DAssets/glasses/glasses5/texs/glasses5_diff.png" },
    glasses6: { meshURL: "/3DAssets/glasses/glasses6/texs/glasses6_diff.png" },
    memeGlasses: {
      meshURL: "/3DAssets/glasses/memeGlasses/texs/memeGlasses_diff.png",
    },
    militaryTacticalGlasses: {
      meshURL:
        "/3DAssets/glasses/militaryTacticalGlasses/texs/militaryTacticalGlasses_diff.png",
    },
    steampunkGlasses: {
      meshURL:
        "/3DAssets/glasses/steampunkGlasses/texs/steampunkGlasses_diff.png",
    },
    threeDGlasses: {
      meshURL: "/3DAssets/glasses/threeDGlasses/texs/threeDGlasses_diff.png",
    },
    toyGlasses: {
      meshURL: "/3DAssets/glasses/toyGlasses/texs/toyGlasses_diff.png",
    },
    shades: { meshURL: "/3DAssets/glasses/shades/texs/shades_diff.png" },
    VRGlasses: {
      meshURL: "/3DAssets/glasses/VRGlasses/texs/VRGlasses_diff.png",
    },
  },
  nor: {},
  disp: {},
  metalRough: {},
  spec: {},
  emiss: {},
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
  diff: {
    AsianConicalHat: {
      meshURL: "/3DAssets/hats/AsianConicalHat/texs/AsianConicalHat_diff.png",
    },
    aviatorHelmet: {
      meshURL: "/3DAssets/hats/aviatorHelmet/texs/aviatorHelmet_diff.png",
    },
    bicornHat: { meshURL: "/3DAssets/hats/bicornHat/texs/bicornHat_diff.png" },
    bicycleHelmet: {
      meshURL: "/3DAssets/hats/bicycleHelmet/texs/bicycleHelmet_diff.png",
    },
    captainsHat: {
      meshURL: "/3DAssets/hats/captainsHat/texs/captainsHat_diff.png",
    },
    chefHat: { meshURL: "/3DAssets/hats/chefHat/texs/chefHat_diff.png" },
    chickenHat: {
      meshURL: "/3DAssets/hats/chickenHat/texs/chickenHat_diff.png",
    },
    deadManHat: {
      meshURL: "/3DAssets/hats/deadManHat/texs/deadManHat_diff.png",
    },
    dogEars: { meshURL: "/3DAssets/hats/dogEars/texs/dogEars_diff.png" },
    flatCap: { meshURL: "/3DAssets/hats/flatCap/texs/flatCap_diff.png" },
    hardHat: { meshURL: "/3DAssets/hats/hardHat/texs/hardHat_diff.png" },
    hopliteHelmet: {
      meshURL: "/3DAssets/hats/hopliteHelmet/texs/hopliteHelmet_diff.png",
    },
    militaryHat: {
      meshURL: "/3DAssets/hats/militaryHat/texs/militaryHat_diff.png",
    },
    rabbitEars: {
      meshURL: "/3DAssets/hats/rabbitEars/texs/rabbitEars_diff.png",
    },
    roundEarsHat: {
      meshURL: "/3DAssets/hats/roundEarsHat/texs/roundEarsHat_diff.png",
    },
    santaHat: { meshURL: "/3DAssets/hats/santaHat/texs/santaHat_diff.png" },
    seamanHat: { meshURL: "/3DAssets/hats/seamanHat/texs/seamanHat_diff.png" },
    stylishHat: {
      meshURL: "/3DAssets/hats/stylishHat/texs/stylishHat_diff.png",
    },
    superMarioOdysseyHat: {
      meshURL:
        "/3DAssets/hats/superMarioOdysseyHat/texs/superMarioOdysseyHat_diff.png",
    },
    ushankaHat: {
      meshURL: "/3DAssets/hats/ushankaHat/texs/ushankaHat_diff.png",
    },
    vikingHelmet: {
      meshURL: "/3DAssets/hats/vikingHelmet/texs/vikingHelmet_diff.png",
    },
  },
  nor: {},
  disp: {},
  metalRough: {},
  spec: {},
  emiss: {},
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
  diff: {
    angryHamster: {
      meshURL: "/3DAssets/pets/angryHamster/texs/angryHamster_diff.png",
    },
    axolotl: { meshURL: "/3DAssets/pets/axolotl/texs/axolotl_diff.png" },
    babyDragon: {
      meshURL: "/3DAssets/pets/babyDragon/texs/babyDragon_diff.png",
    },
    beardedDragon: {
      meshURL: "/3DAssets/pets/babyDragon/texs/babyDragon_diff.png",
    },
    bird1: { meshURL: "/3DAssets/pets/bird1/texs/bird1_diff.png" },
    bird2: { meshURL: "/3DAssets/pets/bird2/texs/bird2_diff.png" },
    boxer: { meshURL: "/3DAssets/pets/boxer/texs/boxer_diff.png" },
    brain: { meshURL: "/3DAssets/pets/brain/texs/brain_diff.png" },
    buddyHamster: {
      meshURL: "/3DAssets/pets/buddyHamster/texs/buddyHamster_diff.png",
    },
    cat1: { meshURL: "/3DAssets/pets/cat1/texs/cat1_diff.png" },
    cat2: { meshURL: "/3DAssets/pets/cat2/texs/cat2_diff.png" },
    dodoBird: { meshURL: "/3DAssets/pets/dodoBird/texs/dodoBird_diff.png" },
    happyHamster: {
      meshURL: "/3DAssets/pets/happyHamster/texs/happyHamster_diff.png",
    },
    mechanicalGrasshopper: {
      meshURL:
        "/3DAssets/pets/mechanicalGrasshopper/texs/mechanicalGrasshopper_diff.png",
    },
    panda1: { meshURL: "/3DAssets/pets/panda1/texs/panda1_diff.png" },
    panda2: { meshURL: "/3DAssets/pets/panda2/texs/panda2_diff.png" },
    petRock: { meshURL: "/3DAssets/pets/petRock/texs/petRock_diff.png" },
    pig: { meshURL: "/3DAssets/pets/pig/texs/pig_diff.png" },
    redFox1: { meshURL: "/3DAssets/pets/redFox1/texs/redFox1_diff.png" },
    redFox2: { meshURL: "/3DAssets/pets/redFox2/texs/redFox2_diff.png" },
    roboDog: { meshURL: "/3DAssets/pets/roboDog/texs/roboDog_diff.png" },
    skeletonTRex: {
      meshURL: "/3DAssets/pets/skeletonTRex/texs/skeletonTRex_diff.png",
    },
    snail: { meshURL: "/3DAssets/pets/snail/texs/snail_diff.png" },
    spinosaurus: {
      meshURL: "/3DAssets/pets/spinosaurus/texs/spinosaurus_diff.png",
    },
    TRex: { meshURL: "/3DAssets/pets/TRex/texs/TRex_diff.png" },
  },
  nor: {},
  disp: {},
  metalRough: {},
  spec: {},
  emiss: {},
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
