import {
  onChangeGridSizeType,
  onChangeSnakeColorType,
  onSnakeDirectionChangeType,
  snakeGames,
} from "../../typeConstant";

class SnakeGameController {
  constructor() {}

  onSnakeDirectionChange = (event: onSnakeDirectionChangeType) => {
    const { table_id, username, instance, gameId } = event.header;
    const { direction } = event.data;

    snakeGames[table_id][gameId].changeSnakeDirection(
      username,
      instance,
      direction
    );
  };

  onChangeGridSize = (event: onChangeGridSizeType) => {
    const { table_id, gameId } = event.header;
    const { gridSize } = event.data;

    snakeGames[table_id][gameId].changeGridSize(gridSize);
  };

  onChangeSnakeColor = (event: onChangeSnakeColorType) => {
    const { table_id, username, instance, gameId } = event.header;
    const { newSnakeColor } = event.data;

    snakeGames[table_id][gameId].changeSnakeColor(
      username,
      instance,
      newSnakeColor
    );
  };
}

export default SnakeGameController;
