import { BaseNode } from "./BaseNode"

export interface SystemInstructionNode extends BaseNode{
  type: "systemInstruction"
  parameters: {
      instruction: string
  }
  inputs: null,
  outputs: {
      instruction: string
  }
}