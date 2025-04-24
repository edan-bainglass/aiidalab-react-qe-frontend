import Form from "@rjsf/react-bootstrap";
import validator from "@rjsf/validator-ajv8";
import React, { useEffect, useState } from "react";
import { Dropdown, DropdownButton, Spinner, Tab, Tabs } from "react-bootstrap";

import { getDefaultFormState, RegistryWidgetsType } from "@rjsf/utils";

import { SwitchWidget, ToggleGroupWidget } from "../common/components";
import {
  InputSchema,
  ParameterSchemas,
  PropertyMap,
  SchemaMap,
  StructureType,
} from "../interfaces";
import { patchDataIn, patchDataOut, patchSchema } from "../utils";

const widgets: RegistryWidgetsType = {
  toggleGroup: ToggleGroupWidget,
  CheckboxWidget: SwitchWidget,
};

interface ParameterSettingsStepProps {
  structure: StructureType;
  properties: PropertyMap;
  parametersSchema: ParameterSchemas;
  parameters: any;
  onChange: (panelKey: string, formData: any) => void;
  controls: React.ReactNode;
  panel: string;
  onPanelChange: (panel: string) => void;
  advancedPanel: string;
  onAdvancedPanelChange: (panel: string) => void;
  pluginPanel: string;
  onPluginPanelChange: (panel: string) => void;
  onPluginSchemasChange: (schema: SchemaMap) => void;
}

const ParameterSettingsStep: React.FC<ParameterSettingsStepProps> = ({
  structure,
  properties,
  parametersSchema,
  parameters,
  onChange,
  controls,
  panel,
  onPanelChange: setPanel,
  advancedPanel,
  onAdvancedPanelChange: setAdvancedPanel,
  pluginPanel,
  onPluginPanelChange: setPluginPanel,
  onPluginSchemasChange: updatePluginSchemas,
}) => {
  const handleFormChange = (panelKey: string, formData: any) => {
    onChange(panelKey, formData);
  };

  return (
    <div>
      <h2>Step 3: Set calculation parameters</h2>
      {controls}
      <Tabs
        id="parameters-tabs"
        className="mb-3"
        style={{ marginTop: "1rem" }}
        activeKey={panel}
        onSelect={(key) => setPanel(key || "basic")}
      >
        <Tab eventKey="basic" title="Basic settings">
          <BasicSettings
            structure={structure}
            basicSchema={parametersSchema.basic}
            parameters={parameters}
            onFormChange={handleFormChange}
          />
        </Tab>
        <Tab eventKey="advanced" title="Advanced settings">
          <AdvancedSettings
            structure={structure}
            advancedSchema={parametersSchema.advanced}
            parameters={parameters}
            onFormChange={handleFormChange}
            activePanel={advancedPanel}
            onPanelChange={(panel) => setAdvancedPanel(panel)}
          />
        </Tab>
        <Tab eventKey="properties" title="Property settings">
          <PluginSettings
            structure={structure}
            properties={properties}
            pluginSchemas={parametersSchema.plugins}
            parameters={parameters}
            onFormChange={handleFormChange}
            activePanel={pluginPanel}
            onPanelChange={(panel) => setPluginPanel(panel)}
            onPluginSchemasChange={updatePluginSchemas}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

interface SettingsPanelProps {
  structure: StructureType;
  parameters: Record<string, any>;
  onFormChange: (panelKey: string, formData: any) => void;
}

interface WithNestedPanelProps {
  activePanel: string;
  onPanelChange: (panelKey: string) => void;
}

interface BasicSettingsProps extends SettingsPanelProps {
  basicSchema: InputSchema;
}

const BasicSettings: React.FC<BasicSettingsProps> = ({
  structure,
  basicSchema,
  parameters,
  onFormChange,
}) => {
  useEffect(() => {
    const key = "basic";
    const schema = basicSchema.schema;
    if (parameters[key] === undefined) {
      const defaults = getDefaultFormState(validator, schema, {}, schema);
      onFormChange(key, defaults);
    }
  }, []);

  return (
    <div>
      <Form
        schema={basicSchema.schema}
        uiSchema={{
          ...basicSchema.ui,
          "ui:submitButtonOptions": { norender: true },
        }}
        widgets={widgets}
        formData={parameters["basic"]}
        onChange={(e) => onFormChange("basic", e.formData)}
        validator={validator}
        showErrorList={false}
        liveValidate
      ></Form>
    </div>
  );
};

interface AdvancedSettingsProps
  extends SettingsPanelProps,
    WithNestedPanelProps {
  advancedSchema: SchemaMap;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  structure,
  advancedSchema,
  parameters,
  onFormChange,
  activePanel,
  onPanelChange: setPanel,
}) => {
  const panelKeys = Object.keys(advancedSchema);

  const currentPanelKey = panelKeys.includes(activePanel)
    ? activePanel
    : panelKeys[0];

  const currentSchema = advancedSchema[currentPanelKey];

  const CategorySelector = () => {
    return (
      <DropdownButton
        title={currentSchema?.schema.title || currentPanelKey}
        className="mb-3"
        onSelect={(key) => setPanel(key || "")}
      >
        {panelKeys.map((key) => (
          <Dropdown.Item key={key} eventKey={key}>
            {advancedSchema[key]?.schema.title || key}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    );
  };

  const { schema, ui } = patchSchema(currentSchema, structure);

  return (
    <div>
      {<CategorySelector />}
      {currentSchema && (
        <Form
          schema={schema}
          uiSchema={{
            ...ui,
            "ui:submitButtonOptions": { norender: true },
            "ui:options": { title: "", classNames: `${currentPanelKey}-panel` },
          }}
          widgets={widgets}
          formData={patchDataIn(schema, parameters)}
          onChange={(e) =>
            onFormChange(currentPanelKey, patchDataOut(schema, e.formData))
          }
          validator={validator}
          showErrorList={false}
          liveValidate
        />
      )}
    </div>
  );
};

interface PluginSettingsProps extends SettingsPanelProps, WithNestedPanelProps {
  pluginSchemas: SchemaMap;
  onPluginSchemasChange: (schema: SchemaMap) => void;
  properties: PropertyMap;
}

const PluginSettings: React.FC<PluginSettingsProps> = ({
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
      if (parameters[key] === undefined) {
        const defaults = getDefaultFormState(validator, schema, {}, schema);
        onFormChange(key, defaults);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" />
        <p>Loading plugin parameters...</p>
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

  const { schema, ui } = patchSchema(currentSchema, structure);

  return (
    <div>
      {<CategorySelector />}

      {currentSchema && (
        <Form
          schema={schema}
          uiSchema={{
            ...ui,
            "ui:submitButtonOptions": { norender: true },
            "ui:options": { title: "", classNames: `${currentPanelKey}-panel` },
          }}
          widgets={widgets}
          formData={patchDataIn(schema, parameters)}
          onChange={(e) =>
            onFormChange(currentPanelKey, patchDataOut(schema, e.formData))
          }
          validator={validator}
          showErrorList={false}
          liveValidate
        />
      )}
    </div>
  );
};

export default ParameterSettingsStep;
