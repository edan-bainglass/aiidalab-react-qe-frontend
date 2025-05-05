import { Spinner, Tab, Tabs } from "react-bootstrap";

import { useCoreSchemas, usePluginSchemas } from "@common/hooks";
import {
  ParameterSchemas,
  PropertyMap,
  StructureType,
} from "@common/interfaces";
import { DEBUG } from "@common/utils";
import {
  PluginSettingsPanels,
  SettingsPanel,
  SettingsPanels,
} from "@panels/settings";

interface ParameterSettingsStepProps {
  structure: StructureType;
  properties: PropertyMap;
  parameterSchemas: ParameterSchemas;
  parameters: any;
  onParametersChange: (panelKey: string, formData: any) => void;
  dependencyCache: Record<string, any>;
  onDependencyCacheChange: (deps: Record<string, any>) => void;
  controls: React.ReactNode;
  panel: string;
  onPanelChange: (panel: string) => void;
  advancedPanel: string;
  onAdvancedPanelChange: (panel: string) => void;
  pluginPanel: string;
  onPluginPanelChange: (panel: string) => void;
  onSchemaChange: (
    schema: any,
    panel: keyof ParameterSchemas,
    subpanel?: string
  ) => void;
}

export const ParameterSettingsStep: React.FC<ParameterSettingsStepProps> = ({
  structure,
  properties,
  parameterSchemas,
  parameters,
  onParametersChange: updateParameters,
  dependencyCache,
  onDependencyCacheChange,
  controls,
  panel,
  onPanelChange: setActivePanel,
  advancedPanel,
  onAdvancedPanelChange: setActiveAdvancedPanel,
  pluginPanel,
  onPluginPanelChange: setActivePluginPanel,
  onSchemaChange: setSchema,
}) => {
  DEBUG && console.log("ParameterSettingsStep");

  const { loading: loadingCore, error } = useCoreSchemas(
    structure,
    parameterSchemas,
    setSchema,
    updateParameters,
    parameters
  );

  const { loading: loadingPlugins } = usePluginSchemas(
    structure,
    properties,
    setSchema,
    updateParameters,
    parameters
  );

  return (
    <div>
      <h2>Step 3: Set calculation parameters</h2>
      {controls}
      {error ? (
        <div className="text-center mt-4">
          <p className="text-danger">{error}</p>
        </div>
      ) : loadingCore ? (
        <div className="text-center mt-4">
          <Spinner animation="border" />
          <p>Loading settings panels...</p>
        </div>
      ) : (
        <Tabs
          id="parameters-tabs"
          className="mb-3"
          style={{ marginTop: "1rem" }}
          activeKey={panel}
          onSelect={(key) => setActivePanel(key || "basic")}
        >
          <Tab eventKey="basic" title="Basic settings">
            <SettingsPanel
              panelKey="basic"
              schema={parameterSchemas.basic}
              structure={structure}
              parameters={parameters}
              onParametersChange={updateParameters}
              dependencyCache={dependencyCache}
              onDependencyCacheChange={onDependencyCacheChange}
            />
          </Tab>
          <Tab eventKey="advanced" title="Advanced settings">
            <SettingsPanels
              schemas={parameterSchemas.advanced}
              structure={structure}
              parameters={parameters}
              onParametersChange={updateParameters}
              dependencyCache={dependencyCache}
              onDependencyCacheChange={onDependencyCacheChange}
              activePanel={advancedPanel}
              onPanelChange={setActiveAdvancedPanel}
            />
          </Tab>
          <Tab eventKey="plugins" title="Plugin settings">
            <PluginSettingsPanels
              schemas={parameterSchemas.plugins}
              structure={structure}
              parameters={parameters}
              onParametersChange={updateParameters}
              dependencyCache={dependencyCache}
              onDependencyCacheChange={onDependencyCacheChange}
              activePanel={pluginPanel}
              onPanelChange={setActivePluginPanel}
              properties={properties}
              loading={loadingPlugins}
            />
          </Tab>
        </Tabs>
      )}
    </div>
  );
};
