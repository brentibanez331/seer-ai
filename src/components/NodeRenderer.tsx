import { ChatModelNodeComponent } from "./ChatModelComponent";
import { DocumentLoaderNodeComponent } from "./DocumentLoaderComponent";
import { BaseNode } from "./interfaces/BaseNode";
import { ChatModelNodeProps, NodeProps } from "./interfaces/NodeProps";
import { OutputNodeComponent } from "./OutputNodeComponent";
import { SystemInstructionNodeComponent } from "./SystemInstructionComponent";

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
    }
}

export default NodeRenderer