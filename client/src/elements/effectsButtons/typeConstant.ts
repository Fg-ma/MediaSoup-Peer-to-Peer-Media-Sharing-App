import {
  BeardsEffectTypes,
  GlassesEffectTypes,
  HatsEffectTypes,
  HideBackgroundEffectTypes,
  MasksEffectTypes,
  MustachesEffectTypes,
  PetsEffectTypes,
  PostProcessEffectTypes,
} from "../../context/effectsContext/typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const classicalCurlyBeard_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/beards/classicalCurlyBeard/classicalCurlyBeard_512x512.png";
const classicalCurlyBeard_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/beards/classicalCurlyBeard/classicalCurlyBeard_32x32.png";
const classicalCurlyBeardIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/beards/classicalCurlyBeard/classicalCurlyBeardIcon.svg";
const classicalCurlyBeardOffIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/beards/classicalCurlyBeard/classicalCurlyBeardOffIcon.svg";
const chinBeard_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/beards/chinBeard/chinBeard_512x512.png";
const chinBeard_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/beards/chinBeard/chinBeard_32x32.png";
const chinBeard_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/beards/chinBeard/chinBeard_off_512x512.png";
const chinBeard_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/beards/chinBeard/chinBeard_off_32x32.png";
const fullBeard_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/beards/fullBeard/fullBeard_512x512.png";
const fullBeard_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/beards/fullBeard/fullBeard_32x32.png";
const fullBeard_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/beards/fullBeard/fullBeard_off_512x512.png";
const fullBeard_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/beards/fullBeard/fullBeard_off_32x32.png";

const prismaColors =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/prismaColors_512x512.jpg";
const prismaColorsSmall =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/prismaColors_32x32.jpg";
const blackAndWhite =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/blackAndWhite_256x256.jpg";
const blackAndWhiteSmall =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/blackAndWhite_32x32.jpg";
const bubbleChromatic =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/bubbleChromatic_850x850.jpg";
const bubbleChromaticSmall =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/bubbleChromatic_32x32.jpg";
const fisheye =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/fisheye_512x512.jpg";
const fisheyeSmall =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/fisheye_32x32.jpg";
const nightVision =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/nightVision_512x512.jpg";
const nightVisionSmall =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/nightVision_32x32.jpg";
const vintageTV =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/vintageTV_512x512.jpg";
const vintageTVSmall =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/vintageTV_32x32.jpg";
const motionblur =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/motionBlur_512x512.jpg";
const motionblurSmall =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/motionBlur_32x32.jpg";
const pixelation =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/pixelation_256x256.png";
const pixelationSmall =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/pixelation_32x32.png";
const old = nginxAssetServerBaseUrl + "2DAssets/postProcess/old_512x512.jpg";
const oldSmall = nginxAssetServerBaseUrl + "2DAssets/postProcess/old_32x32.jpg";
const chromaticAberration =
  nginxAssetServerBaseUrl +
  "2DAssets/postProcess/chromaticAberration_512x512.jpg";
const chromaticAberrationSmall =
  nginxAssetServerBaseUrl +
  "2DAssets/postProcess/chromaticAberration_32x32.jpg";
const colorSplash =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/colorSplash_850x850.jpg";
const colorSplashSmall =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/colorSplash_32x32.jpg";
const tonemap =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/tonemap_512x512.jpg";
const tonemapSmall =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/tonemap_32x32.jpg";
const rays = nginxAssetServerBaseUrl + "2DAssets/postProcess/rays_512x512.jpg";
const raysSmall =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/rays_32x32.jpg";
const sharpen =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/sharpen_512x512.jpg";
const sharpenSmall =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/sharpen_32x32.jpg";
const tiltShift =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/tiltShift_512x512.jpg";
const tiltShiftSmall =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/tiltShift_32x32.jpg";
const cartoon =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/cartoon_512x512.png";
const cartoonSmall =
  nginxAssetServerBaseUrl + "2DAssets/postProcess/cartoon_32x32.png";

const defaultGlasses_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/defaultGlasses/defaultGlasses_512x512.png";
const defaultGlasses_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/defaultGlasses/defaultGlasses_32x32.png";
const defaultGlassesIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/glasses/defaultGlasses/defaultGlassesIcon.svg";
const defaultGlassesOffIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/glasses/defaultGlasses/defaultGlassesOffIcon.svg";
const aviatorGoggles_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/aviatorGoggles/aviatorGoggles_512x512.png";
const aviatorGoggles_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/aviatorGoggles/aviatorGoggles_32x32.png";
const aviatorGoggles_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/aviatorGoggles/aviatorGoggles_off_512x512.png";
const aviatorGoggles_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/aviatorGoggles/aviatorGoggles_off_32x32.png";
const bloodyGlasses_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/bloodyGlasses/bloodyGlasses_512x512.png";
const bloodyGlasses_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/bloodyGlasses/bloodyGlasses_32x32.png";
const bloodyGlasses_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/bloodyGlasses/bloodyGlasses_off_512x512.png";
const bloodyGlasses_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/bloodyGlasses/bloodyGlasses_off_32x32.png";
const eyeProtectionGlasses_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses_512x512.png";
const eyeProtectionGlasses_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses_32x32.png";
const eyeProtectionGlasses_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses_off_512x512.png";
const eyeProtectionGlasses_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses_off_32x32.png";
const glasses1_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses1/glasses1_512x512.png";
const glasses1_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses1/glasses1_32x32.png";
const glasses1_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/glasses1/glasses1_off_512x512.png";
const glasses1_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses1/glasses1_off_32x32.png";
const glasses2_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses2/glasses2_512x512.png";
const glasses2_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses2/glasses2_32x32.png";
const glasses2_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/glasses2/glasses2_off_512x512.png";
const glasses2_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses2/glasses2_off_32x32.png";
const glasses3_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses3/glasses3_512x512.png";
const glasses3_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses3/glasses3_32x32.png";
const glasses3_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/glasses3/glasses3_off_512x512.png";
const glasses3_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses3/glasses3_off_32x32.png";
const glasses4_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses4/glasses4_512x512.png";
const glasses4_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses4/glasses4_32x32.png";
const glasses4_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/glasses4/glasses4_off_512x512.png";
const glasses4_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses4/glasses4_off_32x32.png";
const glasses5_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses5/glasses5_512x512.png";
const glasses5_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses5/glasses5_32x32.png";
const glasses5_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/glasses5/glasses5_off_512x512.png";
const glasses5_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses5/glasses5_off_32x32.png";
const glasses6_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses6/glasses6_512x512.png";
const glasses6_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses6/glasses6_32x32.png";
const glasses6_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/glasses6/glasses6_off_512x512.png";
const glasses6_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/glasses6/glasses6_off_32x32.png";
const memeGlasses_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/memeGlasses/memeGlasses_512x512.png";
const memeGlasses_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/memeGlasses/memeGlasses_32x32.png";
const memeGlassesIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/glasses/memeGlasses/memeGlassesIcon.svg";
const memeGlassesOffIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/glasses/memeGlasses/memeGlassesOffIcon.svg";
const militaryTacticalGlasses_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses_512x512.png";
const militaryTacticalGlasses_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses_32x32.png";
const militaryTacticalGlasses_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses_off_512x512.png";
const militaryTacticalGlasses_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses_off_32x32.png";
const shades_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/shades/shades_512x512.png";
const shades_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/shades/shades_32x32.png";
const shadesIcon =
  nginxAssetServerBaseUrl + "svgs/visualEffects/glasses/shades/shadesIcon.svg";
const shadesOffIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/glasses/shades/shadesOffIcon.svg";
const steampunkGlasses_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/steampunkGlasses/steampunkGlasses_512x512.png";
const steampunkGlasses_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/steampunkGlasses/steampunkGlasses_32x32.png";
const steampunkGlasses_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/steampunkGlasses/steampunkGlasses_off_512x512.png";
const steampunkGlasses_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/steampunkGlasses/steampunkGlasses_off_32x32.png";
const threeDGlasses_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/threeDGlasses/threeDGlasses_512x512.png";
const threeDGlasses_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/threeDGlasses/threeDGlasses_32x32.png";
const threeDGlassesIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/glasses/threeDGlasses/threeDGlassesIcon.svg";
const threeDGlassesOffIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/glasses/threeDGlasses/threeDGlassesOffIcon.svg";
const toyGlasses_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/toyGlasses/toyGlasses_512x512.png";
const toyGlasses_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/toyGlasses/toyGlasses_32x32.png";
const toyGlasses_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/toyGlasses/toyGlasses_off_512x512.png";
const toyGlasses_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/toyGlasses/toyGlasses_off_32x32.png";
const VRGlasses_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/VRGlasses/VRGlasses_512x512.png";
const VRGlasses_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/glasses/VRGlasses/VRGlasses_32x32.png";
const VRGlasses_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/VRGlasses/VRGlasses_off_512x512.png";
const VRGlasses_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/glasses/VRGlasses/VRGlasses_off_32x32.png";

