// "use client";

import React, { useRef } from "react"
import { NodeProps } from "./interfaces/NodeProps";
import { BaseNode } from "./interfaces/BaseNode";
import { ChatModelNode } from "./interfaces/ChatModelNode";

export const OutputNodeComponent = ({node, onMouseEnterInput, onMouseLeaveInput, onMouseDownOutput, selected, x, y, onMouseDownNode} : NodeProps) => {
  const handleMouseEnterInput = (ref: any, inputKey: string) => {
    const centerX = ref.getBoundingClientRect().left + Math.abs(ref.getBoundingClientRect().right - ref.getBoundingClientRect().left) / 2
    const centerY = ref.getBoundingClientRect().top + Math.abs(ref.getBoundingClientRect().bottom - ref.getBoundingClientRect().top) / 2
    onMouseEnterInput(centerX, centerY, node.id, inputKey)
  }

  const handleMouseLeaveInput = (inputKey: string) => {
    
    onMouseLeaveInput(node.id, inputKey)
  }

  const handleMouseDownOutput = (ref: any, event: any, outputKey: string) => {
    event.stopPropagation()
    console.log("MOUSE LEFT")
    const centerX = ref.getBoundingClientRect().left + Math.abs(ref.getBoundingClientRect().right - ref.getBoundingClientRect().left) / 2
    const centerY = ref.getBoundingClientRect().top + Math.abs(ref.getBoundingClientRect().bottom - ref.getBoundingClientRect().top) / 2
    onMouseDownOutput(centerX, centerY, node.id, outputKey)
  }

  return (
    <div className={selected ? "node-selected w-[200px] h-auto" : "node w-[200px] h-auto"}
      style={{ transform: `translate(${x}px, ${y}px)` }}
      onMouseDown={(event: any) => {
        event.stopPropagation()
        onMouseDownNode(node.id, event)
      }}
    >
        <div className="text-xs px-2 py-2 space-y-3">
          <h2 className="text-md font-bold">OUTPUT</h2>
          {/* A Text + Node Input */}
          <div className="relative">
            <div className="input-wrapper">
              <div
                // key={index}
                ref={(el) => { }}
                className="input"
                onMouseEnter={(event) => handleMouseEnterInput(event.currentTarget, 'chatResponse')}
                onMouseLeave={() => handleMouseLeaveInput('chatResponse')}
              >
              </div>
            </div>
            <p>Chat Model <span className="text-red-600">*</span></p>
          </div>
          <div className="relative">
            <div className="input-wrapper">
              <div
                // key={index}
                ref={(el) => { }}
                className="input"
                onMouseEnter={(event) => handleMouseEnterInput(event.currentTarget, 'document')}
                onMouseLeave={() => handleMouseLeaveInput('document')}
              >
              </div>
            </div>
            <p>Document</p>
          </div>

          {/* A Text + Node Output */}
          {/* <div className="relative">
            <div className="output-wrapper">
              <div
                // key={index}
                ref={(el) => { }}
                className="output"
                onMouseDown={(event) => handleMouseDownOutput(event.currentTarget, event, 'asdfadsf')}
              >
              </div>
            </div>
            <p className="text-end">Open AI Base</p>
          </div> */}
        </div>
    </div>
  )
};