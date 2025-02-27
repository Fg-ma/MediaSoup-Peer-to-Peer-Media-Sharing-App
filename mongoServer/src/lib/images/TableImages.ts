import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";

class TableImages {
  private tableImagesCollection: Collection;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.tableImagesCollection = this.db.collection("tableImages");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.tableImagesCollection, this.decoder);
    this.uploads = new Uploads(this.tableImagesCollection, this.encoder);
    this.deletes = new Deletes(this.tableImagesCollection);
  }
}

export default TableImages;
