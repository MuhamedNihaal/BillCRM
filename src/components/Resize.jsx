/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Card,
  Pagination,
  PaginationItems,
  PaginationNext,
  PaginationPrevious,
} from "./ui";
import {
  Maximize2,
  Minimize2,
  SearchX,
  Search,
  Fullscreen,
} from "lucide-react";
import clsx from "clsx";
import Inputs from "./Inputs";
import "app/../styles/resize.css";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

import { Swap, SwapOff, SwapOn } from "components/ui";
import { cn } from "lib/utils";
import { debounce } from "lodash";

// --- Other components ---
const IconButton = memo(
  ({ onClick, isActive, SwapOn: SwapOnIcon, SwapOff: SwapOffIcon }) => (
    <button
      onClick={onClick}
      className="bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400 flex size-7 shrink-0 items-center justify-center rounded-lg"
    >
      <Swap
        defaultValue={isActive ? "on" : "off"}
        value={isActive ? "on" : "off"}
        effect="flip"
      >
        <SwapOn>
          {React.createElement(SwapOnIcon, { className: "size-5 stroke-1" })}
        </SwapOn>
        <SwapOff>
          {React.createElement(SwapOffIcon, { className: "size-5 stroke-1" })}
        </SwapOff>
      </Swap>
    </button>
  ),
);
IconButton.displayName = "IconButton";

// --- Panel Component ---
const Panel = memo(
  ({
    className,
    side,
    title,
    isMaximized,
    searchVisible,
    onToggleSearch,
    onToggleMaximize,
    onClickFullScreen,
    fullScreen,
    children,
    count,
    limit,
    handleFilter,
    headerChildren,
  }) => {
    const timeoutRef = useRef(null);

    let [search, setSearch] = useState("");
    let [page, setPage] = useState(1);

    const isFiltered = useMemo(
      () => typeof handleFilter === "function",
      [handleFilter],
    );

    const pageCount = useMemo(() => {
      const safeCount = count === 0 ? 1 : count;
      return Math.ceil(safeCount / limit);
    }, [count, limit]);

    const debouncedLoadOptions = useCallback((search, page, limit) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        handleFilter(search, page, limit);
      }, 300);
    }, []);

    useEffect(() => {
      if (page <= pageCount && pageCount >= page) {
        if (isFiltered) {
          debouncedLoadOptions(search, page, limit);
        }
      } else {
        setPage(1);
      }
    }, [search, page, pageCount, isFiltered, limit]);

    return (
      <Card
        className={clsx(
          "p-3 pt-0",
          side === "left" ? "item" : "item-details",
          isMaximized ? "maximize" : isMaximized === false ? "minimize" : "",
          className,
        )}
      >
        <div className="flex items-center justify-between bg-white py-1 pt-3">
          <h3 className="text-sm-plus dark:text-dark-100 font-medium tracking-wide text-gray-800 capitalize">
            {title}
          </h3>

          <div className="flex items-center space-x-1">
            {React.isValidElement(headerChildren)
              ? React.cloneElement(headerChildren)
              : headerChildren}

            {isFiltered && (
              <>
                <div
                  className={clsx(
                    "ml-2 overflow-hidden transition-all duration-300 ease-in-out",
                    searchVisible ? "w-48 opacity-100" : "w-0 opacity-0",
                  )}
                >
                  <Inputs
                    className="h-7 py-1 text-xs"
                    type="text"
                    placeholder="Search..."
                    defaultValue={search}
                    handleOnChange={(e) => {
                      setSearch(e.value);
                    }}
                  />
                </div>

                <IconButton
                  onClick={(e) => {
                    setSearch("");
                    onToggleSearch(e);
                  }}
                  isActive={searchVisible}
                  SwapOn={SearchX}
                  SwapOff={Search}
                />
              </>
            )}

            {side === "left" && (
              <IconButton
                onClick={onClickFullScreen}
                isActive={fullScreen}
                SwapOn={ArrowsPointingInIcon}
                SwapOff={ArrowsPointingOutIcon}
              />
            )}

            <IconButton
              onClick={onToggleMaximize}
              isActive={isMaximized}
              SwapOn={Minimize2}
              SwapOff={Maximize2}
            />
          </div>
        </div>

        {React.isValidElement(children)
          ? React.cloneElement(children)
          : children}

        {isFiltered && (
          <div className="mt-2 flex w-full items-center justify-center">
            <Pagination
              total={pageCount}
              defaultValue={page}
              value={page}
              className="mt-auto"
              onChange={setPage}
            >
              <PaginationPrevious />
              <PaginationItems />
              <PaginationNext />
            </Pagination>
          </div>
        )}
      </Card>
    );
  },
);
Panel.displayName = "Panel";

