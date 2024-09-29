export interface Edge {
  id: string
  nodeStartId: string
  nodeEndId: string
  inputKey: string
  outputKey: string
  prevStartPosition: {
    x: number,
    y: number
  }
  currStartPosition: {
    x: number,
    y: number
  }
  prevEndPosition: {
    x: number,
    y: number
  }
  currEndPosition: {
    x: number,
    y: number
  }
}