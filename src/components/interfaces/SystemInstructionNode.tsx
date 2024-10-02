import { BaseNode } from "./BaseNode"

export interface SystemInstructionNode extends BaseNode{
  type: "systemInstruction"
  parameters: SystemInstructionParameters
}

export interface SystemInstructionParameters {
  instruction: string
}
