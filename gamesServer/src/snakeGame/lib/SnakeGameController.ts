import { z } from "zod";
import { sanitizationUtils } from "src";
import {
  onChangeGridSizeType,
  onChangeSnakeColorType,
  onSnakeDirectionChangeType,
  snakeGames,
} from "../../typeConstant";
import { SnakeColorsSchema } from "./typeConstant";

class SnakeGameController {
  constructor() {}

  private snakeDirectionChangeSchema = z.object({
    type: z.literal("snakeDirectionChange"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      gameId: z.string(),
    }),
    data: z.object({
      direction: z.enum(["up", "down", "left", "right"]),
    }),
  });

  onSnakeDirectionChange = (event: onSnakeDirectionChangeType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onSnakeDirectionChangeType;
    const validation = this.snakeDirectionChangeSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance, gameId } = safeEvent.header;
    const { direction } = safeEvent.data;

    snakeGames[tableId][gameId].changeSnakeDirection(
      username,
      instance,
      direction
    );
  };

  private changeGridSizeSchema = z.object({
    type: z.literal("changeGridSize"),
    header: z.object({
      tableId: z.string(),
      gameId: z.string(),
    }),
    data: z.object({
      gridSize: z.number(),
    }),
  });

  onChangeGridSize = (event: onChangeGridSizeType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onChangeGridSizeType;
    const validation = this.changeGridSizeSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, gameId } = safeEvent.header;
    const { gridSize } = safeEvent.data;

    snakeGames[tableId][gameId].changeGridSize(gridSize);
  };

  private changeSnakeColorSchema = z.object({
    type: z.literal("changeSnakeColor"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      gameId: z.string(),
    }),
    data: z.object({
      newSnakeColor: SnakeColorsSchema,
    }),
  });

  onChangeSnakeColor = (event: onChangeSnakeColorType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onChangeSnakeColorType;
    const validation = this.changeSnakeColorSchema.safeParse(safeEvent);
    if (!validation.success) return;
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
