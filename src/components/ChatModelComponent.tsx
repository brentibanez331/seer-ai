// "use client";

import React, { useRef } from "react"
import { ChatModelNodeProps, NodeProps } from "./interfaces/NodeProps";
import { BaseNode } from "./interfaces/BaseNode";
import { ChatModelNode } from "./interfaces/ChatModelNode";
import { Slider } from "./ui/slider";

export const ChatModelNodeComponent = ({
    node,
    onMouseEnterInput,
    onMouseLeaveInput,
    onMouseDownOutput,
    selected,
    x,
    y,
    onMouseDownNode,
    onParameterChange }: ChatModelNodeProps & { node: ChatModelNode }) => {
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

    const handleModelTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        // onChangeModelType(node.id, event.target.value);
        onParameterChange(node.id, 'model', event.target.value)
    };


    const handleTemperatureChange = (value: number[]) => {
        // Assuming onParameterChange is available to update the parent
        onParameterChange(node.id, 'temperature', value[0]);
    };

    return (
        <div className={selected ? "node-selected w-[200px] h-auto" : "node w-[200px] h-auto"}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            onMouseDown={(event: any) => {
                event.stopPropagation()
                onMouseDownNode(node.id, event)
            }}
        >
            <div className="h-[50px] p-2 overflow-hidden relative bg-gradient-to-b from-[#e87bf760] to-transparent to-90%">
                <img src={`chatmodels_logo/${node.parameters.chatModel}.png`} className="size-16"/>
                <div className="absolute bottom-0 left-0 w-full h-full "></div>
                {/* <div className="absolute bottom-[-10px] left-0 w-full h-full bg-gradient-to-t from-[#1c1c1c] from-30% to-transparent"></div> */}
            </div>

            <div className="text-xs px-2 py-2 space-y-4">
                <h2 className="text-md font-bold uppercase">{node.parameters.chatModel} CHAT MODEL</h2>
                {/* A Text + Node Input */}
                <div className="relative">
                    <div className="input-wrapper">
                        <div
                            // key={index}
                            ref={(el) => { }}
                            className="input"
                            onMouseEnter={(event) => handleMouseEnterInput(event.currentTarget, "systemInstruction")}
                            onMouseLeave={() => handleMouseLeaveInput("systemInstruction")}
                        >
                        </div>
                    </div>
                    <p className="text-neutral-400">System Instruction</p>
                </div>

                <select
                    value={node.parameters.model}
                    onChange={handleModelTypeChange}
                    className="border p-1 rounded bg-neutral-800 my-4 w-full"
                >
                    {node.parameters.models.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>

                <div className="pb-4 space-y-3 text-neutral-400">
                    <div className="flex justify-between">
                        <p>Temperature</p>
                        <p>{node.parameters.temperature}</p>
                    </div>

                    <Slider
                        defaultValue={[node.parameters.temperature]}
                        max={1}
                        step={0.1}
                        onValueChange={handleTemperatureChange}>
                    </Slider>
                </div>

                {/* A Text + Node Output */}
                <div className="relative">
                    <div className="output-wrapper">
                        <div
                            // key={index}
                            ref={(el) => { }}
                            className="output"
                            onMouseDown={(event) => handleMouseDownOutput(event.currentTarget, event, "chatResponse")}
                        >
                        </div>
                    </div>
                    <p className="text-end text-neutral-400">{node.parameters.chatModel} Base</p>
                </div>
            </div>
        </div>
    )
};