import { RJSFSchema, UiSchema } from "@rjsf/utils";

import { Atoms, AtomsData } from "weas";

export type StructureType =
  | ((Atoms | AtomsData) & {
      label?: string;
    })
  | null;

export type ResourcesType = any;

export type ResultsType = any;

export interface Property {
  label: string;
  active: boolean;
}

export interface PropertyMap {
  [key: string]: Property;
}

export interface InputSchema {
  schema: RJSFSchema;
  ui?: UiSchema;
  includedIf?: { [key: string]: any };
  dependencies?: string[];
}

export type SchemaMap = Record<string, InputSchema>;

export interface ParameterSchemas {
  basic: InputSchema;
  advanced: SchemaMap;
  plugins: SchemaMap;
}

export interface WorkflowInputs {
  structure: StructureType;
  properties: string[];
  parameters: Record<string, any>;
  resources: ResourcesType;
}

export interface WizardState {
  structure: StructureType | null;
  properties: PropertyMap;
  activeParametersPanel: string;
  activeAdvancedPanel: string;
  activePluginPanel: string;
  parameterSchemas: ParameterSchemas;
  parameters: Record<string, any>;
  resources: ResourcesType | null;
  metadata: Record<string, string>;
  results: ResultsType | null;
}

export type WizardAction =
  | { type: "SET_STRUCTURE"; payload: StructureType }
  | { type: "SET_PROPERTIES"; payload: PropertyMap }
  | { type: "SET_PARAMETERS_PANEL"; payload: string }
  | { type: "SET_ADVANCED_PANEL"; payload: string }
  | { type: "SET_PLUGIN_PANEL"; payload: string }
  | { type: "UPDATE_PLUGIN_SCHEMAS"; payload: SchemaMap }
  | { type: "SET_PARAMETERS"; payload: { panelKey: string; data: any } }
  | { type: "DISCARD_PARAMETERS"; payload: string }
  | { type: "SET_RESOURCES"; payload: ResourcesType }
  | { type: "SET_RESULTS"; payload: ResultsType }
  | { type: "SET_METADATA"; payload: Record<string, string> }
  | { type: "LOAD_WORKFLOW"; payload: WizardState };
