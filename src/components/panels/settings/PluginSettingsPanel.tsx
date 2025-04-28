import Form from "@rjsf/react-bootstrap";
import { getDefaultFormState } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";

import { PropertyMap, SchemaMap } from "@common/interfaces";
import { DEBUG, patchDataIn, patchDataOut, patchSchema } from "@common/utils";
import { SwitchWidget, ToggleGroupWidget } from "@common/widgets";

import PanelSelector from "./PanelSelector";
import { SettingsPanelProps, WithNestedPanelProps } from "./SettingsPanelProps";

interface PluginSettingsProps extends SettingsPanelProps, WithNestedPanelProps {
  pluginSchemas: SchemaMap;
  onPluginSchemasChange: (schema: SchemaMap) => void;
  properties: PropertyMap;
}

export const PluginSettingsPanel: React.FC<PluginSettingsProps> = ({
  structure,
  properties,
  pluginSchemas,
  parameters,
  onParametersChange: updateParameters,
  activePanel,
  onPanelChange: setActivePanel,
  onPluginSchemasChange: updatePluginSchemas,
}) => {
  DEBUG && console.log("PluginSettingsPanel");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPluginSchemas() {
      try {
        const fetched: SchemaMap = {};
        for (const [key, property] of Object.entries(properties)) {
          if (pluginSchemas[key]) continue;
          if (!property.active) continue;
          const res = await fetch(`/api/plugins/${key}/input`);
          if (!res.ok) throw new Error("Failed to load schema");
          fetched[key] = { ...(await res.json()), active: true };
        }
        const mergedSchemas = {
          ...pluginSchemas,
          ...fetched,
        };
        updatePluginSchemas(mergedSchemas);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    Object.keys(properties).length && loadPluginSchemas();
  }, [properties]);

  useEffect(() => {
    Object.entries(pluginSchemas).forEach(([key, { schema }]) => {
      if (!(key in parameters)) {
        const defaults = getDefaultFormState(validator, schema, {}, schema);
        updateParameters(key, defaults);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" />
        <p>Fetching plugin settings panels...</p>
      </div>
    );
  }

  if (!Object.values(properties).some((property) => property.active)) {
    return (
      <div className="text-center mt-4">
        <p>Please select a property to compute in step 2</p>
      </div>
    );
  }

  const panelKeys = Object.keys(pluginSchemas).filter(
    (key) => !properties[key] || properties[key]?.active
  );

  const currentPanelKey = panelKeys.includes(activePanel)
    ? activePanel
    : panelKeys[0];

  const currentSchema = pluginSchemas[currentPanelKey];

  const { schema, ui, dependencies } = patchSchema(currentSchema, structure);

  const uiSchema = {
    ...ui,
    "ui:submitButtonOptions": {
      norender: true,
    },
    "ui:options": {
      title: "",
      classNames: `${currentPanelKey}-panel`,
    },
  };

  const widgets = {
    toggleGroup: ToggleGroupWidget,
    CheckboxWidget: SwitchWidget,
  };

  const formData = patchDataIn(structure, parameters, dependencies);

  const onChange = (e: any) => {
    const patchedData = patchDataOut(e.formData, dependencies);
    updateParameters(currentPanelKey, patchedData);
  };

  const panelOptions = Object.fromEntries(
    Object.entries(pluginSchemas).map(([key, { schema }]) => [
      key,
      schema.title || key,
    ])
  );

  const selectedPanel = currentSchema?.schema.title || currentPanelKey;

  return (
    <div>
      <PanelSelector
        selected={selectedPanel}
        options={panelOptions}
        onSelect={setActivePanel}
      />
      {currentSchema && (
        <Form
          schema={schema}
          uiSchema={uiSchema}
          widgets={widgets}
          formData={formData}
          onChange={onChange}
          validator={validator}
          showErrorList={false}
          liveValidate
        />
      )}
    </div>
  );
};
