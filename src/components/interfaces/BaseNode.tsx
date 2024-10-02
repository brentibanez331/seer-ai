export interface BaseNode {
    id: string
    type: 'default' | 'chatModel' | 'output' | 'systemInstruction' | 'documentLoader' | 'textSplitter' | 'embedding' | 'retriever' | 'retrievalQA' | 'vectorStore';
    // parameters: Record<string, any> | null
    prevPosition: {
        x: number;
        y: number
    }
    currPosition: {
        x: number;
        y: number
    },
    inputs: Record<string, string> | null
    outputs: Record<string, string> | null
}