const AsianConicalHat_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/AsianConicalHat/AsianConicalHat_512x512.png";
const AsianConicalHat_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/AsianConicalHat/AsianConicalHat_32x32.png";
const AsianConicalHat_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/AsianConicalHat/AsianConicalHat_off_512x512.png";
const AsianConicalHat_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/AsianConicalHat/AsianConicalHat_off_32x32.png";
const aviatorHelmet_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/aviatorHelmet/aviatorHelmet_512x512.png";
const aviatorHelmet_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/aviatorHelmet/aviatorHelmet_32x32.png";
const aviatorHelmet_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/aviatorHelmet/aviatorHelmet_off_512x512.png";
const aviatorHelmet_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/aviatorHelmet/aviatorHelmet_off_32x32.png";
const bicornHat_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/bicornHat/bicornHat_512x512.png";
const bicornHat_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/bicornHat/bicornHat_32x32.png";
const bicornHat_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/bicornHat/bicornHat_off_512x512.png";
const bicornHat_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/bicornHat/bicornHat_off_32x32.png";
const bicycleHelmet_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/bicycleHelmet/bicycleHelmet_512x512.png";
const bicycleHelmet_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/bicycleHelmet/bicycleHelmet_32x32.png";
const bicycleHelmet_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/bicycleHelmet/bicycleHelmet_off_512x512.png";
const bicycleHelmet_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/bicycleHelmet/bicycleHelmet_off_32x32.png";
const captainsHat_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/captainsHat/captainsHat_512x512.png";
const captainsHat_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/captainsHat/captainsHat_32x32.png";
const captainsHat_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/captainsHat/captainsHat_off_512x512.png";
const captainsHat_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/captainsHat/captainsHat_off_32x32.png";
const chefHat_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/chefHat/chefHat_512x512.png";
const chefHat_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/chefHat/chefHat_32x32.png";
const chefHat_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/chefHat/chefHat_off_512x512.png";
const chefHat_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/chefHat/chefHat_off_32x32.png";
const chickenHat_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/chickenHat/chickenHat_512x512.png";
const chickenHat_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/chickenHat/chickenHat_32x32.png";
const chickenHat_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/chickenHat/chickenHat_off_512x512.png";
const chickenHat_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/chickenHat/chickenHat_off_32x32.png";
const deadManHat_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/deadManHat/deadManHat_512x512.png";
const deadManHat_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/deadManHat/deadManHat_32x32.png";
const deadManHat_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/deadManHat/deadManHat_off_512x512.png";
const deadManHat_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/deadManHat/deadManHat_off_32x32.png";
const dogEars_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/dogEars/dogEars_512x512.png";
const dogEars_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/dogEars/dogEars_32x32.png";
const dogEarsIcon =
  nginxAssetServerBaseUrl + "svgs/visualEffects/hats/dogEars/dogEarsIcon.svg";
const dogEarsOffIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/hats/dogEars/dogEarsOffIcon.svg";
const flatCap_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/flatCap/flatCap_512x512.png";
const flatCap_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/flatCap/flatCap_32x32.png";
const flatCap_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/flatCap/flatCap_off_512x512.png";
const flatCap_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/flatCap/flatCap_off_32x32.png";
const hardHat_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/hardHat/hardHat_512x512.png";
const hardHat_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/hardHat/hardHat_32x32.png";
const hardHat_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/hardHat/hardHat_off_512x512.png";
const hardHat_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/hardHat/hardHat_off_32x32.png";
const hopliteHelmet_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/hopliteHelmet/hopliteHelmet_512x512.png";
const hopliteHelmet_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/hopliteHelmet/hopliteHelmet_32x32.png";
const hopliteHelmet_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/hopliteHelmet/hopliteHelmet_off_512x512.png";
const hopliteHelmet_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/hopliteHelmet/hopliteHelmet_off_32x32.png";
const militaryHat_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/militaryHat/militaryHat_512x512.png";
const militaryHat_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/militaryHat/militaryHat_32x32.png";
const militaryHat_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/militaryHat/militaryHat_off_512x512.png";
const militaryHat_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/militaryHat/militaryHat_off_32x32.png";
const rabbitEars_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/rabbitEars/rabbitEars_512x512.png";
const rabbitEars_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/rabbitEars/rabbitEars_32x32.png";
const rabbitEars_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/rabbitEars/rabbitEars_off_512x512.png";
const rabbitEars_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/rabbitEars/rabbitEars_off_32x32.png";
const santaHat_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/santaHat/santaHat_512x512.png";
const santaHat_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/santaHat/santaHat_32x32.png";
const santaHat_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/santaHat/santaHat_off_512x512.png";
const santaHat_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/santaHat/santaHat_off_32x32.png";
const seamanHat_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/seamanHat/seamanHat_512x512.png";
const seamanHat_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/seamanHat/seamanHat_32x32.png";
const seamanHat_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/seamanHat/seamanHat_off_512x512.png";
const seamanHat_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/seamanHat/seamanHat_off_32x32.png";
const stylishHat_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/stylishHat/stylishHat_512x512.png";
const stylishHat_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/stylishHat/stylishHat_32x32.png";
const stylishHat_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/stylishHat/stylishHat_off_512x512.png";
const stylishHat_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/stylishHat/stylishHat_off_32x32.png";
const ushankaHat_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/hats/ushankaHat/ushankaHat_512x512.png";
const ushankaHat_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/ushankaHat/ushankaHat_32x32.png";
const ushankaHat_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/ushankaHat/ushankaHat_off_512x512.png";
const ushankaHat_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/ushankaHat/ushankaHat_off_32x32.png";
const vikingHelmet_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/vikingHelmet/vikingHelmet_512x512.png";
const vikingHelmet_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/hats/vikingHelmet/vikingHelmet_32x32.png";
const vikingHelmet_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/vikingHelmet/vikingHelmet_off_512x512.png";
const vikingHelmet_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/hats/vikingHelmet/vikingHelmet_off_32x32.png";

const beachBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/beach_640x427.jpg";
const beachBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/beach_64x43.jpg";
const brickWallBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/brickWall_640x427.jpg";
const brickWallBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/brickWall_64x43.jpg";
const butterfliesBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/butterflies_640x360.jpg";
const butterfliesBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/butterflies_64x36.jpg";
const cafeBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/cafe_427x640.jpg";
const cafeBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/cafe_43x64.jpg";
const chalkBoardBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/chalkBoard_640x427.jpg";
const chalkBoardBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/chalkBoard_64x43.jpg";
const citySkylineBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/citySkyline_640x331.jpg";
const citySkylineBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/citySkyline_64x33.jpg";
const cliffPalaceBackground =
  nginxAssetServerBaseUrl +
  "videoBackgrounds/cliffPalaceMesaVerdeNationalParkByAnselAdams_608x750.jpg";
const cliffPalaceBackgroundSmall =
  nginxAssetServerBaseUrl +
  "videoBackgrounds/cliffPalaceMesaVerdeNationalParkByAnselAdams_52x64.jpg";
const eveningMcDonaldLakeBackground =
  nginxAssetServerBaseUrl +
  "videoBackgrounds/eveningMcDonaldLakeGlacierNationalParkMontanaByAnselAdams_750x569.jpg";
const eveningMcDonaldLakeBackgroundSmall =
  nginxAssetServerBaseUrl +
  "videoBackgrounds/eveningMcDonaldLakeGlacierNationalParkMontanaByAnselAdams_64x49.jpg";
const forestBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/forest_640x427.jpg";
const forestBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/forest_64x43.jpg";
const halfDomeAppleOrchardBackground =
  nginxAssetServerBaseUrl +
  "videoBackgrounds/halfDomeAppleOrchardYosemiteCaliforniaByAnselAdams_750x575.jpg";
const halfDomeAppleOrchardBackgroundSmall =
  nginxAssetServerBaseUrl +
  "videoBackgrounds/halfDomeAppleOrchardYosemiteCaliforniaByAnselAdams_64x49.jpg";
const lakeBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/lake_640x457.jpg";
const lakeBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/lake_64x46.jpg";
const libraryBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/library_640x427.jpg";
const libraryBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/library_64x43.jpg";
const milkyWayBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/milkyWay_640x349.jpg";
const milkyWayBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/milkyWay_64x35.jpg";
const mountainsBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/mountains_640x425.jpg";
const mountainsBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/mountains_64x43.jpg";
const oceanBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/ocean_640x427.jpg";
const oceanBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/ocean_64x43.jpg";
const oldFaithfulGeyserBackground =
  nginxAssetServerBaseUrl +
  "videoBackgrounds/oldFaithfulGeyserYellowstoneNationalParkWyomingByAnselAdams_532x750.jpg";
const oldFaithfulGeyserBackgroundSmall =
  nginxAssetServerBaseUrl +
  "videoBackgrounds/oldFaithfulGeyserYellowstoneNationalParkWyomingByAnselAdams_45x64.jpg";
const railroadBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/railroad_640x414.jpg";
const railroadBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/railroad_64x41.jpg";
const rollingHillsBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/rollingHills_640x417.jpg";
const rollingHillsBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/rollingHills_64x42.jpg";
const seaSideHousesBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/seaSideHouses_640x390.jpg";
const seaSideHousesBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/seaSideHouses_64x39.jpg";
const snowCoveredMoutainsBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/snowCoveredMoutains_640x360.jpg";
const snowCoveredMoutainsBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/snowCoveredMoutains_64x36.jpg";
const sunflowersBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/sunflowers_640x427.jpg";
const sunflowersBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/sunflowers_64x43.jpg";
const sunsetBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/sunset_640x427.jpg";
const sunsetBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/sunset_64x43.jpg";
const treesBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/trees_640x426.jpg";
const treesBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/trees_64x43.jpg";
const windingRoadBackground =
  nginxAssetServerBaseUrl + "videoBackgrounds/windingRoad_640x427.jpg";
const windingRoadBackgroundSmall =
  nginxAssetServerBaseUrl + "videoBackgrounds/windingRoad_64x43.jpg";

const baseMask_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/baseMask/baseMask_512x512.png";
const baseMask_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/baseMask/baseMask_32x32.png";
const baseMaskIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/masks/baseMask/baseMaskIcon.svg";
const baseMaskOffIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/masks/baseMask/baseMaskOffIcon.svg";
const alienMask_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/alienMask/alienMask_512x512.png";
const alienMask_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/alienMask/alienMask_32x32.png";
const alienMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/alienMask/alienMask_off_512x512.png";
const alienMask_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/alienMask/alienMask_off_32x32.png";
const clownMask_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/clownMask/clownMask_512x512.png";
const clownMask_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/clownMask/clownMask_32x32.png";
const clownMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/clownMask/clownMask_off_512x512.png";
const clownMask_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/clownMask/clownMask_off_32x32.png";
const creatureMask_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/creatureMask/creatureMask_512x512.png";
const creatureMask_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/creatureMask/creatureMask_32x32.png";
const creatureMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/creatureMask/creatureMask_off_512x512.png";
const creatureMask_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/creatureMask/creatureMask_off_32x32.png";
const cyberMask_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/cyberMask/cyberMask_512x512.png";
const cyberMask_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/cyberMask/cyberMask_32x32.png";
const cyberMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/cyberMask/cyberMask_off_512x512.png";
const cyberMask_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/cyberMask/cyberMask_off_32x32.png";
const darkKnightMask_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/darkKnightMask/darkKnightMask_512x512.png";
const darkKnightMask_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/darkKnightMask/darkKnightMask_32x32.png";
const darkKnightMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/darkKnightMask/darkKnightMask_off_512x512.png";
const darkKnightMask_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/darkKnightMask/darkKnightMask_off_32x32.png";
const demonMask_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/demonMask/demonMask_512x512.png";
const demonMask_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/demonMask/demonMask_32x32.png";
const demonMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/demonMask/demonMask_off_512x512.png";
const demonMask_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/demonMask/demonMask_off_32x32.png";
const gasMask1_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask1/gasMask1_512x512.png";
const gasMask1_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask1/gasMask1_32x32.png";
const gasMask1_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask1/gasMask1_off_512x512.png";
const gasMask1_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask1/gasMask1_off_32x32.png";
const gasMask2_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask2/gasMask2_512x512.png";
const gasMask2_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask2/gasMask2_32x32.png";
const gasMask2_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask2/gasMask2_off_512x512.png";
const gasMask2_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask2/gasMask2_off_32x32.png";
const gasMask3_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask3/gasMask3_512x512.png";
const gasMask3_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask3/gasMask3_32x32.png";
const gasMask3_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask3/gasMask3_off_512x512.png";
const gasMask3_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask3/gasMask3_off_32x32.png";
const gasMask4_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask4/gasMask4_512x512.png";
const gasMask4_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask4/gasMask4_32x32.png";
const gasMask4_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask4/gasMask4_off_512x512.png";
const gasMask4_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/gasMask4/gasMask4_off_32x32.png";
const masqueradeMask_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/masqueradeMask/masqueradeMask_512x512.png";
const masqueradeMask_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/masqueradeMask/masqueradeMask_32x32.png";
const masqueradeMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/masqueradeMask/masqueradeMask_off_512x512.png";
const masqueradeMask_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/masqueradeMask/masqueradeMask_off_32x32.png";
const metalManMask_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/metalManMask/metalManMask_512x512.png";
const metalManMask_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/metalManMask/metalManMask_32x32.png";
const metalManMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/metalManMask/metalManMask_off_512x512.png";
const metalManMask_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/metalManMask/metalManMask_off_32x32.png";
const oniMask_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/oniMask/oniMask_512x512.png";
const oniMask_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/oniMask/oniMask_32x32.png";
const oniMask_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/oniMask/oniMask_off_512x512.png";
const oniMask_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/oniMask/oniMask_off_32x32.png";
const plagueDoctorMask_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/plagueDoctorMask/plagueDoctorMask_512x512.png";
const plagueDoctorMask_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/plagueDoctorMask/plagueDoctorMask_32x32.png";
const plagueDoctorMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/plagueDoctorMask/plagueDoctorMask_off_512x512.png";
const plagueDoctorMask_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/plagueDoctorMask/plagueDoctorMask_off_32x32.png";
const sixEyesMask_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/sixEyesMask/sixEyesMask_512x512.png";
const sixEyesMask_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/sixEyesMask/sixEyesMask_32x32.png";
const sixEyesMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/sixEyesMask/sixEyesMask_off_512x512.png";
const sixEyesMask_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/sixEyesMask/sixEyesMask_off_32x32.png";
const tenguMask_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/tenguMask/tenguMask_512x512.png";
const tenguMask_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/tenguMask/tenguMask_32x32.png";
const tenguMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/tenguMask/tenguMask_off_512x512.png";
const tenguMask_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/tenguMask/tenguMask_off_32x32.png";
const threeFaceMask_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/threeFaceMask/threeFaceMask_512x512.png";
const threeFaceMask_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/threeFaceMask/threeFaceMask_32x32.png";
const threeFaceMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/threeFaceMask/threeFaceMask_off_512x512.png";
const threeFaceMask_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/threeFaceMask/threeFaceMask_off_32x32.png";
const weldingMask_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/weldingMask/weldingMask_512x512.png";
const weldingMask_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/weldingMask/weldingMask_32x32.png";
const weldingMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/weldingMask/weldingMask_off_512x512.png";
const weldingMask_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/weldingMask/weldingMask_off_32x32.png";
const woodlandMask_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/woodlandMask/woodlandMask_512x512.png";
const woodlandMask_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/woodlandMask/woodlandMask_32x32.png";
const woodlandMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/woodlandMask/woodlandMask_off_512x512.png";
const woodlandMask_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/woodlandMask/woodlandMask_off_32x32.png";
const woodPaintedMask_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/woodPaintedMask/woodPaintedMask_512x512.png";
const woodPaintedMask_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/woodPaintedMask/woodPaintedMask_32x32.png";
const woodPaintedMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/woodPaintedMask/woodPaintedMask_off_512x512.png";
const woodPaintedMask_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/woodPaintedMask/woodPaintedMask_off_32x32.png";
const zombieMask_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/masks/zombieMask/zombieMask_512x512.png";
const zombieMask_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/masks/zombieMask/zombieMask_32x32.png";
const zombieMask_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/zombieMask/zombieMask_off_512x512.png";
const zombieMask_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/masks/zombieMask/zombieMask_off_32x32.png";

