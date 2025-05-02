import {
  onChangeGridSizeType,
  onChangeSnakeColorType,
  onSnakeDirectionChangeType,
  snakeGames,
} from "../../typeConstant";

class SnakeGameController {
  constructor() {}

  onSnakeDirectionChange = (event: onSnakeDirectionChangeType) => {
    const { tableId, username, instance, gameId } = event.header;
    const { direction } = event.data;

    snakeGames[tableId][gameId].changeSnakeDirection(
      username,
      instance,
      direction
    );
  };

  onChangeGridSize = (event: onChangeGridSizeType) => {
    const { tableId, gameId } = event.header;
    const { gridSize } = event.data;

    snakeGames[tableId][gameId].changeGridSize(gridSize);
  };

  onChangeSnakeColor = (event: onChangeSnakeColorType) => {
    const { tableId, username, instance, gameId } = event.header;
    const { newSnakeColor } = event.data;

    snakeGames[tableId][gameId].changeSnakeColor(
      username,
      instance,
      newSnakeColor
    );
  };
}

export default SnakeGameController;
