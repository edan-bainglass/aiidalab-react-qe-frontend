import React, { useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import { Atoms, WEAS } from "weas";

import { StructureType } from "../interfaces";

interface StructureSelectorProps {
  structure?: StructureType | null;
  onChange: (structure: StructureType) => void;
  onConfirm: () => void;
}

let weasViewer: InstanceType<typeof WEAS> | null = null;

const StructureSelector: React.FC<StructureSelectorProps> = ({
  structure,
  onChange,
  onConfirm,
}) => {
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const handleSelection = () => {
    const atoms = new Atoms({
      symbols: ["O", "H", "H"],
      positions: [
        [2.0, 2.76, 2.5],
        [2.0, 3.53, 2.0],
        [2.0, 2.0, 2.0],
      ],
      cell: [5, 5, 5],
    });

    onChange(atoms);

    if (weasViewer) {
      weasViewer.avr.atoms = atoms;
      weasViewer.avr.modelStyle = 1;
      weasViewer.render();
    }
  };

  useEffect(() => {
    if (!weasViewer && viewerContainerRef.current) {
      weasViewer = new WEAS({ domElement: viewerContainerRef.current });
      if (structure) {
        weasViewer.avr.atoms = structure;
        weasViewer.avr.modelStyle = 1;
        weasViewer.render();
      }
    }
  }, []);

  return (
    <div className="structure-selection-step">
      <h2>Step 1: Select a structure</h2>
      <Button onClick={handleSelection} className="mb-2">
        Load structure
      </Button>
      <div
        ref={viewerContainerRef}
        style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}
      />

      <div className="input-panel-controls">
        <Button variant="primary" onClick={onConfirm}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default StructureSelector;
