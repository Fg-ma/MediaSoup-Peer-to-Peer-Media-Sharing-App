import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";
import { TableSvgsType } from "./typeConstant";

class TableSvgs {
  private tableSvgsCollection: Collection<TableSvgsType>;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.tableSvgsCollection = this.db.collection("tableSvgs");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.tableSvgsCollection, this.decoder);
    this.uploads = new Uploads(this.tableSvgsCollection, this.encoder);
    this.deletes = new Deletes(this.tableSvgsCollection);
  }
}

export default TableSvgs;
