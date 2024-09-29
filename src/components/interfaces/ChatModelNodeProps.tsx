export interface ChatModelNodeProps {
  id: string
  x: number
  y: number
  // numberInputs: number
  // numberOutputs: number
  selected: boolean
  onMouseDownNode: (id: string, event: any) => void
  onMouseDownOutput: (outputPositionX: number, outputPositionY: number, nodeId: string, outputIndex: number) => void
  onMouseEnterInput: (inputPositionX: number, inputPositionY: number, nodeId: string, inputIndex: number) => void
  onMouseLeaveInput: (nodeId: string, inputIndex: number) => void
}