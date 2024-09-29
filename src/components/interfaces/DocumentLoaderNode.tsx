import { BaseNode } from "./BaseNode"

export interface DocumentLoaderNode extends BaseNode{
  type: "documentLoader"
  parameters: {
      name: string
      fileFormat: string
  }
  inputs: {
      prompt: string
  }
  outputs: {
      response: string
  }
}