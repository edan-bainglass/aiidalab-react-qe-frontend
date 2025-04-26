import Form from "@rjsf/react-bootstrap";
import { getDefaultFormState } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useEffect } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";

import { SwitchWidget, ToggleGroupWidget } from "@common/components";
import { SchemaMap } from "@interfaces";
import { patchDataIn, patchDataOut, patchSchema } from "@utils";

import { SettingsPanelProps, WithNestedPanelProps } from "./SettingsPanelProps";

interface AdvancedSettingsProps
  extends SettingsPanelProps,
    WithNestedPanelProps {
  advancedSchema: SchemaMap;
}

export const AdvancedSettingsPanel: React.FC<AdvancedSettingsProps> = ({
  structure,
  advancedSchema,
  parameters,
  onFormChange,
  activePanel,
  onPanelChange: setPanel,
}) => {
  useEffect(() => {
    Object.entries(advancedSchema).forEach(([key, { schema }]) => {
      if (parameters[key] === undefined) {
        const defaults = getDefaultFormState(validator, schema, {}, schema);
        onFormChange(key, defaults);
      }
    });
  }, []);

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

  const formData = patchDataIn(parameters, dependencies);

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
