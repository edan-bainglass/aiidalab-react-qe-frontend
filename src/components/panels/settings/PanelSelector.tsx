import { Dropdown, DropdownButton } from "react-bootstrap";

interface PanelSelectorProps {
  selected: string;
  options: Record<string, string>;
  onSelect: (option: string) => void;
}

const PanelSelector: React.FC<PanelSelectorProps> = ({
  selected,
  options,
  onSelect: setPanel,
}) => {
  return (
    <DropdownButton
      title={selected}
      className="mb-3"
      onSelect={(key) => setPanel(key || "")}
    >
      {Object.entries(options).map(([key, label]) => (
        <Dropdown.Item key={key} eventKey={key}>
          {label}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};

export default PanelSelector;
