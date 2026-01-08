import { cn } from "lib/utils";
import * as Inputs from "./Input.options";
import { Case, Default, Switch } from "react-if";
import { memo, useCallback, useRef, useState } from "react";
import { useDidUpdate } from "hooks";
import { deepCleanNulls, existedValue } from "utility";
import { Button } from "components/ui";
import { FunnelIcon } from "lucide-react";

/**
 * @template T
 * @typedef {object} StateType
 * @property {T} state
 * @property {(val: T) => void} setState
 */

/**
 * @typedef {"date" | "text" | "range" | "select"} ConfigType
 */

/**
 * @typedef {object} ConfigItem
 * @property {ConfigType} type
 * @property {string} name
 * @property {string} title
 * @property {boolean} isMulti
 * @property {string} [defaultValue]
 * @property {string} [icon]
 * @property {string} [placeholder]
 */

/**
 * @typedef {ConfigItem[]} Config
 */

/**
 * @template T
 * @typedef {object} FacedFilterProps
 * @property {StateType<T>} states
 * @property {Config} config
 * @property {(filters: T) => void} handleFilter
 * @property {string} [className]
 */

/**
 * @template T
 * @param {FacedFilterProps<T>} props
 */
const FacedFilter = ({
  className,
  config,
  filters,
  handleFilter,
  states,
  handleReset = () =>{},
  ...rest
}) => {
  let [filter, setFilter] = useState({ ...filters });
  let [isReset, setIsReset] = useState(false);
  let [reset, setReset] = useState(0);

  const handleChange = (e, onChange) => {
    if (typeof onChange === "function") onChange(e);

    setFilter((prev) => ({ ...prev, [e?.name || ""]: e?.value || "" }));
  };

  const timeoutRef = useRef(null);
  const onSearch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      let finalFilter = existedValue(deepCleanNulls(filter));

      if (typeof states?.setState === "function") states?.setState(finalFilter);
      if (Object.keys(finalFilter).length == 0) {
        setIsReset(false);
      } else {
        setIsReset(true);
      }

      if (typeof handleFilter === "function") handleFilter(finalFilter);
    }, 300);
  }, [filter, handleFilter, states]);

  useDidUpdate(() => {
    onSearch(filter);
  }, [filter]);

  if (!Array.isArray(config) || config.length === 0) {
    console.error("FacedFilter: pass array in config");
    return null;
  }

  return (
    <div {...rest} className={cn("flex flex-wrap gap-2", className)}>
      {config.map((input, idx) => {
        let Icon = input.icon || FunnelIcon;
        return (
          <Switch key={idx}>
            <Case condition={input.type === "date"}>
              <Inputs.DateFilter
                {...input}
                Icon={Icon}
                onChange={(e) => {
                  handleChange(
                    {
                      name: e?.name,
                      value: e?.value || {},
                    },
                    input?.onChange,
                  );
                }}
                reset={reset}
              />
            </Case>
            <Case condition={input.type === "range"}>
              <Inputs.RangeFilter
                {...input}
                Icon={Icon}
                onChange={(e) => {
                  handleChange(
                    {
                      name: e?.name,
                      value: e?.value || {},
                    },
                    input?.onChange,
                  );
                }}
                reset={reset}
              />
            </Case>
            <Case condition={input.type === "select"}>
              <Inputs.SelectBox
                {...input}
                Icon={Icon}
                onChange={(e) => {
                  handleChange(
                    {
                      name: e?.name,
                      value: e?.value || "",
                      input: e?.obj,
                    },
                    input?.onChange,
                  );
                }}
                reset={reset}
              />
            </Case>
            <Default>
              <Inputs.Input
                {...input}
                reset={reset}
                {...(Icon && { prefix: <Icon className="size-4" /> })}
                name={input.name ?? ""}
                onChange={(e) => {
                  handleChange(
                    {
                      name: e.name,
                      value: e.value,
                    },
                    input?.onChange,
                  );
                }}
              />
            </Default>
          </Switch>
        );
      })}

      {isReset && (
        <Button
          onClick={() => {
            setFilter({});
            handleReset();
            setIsReset(false);
            setReset(Date.now());
          }}
          className="h-8 px-2.5 text-xs whitespace-nowrap"
        >
          Reset Filters
        </Button>
      )}
    </div>
  );
};

export default memo(FacedFilter);
