import { WidgetProps } from "@rjsf/utils";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";

const ToggleRadioWidget: React.FC<WidgetProps> = (props) => {
  return (
    <ToggleButtonGroup
      type="radio"
      name={props.id}
      value={props.value}
      onChange={(val: any) => props.onChange(val)}
      className="d-block"
    >
      {props.options.enumOptions?.map(({ value: optVal, label }, i) => (
        <ToggleButton
          key={optVal}
          id={`${props.id}__toggle_${i}`}
          value={optVal}
          disabled={props.options.enumDisabled?.includes(optVal)}
        >
          {label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default ToggleRadioWidget;
