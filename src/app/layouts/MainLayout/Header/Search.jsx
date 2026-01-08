import {
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { settings } from "app/navigation/settings";
import { useDebounceValue, useDidUpdate, useFuse } from "hooks";
import Inputs from "components/Inputs";
import { NAV_TYPE_COLLAPSE } from "constants/app.constant";
import { Avatar, Button, Skeleton, Spinner } from "components/ui";
import { Highlight } from "components/shared/Highlight";
import { Link } from "react-router";
import { get } from "utility";
import { useThemeContext } from "app/contexts/theme/context";

import { useClickOutside } from "hooks";
import clsx from "clsx";
import { createScopedKeydownHandler } from "utils/dom/createScopedKeydownHandler";

function SlashIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="20"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        d="M3.5.5h12c1.7 0 3 1.3 3 3v13c0 1.7-1.3 3-3 3h-12c-1.7 0-3-1.3-3-3v-13c0-1.7 1.3-3 3-3z"
        opacity="0.4"
      />
      <path fill="currentColor" d="M11.8 6L8 15.1h-.9L10.8 6h1z" />
    </svg>
  );
}

const Search = ({ menus = [] }) => {
  let inputRef = useRef(null);
  let [isOpen, setIsOpen] = useState(false);
  let [dbData, setDbData] = useState({});
  const { isDark } = useThemeContext();

  const ref = useClickOutside(() => {
    setIsOpen(false);
    setSearch("");
  });

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [deferredSearch] = useDebounceValue(search, 500);

  useHotkeys(
    ["/"],
    () => {
      inputRef?.current?.focus();
    },
    {
      ignoreModifiers: true,
      preventDefault: true,
    },
  );

  const data = useMemo(() => flattenNav([...menus, settings]), [menus]);

  const { result, query, setQuery } = useFuse(data, {
    keys: ["title"],
    threshold: 0.2,
    matchAllOnEmptyQuery: false,
  });

  useDidUpdate(() => {
    setLoading(true);
    setQuery(search);
  }, [search]);

  useDidUpdate(() => {
    fetchSearchData();
  }, [deferredSearch]);

  const fetchSearchData = async () => {
    try {
      let { data } = await get(`search?search=${deferredSearch}`);
      setDbData(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div
      className="relative w-80 max-xl:w-64 max-sm:hidden max-sm:w-48"
      ref={ref}
      data-search-wrapper
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setIsOpen(false);
          setSearch("");
          e.target.blur();
        }
      }}
    >
      <Inputs
        classNames={{
          root: "h-8 flex-1",
          input:
            "text-xs-plus placeholder: relative h-8 rounded-lg hover:z-1 focus:z-1",
        }}
        defaultValue={search}
        handleOnChange={(e) => {
          if (!isOpen) setIsOpen(true);
          setSearch(e.value);
        }}
        placeholder="Search Here..."
        prefix={
          deferredSearch !== search && loading ? (
            <Spinner color="primary" className="size-4" variant="innerDot" />
          ) : (
            <MagnifyingGlassIcon className="size-4" />
          )
        }
        onKeyDown={createScopedKeydownHandler({
          siblingSelector: "[data-search-item]",
          parentSelector: "[data-search-wrapper]",
          activateOnFocus: false,
          loop: true,
          orientation: "vertical",
        })}
        suffix={
          isOpen ? (
            <Button
              isIcon
              onClick={close}
              variant={isDark ? "filled" : "outlined"}
              className="mr-4 rounded-sm px-1.5 py-0.5 text-xs"
            >
              ESC
            </Button>
          ) : (
            <SlashIcon />
          )
        }
        ref={inputRef}
        onClick={() => {
          setIsOpen(true);
        }}
        data-search-item
      />

      <div
        className={clsx(
          "absolute top-10 max-h-80 w-full overflow-auto rounded-lg border bg-white text-gray-600 dark:bg-black",
          isOpen
            ? "translate-y-0 opacity-100 transition duration-300 ease-out"
            : "translate-y-2 opacity-0 transition duration-200 ease-in",
        )}
      >
        {result?.length === 0 && Object.keys(dbData).length == 0 && (
          <div className="text-xs-plus p-4 text-center font-bold">
            {deferredSearch !== search && loading ? (
              <div>
                <Skeleton className="h-3 w-20 rounded" />
                <div className="dark:bg-dark-600 group mt-2 flex space-x-2 rounded-lg bg-gray-100 px-4 py-2.5">
                  <Skeleton className="size-11 rounded-full" />
                  <div className="flex flex-1 flex-col justify-between space-y-1 py-2">
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                  </div>
                </div>
              </div>
            ) : (
              "No results"
            )}
          </div>
        )}

        {/* server based search  */}
        {dbData
          ? Object.keys(dbData).map((key, idx) => (
              <div className="relative" key={idx}>
                <h3 className="dark:text-dark-200 text-xs-plus dark:bg-dark-750 sticky -top-1 z-10 mt-3 bg-white px-3 py-2 font-bold text-gray-500 capitalize">
                  {key}
                </h3>

                <div className="flex flex-col space-y-2 px-4 py-2.5">
                  {dbData[key].map((data, idx) => {
                    let name =
                      data?.name || `${data?.firstName} ${data?.lastName}`;
                    return (
                      <Link
                        to={"#"}
                        className="dark:bg-dark-600 group focus:ring-primary-500/50 text-primary-600 dark:text-primary-400 flex w-full cursor-pointer items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2.5 tracking-wide outline-hidden transition-colors focus:ring-3"
                        key={idx}
                        onKeyDown={createScopedKeydownHandler({
                          siblingSelector: "[data-search-item]",
                          parentSelector: "[data-search-wrapper]",
                          activateOnFocus: false,
                          loop: true,
                          orientation: "vertical",
                        })}
                        data-search-item
                      >
                        <Avatar
                          src=""
                          name={name}
                          size="11"
                          initialColor={"auto"}
                        />
                        <div className="overflow-hidden">
                          <span className="text-xs-plus block truncate">
                            <Highlight query={search}>{name}</Highlight>
                          </span>
                          {data.privilege && (
                            <span
                              className={
                                "dark:text-dark-300 mt-1 block truncate text-xs text-gray-400"
                              }
                            >
                              {data.privilege?.name}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          : null}

        {/* menu search  */}
        {result?.length > 0 && (
          <>
            <div className="relative">
              <h3 className="dark:text-dark-200 text-xs-plus dark:bg-dark-750 sticky -top-1 z-10 mt-3 bg-white px-4 py-2 font-bold text-gray-500">
                Menus
              </h3>

              <div className="flex flex-col space-y-2 px-4 py-2.5">
                {result.map(({ item, refIndex }) => (
                  <div className="flex items-center space-x-2" key={refIndex}>
                    <Link
                      to={item?.path}
                      className="group focus:ring-primary-500/50 dark:bg-dark-600 dark:text-dark-100 w-full overflow-hidden rounded-lg bg-gray-100 px-2.5 py-1.5 tracking-wide text-gray-800 focus:ring-3"
                      onKeyDown={createScopedKeydownHandler({
                        siblingSelector: "[data-search-item]",
                        parentSelector: "[data-search-wrapper]",
                        activateOnFocus: false,
                        loop: true,
                        orientation: "vertical",
                      })}
                      data-search-item
                      onClick={() => {
                        setIsOpen(false);
                        setSearch("");
                      }}
                    >
                      <span className="dark:text-dark-300 mt-1 block truncate text-xs text-gray-400">
                        {getLabel(item.path || "")}
                      </span>

                      <div className="flex w-full items-center justify-between">
                        <span className="text-xs-plus block truncate first-letter:uppercase">
                          <Highlight query={query || search}>
                            {item?.title}
                          </Highlight>
                        </span>
                        <ChevronRightIcon className="size-5 rotate-[360deg] rounded-full bg-gray-200 p-1 transition-all duration-300 group-hover:rotate-[300deg]" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            {/* <div className="dark:bg-dark-500 my-4 h-px bg-gray-200"></div> */}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;

function getLabel(path) {
  const segments = path.split("/").filter((seg) => seg);
  const depth = segments.length;

  if (depth === 1) {
    return "Module";
  } else if (depth === 2) {
    return "Menu";
  } else if (depth >= 3) {
    return "Sub Menu";
  }
}

function flattenNav(items) {
  let flatArray = [];
  items.forEach((item) => {
    if (item.path && item.type !== NAV_TYPE_COLLAPSE) {
      const { ...filteredItem } = item;
      flatArray.push(filteredItem);
    }
    if (item.childs) {
      flatArray = flatArray.concat(flattenNav(item.childs));
    }
  });
  return flatArray;
}
