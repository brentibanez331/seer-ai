// "use client";

import React, { useEffect, useRef, useState } from "react"
import { DocumentLoaderNodeProps, SystemInstructionNodeProps, TextSplitterNodeProps } from "./interfaces/NodeProps";
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
import { TextSplitterNode } from "./interfaces/TextSplitterNode";

interface PageContent {
    page: number;
    page_content: string;
}

export const TextSplitterNodeComponent = ({
    node,
    onMouseEnterInput,
    onMouseLeaveInput,
    onMouseDownOutput,
    selected,
    x,
    y,
    onMouseDownNode,
    onParameterChange, uploadedFile }: TextSplitterNodeProps & { node: TextSplitterNode }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewContent, setPreviewContent] = useState<PageContent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        if (uploadedFile) {
            console.log("File received in TextSplitter:", uploadedFile);

            // Call uploadFile when uploadedFile changes
            uploadFile(uploadedFile); 
        }
    }, [uploadedFile]);

    const handleMouseDownOutput = (ref: any, event: any, outputKey: string) => {
        event.stopPropagation()
        console.log("MOUSE LEFT")
        const centerX = ref.getBoundingClientRect().left + Math.abs(ref.getBoundingClientRect().right - ref.getBoundingClientRect().left) / 2
        const centerY = ref.getBoundingClientRect().top + Math.abs(ref.getBoundingClientRect().bottom - ref.getBoundingClientRect().top) / 2
        onMouseDownOutput(centerX, centerY, node.id, outputKey)
    }

    const handleMouseEnterInput = (ref: any, inputKey: string) => {
        const centerX = ref.getBoundingClientRect().left + Math.abs(ref.getBoundingClientRect().right - ref.getBoundingClientRect().left) / 2
        const centerY = ref.getBoundingClientRect().top + Math.abs(ref.getBoundingClientRect().bottom - ref.getBoundingClientRect().top) / 2
        onMouseEnterInput(centerX, centerY, node.id, inputKey)
    }

    const handleMouseLeaveInput = (inputKey: string) => {

        onMouseLeaveInput(node.id, inputKey)
    }

    const handleInstructionChange = (event: any) => {
        const value = event.target.value
        // Assuming onParameterChange is available to update the parent
        onParameterChange(node.id, 'instruction', value);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            uploadFile(selectedFile);
        }
    };

    const uploadFile = async (fileToUpload: File) => {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('chunk_size', "100");
        formData.append('chunk_overlap', "0")
        try {
            const response = await fetch('http://127.0.0.1:5000/text_splitter/document_chunk', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('File uploaded successfully:', result);
                // Update the preview content with the first page of the uploaded document
                const formattedContent = result.data.map((page: any) => ({
                    page: page.metadata.page,
                    page_content: page.page_content
                }));

                setPreviewContent(formattedContent)

                // You might want to update the node's parameters or state here
                onParameterChange(node.id, 'uploadedFile', fileToUpload.name);
            } else {
                console.error('File upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div className={selected ? "node-selected w-[250px] h-auto" : "node w-[250px] h-auto"}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            onMouseDown={(event: any) => {
                event.stopPropagation()
                onMouseDownNode(node.id, event)
            }}
        >
            <div className="text-xs px-2 py-2 space-y-4">
                <div className="flex justify-between">
                    <h2 className="text-md font-bold">{node.parameters.name}</h2>

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

                {/* A Text + Node Input */}
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

                <div className="py-2 space-y-4">
                    <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(!isModalOpen)}>
                        <DialogTrigger asChild>
                            <button className="w-full bg-white py-2 px-2 rounded-md flex items-center justify-center gap-2 text-black">
                                <IoEyeSharp />
                                Preview Data
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[750px] sm:h-4/5 p-0 flex flex-col rounded-lg overflow-hidden gap-0">
                            <DialogHeader className="p-4 sticky">
                                <DialogTitle>{node.parameters.name} Preview</DialogTitle>
                                <DialogDescription>
                                    Edit or Add information
                                </DialogDescription>
                            </DialogHeader>
                            <div className="overflow-y-auto w-[750px] overflow-x-hidden pb-4 px-4 mb-4">
                                {previewContent.length > 0 && (
                                    <div>
                                        {previewContent.map((pageData, index) => (
                                            <div key={index} className="border-b border-neutral-400 space-y-2 py-4">
                                                <p className="text-sm">Page {pageData.page}</p>
                                                <p className="text-sm text-neutral-400">{pageData.page_content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* <div className="px-4 h-full pb-4">
                                <Textarea className="h-full" placeholder="Type your instruction here..." onChange={handleInstructionChange} value={node.parameters.instruction} />
                            </div> */}
                            <div className="grid grid-cols-2 mx-4 gap-4">
                                <Button className="mb-4 bg-transparent text-white hover:bg-neutral-700 hover:text-white" variant={"outline"} onClick={() => setIsModalOpen(false)}>
                                    Discard Changes
                                </Button>
                                <Button className="mb-4 text-black hover:bg-neutral-200" onClick={() => setIsModalOpen(false)}>
                                    Apply
                                </Button>
                            </div>

                        </DialogContent>
                    </Dialog>
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
                    <p className="text-end">Document Chunks</p>
                </div>
            </div>
        </div>
    )
};