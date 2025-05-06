import { IChangeEvent } from "@rjsf/core";
import { useCallback, useMemo } from "react";

import { InputSchema, StructureType } from "@common/interfaces";
import { clearDependencyData, getDependencyData } from "@common/utils";

import { useDependencyReset } from "./useDependencyReset";

interface UseFormDataProps {
  structure: StructureType;
  parameters: Record<string, any>;
  onParametersChange: (panelKey: string, data: Record<string, any>) => void;
  dependencyCache: Record<string, any>;
  onDependencyCacheChange: (deps: Record<string, any>) => void;
  panelKey: string;
  schema: InputSchema;
}

export const useFormData = ({
  structure,
  parameters,
  panelKey,
  schema,
  dependencyCache,
  onDependencyCacheChange: updateDependencyCache,
  onParametersChange: updateParameters,
}: UseFormDataProps) => {
  const dependencyMap = schema.dependencies;

  const dependencyData = useMemo(
    () => getDependencyData(structure, parameters, dependencyMap),
    [structure, parameters, dependencyMap]
  );

  useDependencyReset(
    structure,
    parameters,
    dependencyCache,
    updateDependencyCache,
    updateParameters,
    panelKey,
    schema
  );

  const formData = useMemo(
    () => ({
      ...parameters[panelKey],
      ...dependencyData,
    }),
    [parameters[panelKey], dependencyData]
  );

  const handleChange = useCallback(
    (e: IChangeEvent) => {
      const cleaned = clearDependencyData(e.formData, dependencyMap);
      updateParameters(panelKey, cleaned);
    },
    [updateParameters, panelKey, dependencyMap]
  );

  return {
    formData,
    handleChange,
  };
};
