import { v4 as uuidv4 } from "uuid";
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

class TablesController {
  constructor(private broadcaster: Broadcaster) {}

  onJoinTable = (ws: TableWebSocket, event: onJoinTableType) => {
    const { table_id, username, instance } = event.header;

    ws.id = uuidv4();
    ws.table_id = table_id;
    ws.username = username;
    ws.instance = instance;

    if (!tables[table_id]) {
      tables[table_id] = {};
    }
    if (!tables[table_id][username]) {
      tables[table_id][username] = {};
    }

    tables[table_id][username][instance] = ws;

    this.performSeatSwaps(table_id);

    if (!tablesUserData[table_id]) {
      tablesUserData[table_id] = {};
    }
    if (!tablesUserData[table_id][username]) {
      tablesUserData[table_id][username] = {
        color: this.getRandomAvailableTableColor(table_id) ?? "tableTop",
        seat: this.getNextAvailableTableSeat(table_id) ?? 17,
        online: true,
      };
    }

    this.broadcaster.broadcastToTable(table_id, {
      type: "userJoinedTable",
      data: {
        userData: tablesUserData[table_id],
      },
    });
  };

  onLeaveTable = (event: onLeaveTableType) => {
    const { table_id, username, instance } = event.header;

    if (
      tables[table_id] &&
      tables[table_id][username] &&
      tables[table_id][username][instance]
    ) {
      tables[table_id][username][instance].close();
    }

    this.broadcaster.broadcastToTable(table_id, {
      type: "userLeftTable",
      data: {
        userData: tablesUserData[table_id],
      },
    });
  };

  onChangeTableBackground = (event: onChangeTableBackgroundType) => {
    const { table_id, username, instance } = event.header;
    const { background } = event.data;

    this.broadcaster.broadcastToTable(
      table_id,
      {
        type: "tableBackgroundChanged",
        data: { background },
      },
      [{ username, instance }]
    );
  };

  onMoveSeats = (event: onMoveSeatsType) => {
    const { table_id, username } = event.header;
    const { direction } = event.data;

    // Get the table's user data
    const tableData = tablesUserData[table_id];

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
      tablesUserData[table_id][username].seat = targetSeat;
      tablesUserData[table_id][targetUser].seat = userSeat;
    }
    this.broadcaster.broadcastToTable(table_id, {
      type: "seatsMoved",
      data: {
        userData: tableData,
      },
    });
  };

  onSwapSeats = (event: onSwapSeatsType) => {
    const { table_id, username, targetUsername } = event.header;

    if (targetUsername === username) return;

    const userSeat = tablesUserData[table_id][username].seat;
    const targetSeat = tablesUserData[table_id][targetUsername].seat;

    tablesUserData[table_id][username].seat = targetSeat;
    tablesUserData[table_id][targetUsername].seat = userSeat;

    this.broadcaster.broadcastToTable(table_id, {
      type: "seatsSwaped",
      data: {
        userData: tablesUserData[table_id],
      },
    });
  };

  onKickFromTable = (event: onKickFromTableType) => {
    const { table_id, username, targetUsername } = event.header;

    if (targetUsername === username) return;

    if (tablesUserData[table_id] && tablesUserData[table_id][username]) {
      delete tablesUserData[table_id][username];
    }

    this.broadcaster.broadcastToTable(table_id, {
      type: "kickedFromTable",
      data: {
        userData: tablesUserData[table_id],
      },
    });
  };

  onReaction = (event: onReactionType) => {
    const { table_id, contentType, contentId } = event.header;

    this.broadcaster.broadcastToTable(table_id, {
      type: "reactionOccurred",
      header: {
        contentType,
        contentId,
      },
      data: event.data,
    });
  };

  private performSeatSwaps = (table_id: string) => {
    const tableData = tablesUserData[table_id];

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
    table_id: string
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
    for (const username in tablesUserData[table_id]) {
      colorsAlreadyInUse.push(tablesUserData[table_id][username].color);
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

  private getNextAvailableTableSeat = (table_id: string): number | null => {
    const seatsInUse = Object.keys(tablesUserData[table_id]).length + 1;
    const seatingChart = tableSeatingChart[seatsInUse as 1].seats;

    const seatsAlreadTaken: number[] = [];
    for (const username in tablesUserData[table_id]) {
      seatsAlreadTaken.push(tablesUserData[table_id][username].seat);
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
