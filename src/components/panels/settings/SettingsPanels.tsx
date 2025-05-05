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
  activePanel,
  onPanelChange,
}) => {
  const panelKeys = Object.keys(schemas).filter((key) =>
    isIncludedSchema(parameters, schemas[key])
  );

  useEffect(() => {
    if (!panelKeys.length) return;
    if (!activePanel || !panelKeys.includes(activePanel)) {
      onPanelChange(panelKeys[0]);
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
        onSelect={onPanelChange}
      />
      <SettingsPanel
        key={activePanel}
        panelKey={activePanel}
        schema={currentSchema}
        structure={structure}
        parameters={parameters}
        onParametersChange={onParametersChange}
      />
    </div>
  );
};
