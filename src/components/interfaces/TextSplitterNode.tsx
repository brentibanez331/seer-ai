import { BaseNode } from "./BaseNode"

export interface TextSplitterNode extends BaseNode {
    type: "textSplitter"
    parameters: TextSplitterParameters
    inputs: {
        prompt: string
    }
    outputs: {
        response: string
    }
}

export interface TextSplitterParameters {
    name: string
    chunk_size: number
    chunk_overlap: number
    filePath: string | null
}

