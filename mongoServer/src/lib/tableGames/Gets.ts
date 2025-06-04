import { Collection } from "mongodb";
import Decoder from "./Decoder";
import { GameTypes } from "../../../../universal/contentTypeConstant";
import { TableGamesType } from "./typeConstant";

class Gets {
  constructor(
    private tableGamesCollection: Collection<TableGamesType>,
    private decoder: Decoder
  ) {}

  getGameMetaDataBy_TID_GID = async (gameType: GameTypes, gameId: string) => {
    try {
      const gameData = await this.tableGamesCollection.findOne({
        tid: gameType,
        gid: gameId,
      });

      if (!gameData) {
        return null;
      }

      return this.decoder.decodeMetaData(gameData);
    } catch (err) {
      console.error("Error retrieving game data:", err);
      return null;
    }
  };

  getAllBy_TID = async (tableId: string) => {
    try {
      const gamesData = await this.tableGamesCollection
        .find({ tid: tableId })
        .toArray();

      if (!gamesData || gamesData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return gamesData.map((data) => this.decoder.decodeMetaData(data));
    } catch (err) {
      console.error("Error retrieving data by TID:", err);
      return [];
    }
  };
}

export default Gets;
