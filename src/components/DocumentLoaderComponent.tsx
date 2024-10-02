// "use client";

import React, { useRef, useState } from "react"
import { DocumentLoaderNodeProps, SystemInstructionNodeProps } from "./interfaces/NodeProps";
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
import { LuFileJson2 } from "react-icons/lu";

interface PageContent {
    page: number;
    page_content: string;
}

export const DocumentLoaderNodeComponent = ({
    node,
    // onMouseEnterInput,
    // onMouseLeaveInput,
    onMouseDownOutput,
    selected,
    x,
    y,
    onMouseDownNode,
    onParameterChange, onFileUploaded }: DocumentLoaderNodeProps & { node: DocumentLoaderNode }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewContent, setPreviewContent] = useState<PageContent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false)

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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            uploadFile(selectedFile);
        }
    };

    const handleFilePathChange = (value: string) => {
        // Assuming onParameterChange is available to update the parent
        console.log("UPDATING FILE PATH")
        onParameterChange(node.id, 'filePath', value);
    };

    const uploadFile = async (fileToUpload: File) => {
        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
            const response = await fetch('http://127.0.0.1:5000/document_loader/upload_file', {
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
                onFileUploaded(fileToUpload); 

                setPreviewContent(formattedContent)

                // You might want to update the node's parameters or state here
                handleFilePathChange(result.filePath)
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
            <div className="text-xs px-2 py-2">
                <div className="flex justify-between">
                    <h2 className="text-md font-bold">{node.parameters.name} Loader</h2>

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

                <div className="py-4 space-y-4">


                    {/* <button className="w-full text-white bg-neutral-900 py-2 px-2 rounded-md">
                        Edit Instructions
                    </button> */}
                    <div className="space-y-1">
                        <Label className="text-xs">{node.parameters.name} File</Label>
                        <Input
                            type="file"
                            accept={node.parameters.fileFormat}
                            className="text-xs file:text-xs px-0.5 h-min"
                            onChange={handleFileChange} />
                    </div>

                    <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(!isModalOpen)}>
                        <DialogTrigger asChild>
                            <button className="w-full text-black bg-white py-2 px-2 rounded-md flex items-center justify-center gap-2">
                                <IoEyeSharp />
                                Preview Data
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[750px] sm:h-4/5 p-0 flex flex-col rounded-lg overflow-hidden gap-0">
                            <DialogHeader className="p-4 sticky">
                                <DialogTitle>Document Preview</DialogTitle>
                                <DialogDescription>
                                    Edit or Add information
                                </DialogDescription>
                            </DialogHeader>
                            <div className="overflow-y-auto w-[750px] overflow-x-hidden px-4 pb-4 mb-4">
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
                    <p className="text-end">Document</p>
                </div>
            </div>
        </div>
    )
};