"use client"

import { useEffect, useRef, useState } from "react";
import { CiTrash } from "react-icons/ci";
import { IoMdAdd } from "react-icons/io";
import { ButtonProps } from "./interfaces/ButtonProps";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { IoSend } from "react-icons/io5";
import ChatModal from "./ChatModal";

export const ButtonComponent = (props: ButtonProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [numberInputs, setNumberInputs] = useState(0)
    const [numberOutputs, setNumberOutputs] = useState(0)

    const handleOnClickAdd = (event: any) => {
        event.stopPropagation()
        setIsOpen(!isOpen)

    }

    const handleOnClickAddNode = (event: any) => {
        console.log("[TRIGGER] handleOnClickAdd")
        try {
            if (numberInputs > 4 || numberInputs < 0 || numberOutputs > 4 || numberOutputs < 0) return
            setIsOpen(false);
            props.onClickAdd(numberInputs, numberOutputs)
            setNumberInputs(0)
            setNumberOutputs(0)
        } catch (e) {
            console.log(e)
        }
        event.stopPropagation()
    }

    const handleChangeNumberInputs = (event: any) => {
        setNumberInputs(Number(event.target.value))
    }

    const handleChangeNumberOutputs = (event: any) => {
        setNumberOutputs(Number(event.target.value))
    }

    return (
        <div className="button-wrapper justify-end">

            <button
                className={props.showDelete ? "buttonDelete" : "buttonDeleteHidden"}
            // onClick={props.onClickDelete}
            >
                <CiTrash />
            </button>
            <button
                className={"buttonAdd"} onClick={handleOnClickAdd}>
                <IoMdAdd />
            </button>

            <div className={isOpen ? "dropdown" : "dropdownHidden"}>
                <label className="text-sm font-medium leading-6 text-[#27272a]">Number of Inputs</label>
                <input className="input-field" type="number" value={numberInputs} onInput={handleChangeNumberInputs}></input>
                <label className="text-sm font-medium leading-6 text-[#27272a]">Number of Outputs</label>
                <input className="input-field" type="number" value={numberOutputs} onInput={handleChangeNumberOutputs}></input>
                <button className="transition ease-in p-3 rounded-md text-white bg-black cursor-pointer shadow-md outline-none" onClick={handleOnClickAddNode}>
                    Add Node
                </button>
            </div>
            <ChatModal
                onClickChat={props.onClickChat}
                modelId={props.modelId}
            />
        </div>
    )
}