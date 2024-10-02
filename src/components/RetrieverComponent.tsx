// "use client";

import React, { useRef, useState } from "react"
import { DocumentLoaderNodeProps, RetrieverNodeProps, SystemInstructionNodeProps } from "./interfaces/NodeProps";
import { SystemInstructionNode } from "./interfaces/SystemInstructionNode";
import { FaInfoCircle, FaEdit } from "react-icons/fa";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "./ui/button";
import { DocumentLoaderNode } from "./interfaces/DocumentLoaderNode";
import { IoEyeSharp } from "react-icons/io5";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RetrieverNode } from "./interfaces/RetrieverNode";
import { Checkbox } from "./ui/checkbox";


interface PageContent {
    page: number;
    page_content: string;
}

export const RetrieverNodeComponent = ({
    node,
    // onMouseEnterInput,
    // onMouseLeaveInput,
    onMouseDownOutput,
    selected,
    x,
    y,
    onMouseDownNode,
    onParameterChange }: RetrieverNodeProps & { node: RetrieverNode }) => {

    const handleMouseDownOutput = (ref: any, event: any, outputKey: string) => {
        event.stopPropagation()
        console.log("MOUSE LEFT")
        const centerX = ref.getBoundingClientRect().left + Math.abs(ref.getBoundingClientRect().right - ref.getBoundingClientRect().left) / 2
        const centerY = ref.getBoundingClientRect().top + Math.abs(ref.getBoundingClientRect().bottom - ref.getBoundingClientRect().top) / 2
        onMouseDownOutput(centerX, centerY, node.id, outputKey)
    }

    const handleInstructionChange = (event: any) => {
        const value = event.target.value
        // Assuming onParameterChange is available to update the parent
        onParameterChange(node.id, 'instruction', value);
    };

    return (
        <div className={selected ? "node-selected w-[250px] h-auto" : "node w-[250px] h-auto"}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            onMouseDown={(event: any) => {
                event.stopPropagation()
                onMouseDownNode(node.id, event)
            }}
        >
            <div className="h-[50px] p-2 overflow-hidden relative bg-gradient-to-b from-[#e87bf760] to-transparent to-90%">
                <img src={`retrievers_logo/${node.parameters.name}.png`} className="size-16 object-contain" />
                <div className="absolute bottom-0 left-0 w-full h-full "></div>
                {/* <div className="absolute bottom-[-10px] left-0 w-full h-full bg-gradient-to-t from-[#1c1c1c] from-30% to-transparent"></div> */}
            </div>

            <div className="text-xs px-2 py-2">
                <div className="flex justify-between">
                    <h2 className="text-md font-bold">{node.parameters.name} Retriever</h2>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <FaInfoCircle className="size-4 text-neutral-500 hover:text-neutral-600 cursor-pointer transition ease-in" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Adds System Instruction</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="py-8 space-y-4 ">
                    {node.parameters.name === "Arxiv" && (
                        <div className="space-y-3">
                            <div className="space-y-1 flex items-center justify-between">
                                <Label className="text-xs text-neutral-400">Load Max Document</Label>
                                <Input
                                    
                                    value={2}
                                    className="text-xs h-min w-[50px] text-center"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-xs w-3/4 text-neutral-400">Get Full Document</Label>
                                <Checkbox></Checkbox>
                            </div>
                        </div>

                    )}

                    {/* <button className="w-full text-white bg-neutral-900 py-2 px-2 rounded-md">
                        Edit Instructions
                    </button> */}
                    {/* <div className="space-y-1">
                        <Label className="text-xs">{node.parameters.name} File</Label>
                        <Input
                            type="file"
                            accept={node.parameters.fileFormat}
                            className="text-xs file:text-xs px-0.5 h-min"
                            onChange={handleFileChange} />
                    </div> */}
                </div>

                {/* A Text + Node Output */}
                <div className="relative">
                    <div className="output-wrapper">
                        <div
                            // key={index}
                            ref={(el) => { }}
                            className="output"
                            onMouseDown={(event) => handleMouseDownOutput(event.currentTarget, event, "document")}
                        >
                        </div>
                    </div>
                    <p className="text-end">Document</p>
                </div>
            </div>
        </div>
    )
};