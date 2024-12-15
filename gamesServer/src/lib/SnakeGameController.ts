import { onSnakeDirectionChangeType } from "src/typeConstant";
import Broadcaster from "./Broadcaster";

class SnakeGameController {
  constructor(private broadcaster: Broadcaster) {}

  onSnakeDirectionChange = (event: onSnakeDirectionChangeType) => {
    const { table_id, username, instance, gameId, direction } = event.data;

    this.broadcaster.broadcastToTable(
      table_id,
      "games",
      "snake",
      gameId,
      {
        type: "snakeDirectionChanged",
        sender: {
          username,
          instance,
        },
        direction,
      },
      [{ username, instance }]
    );
  };
}

export default SnakeGameController;
