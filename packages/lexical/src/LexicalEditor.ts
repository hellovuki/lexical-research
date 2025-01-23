import { createEmptyEditorState, EditorState } from './LexicalEditorState';
import {
  DOMConversionMap,
  DOMExportOutput,
  DOMExportOutputMap,
  LexicalNode,
} from './LexicalNode';
import { internalGetActiveEditor } from './LexicalUpdates';
import { createUID } from './LexicalUtils';
import { LineBreakNode } from './nodes/LexicalLineBrakNode';
import { ParagraphNode } from './nodes/LexicalParagraphNode';
import { RootNode } from './nodes/LexicalRootNode';
import { TabNode } from './nodes/LexicalTabNode';
import { TextNode } from './nodes/LexicalTextNode';

type GenericConstructor<T> = new (...args: any[]) => T;

// Allow us to look up the type including static props, as well
// to solve the issue with the constructor type.
// The current type of Example.constructor is Function,
// but I feel that it should be typeof Example instead.
export type KlassConstructor<Cls extends GenericConstructor<any>> =
  GenericConstructor<InstanceType<Cls>> & { [k in keyof Cls]: Cls[k] };

// They type of the class itself, not the instance
export type Klass<T extends LexicalNode> = InstanceType<
  T['constructor']
> extends T
  ? T['constructor']
  : GenericConstructor<T> & T['constructor'];

export type LexicalNodeReplacement = {
  replace: Klass<LexicalNode>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  with: <T extends { new (...args: any): any }>(
    node: InstanceType<T>
  ) => LexicalNode;
  withKlass?: Klass<LexicalNode>;
};

export type Transform<T extends LexicalNode> = (node: T) => void;

export type RegisteredNode = {
  klass: Klass<LexicalNode>;
  transforms: Set<Transform<LexicalNode>>;
  replace: null | ((node: LexicalNode) => LexicalNode);
  replaceWithKlass: null | Klass<LexicalNode>;
  exportDOM?: (
    editor: LexicalEditor,
    targetNode: LexicalNode
  ) => DOMExportOutput;
};

export type RegisteredNodes = Map<string, RegisteredNode>;

export type ErrorHandler = (error: Error) => void;

export type HTMLConfig = {
  export?: DOMExportOutputMap;
  import?: DOMConversionMap;
};

export type EditorThemeClasses = {};

export type CreateEditorArgs = {
  disableEvents?: boolean;
  editorState?: EditorState;
  namespace?: string;
  nodes?: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement>;
  onError?: ErrorHandler;
  parentEditor?: LexicalEditor;
  editable?: boolean;
  theme?: EditorThemeClasses;
  html?: HTMLConfig;
};

export function createEditor(editorConfig?: CreateEditorArgs): LexicalEditor {
  const config = editorConfig || {};
  const activeEditor = internalGetActiveEditor();
  const theme = config.theme || {};
  const parentEditor =
    editorConfig === undefined ? activeEditor : config.parentEditor || null;
  const disableEvents = config.disableEvents || false;
  const editorState = createEmptyEditorState();
  const namespace =
    config.namespace ||
    (parentEditor !== null ? parentEditor._config.namespace : createUID());
  const initialEditorState = config.editorState;

  const nodes = [
    RootNode,
    TextNode,
    LineBreakNode,
    TabNode,
    ParagraphNode,
    ...(config.nodes || []),
  ];

  const { onError, html } = config;
  const isEditable = config.editable !== undefined ? config.editable : true;
  let registeredNodes: Map<string, RegisteredNode>;

  if (editorConfig === undefined && activeEditor !== null) {
    registeredNodes = activeEditor._nodes;
  } else {
    registeredNodes = new Map();
    for (let i = 0; i < nodes.length; i++) {
      let klass = nodes[i];
      let replace: RegisteredNode['replace'] = null;
      let replaceWithKlass: RegisteredNode['replaceWithKlass'] = null;

      if (typeof klass !== 'function') {
        const options = klass;
        klass = options.replace;
        replace = options.with;
        replaceWithKlass = options.withKlass || null;
      }

      const type = klass.getType();
      const transform = klass.transform();
      const transforms = new Set<Transform<LexicalNode>>();
      if (transform !== null) {
        transforms.add(transform);
      }
      registeredNodes.set(type, {
        exportDOM: html && html.export ? html.export.get(klass) : undefined,
        klass,
        replace,
        replaceWithKlass,
        transforms,
      });
    }
  }

  // TODO: Continue here

  const editor = new LexicalEditor();

  return editor;
}

export type EditorConfig = {
  disableEvents?: boolean;
  namespace: string;
  theme: EditorThemeClasses;
};

export class LexicalEditor {
  _nodes: RegisteredNodes;
  _config: EditorConfig;
}
