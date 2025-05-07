import { useMemo } from "react";

import set from "lodash/set";
import useSWR from "swr";

import { DynamicField, InputSchema, StructureType } from "@common/interfaces";

interface FragmentSpec extends DynamicField {
  field: string;
  payload: Record<string, any>;
}

interface UseDynamicSchemaFragmentsProps {
  schema: InputSchema;
  structure: StructureType;
  parameters: Record<string, any>;
}

const fetcher = async (key: string) => {
  const [endpoint, payloadStr] = key.split("|");
  const payload = JSON.parse(payloadStr);
  if (!payload || Object.keys(payload).length === 0) return null;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to fetch dynamic fragment");
  return res.json();
};

export const useDynamicSchemaFragments = ({
  schema,
  structure,
  parameters,
}: UseDynamicSchemaFragmentsProps) => {
  if (!structure) return { schemaPatch: {}, uiPatch: {}, loading: false };
  const fragmentList: FragmentSpec[] = useMemo(() => {
    const dynamicSpecs = schema.dynamic || {};
    const fragments: FragmentSpec[] = [];

    for (const [field, specs] of Object.entries(dynamicSpecs)) {
      for (const spec of specs) {
        const payload: Record<string, any> = {};
        for (const key of spec.requires) {
          const [panel, name] = key.split(".");
          const payloadKey = key.replace(/\./g, "_");
          const value =
            panel === "structure"
              ? structure[name as keyof StructureType]
              : parameters[panel]?.[name];
          if (value !== undefined) {
            payload[payloadKey] = value;
          }
        }
        fragments.push({ ...spec, field, payload });
      }
    }

    return fragments;
  }, [schema, structure, parameters]);

  const swrResponses = fragmentList.map((frag) => {
    const payloadStr = JSON.stringify(
      frag.payload,
      Object.keys(frag.payload).sort()
    );
    const key = `${frag.endpoint}|${payloadStr}`;
    return {
      frag,
      ...useSWR(key, fetcher, { revalidateIfStale: false }),
    };
  });

  const { schemaPatch, uiPatch, loading } = useMemo(() => {
    const schemaPatch: Record<string, any> = {};
    const uiPatch: Record<string, any> = {};
    let anyLoading = false;

    for (const { frag, data, error, isLoading } of swrResponses) {
      if (isLoading) anyLoading = true;
      if (!data || error) continue;

      const fullPath = `${frag.field}.${frag.path}`;

      if (frag.target === "schema" || frag.target === "both") {
        set(schemaPatch, fullPath, data);
      }
      if (frag.target === "ui" || frag.target === "both") {
        set(uiPatch, fullPath, data);
      }
    }

    return { schemaPatch, uiPatch, loading: anyLoading };
  }, [swrResponses]);

  return { schemaPatch, uiPatch, loading };
};
