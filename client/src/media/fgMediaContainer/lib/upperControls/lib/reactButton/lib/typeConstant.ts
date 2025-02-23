const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const likeIcon = nginxAssetSeverBaseUrl + "svgs/reactions/likeIcon.svg";
const dislikeIcon = nginxAssetSeverBaseUrl + "svgs/reactions/dislikeIcon.svg";
const heartIcon = nginxAssetSeverBaseUrl + "svgs/reactions/heartIcon.svg";
const smilelyIcon = nginxAssetSeverBaseUrl + "svgs/reactions/smilelyIcon.svg";
const happyIcon = nginxAssetSeverBaseUrl + "svgs/reactions/happyIcon.svg";
const smilelyFaceIcon =
  nginxAssetSeverBaseUrl + "svgs/reactions/smilelyFaceIcon.svg";
const emoticonIcon = nginxAssetSeverBaseUrl + "svgs/reactions/emoticonIcon.svg";
const neutralIcon = nginxAssetSeverBaseUrl + "svgs/reactions/neutralIcon.svg";
const badMoodIcon = nginxAssetSeverBaseUrl + "svgs/reactions/badMoodIcon.svg";
const sadIcon = nginxAssetSeverBaseUrl + "svgs/reactions/sadIcon.svg";
const angryIcon = nginxAssetSeverBaseUrl + "svgs/reactions/angryIcon.svg";
const sickIcon = nginxAssetSeverBaseUrl + "svgs/reactions/sickIcon.svg";
const deadIcon = nginxAssetSeverBaseUrl + "svgs/reactions/deadIcon.svg";
const moneyIcon = nginxAssetSeverBaseUrl + "svgs/reactions/moneyIcon.svg";
const chanceIcon = nginxAssetSeverBaseUrl + "svgs/reactions/chanceIcon.svg";
const trophyIcon = nginxAssetSeverBaseUrl + "svgs/reactions/trophyIcon.svg";
const secureIcon = nginxAssetSeverBaseUrl + "svgs/reactions/secureIcon.svg";
const coffeeIcon = nginxAssetSeverBaseUrl + "svgs/reactions/coffeeIcon.svg";
const babyIcon = nginxAssetSeverBaseUrl + "svgs/reactions/babyIcon.svg";

export type TableReactions =
  | "like"
  | "dislike"
  | "heart"
  | "smilely"
  | "happy"
  | "smilelyFace"
  | "emoticon"
  | "neutral"
  | "badMood"
  | "sad"
  | "angry"
  | "sick"
  | "dead"
  | "money"
  | "chance"
  | "trophy"
  | "secure"
  | "coffee"
  | "baby";

export const reactionsMeta: {
  [tableReaction in TableReactions]: { name: string; src: string };
} = {
  like: { name: "Like", src: likeIcon },
  dislike: { name: "Dislike", src: dislikeIcon },
  heart: { name: "Heart", src: heartIcon },
  smilely: { name: "Smilely", src: smilelyIcon },
  happy: { name: "Happy", src: happyIcon },
  smilelyFace: { name: "Smilely face", src: smilelyFaceIcon },
  emoticon: { name: "Emoticon", src: emoticonIcon },
  neutral: { name: "Neutral", src: neutralIcon },
  badMood: { name: "Bad mood", src: badMoodIcon },
  sad: { name: "Sad", src: sadIcon },
  angry: { name: "Angry", src: angryIcon },
  sick: { name: "Sick", src: sickIcon },
  dead: { name: "Dead", src: deadIcon },
  money: { name: "Money", src: moneyIcon },
  chance: { name: "Chance", src: chanceIcon },
  trophy: { name: "Trophy", src: trophyIcon },
  secure: { name: "Secure", src: secureIcon },
  coffee: { name: "Coffee", src: coffeeIcon },
  baby: { name: "Baby", src: babyIcon },
};