const disguiseMustache_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/disguiseMustache/disguiseMustache_512x512.png";
const disguiseMustache_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/disguiseMustache/disguiseMustache_32x32.png";
const disguiseMustacheIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/mustaches/disguiseMustache/disguiseMustacheIcon.svg";
const disguiseMustacheOffIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/mustaches/disguiseMustache/disguiseMustacheOffIcon.svg";
const fullMustache_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/fullMustache/fullMustache_512x512.png";
const fullMustache_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/fullMustache/fullMustache_32x32.png";
const fullMustache_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/fullMustache/fullMustache_off_512x512.png";
const fullMustache_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/fullMustache/fullMustache_off_32x32.png";
const mustache1_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/mustache1/mustache1_512x512.png";
const mustache1_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/mustaches/mustache1/mustache1_32x32.png";
const mustache1Icon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/mustaches/mustache1/mustache1Icon.svg";
const mustache1OffIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/mustaches/mustache1/mustache1OffIcon.svg";
const mustache2_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/mustache2/mustache2_512x512.png";
const mustache2_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/mustaches/mustache2/mustache2_32x32.png";
const mustache2Icon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/mustaches/mustache2/mustache2Icon.svg";
const mustache2OffIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/mustaches/mustache2/mustache2OffIcon.svg";
const mustache3_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/mustache3/mustache3_512x512.png";
const mustache3_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/mustaches/mustache3/mustache3_32x32.png";
const mustache3Icon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/mustaches/mustache3/mustache3Icon.svg";
const mustache3OffIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/mustaches/mustache3/mustache3OffIcon.svg";
const mustache4_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/mustache4/mustache4_512x512.png";
const mustache4_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/mustaches/mustache4/mustache4_32x32.png";
const mustache4Icon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/mustaches/mustache4/mustache4Icon.svg";
const mustache4OffIcon =
  nginxAssetServerBaseUrl +
  "svgs/visualEffects/mustaches/mustache4/mustache4OffIcon.svg";
const nicodemusMustache_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/nicodemusMustache/nicodemusMustache_512x512.png";
const nicodemusMustache_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/nicodemusMustache/nicodemusMustache_32x32.png";
const nicodemusMustache_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/nicodemusMustache/nicodemusMustache_off_512x512.png";
const nicodemusMustache_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/nicodemusMustache/nicodemusMustache_off_32x32.png";
const pencilMustache_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/pencilMustache/pencilMustache_512x512.png";
const pencilMustache_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/pencilMustache/pencilMustache_32x32.png";
const pencilMustache_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/pencilMustache/pencilMustache_off_512x512.png";
const pencilMustache_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/pencilMustache/pencilMustache_off_32x32.png";
const spongebobMustache_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/spongebobMustache/spongebobMustache_512x512.png";
const spongebobMustache_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/spongebobMustache/spongebobMustache_32x32.png";
const spongebobMustache_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/spongebobMustache/spongebobMustache_off_512x512.png";
const spongebobMustache_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/spongebobMustache/spongebobMustache_off_32x32.png";
const tinyMustache_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/tinyMustache/tinyMustache_512x512.png";
const tinyMustache_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/tinyMustache/tinyMustache_32x32.png";
const tinyMustache_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/tinyMustache/tinyMustache_off_512x512.png";
const tinyMustache_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/tinyMustache/tinyMustache_off_32x32.png";
const wingedMustache_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/wingedMustache/wingedMustache_512x512.png";
const wingedMustache_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/wingedMustache/wingedMustache_32x32.png";
const wingedMustache_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/wingedMustache/wingedMustache_off_512x512.png";
const wingedMustache_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/mustaches/wingedMustache/wingedMustache_off_32x32.png";

const angryHamster_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/angryHamster/angryHamster_512x512.png";
const angryHamster_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/angryHamster/angryHamster_32x32.png";
const angryHamster_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/angryHamster/angryHamster_off_512x512.png";
const angryHamster_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/angryHamster/angryHamster_off_32x32.png";
const axolotl_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/axolotl/axolotl_512x512.png";
const axolotl_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/axolotl/axolotl_32x32.png";
const axolotl_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/axolotl/axolotl_off_512x512.png";
const axolotl_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/axolotl/axolotl_off_32x32.png";
const babyDragon_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/babyDragon/babyDragon_512x512.png";
const babyDragon_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/babyDragon/babyDragon_32x32.png";
const babyDragon_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/babyDragon/babyDragon_off_512x512.png";
const babyDragon_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/babyDragon/babyDragon_off_32x32.png";
const beardedDragon_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/beardedDragon/beardedDragon_512x512.png";
const beardedDragon_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/beardedDragon/beardedDragon_32x32.png";
const beardedDragon_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/beardedDragon/beardedDragon_off_512x512.png";
const beardedDragon_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/beardedDragon/beardedDragon_off_32x32.png";
const bird1_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/bird1/bird1_512x512.png";
const bird1_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/bird1/bird1_32x32.png";
const bird1_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/bird1/bird1_off_512x512.png";
const bird1_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/bird1/bird1_off_32x32.png";
const bird2_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/bird2/bird2_512x512.png";
const bird2_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/bird2/bird2_32x32.png";
const bird2_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/bird2/bird2_off_512x512.png";
const bird2_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/bird2/bird2_off_32x32.png";
const boxer_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/boxer/boxer_512x512.png";
const boxer_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/boxer/boxer_32x32.png";
const boxer_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/boxer/boxer_off_512x512.png";
const boxer_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/boxer/boxer_off_32x32.png";
const brain_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/brain/brain_512x512.png";
const brain_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/brain/brain_32x32.png";
const brain_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/brain/brain_off_512x512.png";
const brain_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/brain/brain_off_32x32.png";
const buddyHamster_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/buddyHamster/buddyHamster_512x512.png";
const buddyHamster_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/buddyHamster/buddyHamster_32x32.png";
const buddyHamster_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/buddyHamster/buddyHamster_off_512x512.png";
const buddyHamster_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/buddyHamster/buddyHamster_off_32x32.png";
const cat1_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/cat1/cat1_512x512.png";
const cat1_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/cat1/cat1_32x32.png";
const cat1_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/cat1/cat1_off_512x512.png";
const cat1_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/cat1/cat1_off_32x32.png";
const cat2_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/cat2/cat2_512x512.png";
const cat2_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/cat2/cat2_32x32.png";
const cat2_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/cat2/cat2_off_512x512.png";
const cat2_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/cat2/cat2_off_32x32.png";
const dodoBird_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/dodoBird/dodoBird_512x512.png";
const dodoBird_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/dodoBird/dodoBird_32x32.png";
const dodoBird_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/dodoBird/dodoBird_off_512x512.png";
const dodoBird_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/dodoBird/dodoBird_off_32x32.png";
const happyHamster_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/happyHamster/happyHamster_512x512.png";
const happyHamster_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/happyHamster/happyHamster_32x32.png";
const happyHamster_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/happyHamster/happyHamster_off_512x512.png";
const happyHamster_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/happyHamster/happyHamster_off_32x32.png";
const mechanicalGrasshopper_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/mechanicalGrasshopper/mechanicalGrasshopper_512x512.png";
const mechanicalGrasshopper_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/mechanicalGrasshopper/mechanicalGrasshopper_32x32.png";
const mechanicalGrasshopper_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/mechanicalGrasshopper/mechanicalGrasshopper_off_512x512.png";
const mechanicalGrasshopper_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/mechanicalGrasshopper/mechanicalGrasshopper_off_32x32.png";
const panda1_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/panda1/panda1_512x512.png";
const panda1_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/panda1/panda1_32x32.png";
const panda1_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/panda1/panda1_off_512x512.png";
const panda1_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/panda1/panda1_off_32x32.png";
const panda2_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/panda2/panda2_512x512.png";
const panda2_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/panda2/panda2_32x32.png";
const panda2_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/panda2/panda2_off_512x512.png";
const panda2_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/panda2/panda2_off_32x32.png";
const petRock_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/petRock/petRock_512x512.png";
const petRock_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/petRock/petRock_32x32.png";
const petRock_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/petRock/petRock_off_512x512.png";
const petRock_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/petRock/petRock_off_32x32.png";
const pig_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/pig/pig_512x512.png";
const pig_32x32 = nginxAssetServerBaseUrl + "2DAssets/pets/pig/pig_32x32.png";
const pig_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/pig/pig_off_512x512.png";
const pig_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/pig/pig_off_32x32.png";
const redFox1_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/redFox1/redFox1_512x512.png";
const redFox1_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/redFox1/redFox1_32x32.png";
const redFox1_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/redFox1/redFox1_off_512x512.png";
const redFox1_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/redFox1/redFox1_off_32x32.png";
const redFox2_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/redFox2/redFox2_512x512.png";
const redFox2_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/redFox2/redFox2_32x32.png";
const redFox2_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/redFox2/redFox2_off_512x512.png";
const redFox2_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/redFox2/redFox2_off_32x32.png";
const roboDog_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/roboDog/roboDog_512x512.png";
const roboDog_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/roboDog/roboDog_32x32.png";
const roboDog_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/roboDog/roboDog_off_512x512.png";
const roboDog_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/roboDog/roboDog_off_32x32.png";
const skeletonTRex_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/skeletonTRex/skeletonTRex_512x512.png";
const skeletonTRex_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/skeletonTRex/skeletonTRex_32x32.png";
const skeletonTRex_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/skeletonTRex/skeletonTRex_off_512x512.png";
const skeletonTRex_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/skeletonTRex/skeletonTRex_off_32x32.png";
const snail_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/snail/snail_512x512.png";
const snail_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/snail/snail_32x32.png";
const snail_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/snail/snail_off_512x512.png";
const snail_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/snail/snail_off_32x32.png";
const spinosaurus_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/spinosaurus/spinosaurus_512x512.png";
const spinosaurus_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/spinosaurus/spinosaurus_32x32.png";
const spinosaurus_off_512x512 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/spinosaurus/spinosaurus_off_512x512.png";
const spinosaurus_off_32x32 =
  nginxAssetServerBaseUrl +
  "2DAssets/pets/spinosaurus/spinosaurus_off_32x32.png";
