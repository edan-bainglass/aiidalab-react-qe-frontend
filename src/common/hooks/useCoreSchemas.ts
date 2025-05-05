import { getDefaultFormState } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useEffect, useState } from "react";

import {
  InputSchema,
  ParameterSchemas,
  StructureType,
} from "@common/interfaces";

export const useCoreSchemas = (
  structure: StructureType,
  parameterSchemas: ParameterSchemas,
  setSchema: (
    schema: InputSchema,
    panel: keyof ParameterSchemas,
    subpanel?: string
  ) => void,
  updateParameters: (panelKey: string, formData: any) => void,
  parameters: Record<string, any>
): { loading: boolean; error?: string } => {
  const alreadyFetched =
    parameterSchemas.basic?.schema &&
    Object.keys(parameterSchemas.advanced || {}).length > 0;

  const [loading, setLoading] = useState(!alreadyFetched);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchCoreSchemas = async () => {
      try {
        const res = await fetch("/api/core/schemas/input");
        const schemas: Partial<ParameterSchemas> = await res.json();

        if (!schemas.basic || !schemas.advanced) {
          throw new Error("Missing core schemas");
        }

        setSchema(schemas.basic, "basic");
        if (parameters.basic === undefined && schemas.basic.schema) {
          const defaultBasic = getDefaultFormState(
            validator,
            schemas.basic.schema,
            {},
            schemas.basic.schema
          );
          updateParameters("basic", defaultBasic);
        }

        for (const [key, schema] of Object.entries(schemas.advanced)) {
          setSchema(schema, "advanced", key);
          if (parameters[key] === undefined && schema.schema) {
            const defaultAdv = getDefaultFormState(
              validator,
              schema.schema,
              {},
              schema.schema
            );
            updateParameters(key, defaultAdv);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch core schemas");
      } finally {
        setLoading(false);
      }
    };

    !alreadyFetched && fetchCoreSchemas();
  }, []);

  return { loading, error };
};
