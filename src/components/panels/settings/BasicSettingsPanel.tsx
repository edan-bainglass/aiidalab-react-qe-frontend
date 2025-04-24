import Form from "@rjsf/react-bootstrap";
import { getDefaultFormState } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useEffect } from "react";

import { SwitchWidget, ToggleGroupWidget } from "../../../common/components";
import { InputSchema } from "../../../interfaces";
import { SettingsPanelProps } from "./SettingsPanelProps";

interface BasicSettingsProps extends SettingsPanelProps {
  basicSchema: InputSchema;
}

export const BasicSettingsPanel: React.FC<BasicSettingsProps> = ({
  structure,
  basicSchema,
  parameters,
  onFormChange,
}) => {
  useEffect(() => {
    const key = "basic";
    const schema = basicSchema.schema;
    if (parameters[key] === undefined) {
      const defaults = getDefaultFormState(validator, schema, {}, schema);
      onFormChange(key, defaults);
    }
  }, []);

  return (
    <div>
      <Form
        schema={basicSchema.schema}
        uiSchema={{
          ...basicSchema.ui,
          "ui:submitButtonOptions": { norender: true },
        }}
        widgets={{
          toggleGroup: ToggleGroupWidget,
          CheckboxWidget: SwitchWidget,
        }}
        formData={parameters["basic"]}
        onChange={(e) => onFormChange("basic", e.formData)}
        validator={validator}
        showErrorList={false}
        liveValidate
      ></Form>
    </div>
  );
};
