import { SchemaMap, StructureType } from "@common/interfaces";

export interface SettingsPanelProps {
  structure: StructureType;
  parameters: Record<string, any>;
  onParametersChange: (panelKey: string, formData: any) => void;
}

export interface WithNestedPanelProps {
  schemas: SchemaMap;
  activePanel: string;
  onPanelChange: (panelKey: string) => void;
}
