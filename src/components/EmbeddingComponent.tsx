// "use client";

import React, { useRef } from "react"
import { EmbeddingNodeProps } from "./interfaces/NodeProps";
import { Slider } from "./ui/slider";
import { EmbeddingNode } from "./interfaces/EmbeddingNode";

export const EmbeddingNodeComponent = ({
    node,
    onMouseEnterInput,
    onMouseLeaveInput,
    onMouseDownOutput,
    selected,
    x,
    y,
    onMouseDownNode,
    onParameterChange }: EmbeddingNodeProps & { node: EmbeddingNode }) => {
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
        <div className={selected ? "node-selected w-[250px] h-auto" : "node w-[250px] h-auto"}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            onMouseDown={(event: any) => {
                event.stopPropagation()
                onMouseDownNode(node.id, event)
            }}
        >
            <div className="text-xs px-2 py-2 space-y-8">
                <h2 className="text-md font-bold ">{node.parameters.name} Embeddings</h2>
                

                <select
                    value={node.parameters.model}
                    // onChange={handleModelTypeChange}
                    className="border p-1 rounded bg-neutral-800 my-4 w-full"
                >
                    {node.parameters.embeddingTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>

                {/* A Text + Node Output */}
                <div className="relative">
                    <div className="output-wrapper">
                        <div
                            // key={index}
                            ref={(el) => { }}
                            className="output"
                            onMouseDown={(event) => handleMouseDownOutput(event.currentTarget, event, "embedding")}
                        >
                        </div>
                    </div>
                    <p className="text-end text-neutral-400">Embedding</p>
                </div>
            </div>
        </div>
    )
};