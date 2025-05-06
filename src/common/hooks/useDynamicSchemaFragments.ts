import { useMemo } from "react";

import set from "lodash/set";
import useSWR from "swr";

import { DynamicField, InputSchema, StructureType } from "@common/interfaces";

interface UseDynamicSchemaFragmentsProps {
  schema: InputSchema;
  structure: StructureType;
  parameters: Record<string, any>;
}

const fetcher = async ([dynamicSpecs, structure, parameters]: [
  Record<string, DynamicField[]>,
  StructureType,
  Record<string, any>
]) => {
  if (!structure) return { schemaPatch: {}, uiPatch: {} };

  const schemaPatch: Record<string, any> = {};
  const uiPatch: Record<string, any> = {};

  for (const [field, fragments] of Object.entries(dynamicSpecs)) {
    for (const fragment of fragments) {
      const payload: Record<string, any> = {};

      for (const key of fragment.requires) {
        const [panel, name] = key.split(".");
        const payload_key = key.replace(/\./g, "_");
        if (panel === "structure") {
          payload[payload_key] = structure[name as keyof StructureType];
        } else {
          payload[payload_key] = parameters[panel]?.[name];
        }
        if (payload[payload_key] === undefined) {
          return { schemaPatch: {}, uiPatch: {} };
        }
      }

      const res = await fetch(fragment.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to fetch dynamic fragment");
      const result = await res.json();

      const fullPath = `${field}.${fragment.path}`;

      if (fragment.target === "schema" || fragment.target === "both") {
        set(schemaPatch, fullPath, result);
      }
      if (fragment.target === "ui" || fragment.target === "both") {
        set(uiPatch, fullPath, result);
      }
    }
  }

  return { schemaPatch, uiPatch };
};

export const useDynamicSchemaFragments = ({
  schema,
  structure,
  parameters,
}: UseDynamicSchemaFragmentsProps) => {
  const dynamicSpecs = useMemo(() => schema.dynamic || {}, [schema]);

  const { data, isLoading } = useSWR(
    [dynamicSpecs, structure, parameters],
    fetcher
  );

  return {
    schemaPatch: data?.schemaPatch || {},
    uiPatch: data?.uiPatch || {},
    loading: isLoading,
  };
};
