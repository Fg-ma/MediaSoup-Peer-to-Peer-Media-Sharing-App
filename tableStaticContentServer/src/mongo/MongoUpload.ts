import { MongoClient, Db, Collection } from "mongodb";
import {
  beardsEffectEncodingMap,
  glassesEffectEncodingMap,
  hatsEffectEncodingMap,
  hideBackgroundEffectEncodingMap,
  ImageEffectStylesType,
  ImageEffectTypes,
  masksEffectEncodingMap,
  mustachesEffectEncodingMap,
  petsEffectEncodingMap,
  postProcessEffectsEncodingMap,
} from "./lib/typeConstant";

const uri = "mongodb://localhost:27017";
const dbName = "tableTopMongo";

class TableTopMongo {
  private client: MongoClient | undefined;
  private db: Db | undefined;
  private tableImagesCollection: Collection | undefined;

  constructor() {
    this.getDbConnection();
  }

  destructor = () => {
    this.client?.close();
  };

  private getDbConnection = async () => {
    this.client = new MongoClient(uri);

    await this.client.connect();

    this.db = this.client.db(dbName);
    this.tableImagesCollection = this.db.collection("tableImages");
  };

  private convertImageMetaDataToMongo = (data: {
    table_id: string;
    imageId: string;
    positioning: {
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    };
    effects: {
      [effectType in ImageEffectTypes]: boolean;
    };
    effectStyles: ImageEffectStylesType;
  }): {
    tid: string;
    iid: string;
    p: {
      p: {
        l: number;
        t: number;
      };
      s: {
        x: number;
        y: number;
      };
      r: number;
    };
    e: number[];
    es: {
      "0": {
        s: number;
      };
      "1": {
        s: number;
        c: string;
      };
      "2": {
        s: number;
      };
      "3": {
        s: number;
      };
      "4": {
        s: number;
      };
      "5": {
        s: number;
      };
      "6": {
        s: number;
      };
      "7": {
        s: number;
      };
    };
  } => {
    const { table_id, imageId, positioning, effects, effectStyles } = data;

    const e: number[] = Object.keys(effects)
      .filter((effect) => effects[effect as keyof typeof effects])
      .map((effect) => parseInt(effect));

    return {
      tid: table_id,
      iid: imageId,
      p: {
        p: {
          l: positioning.position.left,
          t: positioning.position.top,
        },
        s: {
          x: positioning.scale.x,
          y: positioning.scale.y,
        },
        r: positioning.rotation,
      },
      e,
      es: {
        "0": {
          s: postProcessEffectsEncodingMap[effectStyles.postProcess.style],
        },
        "1": {
          s: hideBackgroundEffectEncodingMap[effectStyles.hideBackground.style],
          c: effectStyles.hideBackground.color,
        },
        "2": {
          s: glassesEffectEncodingMap[effectStyles.glasses.style],
        },
        "3": {
          s: beardsEffectEncodingMap[effectStyles.beards.style],
        },
        "4": {
          s: mustachesEffectEncodingMap[effectStyles.mustaches.style],
        },
        "5": {
          s: masksEffectEncodingMap[effectStyles.masks.style],
        },
        "6": {
          s: hatsEffectEncodingMap[effectStyles.hats.style],
        },
        "7": {
          s: petsEffectEncodingMap[effectStyles.pets.style],
        },
      },
    };
  };

  uploadImageMetaData = async (data: {
    table_id: string;
    imageId: string;
    positioning: {
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    };
    effects: {
      [effectType in ImageEffectTypes]: boolean;
    };
    effectStyles: ImageEffectStylesType;
  }) => {
    const mongoData = this.convertImageMetaDataToMongo(data);

    try {
      await this.tableImagesCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };
}

export default TableTopMongo;
