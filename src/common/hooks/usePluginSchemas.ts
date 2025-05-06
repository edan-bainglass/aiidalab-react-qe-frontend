import { getDefaultFormState } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useEffect, useState } from "react";

import {
  InputSchema,
  ParameterSchemas,
  Property,
  StructureType,
} from "@common/interfaces";

export const usePluginSchemas = (
  structure: StructureType,
  properties: Record<string, Property>,
  setSchema: (
    schema: InputSchema,
    panel: keyof ParameterSchemas,
    subpanel?: string
  ) => void,
  updateParameters: (panelKey: string, formData: any) => void,
  parameters: Record<string, any>
): { loading: boolean } => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPluginSchemas = async () => {
      for (const [key, prop] of Object.entries(properties)) {
        if (!prop.active || parameters[key] !== undefined) continue;

        try {
          const res = await fetch(`/api/plugin/schemas/${key}/input`);
          if (!res.ok) throw new Error("Failed to fetch plugin schema");

          const schema: InputSchema = await res.json();
          setSchema(schema, "plugins", key);

          if (schema.schema) {
            const defaultVal = getDefaultFormState(
              validator,
              schema.schema,
              {},
              schema.schema
            );
            updateParameters(key, defaultVal);
          }
        } catch (err) {
          console.warn(`Could not load plugin schema for ${key}`, err);
        }
      }
      setLoading(false);
    };

    Object.keys(properties).length && fetchPluginSchemas();
  }, [properties]);

  return { loading };
};
