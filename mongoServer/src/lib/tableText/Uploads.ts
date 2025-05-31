import { Collection } from "mongodb";
import Encoder from "./Encoder";
import { TableTextType } from "./typeConstant";
import { TableContentStateTypes } from "../../../../universal/contentTypeConstant";
import { tableStateEncodingMap } from "../typeConstant";

class Uploads {
  constructor(
    private tableTextCollection: Collection<TableTextType>,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    tableId: string;
    textId: string;
    filename: string;
    mimeType: string;
    state: TableContentStateTypes[];
    instances: {
      textInstanceId: string;
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
      effectStyles: {
        backgroundColor: string;
        textColor: string;
        indexColor: string;
        fontSize: string;
        fontStyle: string;
        letterSpacing: number;
      };
    }[];
  }) => {
    const mongoData = this.encoder.encodeMetaData(data);

    try {
      await this.tableTextCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetaData = async (
    filter: { tableId: string; textId: string },
    updateData: Partial<{
      state?: TableContentStateTypes[];
      filename?: string;
      mimeType?: string;
      instances?: {
        textInstanceId: string;
        positioning?: {
          position?: { left?: number; top?: number };
          scale?: { x?: number; y?: number };
          rotation?: number;
        };
        effectStyles?: {
          backgroundColor?: string;
          textColor?: string;
          indexColor?: string;
          fontSize?: string;
          fontStyle?: string;
          letterSpacing?: number;
        };
      }[];
    }>
  ) => {
    if (!this.tableTextCollection) {
      console.error("Database not connected");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bulkOps: any[] = [];

    // 1. General metadata update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const generalSetFields: Record<string, any> = {};

    if (updateData.filename !== undefined) {
      generalSetFields["n"] = updateData.filename;
    }

    if (updateData.mimeType !== undefined) {
      generalSetFields["m"] = updateData.mimeType;
    }

    if (updateData.state !== undefined) {
      generalSetFields["s"] = updateData.state.map(
        (ate) => tableStateEncodingMap[ate]
      );
    }

    if (Object.keys(generalSetFields).length > 0) {
      bulkOps.push({
        updateOne: {
          filter: { tid: filter.tableId, xid: filter.textId },
          update: { $set: generalSetFields },
        },
      });
    }

    // 2. Instance updates
    if (updateData.instances !== undefined && updateData.instances.length > 0) {
      for (const {
        textInstanceId,
        positioning,
        effectStyles,
      } of updateData.instances) {
        if (!textInstanceId) continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const instanceSetFields: Record<string, any> = {};

        if (positioning !== undefined) {
          if (positioning.position?.left !== undefined) {
            instanceSetFields["i.$.p.p.l"] = positioning.position.left;
          }
          if (positioning.position?.top !== undefined) {
            instanceSetFields["i.$.p.p.t"] = positioning.position.top;
          }
          if (positioning.scale?.x !== undefined) {
            instanceSetFields["i.$.p.s.x"] = positioning.scale.x;
          }
          if (positioning.scale?.y !== undefined) {
            instanceSetFields["i.$.p.s.y"] = positioning.scale.y;
          }
          if (positioning.rotation !== undefined) {
            instanceSetFields["i.$.p.r"] = positioning.rotation;
          }
        }

        if (effectStyles !== undefined) {
          if (effectStyles.backgroundColor !== undefined) {
            instanceSetFields["i.$.es.0"] = effectStyles.backgroundColor;
          }
          if (effectStyles.textColor !== undefined) {
            instanceSetFields["i.$.es.1"] = effectStyles.textColor;
          }
          if (effectStyles.indexColor !== undefined) {
            instanceSetFields["i.$.es.2"] = effectStyles.indexColor;
          }
          if (effectStyles.fontSize !== undefined) {
            instanceSetFields["i.$.es.3"] = effectStyles.fontSize;
          }
          if (effectStyles.fontStyle !== undefined) {
            instanceSetFields["i.$.es.4"] = effectStyles.fontStyle;
          }
          if (effectStyles.letterSpacing !== undefined) {
            instanceSetFields["i.$.es.5"] = effectStyles.letterSpacing;
          }
        }

        if (Object.keys(instanceSetFields).length > 0) {
          bulkOps.push({
            updateOne: {
              filter: {
                tid: filter.tableId,
                xid: filter.textId,
                "i.xiid": textInstanceId,
              },
              update: { $set: instanceSetFields },
            },
          });
        }
      }
    }

    // Execute bulkWrite
    if (bulkOps.length > 0) {
      try {
        const result = await this.tableTextCollection.bulkWrite(bulkOps);
        return result;
      } catch (err) {
        console.error("Bulk write error:", err);
      }
    }
  };

  addNewInstances = async (
    filter: { tableId: string; textId: string },
    updateData: {
      textInstanceId: string;
      positioning: {
        position: { left: number; top: number };
        scale: { x: number; y: number };
        rotation: number;
      };
      effectStyles: {
        backgroundColor: string;
        textColor: string;
        indexColor: string;
        fontSize: string;
        fontStyle: string;
        letterSpacing: number;
      };
    }[]
  ) => {
    if (!this.tableTextCollection) {
      console.error("Database not connected");
      return;
    }

    if (updateData && updateData.length > 0) {
      const pushInstances = updateData.map(
        ({ textInstanceId, positioning, effectStyles }) => {
          const p = {
            p: {
              l: positioning.position.left,
              t: positioning.position.top,
            },
            s: {
              x: positioning.scale.x,
              y: positioning.scale.y,
            },
            r: positioning.rotation,
          };
          const es = {
            "0": effectStyles.backgroundColor,
            "1": effectStyles.textColor,
            "2": effectStyles.indexColor,
            "3": effectStyles.fontSize,
            "4": effectStyles.fontStyle,
            "5": effectStyles.letterSpacing,
          };

          return {
            xiid: textInstanceId,
            p,
            es,
          };
        }
      );

      try {
        const result = await this.tableTextCollection.updateOne(
          {
            tid: filter.tableId,
            xid: filter.textId,
          },
          {
            $push: {
              i: {
                $each: pushInstances,
              },
            },
          }
        );

        return result;
      } catch (err) {
        console.error("Update error:", err);
      }
    }
  };
}

export default Uploads;