const TRex_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/TRex/TRex_512x512.png";
const TRex_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/TRex/TRex_32x32.png";
const TRex_off_512x512 =
  nginxAssetServerBaseUrl + "2DAssets/pets/TRex/TRex_off_512x512.png";
const TRex_off_32x32 =
  nginxAssetServerBaseUrl + "2DAssets/pets/TRex/TRex_off_32x32.png";

export const beardsEffects: {
  [key in BeardsEffectTypes]: {
    image: string;
    imageSmall: string;
    icon?: string;
    iconOff?: string;
    imageOff?: string;
    imageOffSmall?: string;
    flipped: boolean;
    bgColor: "white" | "black";
  };
} = {
  classicalCurlyBeard: {
    image: classicalCurlyBeard_512x512,
    imageSmall: classicalCurlyBeard_32x32,
    icon: classicalCurlyBeardIcon,
    iconOff: classicalCurlyBeardOffIcon,
    flipped: true,
    bgColor: "black",
  },
  chinBeard: {
    image: chinBeard_512x512,
    imageSmall: chinBeard_32x32,
    imageOff: chinBeard_off_512x512,
    imageOffSmall: chinBeard_off_32x32,
    flipped: false,
    bgColor: "black",
  },
  fullBeard: {
    image: fullBeard_512x512,
    imageSmall: fullBeard_32x32,
    imageOff: fullBeard_off_512x512,
    imageOffSmall: fullBeard_off_32x32,
    flipped: false,
    bgColor: "white",
  },
};

export const beardsLabels: {
  [beardsEffectType in BeardsEffectTypes]: string;
} = {
  classicalCurlyBeard: "Classical curly",
  chinBeard: "Chin",
  fullBeard: "Full",
};

export const postProcessEffectsChoices: {
  [postProcessEffectType in PostProcessEffectTypes]?: {
    label: string;
    image: string;
    imageSmall: string;
  };
} = {
  prismaColors: {
    label: "Prisma colors",
    image: prismaColors,
    imageSmall: prismaColorsSmall,
  },
  blackAndWhite: {
    label: "Black & white",
    image: blackAndWhite,
    imageSmall: blackAndWhiteSmall,
  },
  bubbleChromatic: {
    label: "Bubbles",
    image: bubbleChromatic,
    imageSmall: bubbleChromaticSmall,
  },
  fisheye: { label: "Fisheye", image: fisheye, imageSmall: fisheyeSmall },
  nightVision: {
    label: "Night vision",
    image: nightVision,
    imageSmall: nightVisionSmall,
  },
  vintageTV: {
    label: "Vintage TV",
    image: vintageTV,
    imageSmall: vintageTVSmall,
  },
  motionblur: {
    label: "Motion blur",
    image: motionblur,
    imageSmall: motionblurSmall,
  },
  pixelation: {
    label: "Pixelation",
    image: pixelation,
    imageSmall: pixelationSmall,
  },
  old: { label: "Old timey", image: old, imageSmall: oldSmall },
  chromaticAberration: {
    label: "Chromatic aberration",
    image: chromaticAberration,
    imageSmall: chromaticAberrationSmall,
  },
  colorSplash: {
    label: "Color splash",
    image: colorSplash,
    imageSmall: colorSplashSmall,
  },
  tonemap: { label: "Tone map", image: tonemap, imageSmall: tonemapSmall },
  rays: { label: "Rays", image: rays, imageSmall: raysSmall },
  sharpen: { label: "Sharpen", image: sharpen, imageSmall: sharpenSmall },
  tiltShift: {
    label: "Tilt shift",
    image: tiltShift,
    imageSmall: tiltShiftSmall,
  },
  cartoon: { label: "Cartoon", image: cartoon, imageSmall: cartoonSmall },
};

