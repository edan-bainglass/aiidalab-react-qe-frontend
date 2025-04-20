import React, { useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import { Atoms, WEAS } from "weas";

import { StructureType } from "../interfaces";

interface StructureSelectionStepProps {
  structure?: StructureType | null;
  onChange: (structure: StructureType) => void;
  controls: React.ReactNode;
}

let weasViewer: InstanceType<typeof WEAS> | null = null;

const StructureSelectionStep: React.FC<StructureSelectionStepProps> = ({
  structure,
  onChange,
  controls,
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
      {controls}
      <div
        ref={viewerContainerRef}
        style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}
      />
      <Button onClick={handleSelection} className="mt-2">
        Load structure
      </Button>
    </div>
  );
};

export default StructureSelectionStep;
