import {
  onAddSnakeType,
  onSnakeDirectionChangeType,
  snakeGames,
} from "../typeConstant";

class SnakeGameController {
  constructor() {}

  onSnakeDirectionChange = (event: onSnakeDirectionChangeType) => {
    const { table_id, username, instance, gameId, direction } = event.data;

    snakeGames[table_id][gameId].changeSnakeDirection(
      username,
      instance,
      direction
    );
  };

  onAddSnake = (event: onAddSnakeType) => {
    const { table_id, username, instance, gameId } = event.data;

    snakeGames[table_id][gameId].addSnake(username, instance);
  };
}

export default SnakeGameController;