// --- Left Panel Wrapper ---
export const Left = memo(
  ({
    title,
    className,
    count = 1,
    limit = 50,
    handleFilter = null,
    ...props
  }) => {
    const {
      layout,
      searchVisible,
      toggleSearch,
      toggleLayout,
      fullScreen,
      onClickFullScreen,
    } = props;

    const isMaximized =
      layout === "maximize-item"
        ? true
        : layout === "maximize-details"
          ? false
          : null;

    return (
      <Panel
        className={className}
        {...props}
        side="left"
        count={count}
        limit={limit}
        handleFilter={handleFilter}
        title={title}
        whenFullScreen={props.whenFullScreen}
        isMaximized={isMaximized}
        searchVisible={searchVisible.left}
        onToggleSearch={() =>
          toggleSearch({ panel: "left", setSearch: () => {} })
        }
        onToggleMaximize={() => toggleLayout("item")}
        fullScreen={fullScreen}
        onClickFullScreen={() => onClickFullScreen()}
      />
    );
  },
);
Left.displayName = "Left";

// --- Right Panel Wrapper ---
export const Right = memo(
  ({
    title,
    className,
    count = 1,
    limit = 50,
    handleFilter = null,
    ...props
  }) => {
    const { layout, searchVisible, toggleSearch, toggleLayout } = props;

    const isMaximized =
      layout === "maximize-details"
        ? true
        : layout === "maximize-item"
          ? false
          : null;

    return (
      <Panel
        className={className}
        {...props}
        side="right"
        count={count}
        handleFilter={handleFilter}
        limit={limit}
        title={title}
        isMaximized={isMaximized}
        searchVisible={searchVisible.right}
        onToggleSearch={() =>
          toggleSearch({ panel: "right", setSearch: () => {} })
        }
        onToggleMaximize={() => toggleLayout("details")}
      />
    );
  },
);
Right.displayName = "Right";

// --- Resize Container ---
export const Resize = memo(({ className, whenFullScreen, ...props }) => {
  const [layout, setLayout] = useState("default");

  const [searchVisible, setSearchVisible] = useState({
    left: false,
    right: false,
  });

  const [fullScreen, setFullScreen] = useState(false);

  const toggleLayout = useCallback((pane) => {
    setLayout((prev) =>
      prev === `maximize-${pane}` ? "default" : `maximize-${pane}`,
    );
  }, []);

  const onClickFullScreen = useCallback(() => {
    setFullScreen((prev) => {
      if (typeof whenFullScreen === "function") {
        whenFullScreen(!prev);
      }

      return !prev;
    });
  }, [whenFullScreen]);

  const toggleSearch = useCallback(({ panel, setSearch }) => {
    setSearchVisible((prev) => {
      const updated = { ...prev, [panel]: !prev[panel] };
      if (updated[panel] && typeof setSearch === "function") setSearch("");
      return updated;
    });
  }, []);

  return (
    <div
      className={cn(
        "resize-div mt-2 mb-2 flex w-full space-x-2 transition-all duration-300 ease-linear",
        className,
        fullScreen &&
          "fixed top-0 right-0 bottom-0 left-0 z-[61] h-auto bg-white p-2",
      )}
    >
      {React.Children.map(props.children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              layout,
              searchVisible,
              toggleSearch,
              toggleLayout,
              fullScreen,
              onClickFullScreen,
            })
          : child,
      )}
    </div>
  );
});
Resize.displayName = "Resize";
