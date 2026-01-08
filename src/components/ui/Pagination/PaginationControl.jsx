// Import Dependencies
import PropTypes from "prop-types";
import { forwardRef } from "react";
import clsx from "clsx";

// Local Imports
import { usePaginationContext } from "./Pagination.context";

// ----------------------------------------------------------------------

const PaginationControl = forwardRef((props, ref) => {
  const ctx = usePaginationContext();

  const { component, active, className, disabled, children, ...rest } = props;

  const Component = component || "button";

  return (
    <Component
      type="button"
      {...rest}
      disabled={disabled}
      data-active={active || undefined}
      data-disabled={disabled || undefined}
      ref={ref}
      className={clsx(
        "pagination-control cursor-pointer",
        [
          active
            ? "active this:primary bg-this disabled:bg-this-light dark:bg-this-light dark:disabled:bg-this-darker text-white disabled:cursor-not-allowed disabled:opacity-60"
            : [
                disabled
                  ? "disabled:cursor-not-allowed disabled:opacity-60"
                  : "dark:hover:bg-surface-1 dark:focus-visible:bg-surface-1 dark:active:bg-surface-1/90 hover:bg-gray-300 focus-visible:bg-gray-300 active:bg-gray-300/80",
              ],
        ],
        ctx.classNames?.control,
        className,
      )}
    >
      {children}
    </Component>
  );
});

PaginationControl.propTypes = {
  component: PropTypes.elementType,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

PaginationControl.displayName = "PaginationControl";

export { PaginationControl };
