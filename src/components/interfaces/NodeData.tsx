interface Node {
    id: string;
    type: string;
    parameters: Record<string, any> | null;
    inputs: Record<string, string> | null;
    outputs: Record<string, string> | null;
}

interface Edge {
    nodeStartId: string;
    nodeEndId: string;
    inputKey: string;
    outputKey: string;
}

interface NodeData {
    nodes: Node[];
    edges: Edge[];
}

export interface NodeDataContainer {
    node_data: NodeData;
}
