import { BaseNode } from "./BaseNode"

export interface ChatModelNode extends BaseNode {
    type: "chatModel"    
    parameters: ChatModelParameters
}

export interface ChatModelParameters {
    models: string[];         
    chatModel: string;        
    model: string;            
    temperature: number;
}

