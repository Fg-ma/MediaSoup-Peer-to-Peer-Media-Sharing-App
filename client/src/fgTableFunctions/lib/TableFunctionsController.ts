import { FgBackground } from "../../elements/fgBackgroundSelector/lib/typeConstant";
import { IncomingTableMessages } from "../../lib/TableSocketController";

class TableFunctionsController {
  constructor(
    private externalBackgroundChange: React.MutableRefObject<boolean>,
    private setTableBackground: React.Dispatch<
      React.SetStateAction<FgBackground | undefined>
    >
  ) {}

  handleTableSocketMessage = (message: IncomingTableMessages) => {
    switch (message.type) {
      case "tableBackgroundChanged":
        this.externalBackgroundChange.current = true;
        this.setTableBackground(message.data.background);
        break;
      default:
        break;
    }
  };
}

export default TableFunctionsController;
