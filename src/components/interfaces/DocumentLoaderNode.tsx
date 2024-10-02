import { BaseNode } from "./BaseNode"

export interface DocumentLoaderNode extends BaseNode{
  type: "documentLoader"
  parameters: DocumentLoaderParameters
}

export interface DocumentLoaderParameters {
    name: string;
    fileFormat: string;
    filePath: string | null;
}