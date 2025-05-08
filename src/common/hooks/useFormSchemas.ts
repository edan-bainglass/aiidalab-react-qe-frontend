import { useMemo } from "react";

import merge from "lodash/merge";

import { useSchemaPatches } from "@common/hooks";
import { InputSchema, StructureType } from "@common/interfaces";
import { patchSchema } from "@common/utils";

interface UseFormSchemasProps {
  structure: StructureType;
  parameters: Record<string, any>;
  panelKey: string;
  schema: InputSchema;
}

export const useFormSchemas = ({
  structure,
  parameters,
  panelKey,
  schema: inputSchema,
}: UseFormSchemasProps) => {
  const { schema, ui } = useMemo(
    () => patchSchema(inputSchema, structure),
    [inputSchema, structure]
  );

  const { schemaPatch, uiPatch, loading } = useSchemaPatches({
    schema: inputSchema,
    structure,
    parameters,
  });

  const formSchema = useMemo(() => {
    return merge({}, schema, schemaPatch);
  }, [schema, schemaPatch]);

  const uiSchema = useMemo(() => {
    return merge({}, ui, uiPatch, {
      "ui:submitButtonOptions": {
        norender: true,
      },
      "ui:options": {
        title: "",
        classNames: `settings-panel ${panelKey}-panel`,
      },
    });
  }, [ui, uiPatch, panelKey]);

  return {
    formSchema,
    uiSchema,
    loading,
  };
};
