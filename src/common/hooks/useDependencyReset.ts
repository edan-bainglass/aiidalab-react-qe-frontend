import { useEffect } from "react";

import { InputSchema } from "@common/interfaces";

export const useDependencyReset = (
  parameters: Record<string, any>,
  dependencyData: Record<string, any>,
  dependencyCache: Record<string, any>,
  updateDependencyCache: (newDeps: Record<string, any>) => void,
  updateParameters: (panelKey: string, data: Record<string, any>) => void,
  panelKey: string,
  schema: InputSchema
): void => {
  const dependencyMap = schema.dependencies;

  useEffect(() => {
    if (!dependencyMap || Object.keys(dependencyMap).length === 0) return;

    const currentData = { ...parameters[panelKey] };
    let hasUpdates = false;

    for (const [field, deps] of Object.entries(dependencyMap)) {
      if (
        deps.some((dep) => dependencyData[dep] !== dependencyCache?.[dep]) &&
        currentData[field] !== undefined
      ) {
        delete currentData[field];
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      updateParameters(panelKey, currentData);
    }

    updateDependencyCache(dependencyData);
  }, [JSON.stringify(dependencyData)]);
};
