import { BaseNode } from "./BaseNode"

export interface TextSplitterNode extends BaseNode{
  type: "textSplitter"
  parameters: {
      name: string
      chunk_size: number
      chunk_overlap: number
      filePath: string | null
  }
  inputs: {
      prompt: string
  }
  outputs: {
      response: string
  }
}