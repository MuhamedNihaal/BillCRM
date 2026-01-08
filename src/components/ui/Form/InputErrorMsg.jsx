// Import Dependencies
import PropTypes from "prop-types";
import clsx from "clsx";

// ----------------------------------------------------------------------

export function InputErrorMsg({ when, children, className }) {
  return when ? (
    <span
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      className={clsx(
        "input-text-error text-error dark:text-error-lighter mt-1 text-xs",
        className,
      )}
    >
      {children}
    </span>
  ) : null;
}

InputErrorMsg.propTypes = {
  when: PropTypes.any,
  children: PropTypes.any,
  className: PropTypes.string,
};
