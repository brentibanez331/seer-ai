import { BaseNode } from "./BaseNode"

export interface VectorStoreNode extends BaseNode{
  type: "vectorStore"
  parameters: VectorStoreParameters
}

export interface VectorStoreParameters {
    name: string                    // The main embedding name
}


