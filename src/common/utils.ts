import type { RJSFSchema, UiSchema } from "@rjsf/utils";

import { InputSchema, StructureType } from "./interfaces";

export const DEBUG = false;

/**
 * Preprocess schema w.r.t dependencies
 */
export const patchSchema = (
  input: InputSchema,
  structure: StructureType
): InputSchema => {
  if (!structure) {
    console.warn("No structure provided for schema patching");
    return input;
  }

  const schema: RJSFSchema = JSON.parse(JSON.stringify(input.schema));
  const ui: UiSchema | undefined = JSON.parse(JSON.stringify(input.ui || {}));

  for (const [fieldKey, fieldDef] of Object.entries(ui || {})) {
    if (fieldDef?.items) {
      if (!schema.definitions) {
        console.warn("No definitions found in schema");
        continue;
      }

      const definition = (schema.definitions?.[fieldKey] as any)?.items;
      if (!definition) {
        console.warn(`No items definition found for ${fieldKey}`);
        continue;
      }

      const generatedFrom: string = fieldDef.items.generatedFrom;
      if (!generatedFrom) {
        console.warn(`No generatedFrom found for ${fieldKey}`);
        continue;
      }

      const template: string = fieldDef.items.template || "{{ species }}";

      switch (generatedFrom) {
        case "structure.species":
          const newItems = Object.keys(structure.species || {}).map((key) => {
            return {
              ...definition,
              title: template.replace(/{{\s*species\s*}}/g, key),
            };
          });

          schema.definitions[fieldKey] = {
            ...(schema.definitions?.[fieldKey] as any),
            items: newItems,
          };

          delete ui?.[fieldKey].items.generatedFrom;
          delete ui?.[fieldKey].items.template;

          break;
        default:
          console.warn(`Unsupported generatedFrom source: ${generatedFrom}`);
          break;
      }
    }
  }

  return { schema, ui, dependencies: input.dependencies };
};

/**
 * Preprocess data w.r.t dependencies
 */
export const patchDataIn = (
  structure: StructureType,
  data: Record<string, any>,
  dependencies?: string[]
): Record<string, any> => {
  const copy = {} as typeof data;

  for (const dependency of dependencies || []) {
    if (dependency.startsWith("basic.")) {
      const [panel, dep] = dependency.split(".");
      if (data[panel]?.[dep]) {
        copy[dep] = data[panel][dep];
      }
      continue;
    }
    switch (dependency) {
      case "structure.pbc":
        if (!structure?.pbc) {
          console.warn("No PBC data found in structure");
        } else {
          copy["molecule"] =
            Array.isArray(structure.pbc) &&
            structure.pbc.every((v) => v === false);
        }
        break;
      default:
        console.warn(
          `Unsupported dependency ${dependency} encountered on patching`
        );
        break;
    }
  }

  return copy;
};

/**
 * Postprocess data w.r.t dependencies
 */
export const patchDataOut = (
  data: Record<string, any>,
  dependencies?: string[]
): Record<string, any> => {
  const copy = { ...data };

  for (const dependency of dependencies || []) {
    if (dependency.startsWith("basic.")) {
      const dep = dependency.split(".")[1];
      delete copy[dep];
      continue;
    }
    switch (dependency) {
      case "structure.pbc":
        delete copy["molecule"];
        break;
      default:
        console.warn(
          `Unsupported dependency ${dependency} encountered on cleanup`
        );
        break;
    }
  }
  return copy;
};

/**
 * Check if the schema should be included based on the data
 */
export const isIncludedSchema = (
  data: Record<string, any>,
  schema: InputSchema
): boolean => {
  const includedIf = schema?.includedIf;

  if (!includedIf) return true;

  for (const [key, value] of Object.entries(includedIf)) {
    if (key.startsWith("basic.")) {
      const [category, trigger] = key.split(".");
      if (data?.[category]?.[trigger] !== value?.const) return false;
    }
  }

  return true;
};
