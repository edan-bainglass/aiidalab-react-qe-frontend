// weas.d.ts

declare module "weas" {
  import * as THREE from "three";

  export class BlendJS {
    constructor(domElement: HTMLElement);
    render(): void;
    scene: THREE.Scene;
    containerElement: HTMLElement;
    updateCameraAndControls(params: object): void;
  }

  export class GUIManager {
    gui: any;
    guiConfig: object;
    playPauseBtn: HTMLButtonElement;
    timeline: any;
    currentFrameDisplay: HTMLElement;
    colorByController: any;
    colorTypeController: any;
    materialTypeController: any;
    atomLabelTypeController: any;
    showBondedAtomsController: any;
    boundaryControllers: any[][];

    constructor(weas: WEAS, guiConfig?: object);
    update(trajectory: Atoms[]): void;
    updateLegend(): void;
  }

  export class EventHandlers {
    constructor(weas: WEAS);
    dispatchViewerUpdated(payload: object): void;
  }

  export class SelectionManager {
    constructor(weas: WEAS);
  }

  export class ObjectManager {
    constructor(weas: WEAS);
  }

  export class OperationManager {
    constructor(weas: WEAS);
  }

  export class InstancedMeshPrimitive {
    constructor(weas: WEAS);
  }

  export class AnyMesh {
    constructor(weas: WEAS);
  }

  export class Specie {
    constructor(element: string);
    element: string;
    number: number;
  }

  export class Atom {
    constructor(symbol: string, position: number[]);
    symbol: string;
    position: number[];
  }

  export interface AtomsAttributes {
    atom: Record<string, any[]>;
    specie: Record<string, any>;
    "inter-specie": Record<string, any>;
  }

  export interface AtomsData {
    symbols?: string[];
    positions?: number[][];
    cell?: number[][] | number[];
    pbc?: boolean[] | boolean;
    species?: Record<string, string | Specie>;
    attributes?: AtomsAttributes;
  }

  export class Atoms {
    label?: string;
    uuid: string | null;
    symbols: string[];
    positions: number[][];
    species: Record<string, Specie>;
    attributes: AtomsAttributes;
    cell: number[][];
    pbc: boolean[];

    constructor(data?: AtomsData);
    setSpecies(
      species: Record<string, string | Specie>,
      symbols?: string[]
    ): void;
    setAttributes(attributes: AtomsAttributes): void;
    newAttribute(name: string, values: any, domain?: string): void;
    getAttribute(name: string, domain?: string): any;
    setCell(cell: number[][] | number[]): void;
    isUndefinedCell(): boolean;
    getCellLengthsAndAngles(): number[];
    setPBC(pbc: boolean[] | boolean): void;
    addSpecie(symbol: string, element?: string | Specie): void;
    getSymbols(): string[];
    getElements(): string[];
    addAtom(atom: Atom): void;
    removeAtom(index: number): void;
    getSpeciesCount(): number;
    getAtomsCount(): number;
    add(other: Atoms): void;
    multiply(mx: number, my: number, mz: number): Atoms;
    translate(t: number[]): void;
    rotate(axis: number[], angle: number, rotate_cell?: boolean): void;
    center(vacuum?: number, axis?: number[], center?: number[]): void;
    deleteAtoms(indices: number[] | number): void;
    replaceAtoms(
      indices: number[],
      newSpecieSymbol: string,
      newSpecieElement?: string
    ): void;
    toDict(): object;
    calculateFractionalCoordinates(): number[][];
    getAtomsByIndices(indices: number[]): Atoms;
    getCenterOfGeometry(): number[];
    copy(): Atoms;
  }

  export interface ViewerConfig {
    modelStyle?: number;
    colorBy?: string;
    colorType?: string;
    colorRamp?: string;
    radiusType?: string;
    materialType?: string;
    atomLabelType?: string;
    showBondedAtoms?: boolean;
    boundary?: number[][];
    atomScale?: number;
    backgroundColor?: string;
    debug?: boolean;
    continuousUpdate?: boolean;
    bondSettings?: object;
    cellSettings?: object;
    logLevel?: string;
  }

  export class AtomsViewer {
    constructor(params: {
      weas: WEAS;
      atoms?: Atoms[];
      viewerConfig?: ViewerConfig;
    });
    uuid: string;
    atoms: Atoms | Atoms[];
    selectedAtomsIndices: number[];
    currentFrame: number;
    modelStyle: number;
    colorBy: string;
    colorType: string;
    materialType: string;
    atomLabelType: string;
    boundary: number[][];
    showBondedAtoms: boolean;
    atomScale: number;
    atomScales: number[];
    modelSticks: number[];
    modelPolyhedras: number[];
    ready: boolean;

    play(): void;
    pause(): void;
    updateAtoms(atoms: Atoms | Atoms[]): void;
    updateFrame(frameIndex: number): void;
    fromPhononMode(params: any): void;
    drawModels(): void;
    dispose(): void;
    deleteSelectedAtoms(indices?: number[]): void;
    replaceSelectedAtoms(element: string, indices?: number[]): void;
    addAtom(
      element: string,
      position?: { x: number; y: number; z: number }
    ): void;
    copyAtoms(indices?: number[]): void;
    setAtomPosition(
      index: number,
      position: { x: number; y: number; z: number }
    ): void;
    resetSelectedAtomsPositions(
      initialAtomPositions: Map<number, { x: number; y: number; z: number }>,
      indices?: number[]
    ): void;
    translateSelectedAtoms(
      translateVector: THREE.Vector3,
      indices?: number[]
    ): void;
    rotateSelectedAtoms(
      cameraDirection: THREE.Vector3,
      rotationAngle: number,
      indices?: number[],
      centroid?: THREE.Vector3
    ): void;
    setAttribute(name: string, values: any[], domain?: string): void;
    updateModelStyles(newValue: number): void;
  }

  export interface WEASConfig {
    domElement: HTMLElement;
    atoms?: Atoms[];
    viewerConfig?: ViewerConfig;
    guiConfig?: object;
  }

  export class WEAS {
    uuid: string;
    tjs: BlendJS;
    guiManager: GUIManager;
    eventHandlers: EventHandlers;
    ops: OperationManager;
    selectionManager: SelectionManager;
    objectManager: ObjectManager;
    avr: AtomsViewer;
    instancedMeshPrimitive: InstancedMeshPrimitive;
    anyMesh: AnyMesh;
    activeObject: any;

    constructor(config: WEASConfig);
    initialize(): void;
    render(): void;
    clear(): void;
  }
}
