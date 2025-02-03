import { BackgroundMusicTypes } from "../../context/effectsContext/typeConstant";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const adventureTimeIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/adventureTimeIcon.svg";
const bottledNoiseIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/bottledNoiseIcon.svg";
const cacophonyIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/cacophonyIcon.svg";
const cafeMusic_1280x1280 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/cafeMusic_1280x1280.png";
const cafeMusic_64x64 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/cafeMusic_64x64.png";
const drumBeatIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/drumBeatIcon.svg";
const drunkOnFunk_1280x1280 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/drunkOnFunk_1280x1280.png";
const drunkOnFunk_64x64 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/drunkOnFunk_64x64.png";
const findingHome_1280x1280 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/findingHome_1280x1280.png";
const findingHome_64x64 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/findingHome_64x64.png";
const funkIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/funkIcon.svg";
const futureSkies_640x640 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/futureSkies_640x640.png";
const futureSkies_64x64 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/futureSkies_64x64.png";
const hardRock_1280x1280 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/hardRock_1280x1280.png";
const hardRock_64x64 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/hardRock_64x64.png";
const harmonicIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/harmonicaIcon.svg";
const highEnergyRock_1280x1280 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/highEnergyRock_1280x1280.png";
const highEnergyRock_64x64 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/highEnergyRock_64x64.png";
const lofi1_1200x1200 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/lofi1_1200x1200.png";
const lofi1_64x64 = nginxAssetSeverBaseUrl + "2DAssets/audio/lofi1_64x64.png";
const lofi2_1200x1200 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/lofi2_1200x1200.png";
const lofi2_64x64 = nginxAssetSeverBaseUrl + "2DAssets/audio/lofi2_64x64.png";
const mischiefIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/mischiefIcon.svg";
const money_1280x1280 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/money_1280x1280.png";
const money_64x64 = nginxAssetSeverBaseUrl + "2DAssets/audio/money_64x64.png";
const motions_1280x1280 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/motions_1280x1280.png";
const motions_64x64 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/motions_64x64.png";
const niceBeat_1280x1280 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/niceBeat_1280x1280.png";
const niceBeat_64x64 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/niceBeat_64x64.png";
const outWestIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/outWestIcon.svg";
const phonk_1280x1280 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/phonk_1280x1280.png";
const phonk_64x64 = nginxAssetSeverBaseUrl + "2DAssets/audio/phonk_64x64.png";
const pianoBackgroundMusicIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/pianoBackgroundMusicIcon.svg";
const reggae_1280x1280 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/reggae_1280x1280.png";
const reggae_64x64 = nginxAssetSeverBaseUrl + "2DAssets/audio/reggae_64x64.png";
const retroGameIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/retroGameIcon.svg";
const riskItAll_1280x1280 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/riskItAll_1280x1280.png";
const riskItAll_64x64 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/riskItAll_64x64.png";
const royalProcession_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/royalProcession_512x512.png";
const royalProcession_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/royalProcession_32x32.png";
const smoothRock_1280x1280 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/smoothRock_1280x1280.png";
const smoothRock_64x64 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/smoothRock_64x64.png";
const spaceBackgroundMusicIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/spaceBackgroundMusicIcon.svg";
const spookyPiano_1280x1280 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/spookyPiano_1280x1280.png";
const spookyPiano_64x64 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/spookyPiano_64x64.png";
const stompingRock_1280x1280 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/stompingRock_1280x1280.png";
const stompingRock_64x64 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/stompingRock_64x64.png";
const ukuleleIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/ukuleleIcon.svg";
const wackyIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/wackyIcon.svg";

