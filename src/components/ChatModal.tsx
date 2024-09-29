import { useEffect, useRef, useState } from "react";
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

interface ChatModalProps {
    // Define any props needed
    onClickChat: () => void,
    modelId: string | null
}

const ChatModal: React.FC<ChatModalProps> = (props) => {
    const [messages, setMessages] = useState<{ role: string; message: string }[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null);



    useEffect(() => {
        if (isModalOpen) {
            // Make your API request here
            // Example:
            // fetch("/api/chat")
            //     .then((response) => response.json())
            //     .then((data) => setMessages(data));
            props.onClickChat()
        }
    }, [isModalOpen]);

    const promptModel = async (prompt: string) => {
        if(!props.modelId) {
            console.error("Model ID is missing")
            return
        }

        console.log(prompt)

        try {
            const response = await fetch(`http://127.0.0.1:5000/prompt_model/${props.modelId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: prompt
                })
            })

            if (!response.ok) {
                const errorDetail = await response.text();
                console.log(`${response.status} - ${errorDetail}`)
                throw new Error(`Error: ${response.status} - ${errorDetail}`);
            }

            const responseData = await response.json(); // Parsing the JSON response
            console.log("RESPONSE BODY", responseData);
            return responseData["response"]
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            throw error
        }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isModalOpen]);

    const handleOnSendMessage = async () => {
        if (newMessage.trim() === "") return;

        setMessages((prevMessages) => [
            { role: "user", message: newMessage },
            ...prevMessages,
        ]);
        const temp = newMessage
        setNewMessage("");

        const modelMessage = await promptModel(temp)

        if(modelMessage !== ""){
            setMessages((prevMessages) => [
                { role: "model", message: modelMessage },
                ...prevMessages,
            ]);
        }
        
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(event.target.value);
    };



    return (
        <div className="buttonChat">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                    <IoChatboxEllipsesOutline />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] sm:h-4/5 p-0 flex flex-col rounded-lg overflow-hidden gap-0">
                    <DialogHeader className="p-4 sticky">
                        <DialogTitle>Chat with your LLM</DialogTitle>
                        <DialogDescription>
                            Test your model here
                        </DialogDescription>
                    </DialogHeader>
                    {/* <div className="bg-white p-4 h-min sticky top-0 z-10">
                        <DialogTitle>Chat with your LLM</DialogTitle>
                    </div> */}
                    <div className="bg-neutral-100 flex-1 flex-col-reverse overflow-y-auto text-sm">
                        <div className="flex flex-col-reverse p-3">
                            <div ref={messagesEndRef} />
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
                                    <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'ml-auto bg-blue-400 text-white' : 'mr-auto bg-neutral-200'} w-fit max-w-[75%]`}>
                                        <p>{msg.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-neutral-100 p-3 sticky bottom-0 flex items-center space-x-5 z-10">
                        <Input className="rounded-lg" value={newMessage} onChange={handleInputChange} onKeyPress={(e) => e.key === 'Enter' && handleOnSendMessage()} />
                        <IoSend className="size-7 hover:opacity-80 transition ease-in-out cursor-pointer" onClick={handleOnSendMessage} />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ChatModal;
