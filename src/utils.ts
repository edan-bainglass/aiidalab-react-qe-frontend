import get from "lodash/get";
import cloneDeep from "lodash/cloneDeep";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";

// your existing types
interface InputSchema {
  schema: RJSFSchema;
  ui: UiSchema;
}
interface StructureType {
  species?: Record<string, any>;
  sites?: Array<{ symbol: string }>;
}

/**
 * 1) Injects any cross-form dependencies declared under `schema.dependsOn`
 *    into schema.properties as hidden fields with default values.
 */
export function injectDependsOn(
  input: InputSchema,
  values: Record<string, any>
): InputSchema {
  const { schema: origSchema, ui: origUi } = input;
  const schema = cloneDeep(origSchema);
  const ui: UiSchema = { ...origUi };

  // grab & remove our custom key
  const deps = (schema as any).dependsOn as string[] | undefined;
  delete (schema as any).dependsOn;

  if (deps && schema.properties) {
    schema.properties = { ...schema.properties };

    deps.forEach((path) => {
      const val = get(values, path);
      const key = path.split(".").pop()!;

      // ensure property exists and set its default
      const prop = schema.properties![key] || {};
      schema.properties![key] = {
        ...prop,
        type:
          prop.type ||
          (typeof val === "boolean"
            ? "boolean"
            : typeof val === "number"
            ? "number"
            : "string"),
        default: val,
      };

      // hide it in the UI
      ui[key] = { ...(ui[key] || {}), "ui:widget": "hidden" };
    });
  }

  return { schema, ui };
}

/**
 * 2) Handles structure‑driven fields (`generatedFrom: "structure.species"`)
 *    after injecting any cross‑panel dependencies.
 */
export const processDependencies = (
  input: InputSchema,
  structure: StructureType
): InputSchema => {
  const { schema: origSchema, ui: origUi } = input;

  const schema: RJSFSchema = {
    ...origSchema,
    properties: { ...(origSchema.properties || {}) },
  };
  const ui: UiSchema = { ...origUi };

  for (const [fieldKey, fieldDef] of Object.entries(schema.properties || {})) {
    const isArray = fieldDef?.type === "array";
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

  return { schema, ui };
};

export const patchFormData = (data: any, schema: RJSFSchema) => {
  if (!schema?.properties) return data;
  const copy = { ...data };

  for (const [fieldKey, fieldDef] of Object.entries(schema.properties)) {
    if (
      fieldDef?.type === "array" &&
      Array.isArray(fieldDef.items) &&
      (!Array.isArray(copy[fieldKey]) ||
        copy[fieldKey].length !== fieldDef.items.length)
    ) {
      copy[fieldKey] = Array(fieldDef.items.length).fill(undefined);
    }
  }

  return copy;
};
