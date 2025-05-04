import Form from "@rjsf/react-bootstrap";
import validator from "@rjsf/validator-ajv8";
import { useEffect } from "react";
import { Spinner } from "react-bootstrap";

import { PropertyMap } from "@common/interfaces";
import { DEBUG, patchDataIn, patchDataOut, patchSchema } from "@common/utils";
import { SwitchWidget, ToggleGroupWidget } from "@common/widgets";

import PanelSelector from "./PanelSelector";
import { SettingsPanelProps, WithNestedPanelProps } from "./SettingsPanelProps";

interface PluginSettingsProps extends SettingsPanelProps, WithNestedPanelProps {
  properties: PropertyMap;
  loading: boolean;
}

export const PluginSettingsPanel: React.FC<PluginSettingsProps> = ({
  structure,
  properties,
  schemas,
  parameters,
  onParametersChange: updateParameters,
  activePanel,
  onPanelChange: setActivePanel,
  loading,
}) => {
  DEBUG && console.log("PluginSettingsPanel");

  const availablePanels = Object.keys(schemas).filter(
    (key) => !properties[key] || properties[key]?.active
  );

  useEffect(() => {
    if (!availablePanels.length) return;
    const fallback = availablePanels[0];
    const isValidPanel = availablePanels.includes(activePanel);
    !isValidPanel && setActivePanel(fallback);
  }, [availablePanels, activePanel]);

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" />
        <p>Loading plugins...</p>
      </div>
    );
  }

  if (!availablePanels.length) {
    return (
      <div className="text-center mt-4">
        <p>Please select a property to compute in step 2</p>
      </div>
    );
  }

  if (!activePanel || !availablePanels.includes(activePanel)) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" />
        <p>Loading...</p>
      </div>
    );
  }

  const currentSchema = schemas[activePanel];

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
    availablePanels.map((key) => [key, schemas[key].schema.title || key])
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
