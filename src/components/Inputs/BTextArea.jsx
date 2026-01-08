import { Textarea } from "components/ui";
import { useUncontrolled } from "hooks";
import { Controller } from "react-hook-form";

/**
 * @param {Object} props
 * @param {string} [props.defaultValue]
 * @param {string} [props.value]
 * @param {string} [props.error]
 * @param {string} [props.disabled]
 * @param {string} [props.name=""]
 * @param {string} [props.label=""]
 * @param {string} [props.placeholder=""]
 * @param {function} [props.handleOnChange]
 * @param {number} [props.rows]
 * @param {any} [props.control] - React-From-Control
 */

const BTextArea = ({
  name,
  label,
  placeholder,
  error,
  handleOnChange,
  defaultValue,
  value,
  rows,
  ...props
}) => {
  const [_value, handleChange] = useUncontrolled({ defaultValue, value });

  const renderInput = (fields) => {
    const { value, onChange, ...rest } = fields;

    return (
      <Textarea
        {...props}
        {...rest}
        value={value || ""}
        onChange={(e) => {
          let target = { name, value: e?.target.value };
          handleOnChange(target);

          onChange(e);
        }}
        label={label}
        rows={rows}
        error={error}
        placeholder={placeholder}
      />
    );
  };

  if (props.control) {
    return (
      <Controller
        name={name}
        control={props.control}
        render={({ field }) => {
          return renderInput(field);
        }}
      />
    );
  }

  return renderInput({
    value: _value,
    onChange: (e) => {
      handleChange(e.target.value);
    },
  });
};

export default BTextArea;
