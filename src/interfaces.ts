/**
 * Shared interfaces and types for the DFT calculation wizard
 */

import { RJSFSchema, UiSchema } from "@rjsf/utils";
import WEAS from "weas"; // Importing WEAS for structure type

/** A generic type for the selected structure; replace with a concrete type as needed */
export type StructureType = typeof WEAS.Atoms;

/** A generic type for resource selection (e.g. compute resources) */
export type ResourcesType = any;

/** A generic type for workflow results */
export type ResultsType = any;

/** Represents a plugin/property available for selection */
export interface Property {
  id: string;
  label: string;
}

export interface InputSchema {
  schema: RJSFSchema;
  ui: UiSchema;
}

export interface WorkflowInputs {
  structure: StructureType;
  properties: string[];
  parameters: Record<string, any>;
  resources: ResourcesType;
}

/** The overall wizard state, with one field per step */
export interface WizardState {
  structure: StructureType | null;
  availableProperties: Property[];
  selectedProperties: string[];
  /** parameters keyed by built-in or plugin panel key */
  parameters: Record<string, any>;
  resources: ResourcesType | null;
  results: ResultsType | null;
}

/** Actions that can be dispatched to update the wizard state */
export type WizardAction =
  | { type: "SET_AVAILABLE_PROPERTIES"; payload: Property[] }
  | { type: "SET_STRUCTURE"; payload: StructureType }
  | { type: "SET_SELECTED_PROPERTIES"; payload: string[] }
  | { type: "SET_PARAMETERS"; payload: { panelKey: string; data: any } }
  | { type: "SET_RESOURCES"; payload: ResourcesType }
  | { type: "SET_RESULTS"; payload: ResultsType }
  | { type: "LOAD_WORKFLOW"; payload: WizardState };
