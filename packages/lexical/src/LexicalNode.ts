import { Klass, KlassConstructor, LexicalEditor } from './LexicalEditor';

type NodeName = string;

// **** EXPORT TO HTML LOGIC ****

export type DOMExportOutput = {
  after?: (
    generatedElement: HTMLElement | DocumentFragment | Text | null | undefined
  ) => HTMLElement | Text | null | undefined;
  element: HTMLElement | DocumentFragment | Text | null;
};

export type DOMExportOutputMap = Map<
  Klass<LexicalNode>,
  (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>;

// **** END OF EXPORT TO HTML LOGIC ****

// **** IMPORT FROM HTML LOGIC ****

export type DOMChildConversion = (
  lexicalNode: LexicalNode,
  parentLexicalNode: LexicalNode | null | undefined
) => LexicalNode | null | undefined;

export type DOMConversionOutput = {
  after?: (childLexicalNodes: Array<LexicalNode>) => Array<LexicalNode>;
  forChild?: DOMChildConversion;
  node: null | LexicalNode | Array<LexicalNode>;
};

export type DOMConversionFn<T extends HTMLElement = HTMLElement> = (
  element: T
) => DOMConversionOutput | null;

export type DOMConversion<T extends HTMLElement = HTMLElement> = {
  conversion: DOMConversionFn<T>;
  priority?: 0 | 1 | 2 | 3 | 4;
};

export type DOMConversionMap<T extends HTMLElement = HTMLElement> = Record<
  NodeName,
  (node: T) => DOMConversion<T> | null
>;

// **** END OF IMPORT FROM HTML LOGIC ****

export class LexicalNode {
  ['constructor']!: KlassConstructor<typeof LexicalNode>;
}
