import React, { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { Atoms, WEAS } from "weas";

import { StructureType } from "@common/interfaces";
import { DEBUG } from "@common/utils";

interface StructureSelectionStepProps {
  structure?: StructureType | null;
  onChange: (structure: StructureType | null) => void;
  controls: React.ReactNode;
}

let weasViewer: WEAS | null = null;

let availableStructures: Record<string, StructureType> = {
  H2O: {
    symbols: ["O", "H", "H"],
    positions: [
      [2.0, 2.76, 2.5],
      [2.0, 3.53, 2.0],
      [2.0, 2.0, 2.0],
    ],
  },
  NaCl: {
    symbols: ["Na", "Cl"],
    positions: [
      [0.0, 0.0, 0.0],
      [2.0, 2.0, 2.0],
    ],
    cell: [5, 5, 5],
    pbc: [true, true, true],
  },
};

export const StructureSelectionStep: React.FC<StructureSelectionStepProps> = ({
  structure,
  onChange,
  controls,
}) => {
  DEBUG && console.log("StructureSelectionStep");

  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string>(structure?.label || "H2O");

  useEffect(() => {
    if (viewerContainerRef.current) {
      weasViewer = new WEAS({ domElement: viewerContainerRef.current });
      if (structure) {
        weasViewer.avr.atoms = structure as Atoms;
        weasViewer.avr.modelStyle = 1;
        weasViewer.render();
      }
    }
  }, []);

  useEffect(() => {
    if (!(selected && availableStructures[selected])) {
      onChange(null);
      return;
    }

    const atoms = new Atoms(availableStructures[selected]);
    atoms.label = selected;

    onChange(atoms);

    if (weasViewer) {
      weasViewer.avr.atoms = atoms;
      weasViewer.avr.modelStyle = 1;
      weasViewer.render();
    }
  }, [selected]);

  return (
    <div className="structure-selection-step">
      <h2>Step 1: Select a structure</h2>
      {controls}
      <div
        ref={viewerContainerRef}
        style={{
          width: "100%",
          height: "400px",
          border: "1px solid #ccc",
          position: "relative",
        }}
      ></div>
      <Form.Select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="mt-2"
      >
        <option value="">Select a structure</option>
        {Object.keys(availableStructures).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </Form.Select>
    </div>
  );
};
