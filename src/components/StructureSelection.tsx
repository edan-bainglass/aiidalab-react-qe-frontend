import { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";

import { Atoms, WEAS } from "weas";

interface StructureSelectorProps {
  onConfirm: () => void;
}

const StructureSelector: React.FC<StructureSelectorProps> = ({ onConfirm }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    if (viewerRef.current) {
      const atoms = new Atoms({
        symbols: ["O", "H", "H"],
        positions: [
          [2.0, 2.76, 2.5],
          [2.0, 3.53, 2.0],
          [2.0, 2.0, 2.0],
        ],
        cell: [5, 5, 5],
      });
      const editor = new WEAS({ domElement: viewerRef.current });
      editor.avr.atoms = atoms;
      editor.avr.modelStyle = 1;
      editor.render();
      setInitialized(true);
    }
  }, []);

  return (
    <div className="structure-selection-step">
      <h2>Step 1: Structure Selection</h2>
      <div
        ref={viewerRef}
        style={{
          border: "1px solid #ccc",
          width: "100%",
          height: "400px",
        }}
      />
      <Button variant="primary" onClick={onConfirm}>
        Next
      </Button>
    </div>
  );
};

export default StructureSelector;
