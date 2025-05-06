import Form from "@rjsf/react-bootstrap";
import validator from "@rjsf/validator-ajv8";

import { useFormData, useFormSchemas } from "@common/hooks";
import { InputSchema, StructureType } from "@common/interfaces";
import { SwitchWidget, ToggleGroupWidget } from "@common/widgets";

const widgets = {
  toggleGroup: ToggleGroupWidget,
  CheckboxWidget: SwitchWidget,
};

export interface CommonSettingsPanelProps {
  structure: StructureType;
  parameters: Record<string, any>;
  onParametersChange: (panelKey: string, data: any) => void;
  dependencyCache: Record<string, any>;
  onDependencyCacheChange: (deps: Record<string, any>) => void;
}

interface SettingsPanelProps extends CommonSettingsPanelProps {
  panelKey: string;
  schema: InputSchema;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  structure,
  parameters,
  onParametersChange,
  dependencyCache,
  onDependencyCacheChange,
  schema,
  panelKey,
}) => {
  const { formSchema, uiSchema } = useFormSchemas({
    structure,
    parameters,
    panelKey,
    schema,
  });

  const { formData, handleChange } = useFormData({
    structure,
    parameters,
    panelKey,
    schema,
    dependencyCache,
    onDependencyCacheChange,
    onParametersChange,
  });

  return (
    <Form
      key={panelKey}
      schema={formSchema}
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
