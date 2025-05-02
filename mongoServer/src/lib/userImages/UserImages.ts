import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";
import { UserImagesType } from "./typeConstant";

class UserImages {
  private userImagesCollection: Collection<UserImagesType>;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.userImagesCollection = this.db.collection("userImages");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.userImagesCollection, this.decoder);
    this.uploads = new Uploads(this.userImagesCollection, this.encoder);
    this.deletes = new Deletes(this.userImagesCollection);
  }
}

export default UserImages;
