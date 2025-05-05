import Form from "@rjsf/react-bootstrap";
import validator from "@rjsf/validator-ajv8";

import { InputSchema, StructureType } from "@common/interfaces";
import { patchSchema, patchDataIn, patchDataOut } from "@common/utils";
import { ToggleGroupWidget, SwitchWidget } from "@common/widgets";

export interface CommonSettingsPanelProps {
  structure: StructureType;
  parameters: Record<string, any>;
  onParametersChange: (panelKey: string, data: any) => void;
}

interface SettingsPanelProps extends CommonSettingsPanelProps {
  panelKey: string;
  schema: InputSchema;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  panelKey,
  structure,
  parameters,
  onParametersChange: onChange,
  schema: inputSchema,
}) => {
  const { schema, ui, dependencies } = patchSchema(inputSchema, structure);

  const uiSchema = {
    ...ui,
    "ui:submitButtonOptions": {
      norender: true,
    },
    "ui:options": {
      title: "",
      classNames: `${panelKey}-panel`,
    },
  };

  const widgets = {
    toggleGroup: ToggleGroupWidget,
    CheckboxWidget: SwitchWidget,
  };

  const formData = patchDataIn(structure, parameters, dependencies);

  const handleChange = (e: any) => {
    const patchedData = patchDataOut(e.formData, dependencies);
    onChange(panelKey, patchedData);
  };

  return (
    <Form
      schema={schema}
      uiSchema={uiSchema}
      widgets={widgets}
      formData={formData}
      onChange={handleChange}
      validator={validator}
      showErrorList={false}
      liveValidate
    />
  );
};
