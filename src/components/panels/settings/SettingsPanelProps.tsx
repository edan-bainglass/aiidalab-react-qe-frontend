import { StructureType } from "@common/interfaces";

export interface SettingsPanelProps {
  structure: StructureType;
  parameters: Record<string, any>;
  onParametersChange: (panelKey: string, formData: any) => void;
}

export interface WithNestedPanelProps {
  activePanel: string;
  onPanelChange: (panelKey: string) => void;
}