export const backgroundMusicStatic: {
  [backgroundMusicType in BackgroundMusicTypes]: {
    image?: string;
    imageSmall?: string;
    icon?: string;
    bgColor: "white" | "black";
    path: string;
    label: string;
  };
} = {
  adventureTime: {
    icon: adventureTimeIcon,
    bgColor: "black",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/adventureTime.mp3",
    label: "Adventure time",
  },
  bottledNoise: {
    icon: bottledNoiseIcon,
    bgColor: "black",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/bottledNoise.mp3",
    label: "Bottled noise",
  },
  cacophony: {
    icon: cacophonyIcon,
    bgColor: "black",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/cacophony.mp3",
    label: "Cacophony",
  },
  cafeMusic: {
    image: cafeMusic_1280x1280,
    imageSmall: cafeMusic_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/cafeMusic.mp3",
    label: "Cafe music",
  },
  drumBeat: {
    icon: drumBeatIcon,
    bgColor: "black",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/drumBeat.mp3",
    label: "Drum beat",
  },
  drunkOnFunk: {
    image: drunkOnFunk_1280x1280,
    imageSmall: drunkOnFunk_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/drunkOnFunk.mp3",
    label: "Drunk on funk",
  },
  findingHome: {
    image: findingHome_1280x1280,
    imageSmall: findingHome_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/findingHome.mp3",
    label: "Finding home",
  },
  funk: {
    icon: funkIcon,
    bgColor: "black",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/funk.mp3",
    label: "Funk",
  },
  futureSkies: {
    image: futureSkies_640x640,
    imageSmall: futureSkies_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/futureSkies.mp3",
    label: "Future skies",
  },
  hardRock: {
    image: hardRock_1280x1280,
    imageSmall: hardRock_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/hardRock.mp3",
    label: "Hard rock",
  },
  harmonica: {
    icon: harmonicIcon,
    bgColor: "black",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/harmonica.mp3",
    label: "Harmonica",
  },
  highEnergyRock: {
    image: highEnergyRock_1280x1280,
    imageSmall: highEnergyRock_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/highEnergyRock.mp3",
    label: "High energy rock",
  },
  lofi1: {
    image: lofi1_1200x1200,
    imageSmall: lofi1_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/lofi1.mp3",
    label: "Lofi 1",
  },
  lofi2: {
    image: lofi2_1200x1200,
    imageSmall: lofi2_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/lofi2.mp3",
    label: "Lofi 2",
  },
  mischief: {
    icon: mischiefIcon,
    bgColor: "black",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/mischief.mp3",
    label: "Mischief",
  },
  money: {
    image: money_1280x1280,
    imageSmall: money_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/money.mp3",
    label: "Money",
  },
  motions: {
    image: motions_1280x1280,
    imageSmall: motions_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/motions.mp3",
    label: "Motions",
  },
  niceBeat: {
    image: niceBeat_1280x1280,
    imageSmall: niceBeat_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/niceBeat.mp3",
    label: "Nice beat",
  },
  outWest: {
    icon: outWestIcon,
    bgColor: "black",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/outWest.mp3",
    label: "Out West",
  },
  phonk: {
    image: phonk_1280x1280,
    imageSmall: phonk_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/phonk.mp3",
    label: "Phonk",
  },
  piano: {
    icon: pianoBackgroundMusicIcon,
    bgColor: "black",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/piano.mp3",
    label: "Piano",
  },
  reggae: {
    image: reggae_1280x1280,
    imageSmall: reggae_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/reggae.mp3",
    label: "Reggae",
  },
  retroGame: {
    icon: retroGameIcon,
    bgColor: "black",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/retroGame.mp3",
    label: "Retro game",
  },
  riskItAll: {
    image: riskItAll_1280x1280,
    imageSmall: riskItAll_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/riskItAll.mp3",
    label: "Risk it all",
  },
  royalProcession: {
    image: royalProcession_512x512,
    imageSmall: royalProcession_32x32,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/royalProcession.mp3",
    label: "Royal procession",
  },
  smoothRock: {
    image: smoothRock_1280x1280,
    imageSmall: smoothRock_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/smoothRock.mp3",
    label: "Smooth rock",
  },
  space: {
    icon: spaceBackgroundMusicIcon,
    bgColor: "black",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/space.mp3",
    label: "Space",
  },
  spookyPiano: {
    image: spookyPiano_1280x1280,
    imageSmall: spookyPiano_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/spookyPiano.mp3",
    label: "Spooky piano",
  },
  stompingRock: {
    image: stompingRock_1280x1280,
    imageSmall: stompingRock_64x64,
    bgColor: "white",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/stompingRock.mp3",
    label: "Stomping rock",
  },
  ukulele: {
    icon: ukuleleIcon,
    bgColor: "black",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/ukulele.mp3",
    label: "Ukulele",
  },
  wacky: {
    icon: wackyIcon,
    bgColor: "black",
    path: nginxAssetSeverBaseUrl + "backgroundMusic/wacky.mp3",
    label: "Wacky",
  },
};
