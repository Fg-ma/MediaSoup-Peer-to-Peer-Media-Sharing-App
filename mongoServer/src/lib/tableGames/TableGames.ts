import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";
import { TableGamesType } from "./typeConstant";

class TableGames {
  private tableGamesCollection: Collection<TableGamesType>;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.tableGamesCollection = this.db.collection("tableGames");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.tableGamesCollection, this.decoder);
    this.uploads = new Uploads(this.tableGamesCollection, this.encoder);
    this.deletes = new Deletes(this.tableGamesCollection);
  }
}

export default TableGames;
