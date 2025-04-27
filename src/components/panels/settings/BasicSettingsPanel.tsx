import Form from "@rjsf/react-bootstrap";
import { getDefaultFormState } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useEffect } from "react";

import { SwitchWidget, ToggleGroupWidget } from "@common/components";
import { patchDataIn, patchDataOut } from "@common/utils";
import { InputSchema } from "@interfaces";

import { SettingsPanelProps } from "./SettingsPanelProps";

interface BasicSettingsProps extends SettingsPanelProps {
  basicSchema: InputSchema;
}

export const BasicSettingsPanel: React.FC<BasicSettingsProps> = ({
  structure,
  basicSchema,
  parameters,
  onParametersChange: updateParameters,
}) => {
  useEffect(() => {
    const key = "basic";
    const schema = basicSchema.schema;
    if (!(key in parameters)) {
      const defaults = getDefaultFormState(validator, schema, {}, schema);
      updateParameters(key, defaults);
    }
  }, []);

  const { schema, ui, dependencies } = basicSchema;

  const uiSchema = {
    ...ui,
    "ui:submitButtonOptions": {
      norender: true,
    },
  };

  const widgets = {
    toggleGroup: ToggleGroupWidget,
    CheckboxWidget: SwitchWidget,
  };

  const formData = patchDataIn(structure, parameters["basic"], dependencies);

  const onChange = (e: any) => {
    const patchedData = patchDataOut(e.formData, dependencies);
    updateParameters("basic", patchedData);
  };

  return (
    <div>
      <Form
        schema={schema}
        uiSchema={uiSchema}
        widgets={widgets}
        formData={formData}
        onChange={onChange}
        validator={validator}
        showErrorList={false}
        liveValidate
      ></Form>
    </div>
  );
};
