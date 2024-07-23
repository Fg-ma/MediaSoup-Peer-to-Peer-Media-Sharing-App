const maxTexturePosition = 16;

let texturePositionsInUse: number[] = [0];

const getNextTexturePosition = (): number | Error => {
  for (let i = 0; i < maxTexturePosition; i++) {
    if (!texturePositionsInUse.includes(i)) {
      texturePositionsInUse.push(i);
      return i;
    }
  }
  return new Error("All textures allocated");
};

const checkTexturePositionInUse = (texturePosition: number): number | Error => {
  if (texturePositionsInUse.includes(texturePosition)) {
    return new Error("Texture position already in use");
  } else {
    return texturePosition;
  }
};

const releaseTexturePosition = (texturePosition: number): void => {
  const index = texturePositionsInUse.indexOf(texturePosition);
  if (index !== -1) {
    texturePositionsInUse.splice(index, 1);
  }
};

const releaseAllTexturePositions = (): void => {
  texturePositionsInUse = [0];
};

export {
  getNextTexturePosition,
  checkTexturePositionInUse,
  releaseTexturePosition,
  releaseAllTexturePositions,
};
