import { useMemo } from "react";

import set from "lodash/set";
import useSWR from "swr";

import { InputSchema, Patch, Patches, StructureType } from "@common/interfaces";

interface PatchSpec extends Patch {
  field: string;
  type: keyof Patches;
  endpoint: string;
  payload: Record<string, any>;
}

interface UseSchemaPatchesProps {
  schema: InputSchema;
  structure: StructureType;
  parameters: Record<string, any>;
}

const fetcher = async (key: string) => {
  const [endpoint, payloadStr] = key.split("|");
  const payload = JSON.parse(payloadStr);
  if (
    !payload ||
    !Object.keys(payload).length ||
    !Object.keys(payload.requirements).length
  ) {
    return null;
  }
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to fetch dynamic fragment");
  return res.json();
};

export const useSchemaPatches = ({
  schema,
  structure,
  parameters,
}: UseSchemaPatchesProps) => {
  if (!structure) return { schemaPatch: {}, uiPatch: {}, loading: false };

  const patchList: PatchSpec[] = useMemo(() => {
    const patches = schema.patches || {};
    const patchSpecs: PatchSpec[] = [];

    for (const [field, patchGroup] of Object.entries(patches)) {
      for (const type of ["definition", "ui"] as const) {
        const patch: Patch | undefined = patchGroup[type];
        if (!patch) continue;

        const payload: Record<string, any> = {};
        for (const key of patch.requires) {
          const [panel, name] = key.split(".");
          const value =
            panel === "structure"
              ? structure[name as keyof StructureType]
              : parameters[panel]?.[name];
          if (value !== undefined) {
            payload[key] = value;
          }
        }

        patchSpecs.push({
          field,
          type,
          endpoint: `/api/core/schema/patches/${field}/${type}`,
          requires: patch.requires,
          payload: { requirements: payload },
        });
      }
    }

    return patchSpecs;
  }, [schema, structure, parameters]);

  const swrResponses = patchList.map((patch) => {
    const payloadStr = JSON.stringify(patch.payload);
    const key = `${patch.endpoint}|${payloadStr}`;
    return {
      frag: patch,
      ...useSWR(key, fetcher, { revalidateIfStale: false }),
    };
  });

  const { schemaPatch, uiPatch, loading } = useMemo(() => {
    const schemaPatch: Record<string, any> = {};
    const uiPatch: Record<string, any> = {};
    let anyLoading = false;

    for (const { frag: patch, data, error, isLoading } of swrResponses) {
      if (isLoading) anyLoading = true;
      if (!data || error) continue;

      if (patch.type === "definition") {
        set(schemaPatch, patch.field, data);
      }
      if (patch.type === "ui") {
        set(uiPatch, patch.field, data);
      }
    }

    return { schemaPatch, uiPatch, loading: anyLoading };
  }, [swrResponses]);

  return { schemaPatch, uiPatch, loading };
};
