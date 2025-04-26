import Form from "@rjsf/react-bootstrap";
import { getDefaultFormState } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useEffect, useState } from "react";
import { Dropdown, DropdownButton, Spinner } from "react-bootstrap";

import { SwitchWidget, ToggleGroupWidget } from "@common/components";
import { PropertyMap, SchemaMap } from "@interfaces";
import { patchDataIn, patchDataOut, patchSchema } from "@utils";

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
  onFormChange,
  activePanel,
  onPanelChange: setPanel,
  onPluginSchemasChange: updatePluginSchemas,
}) => {
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
        onFormChange(key, defaults);
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

  const CategorySelector = () => {
    return (
      <DropdownButton
        title={currentSchema?.schema.title || currentPanelKey}
        className="mb-3"
        onSelect={(key) => setPanel(key || "")}
      >
        {panelKeys.map((key) => (
          <Dropdown.Item key={key} eventKey={key}>
            {pluginSchemas[key]?.schema.title || key}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    );
  };

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
    onFormChange(currentPanelKey, patchedData);
  };

  return (
    <div>
      {<CategorySelector />}

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
