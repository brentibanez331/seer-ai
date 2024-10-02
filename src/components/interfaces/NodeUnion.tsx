import { BaseNode } from "./BaseNode";
import { BaseOutputNode } from "./BaseOutputNode";
import { ChatModelNode } from "./ChatModelNode";
import { DocumentLoaderNode } from "./DocumentLoaderNode";
import { EmbeddingNode } from "./EmbeddingNode";
import { RetrievalQANode } from "./RetrievalQANode";
import { RetrieverNode } from "./RetrieverNode";
import { SystemInstructionNode } from "./SystemInstructionNode";
import { TextSplitterNode } from "./TextSplitterNode";
import { VectorStoreNode } from "./VectorStoreNode";

export type Node =
    | ChatModelNode
    | DocumentLoaderNode 
    | BaseOutputNode 
    | EmbeddingNode 
    | RetrieverNode 
    | TextSplitterNode 
    | SystemInstructionNode 
    | RetrievalQANode
    | VectorStoreNode