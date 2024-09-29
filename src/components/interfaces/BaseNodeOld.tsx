export interface BaseNodeOld {
  // Actual Node parameters
  id: string
  type: 'default' | 'chatModel' | 'output';
  inputEdgeIds: string[]
  outputEdgeIds: string[]
  // Render parameters
  prevPosition: {
    x: number;
    y: number
  }
  currPosition: {
    x: number;
    y: number
  },
}