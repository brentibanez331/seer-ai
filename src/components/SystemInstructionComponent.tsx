// "use client";

import React, { useRef, useState } from "react"
import { SystemInstructionNodeProps } from "./interfaces/NodeProps";
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

export const SystemInstructionNodeComponent = ({
    node,
    onMouseDownOutput,
    selected,
    x,
    y,
    onMouseDownNode,
    onParameterChange }: SystemInstructionNodeProps & { node: SystemInstructionNode }) => {
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

    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className={selected ? "node-selected w-[250px] h-auto" : "node w-[250px] h-auto"}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            onMouseDown={(event: any) => {
                event.stopPropagation()
                onMouseDownNode(node.id, event)
            }}
        >
            <div className="text-xs px-2 py-2">
                <div className="flex justify-between">
                    <h2 className="text-md font-bold">System Instruction</h2>

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

                <div className="py-4 space-y-3">
                    {node.parameters.instruction ? (
                        <p className="line-clamp-2">{node.parameters.instruction}</p>
                    ) : (
                        <p className="line-clamp-2 text-gray-500 italic">No instructions set</p>
                    )}

                    <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(!isModalOpen)}>
                        <DialogTrigger asChild>
                            <button className="w-full text-white bg-neutral-900 py-2 px-2 rounded-md flex items-center justify-center gap-2">
                                <FaEdit />
                                Edit Instructions
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] sm:h-3/5 p-0 flex flex-col rounded-lg overflow-hidden gap-0">
                            <DialogHeader className="p-4 sticky">
                                <DialogTitle>System Instruction</DialogTitle>
                                <DialogDescription>
                                    Optional tone and style for the model
                                </DialogDescription>
                            </DialogHeader>
                            <div className="px-4 h-full pb-4">
                                <Textarea className="h-full" placeholder="Type your instruction here..." onChange={handleInstructionChange} value={node.parameters.instruction} />
                            </div>
                            <Button className="mx-4 mb-4" onClick={() => setIsModalOpen(false)}>
                                Done
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="relative">
                    <div className="output-wrapper">
                        <div
                            ref={(el) => { }}
                            className="output"
                            onMouseDown={(event) => handleMouseDownOutput(event.currentTarget, event, "systemInstruction")}
                        >
                        </div>
                    </div>
                    <p className="text-end">Instruction</p>
                </div>
            </div>
        </div>
    )
};
