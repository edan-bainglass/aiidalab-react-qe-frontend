import { useState } from "react";

import Wizard from "./Wizard";

import "./App.scss";

const App = () => {
  const [showWizard, setShowWizard] = useState(false);

  const startCalculation = () => {
    setShowWizard(true);
  };

  return (
    <div className="app-container">
      {!showWizard && (
        <div className="landing fade-in">
          <h1>Welcome to the AiiDAlab Quantum ESPRESSO App</h1>
          <div>
            <button className="btn btn-primary" onClick={startCalculation}>
              New calculation
            </button>
          </div>
        </div>
      )}
      {showWizard && (
        <div className="wizard-container fade-in">
          <Wizard />
        </div>
      )}
    </div>
  );
};

export default App;
