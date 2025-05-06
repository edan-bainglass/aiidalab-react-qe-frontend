import { Spinner } from "react-bootstrap";

import { Property } from "@common/interfaces";

import { SettingsPanels, SettingsPanelsProps } from "./SettingsPanels";

interface PluginSettingsPanelsProps extends SettingsPanelsProps {
  properties: Record<string, Property>;
  loading?: boolean;
}

export const PluginSettingsPanels: React.FC<PluginSettingsPanelsProps> = ({
  schemas,
  structure,
  properties,
  parameters,
  onParametersChange,
  dependencyCache,
  onDependencyCacheChange,
  activePanel,
  onPanelChange,
  loading = false,
}) => {
  const filteredSchemas = Object.fromEntries(
    Object.entries(schemas).filter(([key]) => properties[key]?.active)
  );

  const showEmptyMessage = !Object.keys(filteredSchemas).length && !loading;

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" />
        <p>Loading plugins...</p>
      </div>
    );
  }

  if (showEmptyMessage) {
    return (
      <div className="text-center mt-4">
        <p>Please select a property to compute in step 2</p>
      </div>
    );
  }

  return (
    <SettingsPanels
      schemas={filteredSchemas}
      structure={structure}
      parameters={parameters}
      onParametersChange={onParametersChange}
      dependencyCache={dependencyCache}
      onDependencyCacheChange={onDependencyCacheChange}
      activePanel={activePanel}
      onPanelChange={onPanelChange}
    />
  );
};
