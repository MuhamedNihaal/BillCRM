import { cn } from "lib/utils";
import DynamicIcon from "./DynamicIcon";
import { Avatar, Card } from "./ui";
import clsx from "clsx";
import { memo } from "react";

/**
 * CardNumber Component
 *
 * @component
 * @example
 * // Basic usage
 * <CardNumber
 *   icon="Wallet"
 *   title="Balance"
 *   value="₹12,000"
 *   color="info"
 * />
 *
 * @param {object}   props                  - Component props.
 * @param {string}   [props.className]       - Additional Tailwind CSS classes for the Card container.
 * @param {Object}   [props.classNames]       - Additional Tailwind CSS classes for the Card container.
 * @param {string}   [props.classNames.root]       - Additional Tailwind CSS classes for the Card container.
 * @param {string}   [props.classNames.container]       - Additional Tailwind CSS classes for the Card container.
 * @param {string}   [props.classNames.paragraph]       - Additional Tailwind CSS classes for the Card container.
 * @param {string}   [props.icon]            - Name of the icon to render inside the Avatar.
 * @param {number}   [props.size]            - size of the Avatar.
 * @param {"one" | "two"}   [props.style]    - two type of style
 * @param {boolean}   [props.tooltip=false]            - tooltip.
 * @param {string}   [props.title=""]        - Title text shown at the top of the card.
 * @param {string|number} [props.value=""]   - Main value displayed prominently (e.g., number, currency).
 * @param {string}   [props.color="info"]    - Avatar background color variant (e.g., "info", "success", "warning").
 * @param {React.ReactNode} [props.children] - Optional children to render below the main content.
 *
 * @returns {JSX.Element} The rendered CardNumber component.
 */
const CardNumber = ({ className, classNames, style = "one", ...props }) => {
  let Component = style == "one" ? StyleOne : StyleTwo;
  return (
    <Card
      {...props}
      className={clsx(
        style === "one" ? "p-5" : "p-3",
        cn(className, classNames?.root),
      )}
    >
      <Component {...props} classNames={classNames} />
    </Card>
  );
};
export default CardNumber;

const StyleOne = memo(
  ({
    size = 12,
    classNames = {},
    icon,
    title = "",
    value = "",
    color = "info",
    tooltip = false,
    children,
  }) => {
    return (
      <>
        <p className="cursor-default">{title}</p>

        <div
          className={cn(
            "flex items-center justify-between",
            classNames?.container,
          )}
        >
          <p
            {...(tooltip && {
              "data-tooltip": true,
              "data-tooltip-content": value,
            })}
            className={cn(
              "this:info text-this dark:text-this-lighter mt-0.5 truncate text-2xl font-medium",
              tooltip ? "cursor-pointer" : "cursor-default",
              classNames?.paragraph,
            )}
          >
            {value}
          </p>

          <Avatar
            size={size}
            classNames={{
              display: "mask is-squircle rounded-none",
            }}
            initialVariant="soft"
            initialColor={color}
          >
            <DynamicIcon name={icon} className={"size-6"} />
          </Avatar>
        </div>

        {children}
      </>
    );
  },
);
StyleOne.displayName = "StyleOne";

const StyleTwo = memo(({ title, value, icon, tooltip, classNames }) => {
  return (
    <>
      <div className={cn("flex justify-between gap-1", classNames?.container)}>
        <p
          {...(tooltip && {
            "data-tooltip": true,
            "data-tooltip-content": value,
          })}
          className={cn(
            "dark:text-dark-100 text-xl font-semibold text-gray-800",
            classNames?.paragraph,
          )}
        >
          {value}
        </p>
        <DynamicIcon
          name={icon}
          className="this:primary text-this size-5 shrink-0"
        />
      </div>
      <p className="text-xs-plus mt-1 truncate">{title}</p>
    </>
  );
});
StyleTwo.displayName = "StyleTwo";
