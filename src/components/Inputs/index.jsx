import { memo } from "react";
import BDatePicker from "./BDatePicker";
import BInput from "./BInput";
import BTextArea from "./BTextArea";
import BEditor from "./BEditor";
import BFileInput from "./BFileInput";
import BSelect from "./BSelect";
import BRSelect from "./BRSelect";
import BDropdown from "./BDropdown";
import BPhone from "./BPhone";

/**
 * @typedef {Object} BaseProps
 * @property {"text"|"number"|"email"|"phone"|"date"|"time"|"select"|"amount"|"duration"|"datePicker"|"file"|"editor"|"textarea"|"dropdown"} [type="text"]
 * @property {string} [placeholder=""]
 * @property {string} [label=""]
 * @property {string} [name=""]
 * @property {any} [defaultValue]
 * @property {boolean} [disabled]
 * @property {any} [control] - React-form-control
 * @property {string} [error]
 * @property {any} [value]
 * @property {(value: object) => void} [handleOnChange]
 */

/**
 * @typedef {Object} SelectClassName
 * @property {string} [root]
 * @property {string} [input]
 * @property {string} [control]
 * @property {string} [placeholder]
 */

/**
 * @typedef {Object} SelectProps
 * @property {"select"} type
 * @property {string} [loadOptionsUrl=""] - Async Select URL to load options
 * @property {string} [className=""] - Style
 * @property {SelectClassName} [classNames={}] - Style
 * @property {function} [onCreateOption] - Create a New Option
 * @property {boolean} [isMulti=false] - Multi select
 * @property {boolean} [closeMenuOnSelect=false] - Whether to close the menu on select
 * @property {boolean} [preCall=false] - Whether to pre-call the options
 * @property {boolean} [isClearable=false] - Whether the select is clearable
 * @property {boolean} [cacheOptions=false] - Whether to cache options
 * @property {boolean} [async=false] - Whether the select is async
 * @property {boolean} [inline=false] - Template Select box
 * @property {boolean} [props.emptyMessage="No options available"] - select box empty message
 * @property {object} [props.options] - Select Options
 * @property {object} [props.searchFields] - Search field options.
 * @property {object} [props.anchor] - Search field options.
 *   Available only when `inline` is set to `true`.
 *   Accepts an array of values that will be included in the search.
 * @property {any} [props.prefix]
 * @property {any} [props.suffix]
 * @property {boolean} [props.id=true] - Determines how the option value is stored.
 *   If `false`, the option will use `{ label, value }`.
 *   If `true` (default), the option will use the `id` field.
 */

/**
 * @typedef {Object} DateProps
 * @property {"datePicker"|"date"} type
 * @property {string | Date | (() => Date)} [minDate] - Minimum selectable date.
 *   - Format: "YYYY-MM-DD" (e.g., "2023-01-01")
 *   - Keywords: "today", "yesterday"
 *   - Or a Date object (e.g., new Date())
 *
 * @property {string | Date | (() => Date)} [maxDate] - Maximum selectable date.
 *   - Format: "DD-MM-YYYY" (e.g., "31-12-2023")
 *   - Keywords: "today", "yesterday"
 *   - Or a Date object (e.g., new Date())
 * @property {object} [props.options] - Select Options
 */

/**
 * @typedef {Object} BDropdownProps
 * @property {"dropdown"} type
 * @property {object} [props.options] - Select Options
 */

/**
 * @typedef {Object} AmountProps
 * @property {"amount"} type
 * @property {object} [props.min] - min amount limit
 * @property {object} [props.max] - max amount limit
 */

/**
 * @typedef {Object} TextAreaProps
 * @property {"textarea"} type
 * @property {number} [props.rows]
 */

/**
 * @typedef {Object} EditorProps
 * @property {"editor"} type
 * @property {reset} [props.rows]
 * @property {any} [props.toolbarOptions]
 */

/**
 * @typedef {Object} FileProps
 * @property {"file"} type
 * @property {"image" | "video" | "document"} [props.srcType]
 * @property {number} [props.resetTrigger] - Pass value to reset input value
 * @property {string} [props.src]
 */

/**
 * @typedef {BaseProps | SelectProps | DateProps | TextAreaProps | EditorProps | FileProps | BDropdownProps | AmountProps} Props
 */

/**
 * @param {Props} props
 */

const Index = ({ type, name, handleOnChange, ...props }) => {
  const onChangeHandler = (e) => {
    if (typeof handleOnChange != "function") return;
    handleOnChange(e);
  };

  const commonProps = {
    ...props,
    type,
    name,
    handleOnChange: onChangeHandler,
  };

  switch (type) {
    case "datePicker":
      return <BDatePicker {...commonProps} />;

    case "editor":
      return <BEditor {...commonProps} />;

    case "file":
      return <BFileInput {...commonProps} />;

    case "select":
      if (props.inline) return <BSelect {...commonProps} />;
      return <BRSelect {...commonProps} />;

    case "textarea":
      return <BTextArea {...commonProps} />;

    case "dropdown":
      return <BDropdown {...commonProps} />;

    case "phone":
      return <BPhone {...commonProps} />;

    default:
      return <BInput {...commonProps} />;
  }
};

export default memo(Index);
