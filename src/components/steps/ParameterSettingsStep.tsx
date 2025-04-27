import React from "react";
import { Tab, Tabs } from "react-bootstrap";

import {
  ParameterSchemas,
  PropertyMap,
  SchemaMap,
  StructureType,
} from "@common/interfaces";
import { DEBUG } from "@common/utils";
import {
  AdvancedSettingsPanel,
  BasicSettingsPanel,
  PluginSettingsPanel,
} from "@panels/settings";

interface ParameterSettingsStepProps {
  structure: StructureType;
  properties: PropertyMap;
  parametersSchema: ParameterSchemas;
  parameters: any;
  onParametersChange: (panelKey: string, formData: any) => void;
  controls: React.ReactNode;
  panel: string;
  onPanelChange: (panel: string) => void;
  advancedPanel: string;
  onAdvancedPanelChange: (panel: string) => void;
  pluginPanel: string;
  onPluginPanelChange: (panel: string) => void;
  onPluginSchemasChange: (schema: SchemaMap) => void;
}

export const ParameterSettingsStep: React.FC<ParameterSettingsStepProps> = ({
  structure,
  properties,
  parametersSchema,
  parameters,
  onParametersChange: updateParameters,
  controls,
  panel,
  onPanelChange: setActivePanel,
  advancedPanel,
  onAdvancedPanelChange: setActiveAdvancedPanel,
  pluginPanel,
  onPluginPanelChange: setActivePluginPanel,
  onPluginSchemasChange: updatePluginSchemas,
}) => {
  DEBUG && console.log("ParameterSettingsStep");

  const handleParametersChange = (panelKey: string, formData: any) => {
    updateParameters(panelKey, formData);
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
        onSelect={(key) => setActivePanel(key || "basic")}
      >
        <Tab eventKey="basic" title="Basic settings">
          <BasicSettingsPanel
            structure={structure}
            basicSchema={parametersSchema.basic}
            parameters={parameters}
            onParametersChange={handleParametersChange}
          />
        </Tab>
        <Tab eventKey="advanced" title="Advanced settings">
          <AdvancedSettingsPanel
            structure={structure}
            advancedSchemas={parametersSchema.advanced}
            parameters={parameters}
            onParametersChange={handleParametersChange}
            activePanel={advancedPanel}
            onPanelChange={(panel) => setActiveAdvancedPanel(panel)}
          />
        </Tab>
        <Tab eventKey="properties" title="Property settings">
          <PluginSettingsPanel
            structure={structure}
            properties={properties}
            pluginSchemas={parametersSchema.plugins}
            parameters={parameters}
            onParametersChange={handleParametersChange}
            activePanel={pluginPanel}
            onPanelChange={(panel) => setActivePluginPanel(panel)}
            onPluginSchemasChange={updatePluginSchemas}
          />
        </Tab>
      </Tabs>
    </div>
  );
};
