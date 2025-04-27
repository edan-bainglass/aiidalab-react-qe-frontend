import Form from "@rjsf/react-bootstrap";
import { getDefaultFormState } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useEffect } from "react";

import { SwitchWidget, ToggleGroupWidget } from "@common/components";
import { SchemaMap } from "@common/interfaces";
import {
  DEBUG,
  isIncludedSchema,
  patchDataIn,
  patchDataOut,
  patchSchema,
} from "@common/utils";

import PanelSelector from "./PanelSelector";
import { SettingsPanelProps, WithNestedPanelProps } from "./SettingsPanelProps";

interface AdvancedSettingsProps
  extends SettingsPanelProps,
    WithNestedPanelProps {
  advancedSchemas: SchemaMap;
}

export const AdvancedSettingsPanel: React.FC<AdvancedSettingsProps> = ({
  structure,
  advancedSchemas,
  parameters,
  onParametersChange: updateParameters,
  activePanel,
  onPanelChange: setActivePanel,
}) => {
  DEBUG && console.log("AdvancedSettingsPanel");

  const availablePanels = Object.keys(advancedSchemas).filter((key) =>
    isIncludedSchema(parameters, advancedSchemas[key])
  );

  useEffect(() => {
    const fallback = availablePanels[0];
    const isValidPanel = availablePanels.includes(activePanel);
    !isValidPanel && setActivePanel(fallback);
  }, [availablePanels, activePanel]);

  useEffect(() => {
    Object.entries(advancedSchemas).forEach(([key, { schema }]) => {
      if (!(key in parameters)) {
        const defaults = getDefaultFormState(validator, schema, {}, schema);
        updateParameters(key, defaults);
      }
    });
  }, []);

  const currentSchema = advancedSchemas[activePanel];

  const { schema, ui, dependencies } = patchSchema(currentSchema, structure);

  const uiSchema = {
    ...ui,
    "ui:submitButtonOptions": {
      norender: true,
    },
    "ui:options": {
      title: "",
      classNames: `${activePanel}-panel`,
    },
  };

  const widgets = {
    toggleGroup: ToggleGroupWidget,
    CheckboxWidget: SwitchWidget,
  };

  const formData = patchDataIn(structure, parameters, dependencies);

  const onChange = (e: any) => {
    const patchedData = patchDataOut(e.formData, dependencies);
    updateParameters(activePanel, patchedData);
  };

  const panelOptions = Object.fromEntries(
    availablePanels.map((key) => [
      key,
      advancedSchemas[key].schema.title || key,
    ])
  );

  const selectedPanel = currentSchema?.schema.title || activePanel;

  return (
    <div>
      <PanelSelector
        selected={selectedPanel}
        options={panelOptions}
        onSelect={setActivePanel}
      />
      {currentSchema && (
        <Form
          schema={schema}
          uiSchema={uiSchema}
          widgets={widgets}
          formData={formData}
          onChange={onChange}
          validator={validator}
          showErrorList={false}
          liveValidate
        />
      )}
    </div>
  );
};
