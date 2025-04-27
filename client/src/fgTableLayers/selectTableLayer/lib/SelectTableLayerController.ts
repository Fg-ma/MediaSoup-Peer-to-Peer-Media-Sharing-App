import { GroupSignals } from "../../../context/signalContext/lib/typeConstant";

class SelectTableLayerController {
  init = false;
  queryInterval: NodeJS.Timeout | undefined;

  selectables: NodeListOf<HTMLElement> | undefined;
  selectedInfo: { type: string; id: string }[] | undefined;

  dragging = false;

  constructor(
    private innerTableContainerRef: React.RefObject<HTMLDivElement>,
    private tableTopRef: React.RefObject<HTMLDivElement>,
    private tableRef: React.RefObject<HTMLDivElement>,
    private dragStart: React.MutableRefObject<
      | {
          x: number;
          y: number;
        }
      | undefined
    >,
    private dragEnd: React.MutableRefObject<
      | {
          x: number;
          y: number;
        }
      | undefined
    >,
    private setDragging: React.Dispatch<React.SetStateAction<boolean>>,
    private selected: React.MutableRefObject<HTMLElement[]>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private sendGroupSignal: (signal: GroupSignals) => void,
    private groupRef: React.RefObject<HTMLDivElement>,
  ) {}

  handlePointerDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (this.groupRef.current?.contains(e.target as Node)) return;

    document.addEventListener("pointerup", this.handlePointerUp);
    document.addEventListener("pointermove", this.handlePointerMove);

    const box = this.innerTableContainerRef.current?.getBoundingClientRect();
    this.dragStart.current = {
      x: e.clientX - (box?.x ?? 0) + (this.tableRef.current?.scrollLeft ?? 0),
      y: e.clientY - (box?.y ?? 0) + (this.tableRef.current?.scrollTop ?? 0),
    };
    this.dragEnd.current = undefined;

    this.selected.current = [];

    this.setDragging(true);

