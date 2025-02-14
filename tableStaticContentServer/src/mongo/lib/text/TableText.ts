import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";

class TableText {
  private tableTextsCollection: Collection;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.tableTextsCollection = this.db.collection("tableTexts");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.tableTextsCollection, this.decoder);
    this.uploads = new Uploads(this.tableTextsCollection, this.encoder);
    this.deletes = new Deletes(this.tableTextsCollection);
  }
}

export default TableText;
