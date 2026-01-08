import { Combobox } from "../shared/form/Combobox";
import { useUncontrolled } from "hooks";
import { memo, useCallback, useEffect, useState } from "react";
import { Controller } from "react-hook-form";

const BSelect = ({
  name,
  label,
  placeholder,
  error,
  handleOnChange,
  defaultValue,
  value,
  options: userOptions = null,

  anchor = { to: "bottom end", gap: 8 },
  searchFields = ["label"],
  isMulti = false,
  id = true,
  ...props
}) => {
  let [options, setOptions] = useState([]);

  const [_value, handleChange] = useUncontrolled({ defaultValue, value });

  useEffect(() => {
    if (userOptions) setOptions(userOptions);
  }, [userOptions]);

  const getSelected = useCallback(
    (value) => {
      if (!String(value)) return isMulti ? [] : "";
      if (!id) return value;
      if (isMulti) {
        return options.filter((option) => {
          const optionValue = String(option.value).toLowerCase();
          const valueArray = value?.map((v) => String(v).toLowerCase()) ?? [];
          return valueArray.includes(optionValue);
        });
      } else {
        if (typeof value === "object" && value?.label && value?.value) {
          return value;
        }

        let selected =
          options.find(
            (option) =>
              String(option.value).toLowerCase() ===
              String(value).toLowerCase(),
          ) || null;

        return selected;
      }
    },
    [id, isMulti, options],
  );

  const renderInput = (fields) => {
    const { value, onChange, ...rest } = fields;
    return (
      <Combobox
        className={props?.className}
        classNames={props?.classNames}
        {...rest}
        displayField="label"
        placeholder={placeholder ? placeholder : "Select..."}
        label={label}
        value={getSelected(value)}
        highlight
        searchFields={searchFields}
        error={error}
        anchor={anchor}
        multiple={isMulti}
        data={options}
        onChange={(val) => {
          let obj = val;

          let target = { name, value: obj };

          if (id) {
            target.value = isMulti
              ? val?.map((item) => item.value)
              : val?.value;
            target.obj = val;
          }

          handleOnChange(target);
          onChange(target.value);
        }}
        inputProps={{
          onKeyDown: (event) => {
            if (
              isMulti &&
              value?.length > 0 &&
              event?.keyCode === 8 &&
              event?.target?.value === ""
            ) {
              let removed = value?.slice(0, -1);

              handleOnChange(removed);
              onChange(removed);
            }
          },
        }}
      />
    );
  };

  if (props.control) {
    return (
      <Controller
        name={name}
        control={props.control}
        defaultValue={defaultValue}
        render={({ field }) => {
          return renderInput(field);
        }}
      />
    );
  }

  return renderInput({
    value: _value,
    onChange: (e) => {
      handleChange(e);
    },
  });
};

export default memo(BSelect);
