import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";

class TableText {
  private tableTextCollection: Collection;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.tableTextCollection = this.db.collection("tableText");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.tableTextCollection, this.decoder);
    this.uploads = new Uploads(this.tableTextCollection, this.encoder);
    this.deletes = new Deletes(this.tableTextCollection);
  }
}

export default TableText;
