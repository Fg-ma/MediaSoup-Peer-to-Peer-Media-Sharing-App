import { tableContent, TableContentTypes } from "../typeConstant";

class TableContentController {
  constructor() {}

  setContent = (
    table_id: string,
    type: TableContentTypes,
    contentId: string,
    url: string
  ) => {
    if (!tableContent[table_id]) {
      tableContent[table_id] = {};
    }
    if (!tableContent[table_id][type]) {
      tableContent[table_id][type] = {};
    }
    if (!tableContent[table_id][type][contentId]) {
      tableContent[table_id][type][contentId] = { url: "" };
    }
    tableContent[table_id][type][contentId].url = url;
  };

  deleteContent = (
    table_id: string,
    type: TableContentTypes,
    contentId: string
  ) => {
    if (tableContent[table_id]?.[type]?.[contentId]) {
      delete tableContent[table_id][type][contentId];

      if (Object.keys(tableContent[table_id][type]).length === 0) {
        delete tableContent[table_id][type];

        if (Object.keys(tableContent[table_id]).length === 0) {
          delete tableContent[table_id];
        }
      }
    }
  };
}

export default TableContentController;
