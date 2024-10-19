import { BaseNode } from "./BaseNode"

export interface RetrieverNode extends BaseNode{
  type: "retriever"
  parameters: RetrieverParameters
}

export interface RetrieverParameters {
    name: string                    // The main embedding name
    arxivMaxLoadDocs: number | null
    arxivgetFullDocs: number | null
}

