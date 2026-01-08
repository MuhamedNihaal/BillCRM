/**
 * @typedef {"vertical" | "horizontal"} ConfigType
 */

import { cn } from "lib/utils";

/**
 * @typedef {object} DividerProps
 * @property {ConfigType} type
 * @property {string} text
 * @property {string} className
 */

/**
 * @param {DividerProps} props
 */
const Divider = ({ type = "horizontal", text, className }) => {
  if (type === "horizontal" && text) {
    return (
      <div className={cn("my-4 flex items-center space-x-3", className)}>
        <div className="dark:bg-dark-500 h-px flex-1 bg-gray-200"></div>
        <p>{text}</p>
        <div className="dark:bg-dark-500 h-px flex-1 bg-gray-200"></div>
      </div>
    );
  } else if (type === "horizontal") {
    return (
      <div
        className={cn("dark:bg-dark-500 my-4 h-px bg-gray-200", className)}
      ></div>
    );
  } else if (type === "vertical" && text) {
    return (
      <div
        className={cn("mx-4 flex flex-col items-center space-y-3", className)}
      >
        <div className="dark:bg-dark-500 w-px flex-1 bg-gray-200" />
        <p>{text}</p>
        <div className="dark:bg-dark-500 w-px flex-1 bg-gray-200" />
      </div>
    );
  } else if (type === "vertical") {
    return (
      <div
        className={cn(
          "dark:bg-dark-500 mx-4 my-1 w-px bg-gray-200",
          className,
        )}
      />
    );
  }

  return null;
};

export default Divider;
