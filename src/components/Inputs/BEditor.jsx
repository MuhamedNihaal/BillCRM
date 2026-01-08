/* eslint-disable react-hooks/rules-of-hooks */
import { TextEditor } from "components/shared/form/TextEditor";
import { useDidUpdate } from "hooks";
import { useEffect, useMemo, useState } from "react";
import { useController } from "react-hook-form";
import { DeltaToHtml, htmlToDelta } from "utils/quillUtils";

const BEditor = ({
  name,
  label,
  placeholder,
  error,
  handleOnChange,
  defaultValue,
  reset,
  toolbarOptions = null,
  ...props
}) => {
  const [state, setState] = useState([]);

  let field = null;
  if (props.control) {
    let formController = useController({
      name,
      control: props?.control,
      defaultValue,
    });
    field = formController?.field;
  }

  useEffect(() => {
    setState(htmlToDelta(defaultValue || ""));
  }, [defaultValue]);

  useDidUpdate(() => {
    if (!field?.value) setState([]);
  }, [field?.value]);

  useDidUpdate(() => {
    if (reset) setState([]);
  }, [reset]);

  const editorModules = useMemo(
    () => ({
      toolbar: toolbarOptions ?? [
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ header: 1 }, { header: 2 }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }, "image"],
        ["clean"],
      ],
    }),
    [toolbarOptions],
  );

  const renderInput = (fields) => {
    const { onChange } = fields;
    return (
      <TextEditor
        label={label}
        placeholder={placeholder}
        error={error}
        value={state}
        modules={editorModules}
        onChange={(e) => {
          setState(e);
          let html = DeltaToHtml(e.ops);
          handleOnChange({ name, value: html });
          onChange({ target: { name, value: html } });
        }}
      />
    );
  };

  if (props.control) {
    return renderInput(field);
  }

  return renderInput({
    onChange: () => {},
  });
};

export default BEditor;
