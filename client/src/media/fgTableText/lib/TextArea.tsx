import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { Settings } from "./typeConstant";

export default function TextArea({
  text,
  settings,
  editableTextRef,
  isLineNums,
  setIsLineNums,
  isEditing,
  setIsEditing,
}: {
  text: React.MutableRefObject<string>;
  settings: Settings;
  editableTextRef: React.RefObject<HTMLDivElement>;
  isLineNums: boolean;
  setIsLineNums: React.Dispatch<React.SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [content, setContent] = useState(text.current.split("\n"));
  const [editingLine, setEditingLine] = useState<number | null>(null);
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [_, setRerender] = useState(false);

  useMemo(() => {
    text.current = content.join("\n");
  }, [content]);

  useMemo(() => {
    setContent(text.current.split("\n"));
  }, [text.current]);

  const lineHeightPx = parseInt(settings.fontSize.value, 10) * 1.25;
  const maxDigits = content.length.toString().length;

  const formatLineNumber = (index: number, maxDigits: number) => {
    const lineNum = index + 1;
    if (maxDigits > 3 && lineNum > 999) {
      const lastTwo = (lineNum % 100).toString().padStart(2, "0");
      return `_${lastTwo}`;
    } else {
      return lineNum.toString().padStart(Math.min(3, maxDigits), " ");
    }
  };

  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const [lineNumFormatted, setLineNumFormatted] = useState(true);
      const editableRef = useRef<HTMLDivElement>(null);

      const lineText = content[index];
      const isActive = isEditing && editingLine === index;

      const handleLineNumClick = () => {
        setLineNumFormatted((prev) => !prev);
      };

      useEffect(() => {
        if (!isActive || !editableRef.current) return;

        const sel = window.getSelection();
        if (!sel) return;

        let range: Range | null = null;

        // Standard modern API
        if (document.caretPositionFromPoint && clickPos) {
          const caret = document.caretPositionFromPoint(clickPos.x, clickPos.y);
          if (!caret) return;
          const { offsetNode, offset } = caret;
          range = document.createRange();
          range.setStart(offsetNode, offset);
        }
        // WebKit fallback
        else if ((document as any).caretRangeFromPoint && clickPos) {
          range = (document as any).caretRangeFromPoint(
            clickPos.x,
            clickPos.y,
          ) as Range;
        }

        // If we fell back or coordinates invalid, just collapse to end
        if (!range) {
          range = document.createRange();
          range.selectNodeContents(editableRef.current);
          range.collapse(false);
        }

        if (clickPos && clickPos.x < 0) {
          // special collapse-to-start (x===-1,y ignored) or -end
          range = document.createRange();
          range.selectNodeContents(editableRef.current);
          range.collapse(clickPos.y > 0);
          // y>0 → collapse to end, else to start
          setClickPos(null);
        }

        sel.removeAllRanges();
        sel.addRange(range);

        // Clear clickPos so stale coords don’t re-fire
        setClickPos(null);
      }, [isActive, clickPos]);

      const commitEdit = () => {
        if (!editableRef.current) return;

        const newText = editableRef.current.innerText.replace(/\u00a0/g, " ");

        setContent((lines) => {
          const copy = [...lines];
          copy[index] = newText;
          return copy;
        });

        setEditingLine(null);
      };

      return (
        <div
          style={{
            ...style,
            display: "flex",
            fontSize: settings.fontSize.value,
            lineHeight: `calc(${settings.fontSize.value} + ${
              parseInt(settings.fontSize.value.slice(0, -2)) * 0.25
            }px)`,
          }}
          className="select-text"
        >
          {isLineNums && (
            <div
              style={{
                flexShrink: 0,
                textAlign: "right",
                paddingRight: 8,
                userSelect: "none",
                color: settings.colors.indexColor.value,
                whiteSpace: "pre",
              }}
              className="cursor-pointer font-B612Mono"
              onClick={handleLineNumClick}
              onDoubleClick={(e) => {
                e.stopPropagation();
                e.bubbles = false;

                setIsLineNums((prev) => !prev);
              }}
            >
              [
              {lineNumFormatted || index + 1 < 999
                ? formatLineNumber(index, maxDigits)
                : index + 1}
              ]
            </div>
          )}

          {isActive ? (
            <div
              ref={editableRef}
              contentEditable
              suppressContentEditableWarning
              className="w-full break-words outline-none"
              style={{
                margin: 0,
                fontFamily: settings.fontStyle.value,
                color: settings.colors.textColor.value,
                whiteSpace: "pre-wrap",
              }}
              onBlur={commitEdit}
              onKeyDownCapture={(e) => {
                const sel = window.getSelection();
                if (!sel) return;
                const range = sel.getRangeAt(0);
                // we assume a single textNode child
                const offset = range.startOffset;
                // --- ENTER: split line at cursor ---
                if (e.key === "Enter") {
                  e.stopPropagation();
                  e.bubbles = false;
                  e.preventDefault();
                  const fullLine = content[index];
                  const before = fullLine.slice(0, offset);
                  const after = fullLine.slice(offset);

                  setContent((lines) => {
                    const copy = [...lines];
                    copy.splice(index, 1, before, after);
                    return copy;
                  });

                  // move edit focus to the new line
                  setEditingLine(index + 1);
                  // place caret at start of that line
                  setClickPos({ x: -1, y: 0 });
                  return;
                }

                // --- BACKSPACE at start: merge with previous ---
                if (e.key === "Backspace" && offset === 0) {
                  e.stopPropagation();
                  e.bubbles = false;
                  e.preventDefault();
                  if (index === 0) return; // nothing to merge

                  setContent((lines) => {
                    const copy = [...lines];
                    // merge current into previous
                    copy[index - 1] = copy[index - 1] + copy[index];
                    copy.splice(index, 1);
                    return copy;
                  });

                  // move edit focus up into the merged line
                  setEditingLine(index - 1);
                  // place caret at end of that merged line
                  // we'll detect negative x to collapse to end
                  setClickPos({ x: -1, y: 0 });
                  return;
                }

                // --- Delete at end: merge with next ---
                if (e.key === "Delete") {
                  e.stopPropagation();
                  e.bubbles = false;
                  if (offset === lineText.length) {
                    if (index === content.length - 1) return;
                    setContent((lines) => {
                      const copy = [...lines];
                      // glue next line onto this one
                      copy[index] = copy[index] + copy[index + 1];
                      copy.splice(index + 1, 1);
                      return copy;
                    });
                    // stay on this line, caret at original offset
                    setEditingLine(index);
                    setClickPos({ x: offset, y: 0 });
                    return;
                  }
                }
              }}
            >
              {lineText}
            </div>
          ) : (
            <pre
              style={{
                margin: 0,
                fontFamily: settings.fontStyle.value,
                color: settings.colors.textColor.value,
              }}
              className="cursor-default select-text outline-none"
              onMouseUp={(e) => {
                if (isEditing) {
                  setEditingLine(index);
                  setClickPos({ x: e.clientX, y: e.clientY });
                }
              }}
            >
              {lineText}
            </pre>
          )}
        </div>
      );
    },
    [
      content,
      isEditing,
      editingLine,
      isLineNums,
      settings,
      maxDigits,
      setEditingLine,
      setIsLineNums,
    ],
  );

  useLayoutEffect(() => {
    if (!editableTextRef.current) {
      return;
    }

    const observer = new ResizeObserver(() => setRerender((prev) => !prev));

    observer.observe(editableTextRef.current);

    return () => observer.disconnect();
  }, [editableTextRef.current]);

  return (
    <div
      className="grow"
      onDoubleClick={() => setIsEditing((prev) => !prev)}
      onKeyDownCapture={(e) => {
        if (
          isEditing &&
          e.key !== "Enter" &&
          e.key !== "Backspace" &&
          e.key !== "Delete"
        ) {
          e.stopPropagation();
          e.bubbles = false;
        }
      }}
      onKeyUpCapture={(e) => {
        if (isEditing) {
          e.stopPropagation();
          e.bubbles = false;
        }
      }}
    >
      <List
        className="small-multidirectional-scroll-bar w-full"
        height={(editableTextRef.current?.clientHeight ?? 24) - 24}
        width="100%"
        itemCount={content.length}
        itemSize={lineHeightPx}
      >
        {Row}
      </List>
    </div>
  );
}
