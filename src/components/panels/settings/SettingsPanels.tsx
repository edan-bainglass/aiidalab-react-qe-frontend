import { useEffect } from "react";
import { Spinner } from "react-bootstrap";

import { InputSchema } from "@common/interfaces";
import { isIncludedSchema } from "@common/utils";

import PanelSelector from "./PanelSelector";
import { CommonSettingsPanelProps, SettingsPanel } from "./SettingsPanel";

export interface SettingsPanelsProps extends CommonSettingsPanelProps {
  schemas: Record<string, InputSchema>;
  activePanel: string;
  onPanelChange: (panelKey: string) => void;
}

export const SettingsPanels: React.FC<SettingsPanelsProps> = ({
  schemas,
  structure,
  parameters,
  onParametersChange,
  dependencyCache,
  onDependencyCacheChange,
  activePanel,
  onPanelChange: setActivePanel,
}) => {
  const panelKeys = Object.keys(schemas).filter((key) =>
    isIncludedSchema(parameters, schemas[key])
  );

  useEffect(() => {
    if (!panelKeys.length) return;
    if (!activePanel || !panelKeys.includes(activePanel)) {
      setActivePanel(panelKeys[0]);
    }
  }, [panelKeys, activePanel]);

  if (!activePanel) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" />
        <p>Loading settings...</p>
      </div>
    );
  }

  if (!panelKeys.length) {
    return (
      <div className="text-center mt-4">
        <p>No panels available</p>
      </div>
    );
  }

  const currentSchema = schemas[activePanel];

  const panelOptions = Object.fromEntries(
    panelKeys.map((key) => [key, schemas[key].schema.title || key])
  );

  return (
    <div>
      <PanelSelector
        selected={currentSchema?.schema.title || activePanel}
        options={panelOptions}
        onSelect={setActivePanel}
      />
      <SettingsPanel
        key={activePanel}
        panelKey={activePanel}
        schema={currentSchema}
        structure={structure}
        parameters={parameters}
        onParametersChange={onParametersChange}
        dependencyCache={dependencyCache}
        onDependencyCacheChange={onDependencyCacheChange}
      />
    </div>
  );
};