    if (!this.init) {
      this.selectables =
        this.tableTopRef.current?.querySelectorAll<HTMLElement>(".selectable");
      this.init = true;
    }
    if (!this.queryInterval) {
      this.queryInterval = setInterval(() => {
        this.selectables =
          this.tableTopRef.current?.querySelectorAll<HTMLElement>(
            ".selectable",
          );
      }, 1000);
    }
  };

  handlePointerMove = (e: PointerEvent) => {
    if (!this.dragStart.current) return;

    const box = this.innerTableContainerRef.current?.getBoundingClientRect();
    const newDragEnd = {
      x: e.clientX - (box?.x ?? 0) + (this.tableRef.current?.scrollLeft ?? 0),
      y: e.clientY - (box?.y ?? 0) + (this.tableRef.current?.scrollTop ?? 0),
    };

    this.dragEnd.current = newDragEnd;

    const left = Math.min(this.dragStart.current.x, this.dragEnd.current.x);
    const top = Math.min(this.dragStart.current.y, this.dragEnd.current.y);
    const width = Math.abs(this.dragStart.current.x - this.dragEnd.current.x);
    const height = Math.abs(this.dragStart.current.y - this.dragEnd.current.y);

    this.selected.current = this.getSelectablesInBox({
      left,
      top,
      width,
      height,
    });

    this.setRerender((prev) => !prev);
  };

  handlePointerUp = () => {
    document.removeEventListener("pointerup", this.handlePointerUp);
    document.removeEventListener("pointermove", this.handlePointerMove);

    this.dragStart.current = undefined;
    this.dragEnd.current = undefined;

    if (this.selected.current.length) {
      this.selectedInfo = [];

      for (const sel of this.selected.current) {
        const type = sel.getAttribute("data-selectable-type");
        const id = sel.getAttribute("data-selectable-id");

        if (type && id) this.selectedInfo.push({ type, id });
      }
    }

    if (this.queryInterval) {
      clearInterval(this.queryInterval);
      this.queryInterval = undefined;
    }

    this.setDragging(false);
  };

  getSelectablesInBox = (selectionBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  }): HTMLElement[] => {
    if (!this.tableTopRef.current || !this.selectables) return [];

    const selectionRect = {
      left: selectionBox.left,
      right: selectionBox.left + selectionBox.width,
      top: selectionBox.top,
      bottom: selectionBox.top + selectionBox.height,
    };

    const overlappingElements: HTMLElement[] = [];

    this.selectables.forEach((el) => {
      if (!this.tableTopRef.current) return;

      const rect = el.getBoundingClientRect();
      const containerRect = this.tableTopRef.current.getBoundingClientRect();

      const elRect = {
        left:
          rect.left - containerRect.left + this.tableTopRef.current.scrollLeft,
        right:
          rect.right - containerRect.left + this.tableTopRef.current.scrollLeft,
        top: rect.top - containerRect.top + this.tableTopRef.current.scrollTop,
        bottom:
          rect.bottom - containerRect.top + this.tableTopRef.current.scrollTop,
      };

      const isOverlapping =
        selectionRect.left < elRect.right &&
        selectionRect.right > elRect.left &&
        selectionRect.top < elRect.bottom &&
        selectionRect.bottom > elRect.top;

      if (isOverlapping) {
        overlappingElements.push(el);
      }
    });

    return overlappingElements;
  };

  groupClick = () => {
    if (!this.dragging) {
      this.selected.current = [];
      this.setRerender((prev) => !prev);
    }
  };

  groupDragStart = (event: React.PointerEvent) => {
    document.addEventListener("pointerup", this.groupDragEnd);
    document.addEventListener("pointermove", this.groupDrag);

    setTimeout(() => {
      this.dragging = true;
    }, 100);

    if (this.selectedInfo && this.selectedInfo.length) {
      const box = this.innerTableContainerRef.current?.getBoundingClientRect();

      this.sendGroupSignal({
        type: "groupDragStart",
        data: {
          affected: this.selectedInfo,
          startDragPosition: {
            x:
              ((event.clientX -
                (box?.x ?? 0) +
                (this.tableRef.current?.scrollLeft ?? 0)) /
                (this.tableTopRef.current?.clientWidth ?? 1)) *
              100,
            y:
              ((event.clientY -
                (box?.y ?? 0) +
                (this.tableRef.current?.scrollTop ?? 0)) /
                (this.tableTopRef.current?.clientHeight ?? 1)) *
              100,
          },
        },
      });
    }
  };

  groupDrag = (event: PointerEvent) => {
    if (this.selectedInfo && this.selectedInfo.length) {
      const box = this.innerTableContainerRef.current?.getBoundingClientRect();

      this.sendGroupSignal({
        type: "groupDrag",
        data: {
          affected: this.selectedInfo,
          dragPosition: {
            x:
              ((event.clientX -
                (box?.x ?? 0) +
                (this.tableRef.current?.scrollLeft ?? 0)) /
                (this.tableTopRef.current?.clientWidth ?? 1)) *
              100,
            y:
              ((event.clientY -
                (box?.y ?? 0) +
                (this.tableRef.current?.scrollTop ?? 0)) /
                (this.tableTopRef.current?.clientHeight ?? 1)) *
              100,
          },
        },
      });

      this.setRerender((prev) => !prev);
    }
  };

  groupDragEnd = () => {
    document.removeEventListener("pointerup", this.groupDragEnd);
    document.removeEventListener("pointermove", this.groupDrag);

    setTimeout(() => {
      this.dragging = false;
    }, 0);

    if (this.selectedInfo && this.selectedInfo.length) {
      this.sendGroupSignal({
        type: "groupDragEnd",
        data: { affected: this.selectedInfo },
      });
    }
  };

  handleKeyPress = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    switch (key) {
      case "x":
        if (this.selectedInfo) {
          this.sendGroupSignal({
            type: "groupDelete",
            data: { affected: this.selectedInfo },
          });
        }
        break;
      case "delete":
        if (this.selectedInfo) {
          this.sendGroupSignal({
            type: "groupDelete",
            data: { affected: this.selectedInfo },
          });
        }
        break;
      case "escape":
        this.dragStart.current = undefined;
        this.dragEnd.current = undefined;
        this.selected.current = [];
        this.setDragging(false);
        break;
      default:
        break;
    }
  };
}

export default SelectTableLayerController;
