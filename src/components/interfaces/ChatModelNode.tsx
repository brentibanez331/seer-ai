import { BaseNode } from "./BaseNode"

export interface ChatModelNode extends BaseNode{
  type: "chatModel"
  models: string[]
  parameters: {
      chatModel: string
      model: string
      temperature: number
  }
  inputs: {
      prompt: string
  }
  outputs: {
      response: string
  }
}