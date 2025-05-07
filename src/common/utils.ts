import type { RJSFSchema, UiSchema } from "@rjsf/utils";

import { InputSchema, StructureType } from "./interfaces";

export const DEBUG = false;
export const USE_LOCAL_SCHEMA = true;

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
export const getDependencyData = (
  structure: StructureType,
  data: Record<string, any>,
  dependencyMap?: { [key: string]: string[] }
): Record<string, any> => {
  const dependencyData = {} as typeof data;

  if (!dependencyMap) return dependencyData;

  for (const dependencies of Object.values(dependencyMap)) {
    for (const dependency of dependencies) {
      if (dependency in dependencyData) continue;
      if (!dependency.includes(".")) {
        console.warn(
          `Invalid dependency format ${dependency} encountered on patching`
        );
        continue;
      }
      const [panel, dep] = dependency.split(".");
      switch (panel) {
        case "structure":
          switch (dep) {
            case "species":
              if (!structure?.species) {
                console.warn("No label data found in structure");
              } else {
                dependencyData[dependency] = structure.species;
              }
              break;
            case "pbc":
              if (!structure?.pbc) {
                console.warn("No PBC data found in structure");
              } else {
                dependencyData[dependency] = structure.pbc;
              }
              break;
            default:
              console.warn(
                `Unsupported structure dependency ${dependency} encountered on patching`
              );
              break;
          }
          break;
        case "basic":
          if (data[panel]?.[dep]) {
            dependencyData[dependency] = data[panel][dep];
          }
          break;
        default:
          console.warn(
            `Unsupported dependency ${dependency} encountered on patching`
          );
          break;
      }
    }
  }

  return dependencyData;
};

/**
 * Postprocess data w.r.t dependencies
 */
export const clearDependencyData = (
  data: Record<string, any>,
  dependencyMap?: { [field: string]: string[] }
): Record<string, any> => {
  const cleaned = { ...data };

  if (!dependencyMap) return cleaned;

  for (const dependencies of Object.values(dependencyMap)) {
    for (const dependency of dependencies) {
      if (dependency in cleaned) {
        delete cleaned[dependency];
      }
    }
  }

  return cleaned;
};

/**
 * Check if the schema should be included based on the data
 */
export const isIncludedSchema = (
  data: Record<string, any>,
  schema: InputSchema
): boolean => {
  const requires = schema?.requires;

  if (!requires) return true;

  for (const [key, value] of Object.entries(requires)) {
    if (key.startsWith("basic.")) {
      const [category, trigger] = key.split(".");
      if (data?.[category]?.[trigger] !== value?.const) return false;
    }
  }

  return true;
};
