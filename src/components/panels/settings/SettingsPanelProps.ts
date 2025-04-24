import { StructureType } from "../../../interfaces";

export interface SettingsPanelProps {
  structure: StructureType;
  parameters: Record<string, any>;
  onFormChange: (panelKey: string, formData: any) => void;
}
export interface WithNestedPanelProps {
  activePanel: string;
  onPanelChange: (panelKey: string) => void;
}
