import { InputSchema } from "./interfaces";

export const basicSettingsSchema: InputSchema = {
  schema: {
    type: "object",
    properties: {
      relax: {
        title: "Relaxation level",
        enum: ["none", "positions", "positions-cell"],
        default: "none",
      },
      electronic_type: {
        type: "string",
        title: "Electronic type",
        enum: ["Metallic", "Insulator"],
        default: "Metallic",
      },
      protocol: {
        type: "string",
        title: "Protocol",
        enum: ["Fast", "Balanced", "Stringent"],
        default: "Fast",
      },
      spin_type: {
        type: "boolean",
        title: "Magnetism",
      },
      spin_orbit: {
        type: "boolean",
        title: "Spin orbit coupling",
      },
    },
  },
  ui: {
    relax: {
      "ui:widget": "toggleGroup",
      "ui:enumNames": ["Structure as is", "Positions only", "Full geometry"],
    },
    electronic_type: {
      "ui:widget": "toggleGroup",
    },
    protocol: {
      "ui:widget": "toggleGroup",
    },
  },
};

export type SchemaMap = Record<string, InputSchema>;

export const advancedSettingsSchema: SchemaMap = {
  // convergence: {
  //   schema: {
  //     type: "object",
  //     title: "Convergence",
  //     properties: {
  //       protocol: {
  //         type: "string",
  //         title: "Protocol",
  //         enum: ["Fast", "Balanced", "Stringent"],
  //         default: "Fast",
  //       },
  //     },
  //     if: {
  //       properties: {
  //         protocol: {
  //           const: "Fast",
  //         },
  //       },
  //     },
  //     then: {
  //       properties: {
  //         scfConvEng: {
  //           type: "number",
  //           title: "SCF energy (Ry/atom)",
  //           default: 4e-10,
  //         },
  //         ionicConvEng: {
  //           type: "number",
  //           title: "Ionic energy (Ry/atom)",
  //           default: 0.0001,
  //         },
  //         ionicConvForce: {
  //           type: "number",
  //           title: "Ionic force (Ry/Bohr)",
  //           default: 0.001,
  //         },
  //       },
  //     },
  //     else: {
  //       if: {
  //         properties: {
  //           protocol: {
  //             const: "Balanced",
  //           },
  //         },
  //       },
  //       then: {
  //         properties: {
  //           scfConvEng: {
  //             type: "number",
  //             title: "SCF energy (Ry/atom)",
  //             default: 2e-10,
  //           },
  //           ionicConvEng: {
  //             type: "number",
  //             title: "Ionic energy (Ry/atom)",
  //             default: 0.00001,
  //           },
  //           ionicConvForce: {
  //             type: "number",
  //             title: "Ionic force (Ry/Bohr)",
  //             default: 0.0001,
  //           },
  //         },
  //       },
  //       else: {
  //         if: {
  //           properties: {
  //             protocol: {
  //               const: "Stringent",
  //             },
  //           },
  //         },
  //         then: {
  //           properties: {
  //             scfConvEng: {
  //               type: "number",
  //               title: "SCF energy (Ry/atom)",
  //               default: 1e-10,
  //             },
  //             ionicConvEng: {
  //               type: "number",
  //               title: "Ionic energy (Ry/atom)",
  //               default: 0.000005,
  //             },
  //             ionicConvForce: {
  //               type: "number",
  //               title: "Ionic force (Ry/Bohr)",
  //               default: 0.00005,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // },
  convergence: {
    schema: {
      type: "object",
      title: "Convergence",
      properties: {
        scfConvEng: {
          type: "number",
          title: "SCF energy (Ry/atom)",
          default: 4e-10,
        },
        ionicConvEng: {
          type: "number",
          title: "Ionic energy (Ry/atom)",
          default: 0.0001,
        },
        ionicConvForce: {
          type: "number",
          title: "Ionic force (Ry/Bohr)",
          default: 0.001,
        },
      },
    },
  },
  smearing: {
    schema: {
      type: "object",
      title: "Smearing",
      properties: {
        method: {
          type: "string",
          title: "Method",
          enum: ["Gaussian", "Methfessel-Paxton", "Fermi-Dirac"],
          default: "Gaussian",
        },
        width: { type: "number", title: "Width (eV)", default: 0.05 },
      },
    },
  },
  magnetization: {
    schema: {
      type: "object",
      title: "Magnetization",
      properties: {
        initialMagnetization: {
          type: "number",
          title: "Initial magnetization",
        },
      },
    },
  },
  hubbardU: {
    schema: {
      type: "object",
      title: "Hubbard U",
      properties: {
        use_hubbard: {
          default: false,
          title: "Enable U",
          type: "boolean",
        },
      },
      required: ["use_hubbard"],
      if: {
        properties: {
          use_hubbard: {
            const: true,
          },
        },
      },
      then: {
        properties: {
          U: {
            minimum: 0,
            title: "U (eV)",
            type: "number",
          },
        },
      },
    },
  },
  pseudopotentials: {
    schema: {
      type: "object",
      title: "Pseudopotentials",
      properties: {
        functional: {
          type: "string",
          title: "Functional",
          enum: ["PBE", "PBEsol"],
          default: "PBEsol",
        },
        family: {
          type: "string",
          title: "Family",
          enum: ["SSSP", "PseudoDojo"],
          default: "SSSP",
        },
        pseudopotentials: {
          type: "array",
          title: "Pseudopotentials",
          items: {
            type: "string",
            format: "data-url",
            generatedFrom: "structure.species",
            template: "{{species}}",
          },
        },
      },
      if: {
        properties: {
          family: {
            const: "SSSP",
          },
        },
      },
      then: {
        properties: {
          accuracy: {
            type: "string",
            title: "Accuracy",
            enum: ["Efficiency", "Precision"],
            default: "Efficiency",
          },
        },
      },
      else: {
        if: {
          properties: {
            family: {
              const: "PseudoDojo",
            },
          },
        },
        then: {
          properties: {
            accuracy: {
              type: "string",
              title: "Accuracy",
              enum: ["Standard", "Stringent"],
              default: "Standard",
            },
          },
        },
      },
    },
    ui: {
      functional: {
        "ui:widget": "toggleGroup",
      },
      family: {
        "ui:widget": "toggleGroup",
      },
      accuracy: {
        "ui:widget": "toggleGroup",
      },
      pseudopotentials: {
        "ui:options": {
          classNames: "mt-2",
        },
        items: {
          "ui:hideError": true,
          "ui:options": {
            accept: ".UPF",
          },
        },
      },
      "ui:order": ["functional", "family", "accuracy", "pseudopotentials"],
    },
  },
};
