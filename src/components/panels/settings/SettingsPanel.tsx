import Form from "@rjsf/react-bootstrap";
import validator from "@rjsf/validator-ajv8";
import { useEffect } from "react";

import { InputSchema, StructureType } from "@common/interfaces";
import {
  clearDependencyData,
  getDependencyData,
  patchSchema,
} from "@common/utils";
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
  onParametersChange: updateParameters,
  dependencyCache,
  onDependencyCacheChange: updateDependencyCache,
  schema: inputSchema,
  panelKey,
}) => {
  const {
    schema,
    ui,
    dependencies: dependencyMap,
  } = patchSchema(inputSchema, structure);

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

  const dependencyData = getDependencyData(
    structure,
    parameters,
    dependencyMap
  );

  useEffect(() => {
    if (!dependencyMap || Object.keys(dependencyMap).length === 0) return;

    const newData = { ...parameters[panelKey] };
    let hasUpdates = false;

    for (const [field, deps] of Object.entries(dependencyMap)) {
      if (
        deps.some((dep) => dependencyData[dep] !== dependencyCache?.[dep]) &&
        newData[field] !== undefined
      ) {
        delete newData[field];
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      updateParameters(panelKey, newData);
    }

    updateDependencyCache(dependencyData);
  }, [JSON.stringify(dependencyData)]);

  const formData = {
    ...parameters[panelKey],
    ...dependencyData,
  };

  const handleChange = ({ formData }: any) => {
    const cleanedData = clearDependencyData(formData, dependencyMap);
    updateParameters(panelKey, cleanedData);
  };

  return (
    <Form
      key={panelKey}
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
