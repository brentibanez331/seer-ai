// "use client";

import React, { useRef } from "react"
import { NodeProps } from "./interfaces/NodeProps";
import { BaseNode } from "./interfaces/BaseNode";
import { ChatModelNode } from "./interfaces/ChatModelNode";

export const NodeComponent = (props: NodeProps) => {
  const handleMouseEnterInput = (ref: any, inputIndex: number) => {
    const centerX = ref.getBoundingClientRect().left + Math.abs(ref.getBoundingClientRect().right - ref.getBoundingClientRect().left) / 2
    const centerY = ref.getBoundingClientRect().top + Math.abs(ref.getBoundingClientRect().bottom - ref.getBoundingClientRect().top) / 2
    props.onMouseEnterInput(centerX, centerY, props.id, inputIndex)
  }

  const handleMouseLeaveInput = (inputIndex: number) => {
    props.onMouseLeaveInput(props.id, inputIndex)
  }

  const handleMouseDownOutput = (ref: any, event: any, outputIndex: number) => {
    event.stopPropagation()
    const centerX = ref.getBoundingClientRect().left + Math.abs(ref.getBoundingClientRect().right - ref.getBoundingClientRect().left) / 2
    const centerY = ref.getBoundingClientRect().top + Math.abs(ref.getBoundingClientRect().bottom - ref.getBoundingClientRect().top) / 2
    props.onMouseDownOutput(centerX, centerY, props.id, outputIndex)
  }

  const handleModelTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    props.onChangeModelType(props.id, event.target.value);
  };

  const isChatModelNode = (node: BaseNode | ChatModelNode): node is ChatModelNode => {
    return node.type === 'chatModel';
  };

  return (
    <div className={props.selected ? "node-selected w-[200px] h-auto" : "node w-[200px] h-auto"}
      style={{ transform: `translate(${props.x}px, ${props.y}px)` }}
      onMouseDown={(event: any) => {
        event.stopPropagation()
        props.onMouseDownNode(props.id, event)
      }}
    >

      {props.node.type === 'default' && (
        <div className="text-xs px-2 py-2">
          <h2 className="text-md font-bold">OUTPUT</h2>
          {/* A Text + Node Input */}
          <div className="relative">
            <div className="input-wrapper">
              <div
                // key={index}
                ref={(el) => { }}
                className="input"
                onMouseEnter={(event) => handleMouseEnterInput(event.currentTarget, 0)}
                onMouseLeave={() => handleMouseLeaveInput(0)}
              >
              </div>
            </div>
            <p>Language Model</p>
          </div>

          {/* A Text + Node Output */}
          <div className="relative">
            <div className="output-wrapper">
              <div
                // key={index}
                ref={(el) => { }}
                className="output"
                onMouseDown={(event) => handleMouseDownOutput(event.currentTarget, event, 0)}
              >
              </div>
            </div>
            <p className="text-end">Open AI Base</p>
          </div>
        </div>
      )}

      {props.node.type === 'output' && (
        <div className="text-xs px-2 py-2">
          <h2 className="text-md font-bold">OUTPUT</h2>
          {/* A Text + Node Input */}
          <div className="relative">
            <div className="input-wrapper">
              <div
                // key={index}
                ref={(el) => { }}
                className="input"
                onMouseEnter={(event) => handleMouseEnterInput(event.currentTarget, 0)}
                onMouseLeave={() => handleMouseLeaveInput(0)}
              >
              </div>
            </div>
            <p>Language Model</p>
          </div>

          {/* A Text + Node Output */}
          <div className="relative">
            <div className="output-wrapper">
              <div
                // key={index}
                ref={(el) => { }}
                className="output"
                onMouseDown={(event) => handleMouseDownOutput(event.currentTarget, event, 0)}
              >
              </div>
            </div>
            <p className="text-end">Open AI Base</p>
          </div>
        </div>
      )}

      {isChatModelNode(props.node) && (
        <div className="text-xs px-2 py-2">
          <h2 className="text-md font-bold">CHAT MODEL</h2>
          {/* A Text + Node Input */}
          <div className="relative">
            <div className="input-wrapper">
              <div
                // key={index}
                ref={(el) => { }}
                className="input"
                onMouseEnter={(event) => handleMouseEnterInput(event.currentTarget, 0)}
                onMouseLeave={() => handleMouseLeaveInput(0)}
              >
              </div>
            </div>
            <p>Language Model</p>
          </div>

          <select
            value={props.node.modelType}
            onChange={handleModelTypeChange}
            className="border p-1 rounded my-4 w-full"
          >
            {props.modelTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          A Text + Node Output
          <div className="relative">
            <div className="output-wrapper">
              <div
                // key={index}
                ref={(el) => { }}
                className="output"
                onMouseDown={(event) => handleMouseDownOutput(event.currentTarget, event, 0)}
              >
              </div>
            </div>
            <p className="text-end">{props.node.chatModel} Base</p>
          </div>
        </div>
        <></>
      )
      }
    </div>
  )
};



// <div className={props.selected ? "node-selected w-[100px] h-[100px]" : "node w-[100px] h-[100px]"}
//   style={{ transform: `translate(${props.x}px, ${props.y}px)` }}
//   onMouseDown={(event: any) => {
//     event.stopPropagation()
//     props.onMouseDownNode(props.id, event)
//   }}>
//   <div className="input-wrapper">
//     {Array.from({ length: props.numberInputs }, (_, index) => (
//       <div
//         key={index}
//         ref={(el) => { }}
//         className="input"
//         onMouseEnter={(event) => handleMouseEnterInput(event.currentTarget, index)}
//         onMouseLeave={() => handleMouseLeaveInput(index)}
//       >
//       </div>
//     ))}
//   </div>
//   <div className="text-xs space-y-2.5 px-1.5">
//     <p>Document</p>
//     <p>Memory</p>
//     <p className="text-end">Output</p>
//   </div>

//   <div className="output-wrapper">
//     {Array.from({ length: props.numberOutputs }, (_, index) => (
//       <div
//         key={index}
//         ref={(el) => {
//           if (el) {
//             outputRefs.current[index] = el;
//           }
//         }}
//         className="output"
//         onMouseDown={(event: any) => handleMouseDownOutput(outputRefs.current[index], event, index)}
//       >
//       </div>
//     ))}
//   </div>
// </div>