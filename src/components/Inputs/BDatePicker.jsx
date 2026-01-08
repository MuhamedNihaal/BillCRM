import { DatePicker } from "components/shared/form/Datepicker";
import { useUncontrolled } from "hooks";
import moment from "moment";
import { Controller } from "react-hook-form";

const BDatePicker = ({
  defaultValue,
  minDate,
  maxDate,
  label,
  name,
  value,
  handleOnChange,
  error,
  placeholder,
  options = {},
  ...props
}) => {
  let [_value, handleChange] = useUncontrolled({ value, defaultValue });

  const renderDateInput = (fields) => {
    let { value, onChange, ...rest } = fields;

    if (value && moment(value, "YYYY-MM-DD", true).isValid()) {
      value = moment(value, "YYYY-MM-DD").format("DD-MM-YYYY");
    }

    return (
      <DatePicker
        {...rest}
        {...props}
        value={value}
        label={label}
        error={error}
        onChange={(e) => {
          let from,
            to = null;

          let value = null;

          if (e[0]) {
            if (options.enableTime) from = moment(e[0]).format("HH:mm");
            if (!options.enableTime) from = moment(e[0]).format("YYYY-MM-DD");
          }

          if (e[1] && !options.enableTime) {
            to = moment(e[1]).format("YYYY-MM-DD");
          }

          if (options.mode === "range") {
            value = {
              from: from || null,
              to: to || null,
            };
          } else {
            value = from;
          }

          let target = { name, value };

          if (typeof handleOnChange === "function") {
            handleOnChange(target);
          }

          onChange({
            target: {
              target,
            },
          });
        }}
        placeholder={placeholder ? placeholder : "DD-MM-YYYY"}
        options={{
          disableMobile: true,
          dateFormat: "d-m-Y",
          ...options,
          minDate,
          maxDate,
        }}
      />
    );
  };

  if (props?.control) {
    <Controller
      name={name}
      control={props.control}
      // defaultValue={defaultValue}
      render={({ field }) => {
        return renderDateInput(field);
      }}
    />;
  }

  return renderDateInput({
    value: [_value],
    onChange: handleChange,
  });
};

export default BDatePicker;
