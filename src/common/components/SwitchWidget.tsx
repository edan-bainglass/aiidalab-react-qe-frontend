import { WidgetProps } from "@rjsf/utils";
import React from "react";
import Form from "react-bootstrap/Form";

const SwitchWidget: React.FC<WidgetProps> = (props) => {
  // RJSF passes the enumOptions for booleans/widgets; here we just
  // treat this widget as a boolean toggle.
  return (
    <Form.Check
      type="switch"
      id={props.id}
      label={props.label}
      checked={Boolean(props.value)}
      disabled={props.disabled || props.readonly}
      required={props.required}
      autoFocus={props.autofocus}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        props.onChange(e.target.checked)
      }
    />
  );
};

export default SwitchWidget;
