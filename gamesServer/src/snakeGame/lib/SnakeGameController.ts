import { sanitizationUtils } from "src";
import {
  onChangeGridSizeType,
  onChangeSnakeColorType,
  onSnakeDirectionChangeType,
  snakeGames,
} from "../../typeConstant";

class SnakeGameController {
  constructor() {}

  onSnakeDirectionChange = (event: onSnakeDirectionChangeType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onSnakeDirectionChangeType;
    const { tableId, username, instance, gameId } = safeEvent.header;
    const { direction } = safeEvent.data;

    snakeGames[tableId][gameId].changeSnakeDirection(
      username,
      instance,
      direction
    );
  };

  onChangeGridSize = (event: onChangeGridSizeType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onChangeGridSizeType;
    const { tableId, gameId } = safeEvent.header;
    const { gridSize } = safeEvent.data;

    snakeGames[tableId][gameId].changeGridSize(gridSize);
  };

  onChangeSnakeColor = (event: onChangeSnakeColorType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onChangeSnakeColorType;
    const { tableId, username, instance, gameId } = safeEvent.header;
    const { newSnakeColor } = safeEvent.data;

    snakeGames[tableId][gameId].changeSnakeColor(
      username,
      instance,
      newSnakeColor
    );
  };
}

export default SnakeGameController;
