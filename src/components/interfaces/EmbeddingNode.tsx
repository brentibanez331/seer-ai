import { BaseNode } from "./BaseNode"

export interface EmbeddingNode extends BaseNode {
    type: "embedding"
    parameters: EmbeddingParameters
}

export interface EmbeddingParameters {
    name: string                    // The main embedding name
    model: string                   // The specific embedding model
    embeddingTypes: string[]            // All embedding models in an embedding
}
