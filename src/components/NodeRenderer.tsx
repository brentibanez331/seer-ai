import { ChatModelNodeComponent } from "./ChatModelComponent";
import { DocumentLoaderNodeComponent } from "./DocumentLoaderComponent";
import { EmbeddingNodeComponent } from "./EmbeddingComponent";
import { BaseNode } from "./interfaces/BaseNode";
import { ChatModelNodeProps, NodeProps } from "./interfaces/NodeProps";
import { OutputNodeComponent } from "./OutputNodeComponent";
import { RetrievalQAComponent } from "./RetrievalQAComponent";
import { RetrieverNodeComponent } from "./RetrieverComponent";
import { SystemInstructionNodeComponent } from "./SystemInstructionComponent";
import { TextSplitterNodeComponent } from "./TextSplitterComponent";
import { VectorStoreNodeComponent } from "./VectorStoreComponent";

const NodeRenderer = (props: any) => {
    switch(props.node.type) {
        case 'output':
            return <OutputNodeComponent {...props} />
        case 'chatModel':
            return <ChatModelNodeComponent {...props} />
        case 'systemInstruction':
            return <SystemInstructionNodeComponent {...props}/>
        case 'documentLoader':
            return <DocumentLoaderNodeComponent {...props}/>
        case 'textSplitter':
            return <TextSplitterNodeComponent {...props}/>
        case 'retriever':
            return <RetrieverNodeComponent {...props}/>
        case 'retrievalQA':
            return <RetrievalQAComponent {...props}/>
        case 'embedding':
            return <EmbeddingNodeComponent {...props}/>
        case 'vectorStore':
            return <VectorStoreNodeComponent {...props}/>
    }
}

export default NodeRenderer