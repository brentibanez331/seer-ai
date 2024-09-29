export interface Edge {
    id: string
    nodeStartId: string    // From Node
    nodeEndId: string      // To Node
    fromOutput: string
    fromInput: string
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