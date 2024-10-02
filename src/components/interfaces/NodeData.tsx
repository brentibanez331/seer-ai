// interface Node {
//     id: string;
//     type: string;
//     parameters: Record<string, any> | null;
//     inputs: Record<string, string> | null;
//     outputs: Record<string, string> | null;
// }

import { ChatModelParameters } from "./ChatModelNode";
import { DocumentLoaderParameters } from "./DocumentLoaderNode";
import { EmbeddingParameters } from "./EmbeddingNode";
import { Node } from "./NodeUnion";
import { RetrieverParameters } from "./RetrieverNode";
import { SystemInstructionParameters } from "./SystemInstructionNode";
import { TextSplitterParameters } from "./TextSplitterNode";
import { VectorStoreParameters } from "./VectorStoreNode";

export interface ApiNode {
    id: string;
    type: Node['type']; // Use type from Node union
    parameters: ChatModelParameters
    | DocumentLoaderParameters 
    | EmbeddingParameters 
    | RetrieverParameters 
    | SystemInstructionParameters
    | VectorStoreParameters
    | TextSplitterParameters 
    | null;
    inputs: Record<string, string> | null;
    outputs: Record<string, string> | null;
}

interface ApiEdge {
    nodeStartId: string;
    nodeEndId: string;
    inputKey: string;
    outputKey: string;
}

interface ApiNodeData {
    nodes: ApiNode[];
    edges: ApiEdge[];
}

export interface ApiNodeDataContainer {
    node_data: ApiNodeData;
}