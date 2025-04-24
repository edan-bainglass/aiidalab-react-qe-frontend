import React from "react";
import { Tab, Tabs } from "react-bootstrap";

import {
  ParameterSchemas,
  PropertyMap,
  SchemaMap,
  StructureType,
} from "../interfaces";
import {
  AdvancedSettingsPanel,
  BasicSettingsPanel,
  PluginSettingsPanel,
} from "./panels/settings";

interface ParameterSettingsStepProps {
  structure: StructureType;
  properties: PropertyMap;
  parametersSchema: ParameterSchemas;
  parameters: any;
  onChange: (panelKey: string, formData: any) => void;
  controls: React.ReactNode;
  panel: string;
  onPanelChange: (panel: string) => void;
  advancedPanel: string;
  onAdvancedPanelChange: (panel: string) => void;
  pluginPanel: string;
  onPluginPanelChange: (panel: string) => void;
  onPluginSchemasChange: (schema: SchemaMap) => void;
}

const ParameterSettingsStep: React.FC<ParameterSettingsStepProps> = ({
  structure,
  properties,
  parametersSchema,
  parameters,
  onChange,
  controls,
  panel,
  onPanelChange: setPanel,
  advancedPanel,
  onAdvancedPanelChange: setAdvancedPanel,
  pluginPanel,
  onPluginPanelChange: setPluginPanel,
  onPluginSchemasChange: updatePluginSchemas,
}) => {
  const handleFormChange = (panelKey: string, formData: any) => {
    onChange(panelKey, formData);
  };

  return (
    <div>
      <h2>Step 3: Set calculation parameters</h2>
      {controls}
      <Tabs
        id="parameters-tabs"
        className="mb-3"
        style={{ marginTop: "1rem" }}
        activeKey={panel}
        onSelect={(key) => setPanel(key || "basic")}
      >
        <Tab eventKey="basic" title="Basic settings">
          <BasicSettingsPanel
            structure={structure}
            basicSchema={parametersSchema.basic}
            parameters={parameters}
            onFormChange={handleFormChange}
          />
        </Tab>
        <Tab eventKey="advanced" title="Advanced settings">
          <AdvancedSettingsPanel
            structure={structure}
            advancedSchema={parametersSchema.advanced}
            parameters={parameters}
            onFormChange={handleFormChange}
            activePanel={advancedPanel}
            onPanelChange={(panel) => setAdvancedPanel(panel)}
          />
        </Tab>
        <Tab eventKey="properties" title="Property settings">
          <PluginSettingsPanel
            structure={structure}
            properties={properties}
            pluginSchemas={parametersSchema.plugins}
            parameters={parameters}
            onFormChange={handleFormChange}
            activePanel={pluginPanel}
            onPanelChange={(panel) => setPluginPanel(panel)}
            onPluginSchemasChange={updatePluginSchemas}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

export default ParameterSettingsStep;
