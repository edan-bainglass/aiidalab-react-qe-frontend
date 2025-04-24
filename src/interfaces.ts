import { RJSFSchema, UiSchema } from "@rjsf/utils";
import WEAS from "weas";

export type StructureType = typeof WEAS.Atoms;

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
}

export interface WorkflowInputs {
  structure: StructureType;
  properties: string[];
  parameters: Record<string, any>;
  resources: ResourcesType;
}

export type SchemaMap = Record<string, InputSchema>;

export interface WizardState {
  structure: StructureType | null;
  properties: PropertyMap;
  activeParametersPanel: string;
  activeAdvancedPanel: string;
  parametersSchema: SchemaMap;
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
  | { type: "SET_PARAMETERS_SCHEMA"; payload: SchemaMap }
  | { type: "SET_PARAMETERS"; payload: { panelKey: string; data: any } }
  | { type: "SET_RESOURCES"; payload: ResourcesType }
  | { type: "SET_RESULTS"; payload: ResultsType }
  | { type: "SET_METADATA"; payload: Record<string, string> }
  | { type: "LOAD_WORKFLOW"; payload: WizardState };
