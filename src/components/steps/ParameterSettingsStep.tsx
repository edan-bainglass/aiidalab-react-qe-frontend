import { useEffect, useState } from "react";
import { Spinner, Tab, Tabs } from "react-bootstrap";

import {
  InputSchema,
  ParameterSchemas,
  PropertyMap,
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
  parameterSchemas: ParameterSchemas;
  parameters: any;
  onParametersChange: (panelKey: string, formData: any) => void;
  controls: React.ReactNode;
  panel: string;
  onPanelChange: (panel: string) => void;
  advancedPanel: string;
  onAdvancedPanelChange: (panel: string) => void;
  pluginPanel: string;
  onPluginPanelChange: (panel: string) => void;
  onSchemaChange: (
    schema: InputSchema,
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

  const hasBasic = Object.keys(parameterSchemas.basic).length > 0;
  const hasAdvanced = Object.keys(parameterSchemas.advanced).length > 0;
  const hasSchemas = hasBasic || hasAdvanced;

  const [loading, setLoading] = useState(!hasSchemas);
  const [loadingPlugins, setLoadingPlugins] = useState(true);

  useEffect(() => {
    const fetchSchemas = async () => {
      try {
        const response = await fetch("/api/core/schemas/input");
        const schemas: Partial<ParameterSchemas> = await response.json();
        if (!schemas) {
          throw new Error("No schemas found");
        }
        if (!(schemas.basic && schemas.advanced)) {
          throw new Error("Missing core schemas");
        }
        setSchema(schemas.basic, "basic");
        Object.entries(schemas.advanced).forEach(([key, schema]) => {
          setSchema(schema, "advanced", key);
        });
      } catch (error) {
        console.error("Error fetching schemas:", error);
      } finally {
        setLoading(false);
      }
    };
    !hasSchemas && fetchSchemas();
  }, []);

  useEffect(() => {
    const fetchPluginSchemas = async () => {
      try {
        for (const [key, property] of Object.entries(properties)) {
          if (parameterSchemas.plugins[key]) continue;
          if (!property.active) continue;
          const res = await fetch(`/api/plugin/schemas/${key}/input`);
          if (!res.ok) throw new Error("Failed to load schema");
          const schema: InputSchema = await res.json();
          setSchema(schema, "plugins", key);
        }
      } catch (err) {
        console.warn("Failed to load plugin schemas", err);
      } finally {
        setLoadingPlugins(false);
      }
    };
    Object.keys(properties).length && fetchPluginSchemas();
  }, [properties]);

  const handleParametersChange = (panelKey: string, formData: any) => {
    updateParameters(panelKey, formData);
  };

  return (
    <div>
      <h2>Step 3: Set calculation parameters</h2>
      {controls}
      {loading ? (
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
            <BasicSettingsPanel
              structure={structure}
              basicSchema={parameterSchemas.basic}
              parameters={parameters}
              onParametersChange={handleParametersChange}
            />
          </Tab>
          <Tab eventKey="advanced" title="Advanced settings">
            <AdvancedSettingsPanel
              structure={structure}
              advancedSchemas={parameterSchemas.advanced}
              parameters={parameters}
              onParametersChange={handleParametersChange}
              activePanel={advancedPanel}
              onPanelChange={setActiveAdvancedPanel}
            />
          </Tab>
          <Tab eventKey="properties" title="Property settings">
            <PluginSettingsPanel
              structure={structure}
              properties={properties}
              pluginSchemas={parameterSchemas.plugins}
              parameters={parameters}
              onParametersChange={handleParametersChange}
              activePanel={pluginPanel}
              onPanelChange={setActivePluginPanel}
              loading={loadingPlugins}
            />
          </Tab>
        </Tabs>
      )}
    </div>
  );
};
