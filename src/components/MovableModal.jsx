import clsx from "clsx";
import { cn } from "lib/utils";
import { memo, useRef, useState } from "react";
import { Button } from "./ui";
import { SquareArrowDownRight, XCircle } from "lucide-react";
import { useDidUpdate } from "hooks";

/**
 *
 * @param {Object} props
 * @param {boolean} [props.isOpen=false]
 * @param {function} props.close
 * @param {number} [props.minWidth=450]
 * @param {number} [props.minHeight=450]
 * @param {number} [props.maxWidth=900]
 * @param {number} [props.maxHeight=900]
 * @param {function} props.close
 * @param {function} [props.title]
 * @returns
 */
const MovableModal = ({
  isOpen = false,
  close,
  title = "",
  minWidth = 450,
  minHeight = 450,
  maxWidth = 600,
  maxHeight = 600,
  ...props
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  let isFunctionChildren = typeof props.children === "function" ? true : false;

  const [dimensions, setDimensions] = useState({
    width: minWidth,
    height: minHeight,
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const resizeDirectionRef = useRef(null);

  const elementRef = useRef(null);

  useDidUpdate(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      setPosition((prevPosition) => ({
        x: prevPosition.x + dx,
        y: prevPosition.y + dy,
      }));

      dragStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useDidUpdate(() => {
    const handleResizeMouseMove = (e) => {
      if (!isResizing || !elementRef.current) return;

      const { x, y, width, height } = resizeStartRef.current;
      let dx = e.clientX - x;
      let dy = e.clientY - y;

      let newWidth = width;
      let newHeight = height;
      let newX = position.x;
      let newY = position.y;

      switch (resizeDirectionRef.current) {
        case "bottom-right":
          newWidth = width + dx;
          newHeight = height + dy;
          break;
        case "right":
          newWidth = width + dx;
          break;
        case "bottom":
          newHeight = height + dy;
          break;
        case "left":
          newWidth = width - dx;
          if (newWidth >= minWidth) {
            newX = position.x + dx;
          } else {
            newWidth = minWidth;
            newX = position.x + (width - minWidth);
          }
          break;
        case "top":
          newHeight = height - dy;
          if (newHeight >= minWidth) {
            newY = position.y + dy;
          } else {
            newHeight = minWidth;
            newY = position.y + (height - minWidth);
          }
          break;
        default:
          break;
      }

      if (newWidth > maxWidth) {
        newWidth = maxWidth;
      }
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
      }

      setDimensions({
        width: Math.max(minWidth, newWidth),
        height: Math.max(minHeight, newHeight),
      });

      setPosition({ x: newX, y: newY });
    };

    const handleResizeMouseUp = () => {
      setIsResizing(false);
      resizeDirectionRef.current = null;
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMouseMove);
      document.addEventListener("mouseup", handleResizeMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleResizeMouseMove);
      document.removeEventListener("mouseup", handleResizeMouseUp);
    };
  }, [isResizing]);

  useDidUpdate(() => {
    if (isDragging || isResizing) {
      document.body.style.userSelect = "none";
    } else {
      document.body.style.userSelect = "";
    }

    return () => {
      document.body.style.userSelect = "";
    };
  }, [isResizing, isDragging]);

  const handleMouseDown = (e) => {
    if (e.target.dataset.resizeHandle) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleResizeMouseDown = (e, direction) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeDirectionRef.current = direction;

    if (elementRef.current) {
      const { offsetWidth, offsetHeight } = elementRef.current;
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: offsetWidth,
        height: offsetHeight,
      };
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={elementRef}
      className={cn(
        "fixed z-[100] cursor-grab rounded-lg bg-gray-200 dark:bg-gray-800",
        "flex flex-col items-center justify-center shadow-xl",
        isDragging ? "cursor-grabbing" : "",
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative h-full w-full">
        {!isFunctionChildren && (
          <div className="flex items-center justify-between px-3 py-1">
            <h3 className="dark:text-dark-100 text-base font-medium text-gray-800">
              {title ?? ""}
            </h3>
            <Button
              className="size-7"
              variant="outline"
              isIcon
              onClick={() =>
                typeof close === "function" ? close(false) : undefined
              }
            >
              <XCircle />
            </Button>
          </div>
        )}
        <div className="dark:bg-dark-700 flex h-full w-full flex-grow items-center justify-center bg-white rounded-lg overflow-hidden select-none">
          {isFunctionChildren
            ? props?.children({ close: () => close(false) })
            : props?.children}
        </div>

        <Button
          isIcon
          className="absolute right-0 bottom-0 z-2 size-5 cursor-nwse-resize text-gray-800 dark:text-gray-200"
          onMouseDown={(e) => handleResizeMouseDown(e, "bottom-right")}
          variant="outline"
          data-resize-handle="true"
        >
          <SquareArrowDownRight className="size-5" />
        </Button>
        <ResizeBar
          position="horizontal"
          handleResizeMouseDown={handleResizeMouseDown}
          data-resize-handle="true"
        />

        <ResizeBar
          position="vertical"
          handleResizeMouseDown={handleResizeMouseDown}
          data-resize-handle="true"
        />
      </div>
    </div>
  );
};

export default MovableModal;

const ResizeBar = memo(
  ({ className, handleResizeMouseDown, position = "vertical" }) => {
    let selectedPosition = {
      vertical: {
        one: "top-0 right-0 bottom-0 cursor-ew-resize w-3",
        two: "top-0 bottom-0 left-0 cursor-ew-resize w-3",
      },
      horizontal: {
        one: "left-0 right-0 top-0 h-4 cursor-ns-resize",
        two: "left-0 right-0 bottom-0 h-4 cursor-ns-resize",
      },
    }[position];

    return (
      <>
        <div
          className={cn(clsx("absolute", selectedPosition?.one), className)}
          onMouseDown={(e) =>
            handleResizeMouseDown(e, position === "vertical" ? "right" : "top")
          }
          data-resize-handle="true"
        ></div>
        <div
          className={cn(clsx("absolute", selectedPosition?.two), className)}
          onMouseDown={(e) =>
            handleResizeMouseDown(
              e,
              position === "vertical" ? "left" : "bottom",
            )
          }
          data-resize-handle="true"
        ></div>
      </>
    );
  },
);
ResizeBar.displayName = "ResizeBar";
