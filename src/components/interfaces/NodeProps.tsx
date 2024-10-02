// import { BaseNode } from "./BaseNodeOld"
import { BaseNode } from "./BaseNode"
import { ChatModelNode } from "./ChatModelNode"
import { DocumentLoaderNode } from "./DocumentLoaderNode"
import { SystemInstructionNode } from "./SystemInstructionNode"

export interface NodeProps {
  id: string
  x: number
  y: number
  selected: boolean
  onMouseDownNode: (id: string, event: any) => void
  onMouseDownOutput: (outputPositionX: number, outputPositionY: number, nodeId: string, outputKey: string) => void
  onMouseEnterInput: (inputPositionX: number, inputPositionY: number, nodeId: string, inputKey: string) => void
  onMouseLeaveInput: (nodeId: string, inputKey: string) => void
  // onChangeModelType: (id: string, modelType: string) => void;
  node: BaseNode | ChatModelNode | SystemInstructionNode | DocumentLoaderNode
}

export interface ChatModelNodeProps extends NodeProps{
  onChangeModelType: (id: string, modelType: string) => void
  onParameterChange: (id: string, parameter: string, value: any) => void
}

export interface SystemInstructionNodeProps extends NodeProps{
  onParameterChange: (id: string, parameter: string, value: any) => void
}

export interface DocumentLoaderNodeProps extends NodeProps{
  onParameterChange: (id: string, parameter: string, value: any) => void
  onFileUploaded: (file: File | null) => void; 
}

export interface TextSplitterNodeProps extends NodeProps{
  onParameterChange: (id: string, parameter: string, value: any) => void
  // onFileUploaded: (file: File | null) => void; 
  uploadedFile: File | null;
}

export interface RetrieverNodeProps extends NodeProps{
  onParameterChange: (id: string, parameter: string, value: any) => void
}

export interface EmbeddingNodeProps extends NodeProps{
  onParameterChange: (id: string, parameter: string, value: any) => void
}

export interface VectorStoreNodeProps extends NodeProps{
  onParameterChange: (id: string, parameter: string, value: any) => void
}


