import { BaseNode } from "../interfaces/BaseNode";
import { ChatModelNode } from "../interfaces/ChatModelNode";
export const createChatModelNode = (
  id: string,
  position: { x: number; y: number },
  chatModel: string,
  modelTypes: string[]
): ChatModelNode => {
  return {
    id,
    type: "chatModel",
    modelType: modelTypes[0],
    modelTypes,
    chatModel,
    parameters: {
      model: modelTypes[0],
      temperature: 0.7,
    },
    prevPosition: { x: position.x, y: position.y },
    currPosition: { x: position.x, y: position.y },
    inputs: {
      prompt: "",
    },
    outputs: {
      response: "",
    },
  };
};