export const glassesEffects: {
  [key in GlassesEffectTypes]: {
    image: string;
    imageSmall: string;
    icon?: string;
    iconOff?: string;
    imageOff?: string;
    imageOffSmall?: string;
    flipped: boolean;
    bgColor: "white" | "black";
  };
} = {
  defaultGlasses: {
    image: defaultGlasses_512x512,
    imageSmall: defaultGlasses_32x32,
    icon: defaultGlassesIcon,
    iconOff: defaultGlassesOffIcon,
    flipped: false,
    bgColor: "white",
  },
  aviatorGoggles: {
    image: aviatorGoggles_512x512,
    imageSmall: aviatorGoggles_32x32,
    imageOff: aviatorGoggles_off_512x512,
    imageOffSmall: aviatorGoggles_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  bloodyGlasses: {
    image: bloodyGlasses_512x512,
    imageSmall: bloodyGlasses_32x32,
    imageOff: bloodyGlasses_off_512x512,
    imageOffSmall: bloodyGlasses_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  eyeProtectionGlasses: {
    image: eyeProtectionGlasses_512x512,
    imageSmall: eyeProtectionGlasses_32x32,
    imageOff: eyeProtectionGlasses_off_512x512,
    imageOffSmall: eyeProtectionGlasses_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  glasses1: {
    image: glasses1_512x512,
    imageSmall: glasses1_32x32,
    imageOff: glasses1_off_512x512,
    imageOffSmall: glasses1_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  glasses2: {
    image: glasses2_512x512,
    imageSmall: glasses2_32x32,
    imageOff: glasses2_off_512x512,
    imageOffSmall: glasses2_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  glasses3: {
    image: glasses3_512x512,
    imageSmall: glasses3_32x32,
    imageOff: glasses3_off_512x512,
    imageOffSmall: glasses3_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  glasses4: {
    image: glasses4_512x512,
    imageSmall: glasses4_32x32,
    imageOff: glasses4_off_512x512,
    imageOffSmall: glasses4_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  glasses5: {
    image: glasses5_512x512,
    imageSmall: glasses5_32x32,
    imageOff: glasses5_off_512x512,
    imageOffSmall: glasses5_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  glasses6: {
    image: glasses6_512x512,
    imageSmall: glasses6_32x32,
    imageOff: glasses6_off_512x512,
    imageOffSmall: glasses6_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  memeGlasses: {
    image: memeGlasses_512x512,
    imageSmall: memeGlasses_32x32,
    icon: memeGlassesIcon,
    iconOff: memeGlassesOffIcon,
    flipped: true,
    bgColor: "white",
  },
  militaryTacticalGlasses: {
    image: militaryTacticalGlasses_512x512,
    imageSmall: militaryTacticalGlasses_32x32,
    imageOff: militaryTacticalGlasses_off_512x512,
    imageOffSmall: militaryTacticalGlasses_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  shades: {
    image: shades_512x512,
    imageSmall: shades_32x32,
    icon: shadesIcon,
    iconOff: shadesOffIcon,
    flipped: false,
    bgColor: "white",
  },
  steampunkGlasses: {
    image: steampunkGlasses_512x512,
    imageSmall: steampunkGlasses_32x32,
    imageOff: steampunkGlasses_off_512x512,
    imageOffSmall: steampunkGlasses_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  threeDGlasses: {
    image: threeDGlasses_512x512,
    imageSmall: threeDGlasses_32x32,
    icon: threeDGlassesIcon,
    iconOff: threeDGlassesOffIcon,
    flipped: false,
    bgColor: "black",
  },
  toyGlasses: {
    image: toyGlasses_512x512,
    imageSmall: toyGlasses_32x32,
    imageOff: toyGlasses_off_512x512,
    imageOffSmall: toyGlasses_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  VRGlasses: {
    image: VRGlasses_512x512,
    imageSmall: VRGlasses_32x32,
    imageOff: VRGlasses_off_512x512,
    imageOffSmall: VRGlasses_off_32x32,
    flipped: false,
    bgColor: "white",
  },
};

export const glassesLabels: {
  [glassesEffectType in GlassesEffectTypes]: string;
} = {
  defaultGlasses: "Default",
  aviatorGoggles: "Aviator",
  bloodyGlasses: "Bloody",
  eyeProtectionGlasses: "Eye protection",
  glasses1: "Glasses 1",
  glasses2: "Glasses 2",
  glasses3: "Glasses 3",
  glasses4: "Glasses 4",
  glasses5: "Glasses 5",
  glasses6: "Glasses 6",
  memeGlasses: "Meme",
  militaryTacticalGlasses: "Military tactical",
  shades: "Shades",
  steampunkGlasses: "Steampunk",
  threeDGlasses: "3D",
  toyGlasses: "Toy",
  VRGlasses: "VR",
};

export const hatsEffects: {
  [key in HatsEffectTypes]: {
    image: string;
    imageSmall: string;
    icon?: string;
    iconOff?: string;
    imageOff?: string;
    imageOffSmall?: string;
    flipped: boolean;
    bgColor: "white" | "black";
  };
} = {
  AsianConicalHat: {
    image: AsianConicalHat_512x512,
    imageSmall: AsianConicalHat_32x32,
    imageOff: AsianConicalHat_off_512x512,
    imageOffSmall: AsianConicalHat_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  aviatorHelmet: {
    image: aviatorHelmet_512x512,
    imageSmall: aviatorHelmet_32x32,
    imageOff: aviatorHelmet_off_512x512,
    imageOffSmall: aviatorHelmet_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  bicornHat: {
    image: bicornHat_512x512,
    imageSmall: bicornHat_32x32,
    imageOff: bicornHat_off_512x512,
    imageOffSmall: bicornHat_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  bicycleHelmet: {
    image: bicycleHelmet_512x512,
    imageSmall: bicycleHelmet_32x32,
    imageOff: bicycleHelmet_off_512x512,
    imageOffSmall: bicycleHelmet_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  captainsHat: {
    image: captainsHat_512x512,
    imageSmall: captainsHat_32x32,
    imageOff: captainsHat_off_512x512,
    imageOffSmall: captainsHat_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  chefHat: {
    image: chefHat_512x512,
    imageSmall: chefHat_32x32,
    imageOff: chefHat_off_512x512,
    imageOffSmall: chefHat_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  chickenHat: {
    image: chickenHat_512x512,
    imageSmall: chickenHat_32x32,
    imageOff: chickenHat_off_512x512,
    imageOffSmall: chickenHat_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  deadManHat: {
    image: deadManHat_512x512,
    imageSmall: deadManHat_32x32,
    imageOff: deadManHat_off_512x512,
    imageOffSmall: deadManHat_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  dogEars: {
    image: dogEars_512x512,
    imageSmall: dogEars_32x32,
    icon: dogEarsIcon,
    iconOff: dogEarsOffIcon,
    flipped: true,
    bgColor: "white",
  },
  flatCap: {
    image: flatCap_512x512,
    imageSmall: flatCap_32x32,
    imageOff: flatCap_off_512x512,
    imageOffSmall: flatCap_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  hardHat: {
    image: hardHat_512x512,
    imageSmall: hardHat_32x32,
    imageOff: hardHat_off_512x512,
    imageOffSmall: hardHat_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  hopliteHelmet: {
    image: hopliteHelmet_512x512,
    imageSmall: hopliteHelmet_32x32,
    imageOff: hopliteHelmet_off_512x512,
    imageOffSmall: hopliteHelmet_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  militaryHat: {
    image: militaryHat_512x512,
    imageSmall: militaryHat_32x32,
    imageOff: militaryHat_off_512x512,
    imageOffSmall: militaryHat_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  rabbitEars: {
    image: rabbitEars_512x512,
    imageSmall: rabbitEars_32x32,
    imageOff: rabbitEars_off_512x512,
    imageOffSmall: rabbitEars_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  santaHat: {
    image: santaHat_512x512,
    imageSmall: santaHat_32x32,
    imageOff: santaHat_off_512x512,
    imageOffSmall: santaHat_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  seamanHat: {
    image: seamanHat_512x512,
    imageSmall: seamanHat_32x32,
    imageOff: seamanHat_off_512x512,
    imageOffSmall: seamanHat_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  stylishHat: {
    image: stylishHat_512x512,
    imageSmall: stylishHat_32x32,
    imageOff: stylishHat_off_512x512,
    imageOffSmall: stylishHat_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  ushankaHat: {
    image: ushankaHat_512x512,
    imageSmall: ushankaHat_32x32,
    imageOff: ushankaHat_off_512x512,
    imageOffSmall: ushankaHat_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  vikingHelmet: {
    image: vikingHelmet_512x512,
    imageSmall: vikingHelmet_32x32,
    imageOff: vikingHelmet_off_512x512,
    imageOffSmall: vikingHelmet_off_32x32,
    flipped: false,
    bgColor: "white",
  },
};

export const hatsLabels: {
  [hatsEffectType in HatsEffectTypes]: string;
} = {
  AsianConicalHat: "Asian conical",
  aviatorHelmet: "Aviator helmet",
  bicornHat: "Bicorn",
  bicycleHelmet: "Bicycle helmet",
  captainsHat: "Captain",
  chefHat: "Chef",
  chickenHat: "Chicken",
  deadManHat: "Dead man",
  dogEars: "Dog ears",
  flatCap: "Flat cap",
  hardHat: "Hard hat",
  hopliteHelmet: "Hoplite helmet",
  militaryHat: "Military",
  rabbitEars: "Rabbit ears",
  santaHat: "Santa",
  seamanHat: "Seaman",
  stylishHat: "Stylish",
  ushankaHat: "Ushanka",
  vikingHelmet: "Viking Helmet",
};

export const backgroundChoices: {
  [hideBackgroundEffect in HideBackgroundEffectTypes]?: {
    image: string;
    imageSmall: string;
  };
} = {
  beach: { image: beachBackground, imageSmall: beachBackgroundSmall },
  brickWall: {
    image: brickWallBackground,
    imageSmall: brickWallBackgroundSmall,
  },
  butterflies: {
    image: butterfliesBackground,
    imageSmall: butterfliesBackgroundSmall,
  },
  cafe: { image: cafeBackground, imageSmall: cafeBackgroundSmall },
  chalkBoard: {
    image: chalkBoardBackground,
    imageSmall: chalkBoardBackgroundSmall,
  },
  citySkyline: {
    image: citySkylineBackground,
    imageSmall: citySkylineBackgroundSmall,
  },
  cliffPalace: {
    image: cliffPalaceBackground,
    imageSmall: cliffPalaceBackgroundSmall,
  },
  eveningMcDonaldLake: {
    image: eveningMcDonaldLakeBackground,
    imageSmall: eveningMcDonaldLakeBackgroundSmall,
  },
  forest: { image: forestBackground, imageSmall: forestBackgroundSmall },
  halfDomeAppleOrchard: {
    image: halfDomeAppleOrchardBackground,
    imageSmall: halfDomeAppleOrchardBackgroundSmall,
  },
  lake: { image: lakeBackground, imageSmall: lakeBackgroundSmall },
  library: { image: libraryBackground, imageSmall: libraryBackgroundSmall },
  milkyWay: {
    image: milkyWayBackground,
    imageSmall: milkyWayBackgroundSmall,
  },
  mountains: {
    image: mountainsBackground,
    imageSmall: mountainsBackgroundSmall,
  },
  ocean: { image: oceanBackground, imageSmall: oceanBackgroundSmall },
  oldFaithfulGeyser: {
    image: oldFaithfulGeyserBackground,
    imageSmall: oldFaithfulGeyserBackgroundSmall,
  },
  railroad: {
    image: railroadBackground,
    imageSmall: railroadBackgroundSmall,
  },
  rollingHills: {
    image: rollingHillsBackground,
    imageSmall: rollingHillsBackgroundSmall,
  },
  seaSideHouses: {
    image: seaSideHousesBackground,
    imageSmall: seaSideHousesBackgroundSmall,
  },
  snowCoveredMoutains: {
    image: snowCoveredMoutainsBackground,
    imageSmall: snowCoveredMoutainsBackgroundSmall,
  },
  sunflowers: {
    image: sunflowersBackground,
    imageSmall: sunflowersBackgroundSmall,
  },
  sunset: { image: sunsetBackground, imageSmall: sunsetBackgroundSmall },
  trees: { image: treesBackground, imageSmall: treesBackgroundSmall },
  windingRoad: {
    image: windingRoadBackground,
    imageSmall: windingRoadBackgroundSmall,
  },
};

export const hideBackgroundLabels: {
  [hideBackgroundEffectType in HideBackgroundEffectTypes]: string;
} = {
  color: "Solid color",
  beach: "Beach",
  brickWall: "Brick wall",
  butterflies: "Neon butterflies",
  cafe: "Cafe",
  chalkBoard: "Chalk board",
  citySkyline: "City skyline",
  cliffPalace: "Cliff Palace by Ansel Adams",
  eveningMcDonaldLake: "Evening McDonald Lake by Ansel Adams",
  forest: "Forest",
  halfDomeAppleOrchard: "Half Dome Apple Orchard by Ansel Adams",
  lake: "Lake",
  library: "Library",
  milkyWay: "Milky Way",
  mountains: "Mountains",
  ocean: "Ocean",
  oldFaithfulGeyser: "Old Faithful Geyser by Ansel Adams",
  railroad: "Railroad",
  rollingHills: "Rolling hills",
  seaSideHouses: "Sea side house",
  snowCoveredMoutains: "Snow covered mountains",
  sunflowers: "Sunflowers",
  sunset: "Sunset",
  trees: "Trees",
  windingRoad: "Winding road",
};

export const masksEffects: {
  [key in MasksEffectTypes]: {
    image: string;
    imageSmall: string;
    icon?: string;
    iconOff?: string;
    imageOff?: string;
    imageOffSmall?: string;
    flipped: boolean;
    bgColor: "white" | "black";
  };
} = {
  baseMask: {
    image: baseMask_512x512,
    imageSmall: baseMask_32x32,
    icon: baseMaskIcon,
    iconOff: baseMaskOffIcon,
    flipped: false,
    bgColor: "white",
  },
  alienMask: {
    image: alienMask_512x512,
    imageSmall: alienMask_32x32,
    imageOff: alienMask_off_512x512,
    imageOffSmall: alienMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  clownMask: {
    image: clownMask_512x512,
    imageSmall: clownMask_32x32,
    imageOff: clownMask_off_512x512,
    imageOffSmall: clownMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  creatureMask: {
    image: creatureMask_512x512,
    imageSmall: creatureMask_32x32,
    imageOff: creatureMask_off_512x512,
    imageOffSmall: creatureMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  cyberMask: {
    image: cyberMask_512x512,
    imageSmall: cyberMask_32x32,
    imageOff: cyberMask_off_512x512,
    imageOffSmall: cyberMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  darkKnightMask: {
    image: darkKnightMask_512x512,
    imageSmall: darkKnightMask_32x32,
    imageOff: darkKnightMask_off_512x512,
    imageOffSmall: darkKnightMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  demonMask: {
    image: demonMask_512x512,
    imageSmall: demonMask_32x32,
    imageOff: demonMask_off_512x512,
    imageOffSmall: demonMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  gasMask1: {
    image: gasMask1_512x512,
    imageSmall: gasMask1_32x32,
    imageOff: gasMask1_off_512x512,
    imageOffSmall: gasMask1_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  gasMask2: {
    image: gasMask2_512x512,
    imageSmall: gasMask2_32x32,
    imageOff: gasMask2_off_512x512,
    imageOffSmall: gasMask2_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  gasMask3: {
    image: gasMask3_512x512,
    imageSmall: gasMask3_32x32,
    imageOff: gasMask3_off_512x512,
    imageOffSmall: gasMask3_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  gasMask4: {
    image: gasMask4_512x512,
    imageSmall: gasMask4_32x32,
    imageOff: gasMask4_off_512x512,
    imageOffSmall: gasMask4_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  masqueradeMask: {
    image: masqueradeMask_512x512,
    imageSmall: masqueradeMask_32x32,
    imageOff: masqueradeMask_off_512x512,
    imageOffSmall: masqueradeMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  metalManMask: {
    image: metalManMask_512x512,
    imageSmall: metalManMask_32x32,
    imageOff: metalManMask_off_512x512,
    imageOffSmall: metalManMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  oniMask: {
    image: oniMask_512x512,
    imageSmall: oniMask_32x32,
    imageOff: oniMask_off_512x512,
    imageOffSmall: oniMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  plagueDoctorMask: {
    image: plagueDoctorMask_512x512,
    imageSmall: plagueDoctorMask_32x32,
    imageOff: plagueDoctorMask_off_512x512,
    imageOffSmall: plagueDoctorMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  sixEyesMask: {
    image: sixEyesMask_512x512,
    imageSmall: sixEyesMask_32x32,
    imageOff: sixEyesMask_off_512x512,
    imageOffSmall: sixEyesMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  tenguMask: {
    image: tenguMask_512x512,
    imageSmall: tenguMask_32x32,
    imageOff: tenguMask_off_512x512,
    imageOffSmall: tenguMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  threeFaceMask: {
    image: threeFaceMask_512x512,
    imageSmall: threeFaceMask_32x32,
    imageOff: threeFaceMask_off_512x512,
    imageOffSmall: threeFaceMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  weldingMask: {
    image: weldingMask_512x512,
    imageSmall: weldingMask_32x32,
    imageOff: weldingMask_off_512x512,
    imageOffSmall: weldingMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  woodlandMask: {
    image: woodlandMask_512x512,
    imageSmall: woodlandMask_32x32,
    imageOff: woodlandMask_off_512x512,
    imageOffSmall: woodlandMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  woodPaintedMask: {
    image: woodPaintedMask_512x512,
    imageSmall: woodPaintedMask_32x32,
    imageOff: woodPaintedMask_off_512x512,
    imageOffSmall: woodPaintedMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  zombieMask: {
    image: zombieMask_512x512,
    imageSmall: zombieMask_32x32,
    imageOff: zombieMask_off_512x512,
    imageOffSmall: zombieMask_off_32x32,
    flipped: false,
    bgColor: "white",
  },
};

export const masksLabels: {
  [masksEffectType in MasksEffectTypes]: string;
} = {
  baseMask: "Skin mask",
  alienMask: "Alien",
  clownMask: "Clown",
  creatureMask: "Creature",
  cyberMask: "Cyber",
  darkKnightMask: "Dark knight",
  demonMask: "Demon",
  gasMask1: "Gas mask 1",
  gasMask2: "Gas mask 2",
  gasMask3: "Gas mask 3",
  gasMask4: "Gas mask 4",
  masqueradeMask: "Masquerade",
  metalManMask: "Metal man",
  oniMask: "Oni",
  plagueDoctorMask: "Plague doctor",
  sixEyesMask: "Six eyes",
  tenguMask: "Tengu",
  threeFaceMask: "Three face",
  weldingMask: "Welding",
  woodlandMask: "Woodland",
  woodPaintedMask: "Wood painted",
  zombieMask: "Zombie",
};

export const mustachesEffects: {
  [key in MustachesEffectTypes]: {
    image: string;
    imageSmall: string;
    icon?: string;
    iconOff?: string;
    imageOff?: string;
    imageOffSmall?: string;
    flipped: boolean;
    bgColor: "white" | "black";
  };
} = {
  disguiseMustache: {
    image: disguiseMustache_512x512,
    imageSmall: disguiseMustache_32x32,
    icon: disguiseMustacheIcon,
    iconOff: disguiseMustacheOffIcon,
    flipped: false,
    bgColor: "white",
  },
  fullMustache: {
    image: fullMustache_512x512,
    imageSmall: fullMustache_32x32,
    imageOff: fullMustache_off_512x512,
    imageOffSmall: fullMustache_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  mustache1: {
    image: mustache1_512x512,
    imageSmall: mustache1_32x32,
    icon: mustache1Icon,
    iconOff: mustache1OffIcon,
    flipped: false,
    bgColor: "white",
  },
  mustache2: {
    image: mustache2_512x512,
    imageSmall: mustache2_32x32,
    icon: mustache2Icon,
    iconOff: mustache2OffIcon,
    flipped: false,
    bgColor: "white",
  },
  mustache3: {
    image: mustache3_512x512,
    imageSmall: mustache3_32x32,
    icon: mustache3Icon,
    iconOff: mustache3OffIcon,
    flipped: false,
    bgColor: "white",
  },
  mustache4: {
    image: mustache4_512x512,
    imageSmall: mustache4_32x32,
    icon: mustache4Icon,
    iconOff: mustache4OffIcon,
    flipped: false,
    bgColor: "white",
  },
  nicodemusMustache: {
    image: nicodemusMustache_512x512,
    imageSmall: nicodemusMustache_32x32,
    imageOff: nicodemusMustache_off_512x512,
    imageOffSmall: nicodemusMustache_off_32x32,
    flipped: false,
    bgColor: "black",
  },
  pencilMustache: {
    image: pencilMustache_512x512,
    imageSmall: pencilMustache_32x32,
    imageOff: pencilMustache_off_512x512,
    imageOffSmall: pencilMustache_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  spongebobMustache: {
    image: spongebobMustache_512x512,
    imageSmall: spongebobMustache_32x32,
    imageOff: spongebobMustache_off_512x512,
    imageOffSmall: spongebobMustache_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  tinyMustache: {
    image: tinyMustache_512x512,
    imageSmall: tinyMustache_32x32,
    imageOff: tinyMustache_off_512x512,
    imageOffSmall: tinyMustache_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  wingedMustache: {
    image: wingedMustache_512x512,
    imageSmall: wingedMustache_32x32,
    imageOff: wingedMustache_off_512x512,
    imageOffSmall: wingedMustache_off_32x32,
    flipped: false,
    bgColor: "black",
  },
};

export const mustachesLabels: {
  [beardsEffectType in MustachesEffectTypes]: string;
} = {
  disguiseMustache: "Disguise",
  fullMustache: "Full",
  mustache1: "Mustache 1",
  mustache2: "Mustache 2",
  mustache3: "Mustache 3",
  mustache4: "Mustache 4",
  nicodemusMustache: "Nicodemus",
  pencilMustache: "Pencil",
  spongebobMustache: "Squiggly",
  tinyMustache: "Tiny",
  wingedMustache: "Winged",
};

export const petsEffects: {
  [key in PetsEffectTypes]: {
    image: string;
    imageSmall: string;
    icon?: string;
    iconOff?: string;
    imageOff?: string;
    imageOffSmall?: string;
    flipped: boolean;
    bgColor: "white" | "black";
  };
} = {
  angryHamster: {
    image: angryHamster_512x512,
    imageSmall: angryHamster_32x32,
    imageOff: angryHamster_off_512x512,
    imageOffSmall: angryHamster_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  axolotl: {
    image: axolotl_512x512,
    imageSmall: axolotl_32x32,
    imageOff: axolotl_off_512x512,
    imageOffSmall: axolotl_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  babyDragon: {
    image: babyDragon_512x512,
    imageSmall: babyDragon_32x32,
    imageOff: babyDragon_off_512x512,
    imageOffSmall: babyDragon_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  beardedDragon: {
    image: beardedDragon_512x512,
    imageSmall: beardedDragon_32x32,
    imageOff: beardedDragon_off_512x512,
    imageOffSmall: beardedDragon_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  bird1: {
    image: bird1_512x512,
    imageSmall: bird1_32x32,
    imageOff: bird1_off_512x512,
    imageOffSmall: bird1_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  bird2: {
    image: bird2_512x512,
    imageSmall: bird2_32x32,
    imageOff: bird2_off_512x512,
    imageOffSmall: bird2_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  boxer: {
    image: boxer_512x512,
    imageSmall: boxer_32x32,
    imageOff: boxer_off_512x512,
    imageOffSmall: boxer_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  brain: {
    image: brain_512x512,
    imageSmall: brain_32x32,
    imageOff: brain_off_512x512,
    imageOffSmall: brain_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  buddyHamster: {
    image: buddyHamster_512x512,
    imageSmall: buddyHamster_32x32,
    imageOff: buddyHamster_off_512x512,
    imageOffSmall: buddyHamster_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  cat1: {
    image: cat1_512x512,
    imageSmall: cat1_32x32,
    imageOff: cat1_off_512x512,
    imageOffSmall: cat1_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  cat2: {
    image: cat2_512x512,
    imageSmall: cat2_32x32,
    imageOff: cat2_off_512x512,
    imageOffSmall: cat2_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  dodoBird: {
    image: dodoBird_512x512,
    imageSmall: dodoBird_32x32,
    imageOff: dodoBird_off_512x512,
    imageOffSmall: dodoBird_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  happyHamster: {
    image: happyHamster_512x512,
    imageSmall: happyHamster_32x32,
    imageOff: happyHamster_off_512x512,
    imageOffSmall: happyHamster_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  mechanicalGrasshopper: {
    image: mechanicalGrasshopper_512x512,
    imageSmall: mechanicalGrasshopper_32x32,
    imageOff: mechanicalGrasshopper_off_512x512,
    imageOffSmall: mechanicalGrasshopper_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  panda1: {
    image: panda1_512x512,
    imageSmall: panda1_32x32,
    imageOff: panda1_off_512x512,
    imageOffSmall: panda1_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  panda2: {
    image: panda2_512x512,
    imageSmall: panda2_32x32,
    imageOff: panda2_off_512x512,
    imageOffSmall: panda2_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  petRock: {
    image: petRock_512x512,
    imageSmall: petRock_32x32,
    imageOff: petRock_off_512x512,
    imageOffSmall: petRock_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  pig: {
    image: pig_512x512,
    imageSmall: pig_32x32,
    imageOff: pig_off_512x512,
    imageOffSmall: pig_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  redFox1: {
    image: redFox1_512x512,
    imageSmall: redFox1_32x32,
    imageOff: redFox1_off_512x512,
    imageOffSmall: redFox1_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  redFox2: {
    image: redFox2_512x512,
    imageSmall: redFox2_32x32,
    imageOff: redFox2_off_512x512,
    imageOffSmall: redFox2_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  roboDog: {
    image: roboDog_512x512,
    imageSmall: roboDog_32x32,
    imageOff: roboDog_off_512x512,
    imageOffSmall: roboDog_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  skeletonTRex: {
    image: skeletonTRex_512x512,
    imageSmall: skeletonTRex_32x32,
    imageOff: skeletonTRex_off_512x512,
    imageOffSmall: skeletonTRex_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  snail: {
    image: snail_512x512,
    imageSmall: snail_32x32,
    imageOff: snail_off_512x512,
    imageOffSmall: snail_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  spinosaurus: {
    image: spinosaurus_512x512,
    imageSmall: spinosaurus_32x32,
    imageOff: spinosaurus_off_512x512,
    imageOffSmall: spinosaurus_off_32x32,
    flipped: false,
    bgColor: "white",
  },
  TRex: {
    image: TRex_512x512,
    imageSmall: TRex_32x32,
    imageOff: TRex_off_512x512,
    imageOffSmall: TRex_off_32x32,
    flipped: false,
    bgColor: "white",
  },
};

export const petsLabels: {
  [petsEffectType in PetsEffectTypes]: string;
} = {
  angryHamster: "Angry hamster",
  axolotl: "Axolotl",
  babyDragon: "Baby dragon",
  beardedDragon: "Bearded dragon",
  bird1: "Bird 1",
  bird2: "Bird 2",
  boxer: "Boxer",
  brain: "Brain",
  buddyHamster: "Buddy hamster",
  cat1: "Cat 1",
  cat2: "Cat 2",
  dodoBird: "Dodo bird",
  happyHamster: "Happy hamster",
  mechanicalGrasshopper: "Mechanical grasshopper",
  panda1: "Panda 1",
  panda2: "Panda 2",
  petRock: "Pet rock",
  pig: "Pig",
  redFox1: "Red fox 1",
  redFox2: "Red fox 2",
  roboDog: "Robo dog",
  skeletonTRex: "Skeleton T-Rex",
  snail: "Snail",
  spinosaurus: "Spinosaurus",
  TRex: "T-Rex",
};
