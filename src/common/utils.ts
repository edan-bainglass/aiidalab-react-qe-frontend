import type { RJSFSchema, UiSchema } from "@rjsf/utils";

import { InputSchema, StructureType } from "./interfaces";

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

  const { schema: origSchema, ui: origUi, dependencies } = input;

  const schema: RJSFSchema = {
    ...origSchema,
    properties: { ...(origSchema.properties || {}) },
  };
  const ui: UiSchema = { ...origUi };

  for (const [fieldKey, fieldDef] of Object.entries(schema.properties || {})) {
    const isArray = typeof fieldDef === "object" && fieldDef?.type === "array";
    const items = (fieldDef as any)?.items;

    if (!isArray || !items || typeof items !== "object") continue;

    const generatedFrom = items.generatedFrom;
    if (!generatedFrom) continue;

    if (generatedFrom !== "structure.species") {
      console.warn(`Unsupported generatedFrom source: ${generatedFrom}`);
      continue;
    }

    const speciesKeys = Object.keys(structure.species || {});

    const itemSchemas = speciesKeys.map((symbol, i) => {
      const title = items.template
        .replace(/{{\s*species\s*}}/g, symbol)
        .replace(/{{\s*i\s*}}/g, String(i + 1));

      const newItem: any = {
        type: items.type,
        title,
        default: items.default,
      };

      if (items.format) newItem.format = items.format;
      if (items.default !== undefined) newItem.default = items.default;

      return newItem;
    });

    schema.properties![fieldKey] = {
      ...fieldDef,
      items: itemSchemas,
    };
  }

  return { schema, ui, dependencies };
};

/**
 * Preprocess data w.r.t dependencies
 */
export const patchDataIn = (
  data: Record<string, any>,
  dependencies?: string[]
): Record<string, any> => {
  const copy = {} as typeof data;

  for (const dependency of dependencies || []) {
    switch (dependency) {
      case "basic.protocol":
        if (data["basic"]?.protocol) {
          const [panel, dep] = dependency.split(".");
          copy[dep] = data[panel][dep];
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
  for (const dependency of dependencies || []) {
    switch (dependency) {
      case "basic.protocol":
        delete data["protocol"];
        break;
      default:
        console.warn(
          `Unsupported dependency ${dependency} encountered on cleanup`
        );
        break;
    }
  }
  return data;
};
