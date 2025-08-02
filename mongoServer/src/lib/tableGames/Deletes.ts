import { Collection } from "mongodb";
import { TableGamesType } from "./typeConstant";

class Deletes {
  constructor(private tableGamesCollection: Collection<TableGamesType>) {}

  deleteMetadataBy_TID_GID = async (tableId: string, gameId: string) => {
    try {
      await this.tableGamesCollection.deleteOne({
        tid: tableId,
        gid: gameId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
