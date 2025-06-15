import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import {
  onChangeTableBackgroundType,
  onJoinTableType,
  onKickFromTableType,
  onLeaveTableType,
  onMoveSeatsType,
  onReactionType,
  onSwapSeatsType,
  TableColors,
  tables,
  tableSeatingChart,
  tablesUserData,
  TableWebSocket,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";
import { sanitizationUtils } from "src";
import { contentTypesArray } from "../../../universal/contentTypeConstant";
import {
  TableReactionsArray,
  TableReactionStylesArray,
} from "../../../universal/reactionsTypeConstant";

class TablesController {
  constructor(private broadcaster: Broadcaster) {}

  private joinTableSchema = z.object({
    type: z.literal("joinTable"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
    }),
  });

  onJoinTable = (ws: TableWebSocket, event: onJoinTableType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onJoinTableType;
    const validation = this.joinTableSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance } = safeEvent.header;

    ws.id = uuidv4();
    ws.tableId = tableId;
    ws.username = username;
    ws.instance = instance;

    if (!tables[tableId]) {
      tables[tableId] = {};
    }
    if (!tables[tableId][username]) {
      tables[tableId][username] = {};
    }

    tables[tableId][username][instance] = ws;

    this.performSeatSwaps(tableId);

    if (!tablesUserData[tableId]) {
      tablesUserData[tableId] = {};
    }
    if (!tablesUserData[tableId][username]) {
      tablesUserData[tableId][username] = {
        color: this.getRandomAvailableTableColor(tableId) ?? "tableTop",
        seat: this.getNextAvailableTableSeat(tableId) ?? 17,
        online: true,
      };
    }

    this.broadcaster.broadcastToTable(tableId, {
      type: "userJoinedTable",
      data: {
        userData: tablesUserData[tableId],
      },
    });
  };

  private leaveTableSchema = z.object({
    type: z.literal("leaveTable"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
    }),
  });

  onLeaveTable = (event: onLeaveTableType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onLeaveTableType;
    const validation = this.leaveTableSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance } = safeEvent.header;

    if (
      tables[tableId] &&
      tables[tableId][username] &&
      tables[tableId][username][instance]
    ) {
      tables[tableId][username][instance].close();
    }

    this.broadcaster.broadcastToTable(tableId, {
      type: "userLeftTable",
      data: {
        userData: tablesUserData[tableId],
      },
    });
  };

  private changeTableBackgroundSchema = z.object({
    type: z.literal("changeTableBackground"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
    }),
    data: z.object({
      background: z.object({
        category: z.string(),
        categorySelection: z.string(),
      }),
    }),
  });

  onChangeTableBackground = (event: onChangeTableBackgroundType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onChangeTableBackgroundType;
    const validation = this.changeTableBackgroundSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance } = safeEvent.header;
    const { background } = safeEvent.data;

    this.broadcaster.broadcastToTable(
      tableId,
      {
        type: "tableBackgroundChanged",
        data: { background },
      },
      [{ username, instance }]
    );
  };

  private moveSeatsSchema = z.object({
    type: z.literal("moveSeats"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
    }),
    data: z.object({
      direction: z.enum(["left", "right"]),
    }),
  });

  onMoveSeats = (event: onMoveSeatsType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onMoveSeatsType;
    const validation = this.moveSeatsSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username } = safeEvent.header;
    const { direction } = safeEvent.data;

    // Get the table's user data
    const tableData = tablesUserData[tableId];

    // Get current user seat
    const userSeat = tableData[username]?.seat;
    if (!userSeat) return;

    // Get all occupied seats (sorted in ascending order)
    const occupiedSeats = Object.values(tableData)
      .map((user) => user.seat)
      .sort((a, b) => a - b);

    const userIndex = occupiedSeats.findIndex(
      (occupiedSeats) => occupiedSeats === userSeat
    );

    // Find the closest seat based on direction
    let targetSeat: number;
    if (direction === "left") {
      targetSeat =
        occupiedSeats[
          userIndex - 1 < 0 ? occupiedSeats.length - 1 : userIndex - 1
        ];
    } else {
      targetSeat =
        occupiedSeats[
          userIndex + 1 > occupiedSeats.length - 1 ? 0 : userIndex + 1
        ];
    }

    // Find the user in the target seat
    const targetUser = Object.keys(tableData).find(
      (user) => tableData[user].seat === targetSeat
    );

    if (targetUser) {
      tablesUserData[tableId][username].seat = targetSeat;
      tablesUserData[tableId][targetUser].seat = userSeat;
    }
    this.broadcaster.broadcastToTable(tableId, {
      type: "seatsMoved",
      data: {
        userData: tableData,
      },
    });
  };

  private swapSeatsSchema = z.object({
    type: z.literal("swapSeats"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      targetUsername: z.string(),
    }),
  });

  onSwapSeats = (event: onSwapSeatsType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onSwapSeatsType;
    const validation = this.swapSeatsSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, targetUsername } = safeEvent.header;

    if (targetUsername === username) return;

    const userSeat = tablesUserData[tableId][username].seat;
    const targetSeat = tablesUserData[tableId][targetUsername].seat;

    tablesUserData[tableId][username].seat = targetSeat;
    tablesUserData[tableId][targetUsername].seat = userSeat;

    this.broadcaster.broadcastToTable(tableId, {
      type: "seatsSwaped",
      data: {
        userData: tablesUserData[tableId],
      },
    });
  };

  private kickFromTableSchema = z.object({
    type: z.literal("kickFromTable"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      targetUsername: z.string(),
    }),
  });

  onKickFromTable = (event: onKickFromTableType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onKickFromTableType;
    const validation = this.kickFromTableSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, targetUsername } = safeEvent.header;

    if (targetUsername === username) return;

    if (tablesUserData[tableId] && tablesUserData[tableId][username]) {
      delete tablesUserData[tableId][username];
    }

    this.broadcaster.broadcastToTable(tableId, {
      type: "kickedFromTable",
      data: {
        userData: tablesUserData[tableId],
      },
    });
  };

  private reactionSchema = z.object({
    type: z.literal("reaction"),
    header: z.object({
      tableId: z.string(),
      contentType: z.enum(contentTypesArray),
      contentId: z.string().optional(),
      instanceId: z.string().optional(),
    }),
    data: z.object({
      reaction: z.enum(TableReactionsArray),
      reactionStyle: z.enum(TableReactionStylesArray),
    }),
  });

  onReaction = (event: onReactionType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(event) as onReactionType;
    const validation = this.reactionSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, contentType, contentId, instanceId } = safeEvent.header;

    this.broadcaster.broadcastToTable(tableId, {
      type: "reactionOccurred",
      header: {
        contentType,
        contentId,
        instanceId,
      },
      data: safeEvent.data,
    });
  };

  private performSeatSwaps = (tableId: string) => {
    const tableData = tablesUserData[tableId];

    if (!tableData) return;

    const seatsInUse = Object.keys(tableData).length + 1;
    const swaps = tableSeatingChart[seatsInUse as 1 | 4]?.swaps || [];

    if (swaps.length === 0) return;

    for (const username in tableData) {
      const user = tableData[username];
      const swap = swaps.find((swap) => swap.from === user.seat);
      if (swap) {
        user.seat = swap.to;
      }
    }
  };

  private getRandomAvailableTableColor = (
    tableId: string
  ): TableColors | null => {
    const allColors: TableColors[] = [
      "cyan",
      "orange",
      "blue",
      "green",
      "yellow",
      "purple",
      "pink",
      "black",
      "white",
      "brown",
      "lime",
      "coral",
      "gray",
      "navy",
      "lightBlue",
      "tableTop",
    ];

    // Step 2: Collect colors already in use for the given table
    const colorsAlreadyInUse: TableColors[] = [];
    for (const username in tablesUserData[tableId]) {
      colorsAlreadyInUse.push(
        tablesUserData[tableId][username].color as TableColors
      );
    }

    // Step 3: Filter out used colors
    const availableColors = allColors.filter(
      (color) => !colorsAlreadyInUse.includes(color)
    );

    // Step 4: Return a random available color, or null if all colors are used
    if (availableColors.length === 0) {
      return null;
    }
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  };

  private getNextAvailableTableSeat = (tableId: string): number | null => {
    const seatsInUse = Object.keys(tablesUserData[tableId]).length + 1;
    const seatingChart = tableSeatingChart[seatsInUse as 1].seats;

    const seatsAlreadTaken: number[] = [];
    for (const username in tablesUserData[tableId]) {
      seatsAlreadTaken.push(tablesUserData[tableId][username].seat);
    }

    // Step 3: Filter out used colors
    const availableSeats = seatingChart.filter(
      (seat) => !seatsAlreadTaken.includes(seat)
    );

    // Step 4: Return a random available color, or null if all colors are used
    if (availableSeats.length === 0) {
      return null;
    }
    return availableSeats[0];
  };
}

export default TablesController;
