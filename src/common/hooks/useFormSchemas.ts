import { useMemo } from "react";

import { InputSchema, StructureType } from "@common/interfaces";
import { patchSchema } from "@common/utils";

interface UseFormSchemasProps {
  schema: InputSchema;
  panelKey: string;
  structure: StructureType;
}

export const useFormSchemas = ({
  structure,
  panelKey,
  schema: inputSchema,
}: UseFormSchemasProps) => {
  const { schema, ui } = useMemo(
    () => patchSchema(inputSchema, structure),
    [inputSchema, structure]
  );

  const uiSchema = {
    ...ui,
    "ui:submitButtonOptions": {
      norender: true,
    },
    "ui:options": {
      title: "",
      classNames: `${panelKey}-panel`,
    },
  };

  return {
    formSchema: schema,
    uiSchema: uiSchema,
  };
};
