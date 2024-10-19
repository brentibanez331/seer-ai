"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { ButtonComponent } from "./Button";
// import { NodeComponent } from "./NodeComponent";
import { EdgeComponent } from "./EdgeComponent";
import { BaseNode } from "./interfaces/BaseNode";
import { Edge } from "./interfaces/Edge";
import { RxCaretUp, RxCaretDown } from "react-icons/rx";
// import { ChatModelNodeComponent } from "./ChatModelComponent";
import { NodeComponent } from "./NodeComponent";
import { ChatModelNode, ChatModelParameters } from "./interfaces/ChatModelNode";
import NodeRenderer from "./NodeRenderer";
import { ApiNode, ApiNodeDataContainer } from "./interfaces/NodeData";
import { SystemInstructionNode, SystemInstructionParameters } from "./interfaces/SystemInstructionNode";
import { DocumentLoaderNode, DocumentLoaderParameters } from "./interfaces/DocumentLoaderNode";
import { TextSplitterNode, TextSplitterParameters } from "./interfaces/TextSplitterNode";
import { FaCogs, FaAssistiveListeningSystems, FaFileAlt } from "react-icons/fa";
import { LuFileJson2 } from "react-icons/lu";
import { BsFiletypeCsv, BsFiletypeHtml, BsFiletypeJson, BsFiletypePdf } from "react-icons/bs";
import { FaFileCode, FaFileCsv, FaFilePdf } from "react-icons/fa6";
import { Input } from "./ui/input";
import { FaSearch } from "react-icons/fa";
import { RetrieverNode, RetrieverParameters } from "./interfaces/RetrieverNode";
import { EmbeddingNode, EmbeddingParameters } from "./interfaces/EmbeddingNode";
import { VectorStoreNode } from "./interfaces/VectorStoreNode";
import { Node } from "./interfaces/NodeUnion";
import { motion, AnimatePresence } from 'framer-motion';


const CHAT_MODELS = [
  {
    name: "OpenAI",
    modelTypes: ["gpt-3", "gpt-4"]
  },
  {
    name: "GoogleAI",
    modelTypes: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro", "gemini-1.0-flash"]
  },
  {
    name: "Anthropic",
    modelTypes: ["ant-sonnet", "ant-opus"]
  },
  {
    name: "HuggingFace",
    modelTypes: []
  },
  {
    name: "Ollama",
    modelTypes: ["llama3", "llama3.1", "gemma", "qwen", "qwen2", "mistral"]
  },
  {
    name: "MistralAI",
    modelTypes: ["mistral-large-latest", "mistral-small-latest", "codestral-latest", "mistral-embed"]
  }
];

const DOCUMENT_LOADERS = [
  {
    name: "CSV",
    fileFormat: ".csv"
  },
  {
    // Unstructured
    name: "HTML",
    fileFormat: ".html"
  },
  {
    name: "PDF",
    fileFormat: ".pdf",
    package: "PyPDFLoader"
  },
  {
    name: "JSON",
    fileFormat: ".json"
  },
  {
    name: "Markdown",
    fileFormat: ".md"
  }
]

const TEXT_SPLITTERS = [
  {
    name: "HTMLHeaderSplitter"
  },
  {
    name: "HTMLSectionSplitter"
  },
  {
    name: "CharacterTextSplitter"
  },
  {
    name: "MarkdownHeaderTextSplitter"
  },
  {
    name: "RecursiveJsonSplitter"
  },
  {
    name: "SemanticChunker"
  },
]

const VECTOR_STORES = [
  {
    name: "Chroma"
  },
  {
    name: "FAISS"
  },
  {
    name: "InMemory"
  },
]

const AGENTS = [
  {
    name: "JSON Chat Agent"
  },
  {
    name: "OPENAI Functions Agent"
  },
  {
    name: "OPENAI Tools Agent"
  },
  {
    name: "React Agent"
  },
  {
    name: "Self Ask With Search"
  },
  {
    name: "Structured Chat Agent"
  },
  {
    name: "Tool Calling Agent"
  },
  {
    name: "XML Agent"
  },
]

const RETRIEVERS = [
  {
    name: "Arxiv",
    description: "Scholarly articles on arxiv.org"
  },
  {
    name: "TavilySearchAPI",
    description: "Internet search"
  },
  {
    name: "Wikipedia",
    description: "Wikipedia articles"
  }
]

const EMBEDDINGS = [
  {
    name: "AzureOpenAI",
    package: "from langchain_openai import AzureOpenAIEmbeddings",
    embeddingTypes: ["text-embedding-3-large", "text-embedding-3-small", "text-embedding-ada-002"]
  },
  {
    name: "Ollama",
    package: "from langchain_ollama import OllamaEmbeddings",
    embeddingTypes: ["mxbai-embed-large", "nomic-embed-text", "all-minilm"]
  },
  {
    name: "AI21",
    package: "from langchain_ai21 import AI21Embeddings",
    embeddingTypes: []
  },
  {
    name: "OpenAI",
    package: "from langchain_openai import OpenAIEmbeddings",
    embeddingTypes: ["text-embedding-3-small", "text-embedding-3-large", "text-embedding-ada-002"]
  },
  {
    name: "GoogleGenerativeAI",
    package: "from langchain_google_genai import GoogleGenerativeAIEmbeddings",
    embeddingTypes: ["models/embedding-001"]
  }
]

type DragData = {
  type: BaseNode['type'];
  name: string;
};

export const Board = () => {
  const [grabbingBoard, setGrabbingBoard] = useState<boolean>(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [clickedPosition, setClickedPosition] = useState<{ x: number, y: number }>({ x: -1, y: -1 });

  const [newEdge, setNewEdge] = useState<Edge | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [copiedNode, setCopiedNode] = useState<BaseNode | null>(null);
  const [edges, setEdges] = useState<Edge[]>([])

  const [scale, setScale] = useState<number>(1);
  const [isScaling, setIsScaling] = useState(false);
  const initialScaleRef = useRef(1);

  const [nodeFlow, setNodeFlow] = useState<BaseNode[]>([])

  const [modelId, setModelId] = useState<string | null>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUploaded = (file: File | null) => {
    setUploadedFile(file);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  // let node_data: { node_data: { nodes: { id: string; type: "default" | "chatModel" | "output"; parameters: Record<string, any> | null; inputs: Record<string, string>; outputs: Record<string, string> | null; }[]; edges: { nodeStartId: string; nodeEndId: string; inputKey: string; outputKey: string; }[]; }; };
  let node_data: ApiNodeDataContainer
  const [insideInput, setInsideInput] = useState<{
    nodeId: string,
    inputKey: string,
    positionX: number,
    positionY: number
  } | null>(null)

  const boardRef = useRef<HTMLDivElement>(null);
  const boardWrapperRef = useRef<HTMLDivElement>(null);


  useEffect(() => {

    // Call API to retrieve landing page

    const outputNodeId = `node_${Math.random().toString(36).substring(2, 8)}`
    const outputNode: Node = {
      id: outputNodeId,
      type: "output",
      prevPosition: { x: window.innerWidth - 400, y: 250 },
      currPosition: { x: window.innerWidth - 400, y: 250 },
      inputs: {
        response: "chatResponse",
        document: "document",
        parser: "outputParser"
      },
      outputs: null,
      parameters: null
    };

    setNodes([outputNode]);
  }, [])

  useEffect(() => {
    const boardElement = boardRef.current;

    if (boardElement) {
      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();

        if (!isScaling) {
          setIsScaling(true)
          initialScaleRef.current = scale;
        }

        const newScale = initialScaleRef.current + event.deltaY * -0.0005;
        const restrictedScale = Math.min(Math.max(1, newScale), 2);

        setScale(restrictedScale);
        boardElement.style.transition = "transform 0.1s ease";

        const timeoutId = setTimeout(() => {
          setIsScaling(false);
          boardElement.style.transition = "";
        }, 100);

        return () => clearTimeout(timeoutId);
      };

      boardElement.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        boardElement.removeEventListener("wheel", handleWheel);
      };
    }
  }, [scale, isScaling]);

  useEffect(() => {
    const boardElement = boardRef.current;

    if (boardElement) {
      boardElement.style.transform = `scale(${scale})`;
      boardElement.style.marginTop = `${(scale - 1) * 50}vh`;
      boardElement.style.marginLeft = `${(scale - 1) * 50}vw`;
    }
  }, [scale]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        // handleOnClickDelete();
      }
      // else if (event.ctrlKey && (event.key === 'c' || event.key === 'v')) {
      //   event.preventDefault()
      //   if (event.key === 'c') {
      //     handleCopyNode()
      //   } else if (event.key === 'v') {
      //     handlePasteNode()
      //   }
      // }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedNode, nodes]);

  const updateNodeFlow = () => {

    // Look for the node with empty inputEdgeIds [] and if the type is "chatModel"
    // Treat it as the first node

    // RECURSIVELY:
    // Get the outputs of the current node
    // Use it to searczh for the nodeEndId
    // Search the nodes using the nodeEndId
    // Append the found node to the nodes list

    // If the outputEdgeIds of the node is empty, end the loop....

    // setNodeFlow() ???????????/


    const outputNode = nodes.find(node => node.type === "output");

    if (!outputNode) {
      console.warn('Output node not found!');
      setNodeFlow([])
      return;
    }

    // Keeps track of all visited nodes
    const visitedNodes = new Set<string>();

    // Temporary flow holder
    const flow: BaseNode[] = [];

    // // Traverse all nodes starting from the output
    const traverseFlow = (nodeId: string) => {
      if (visitedNodes.has(nodeId)) return;
      visitedNodes.add(nodeId);

      const currentNode = nodes.find(n => n.id === nodeId);
      if (currentNode) {
        flow.push(currentNode);
        const incomingEdges = edges.filter(edge => edge.nodeEndId === nodeId);

        for (const edge of incomingEdges) {
          traverseFlow(edge.nodeStartId);
        }
        // Iterate through the current node's outputs
        // if (currentNode.outputs) {
        //   for (const outputKey in currentNode.outputs) {
        //     // Find the edge that connects to this output
        //     const connectingEdge = edges.find(edge =>
        //       edge.nodeStartId === nodeId && edge.outputKey === outputKey
        //     );

        //     if (connectingEdge) {
        //       traverseFlow(connectingEdge.nodeEndId);
        //     }
        //   }
        // }
      }
    };

    traverseFlow(outputNode.id);

    // // Check if a chatModel node is connected to the output
    // const hasChatModel = flow.some(node => node.type === "chatModel");
    // if (!hasChatModel) {
    //   console.warn('No chatModel node connected to the output!');
    //   // You might want to clear the flow or handle this case differently
    //   return;
    // }

    setNodeFlow(flow.reverse());

    console.log("NODE FLOWWW: ", nodeFlow)
  }

  const handleCopyNode = () => {
    const nodeToCopy = nodes.find((node) => node.id === selectedNode)
    if (nodeToCopy) {
      setCopiedNode(nodeToCopy)
    }
  }

  const handlePasteNode = () => {
    // if (copiedNode) {
    //   const newNodeId = `node_${Math.random().toString(36).substring(2, 8)}`
    //   const newNode: BaseNode = {
    //     ...copiedNode,
    //     id: newNodeId,
    //     currPosition: {
    //       x: copiedNode.currPosition.x + 20 / scale,
    //       y: copiedNode.currPosition.y + 20 / scale
    //     },
    //     prevPosition: {
    //       x: copiedNode.currPosition.x + 20 / scale,
    //       y: copiedNode.currPosition.y + 20 / scale
    //     },
    //     inputEdgeIds: [],
    //     outputEdgeIds: []
    //   }

    //   const newEdges = [...edges]
    //   copiedNode.outputEdgeIds.forEach((edgeId) => {
    //     const edgeToCopy = edges.find((edge) => edge.id === edgeId)

    //     if (edgeToCopy) {
    //       // const newEdgeId = `edge_${newNodeId}_${edgeToCopy.outputIndex}_${edgeToCopy.nodeEndId}_${edgeToCopy.nodeEndInputIndex}`
    //       const originalEndNode = nodes.find(node => node.id === edgeToCopy!.nodeEndId);
    //       const nodeEndInputIndex = originalEndNode?.inputEdgeIds.indexOf(edgeToCopy!.id);

    //       const newEdgeId = `edge_${newNodeId}_${edgeToCopy!.outputIndex}_${edgeToCopy!.nodeEndId}_${nodeEndInputIndex}`;

    //       newEdges.push({
    //         ...edgeToCopy,
    //         id: newEdgeId,
    //         nodeStartId: newNodeId,
    //       });
    //       newNode.outputEdgeIds.push(newEdgeId);
    //     }
    //   })
    //   setEdges(newEdges);
    //   setNodes((prevNodes) => [...prevNodes, newNode]);
    // }
  }

  const handleOnMouseDownBoard = (event: React.MouseEvent) => {
    // Deselect node
    setSelectedNode(null);
    setSelectedEdge(null)
    // Start grabbing board
    setGrabbingBoard(true);
    setClickedPosition({ x: event.clientX, y: event.clientY });
  };

  const handleOnMouseUpBoard = () => {
    setClickedPosition({ x: -1, y: -1 });
    setGrabbingBoard(false);

    if (newEdge && !insideInput) {
      setNewEdge(null)
    }

    // If an edge is dragged to an input
    if (newEdge && insideInput) {
      const nodeStartId = newEdge.nodeStartId
      const nodeEndId = insideInput.nodeId

      const nodeStart = nodes.find((node) => node.id === nodeStartId)
      const nodeEnd = nodes.find((node) => node.id === nodeEndId)

      if (nodeStart && nodeEnd) {
        let edgeId = `edge_${nodeStart.id}_${newEdge.outputKey}_${nodeEnd.id}_${insideInput.inputKey}`;

        if (newEdge.outputKey !== insideInput.inputKey) {
          setNewEdge(null)
          return
        }

        console.log(newEdge.outputKey !== insideInput.inputKey)
        console.log("FROM: ", newEdge)
        console.log("TO: ", insideInput)


        // const startHasEdge = nodeStart.outputs![newEdge.outputKey] === edgeId;
        // const endHasEdge = nodeEnd.inputs![insideInput.inputKey] === edgeId;
        let startHasEdge = false;
        let endHasEdge = false;

        switch (nodeStart.type) {
          case 'chatModel':
            startHasEdge = (nodeStart.outputs as ChatModelNode['outputs'])![newEdge.outputKey] === edgeId;
            break;
          case 'retriever':
            startHasEdge = (nodeStart.outputs as RetrieverNode['outputs'])![newEdge.outputKey] === edgeId;
            break;
          case 'output':
            startHasEdge = (nodeStart.outputs as BaseNode['outputs'])![newEdge.outputKey] === edgeId;
            break;
          case 'systemInstruction':
            startHasEdge = (nodeStart.outputs as SystemInstructionNode['outputs'])![newEdge.outputKey] === edgeId;
            break;
          case 'embedding':
            startHasEdge = (nodeStart.outputs as EmbeddingNode['outputs'])![newEdge.outputKey] === edgeId;
            break;
          case 'documentLoader':
            startHasEdge = (nodeStart.outputs as DocumentLoaderNode['outputs'])![newEdge.outputKey] === edgeId;
            break;
          case 'vectorStore':
            startHasEdge = (nodeStart.outputs as VectorStoreNode['outputs'])![newEdge.outputKey] === edgeId;
            break;

          default:
            console.warn('Unhandled nodeStart type in handleOnMouseUpBoard:', nodeStart.type);
        }


        switch (nodeEnd.type) {
          case 'chatModel':
            endHasEdge = (nodeEnd.inputs as ChatModelNode['inputs'])![insideInput.inputKey] === edgeId;
            break;
          case 'retriever':
            endHasEdge = (nodeEnd.inputs as RetrieverNode['inputs'])![newEdge.inputKey] === edgeId;
            break;
          case 'output':
            endHasEdge = (nodeEnd.inputs as BaseNode['inputs'])![newEdge.inputKey] === edgeId;
            break;
          case 'systemInstruction':
            endHasEdge = (nodeEnd.inputs as SystemInstructionNode['inputs'])![newEdge.inputKey] === edgeId;
            break;
          case 'embedding':
            endHasEdge = (nodeEnd.inputs as EmbeddingNode['inputs'])![newEdge.inputKey] === edgeId;
            break;
          case 'documentLoader':
            endHasEdge = (nodeEnd.inputs as DocumentLoaderNode['inputs'])![newEdge.inputKey] === edgeId;
            break;
          case 'vectorStore':
            endHasEdge = (nodeEnd.inputs as VectorStoreNode['inputs'])![newEdge.inputKey] === edgeId;
            break;


          default:
            console.warn('Unhandled nodeStart type in handleOnMouseUpBoard:', nodeStart.type);
        }


        if (startHasEdge && endHasEdge) {
          setNewEdge(null)
          edgeId = ""
        }

        if (nodeStart.id === nodeEnd.id) {
          console.log("Similar Node Detected")
          setNewEdge(null)
          edgeId = ""
        }

        console.log(`FROM ${nodeStart.id} TO ${nodeEnd.id}`)

        if (edgeId === "") return

        updateNodeFlow()

        // setNodeFlow((prevNodeFlow) => [...prevNodeFlow, nodeEnd])


        // APPEND THE OUTPUT NODE TO THE FLOW
        // console.log(`SHOULD APPEND ${JSON.stringify(nodeEnd)}`)

        // Append the edgeId to both nodes
        // nodeStart.outputs![newEdge.outputKey] = edgeId;
        // nodeEnd.inputs![insideInput.inputKey] = edgeId;

        const boardWrapperElement = boardWrapperRef.current

        setNewEdge(null)

        setEdges((prevEdges) => [
          ...prevEdges,
          {
            ...newEdge,
            id: edgeId,
            nodeEndId: nodeEnd.id,
            inputKey: insideInput!.inputKey,
            prevStartPosition: {
              x: (newEdge.currStartPosition.x + boardWrapperElement!.scrollLeft) / scale,
              y: (newEdge.currStartPosition.x + boardWrapperElement!.scrollTop) / scale,
            },
            prevEndPosition: {
              x: (insideInput.positionX + boardWrapperElement!.scrollLeft) / scale,
              y: (insideInput.positionY + boardWrapperElement!.scrollTop) / scale
            },
            currEndPosition: {
              x: (insideInput.positionX + boardWrapperElement!.scrollLeft) / scale,
              y: (insideInput.positionY + boardWrapperElement!.scrollTop) / scale
            }
          }
        ])

        if (modelId) removeModel()
      }
    }
  }

  const handleOnMouseMove = (event: any) => {
    if (clickedPosition.x >= 0 && clickedPosition.y >= 0) {
      if (selectedNode) {
        const deltaX = event.clientX - clickedPosition.x;
        const deltaY = event.clientY - clickedPosition.y;

        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            if (node.id === selectedNode) {
              return {
                ...node,
                currPosition: {
                  x: (node.prevPosition.x + deltaX) / scale,
                  y: (node.prevPosition.y + deltaY) / scale,
                },
              };
            }
            return node;
          })
        );

        setEdges((prevEdges) =>
          prevEdges.map((edge) => {
            if (edge.nodeStartId === selectedNode) {
              return {
                ...edge,
                currStartPosition: {
                  x: (edge.prevStartPosition.x + deltaX) / scale,
                  y: (edge.prevStartPosition.y + deltaY) / scale,
                },
              };
            } else if (edge.nodeEndId === selectedNode) {
              return {
                ...edge,
                currEndPosition: {
                  x: (edge.prevEndPosition.x + deltaX) / scale,
                  y: (edge.prevEndPosition.y + deltaY) / scale,
                },
              };
            }
            return edge;
          })
        );
      } else {
        const deltaX = event.clientX - clickedPosition.x;
        const deltaY = event.clientY - clickedPosition.y;

        const boardWrapperElement = boardWrapperRef.current;
        if (boardWrapperElement) {
          boardWrapperElement.scrollBy(-deltaX, -deltaY);
          setClickedPosition({ x: event.clientX, y: event.clientY });
        }
      }
    }

    if (newEdge) {
      const boardWrapperElement = boardWrapperRef.current;
      if (boardWrapperElement) {
        setNewEdge((prevNewEdge) => ({
          ...prevNewEdge!,
          currEndPosition: {
            x: (event.clientX + boardWrapperElement.scrollLeft) / scale,
            y: (event.clientY + boardWrapperElement.scrollTop) / scale,
          },
        }));
      }
    }
  }

  const handleOnMouseDownNode = (id: string, event: MouseEvent) => {
    setSelectedNode(id);
    setSelectedEdge(null)
    setClickedPosition({ x: event.clientX, y: event.clientY });

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            prevPosition: {
              x: node.currPosition.x * scale,
              y: node.currPosition.y * scale,
            },
          };
        }
        return node;
      })
    );

    setEdges((prevEdges) =>
      prevEdges.map((edge) => {
        if (edge.nodeStartId === id) {
          return {
            ...edge,
            prevStartPosition: {
              x: edge.currStartPosition.x * scale,
              y: edge.currStartPosition.y * scale,
            },
          };
        } else if (edge.nodeEndId === id) {
          return {
            ...edge,
            prevEndPosition: {
              x: edge.currEndPosition.x * scale,
              y: edge.currEndPosition.y * scale,
            },
          };
        }
        return edge;
      })
    );
  }

  const handleOnClickSystemInstruction = () => {
    const randomX = window.innerWidth / 2 - 50
    const randomY = window.innerHeight / 2 - 100

    const newNode: SystemInstructionNode = {
      id: `node_${Math.random().toString(36).substring(2, 8)}`,
      type: "systemInstruction",

      parameters: {
        instruction: ""
      },
      inputs: null,
      outputs: {
        instruction: "systemInstruction"
      },

      prevPosition: {
        x: randomX,
        y: randomY
      },
      currPosition: {
        x: randomX,
        y: randomY
      }
    }
    // `node_${Math.random().toString(36).substring(2, 8)}`,
    // { x: randomX, y: randomY },
    // chatModelName,
    // modelTypes,
    // modelTypes[0],
    // )

    // setNodes(prevNodes => [...prevNodes, newNode])
    if (modelId) removeModel()

    console.log(nodes)
  }

  const handleOnClickDocumentLoader = (documentLoader: string, fileFormat: string) => {
    const randomX = window.innerWidth / 2 - 50
    const randomY = window.innerHeight / 2 - 100

    const newNode: DocumentLoaderNode = {
      id: `node_${Math.random().toString(36).substring(2, 8)}`,
      type: "documentLoader",
      parameters: {
        name: documentLoader,
        fileFormat: fileFormat,
        filePath: null
      },
      inputs: {
        prompt: ""
      },
      outputs: {
        response: "chatResponse"
      },

      prevPosition: {
        x: randomX,
        y: randomY
      },
      currPosition: {
        x: randomX,
        y: randomY
      }
    }

    setNodes(prevNodes => [...prevNodes, newNode])
    if (modelId) removeModel()

    console.log(nodes)
  }

  // const handleOnClickEmbedding = (embedding: string, embeddingTypes: string[]) => {
  //   const randomX = window.innerWidth / 2 - 50
  //   const randomY = window.innerHeight / 2 - 150

  //   console.log(randomX, randomY)

  //   const newNode: EmbeddingNode = {
  //     id: `node_${Math.random().toString(36).substring(2, 8)}`,
  //     type: "embedding",
  //     embeddingTypes: embeddingTypes,
  //     parameters: {
  //       name: embedding,
  //       model: embeddingTypes[0]

  //     },
  //     inputs: {
  //       prompt: ""
  //     },
  //     outputs: {
  //       response: "chatResponse"
  //     },

  //     prevPosition: {
  //       x: randomX,
  //       y: randomY
  //     },
  //     currPosition: {
  //       x: randomX,
  //       y: randomY
  //     }
  //   }
  //   // `node_${Math.random().toString(36).substring(2, 8)}`,
  //   // { x: randomX, y: randomY },
  //   // chatModelName,
  //   // modelTypes,
  //   // modelTypes[0],
  //   // )

  //   // setNodes(prevNodes => [...prevNodes, newNode])
  //   if (modelId) removeModel()

  //   console.log(nodes)
  // }

  const handleOnClickVectorStore = (vectorStore: string) => {
    const randomX = window.innerWidth / 2 - 50
    const randomY = window.innerHeight / 2 - 150

    console.log(randomX, randomY)

    const newNode: VectorStoreNode = {
      id: `node_${Math.random().toString(36).substring(2, 8)}`,
      type: 'vectorStore',
      parameters: {
        name: vectorStore,

      },
      inputs: {
        prompt: ""
      },
      outputs: {
        response: "chatResponse"
      },

      prevPosition: {
        x: randomX,
        y: randomY
      },
      currPosition: {
        x: randomX,
        y: randomY
      }
    }

    // setNodes(prevNodes => [...prevNodes, newNode])
    if (modelId) removeModel()

    console.log(nodes)
  }

  const handleOnClickTextSplitter = (textSplitter: string) => {
    const randomX = window.innerWidth / 2 - 50
    const randomY = window.innerHeight / 2 - 100

    const newNode: TextSplitterNode = {
      id: `node_${Math.random().toString(36).substring(2, 8)}`,
      type: "textSplitter",
      parameters: {
        name: textSplitter,
        filePath: null,
        chunk_size: 1000,
        chunk_overlap: 0
        // fileFormat: fileFormat
      },
      inputs: {
        prompt: ""
      },
      outputs: {
        response: "Document"
      },

      prevPosition: {
        x: randomX,
        y: randomY
      },
      currPosition: {
        x: randomX,
        y: randomY
      }
    }

    // setNodes(prevNodes => [...prevNodes, newNode])
    if (modelId) removeModel()

    console.log(nodes)
  }

  const handleOnClickRetriever = (retriever: string) => {
    const randomX = window.innerWidth / 2 - 50
    const randomY = window.innerHeight / 2 - 100

    const newNode: RetrieverNode = {
      id: `node_${Math.random().toString(36).substring(2, 8)}`,
      type: "retriever",
      parameters: {
        name: retriever,

      },
      inputs: {
        prompt: ""
      },
      outputs: {
        response: "Document"
      },

      prevPosition: {
        x: randomX,
        y: randomY
      },
      currPosition: {
        x: randomX,
        y: randomY
      }
    }

    // setNodes(prevNodes => [...prevNodes, newNode])
    if (modelId) removeModel()

    console.log(nodes)
  }

  const handleOnClickAdd = () => {
    // const randomX = window.innerWidth / 2
    // const randomY = window.innerHeight / 2

    // const newNode: BaseNode = {
    //   id: `node_${Math.random().toString(36).substring(2, 8)}`,
    //   type: "output",
    //   prevPosition: {
    //     x: randomX,
    //     y: randomY
    //   },
    //   currPosition: {
    //     x: randomX,
    //     y: randomY
    //   },
    //   inputs: {
    //     response: "chatResponse"
    //   },
    //   parameters: null,
    //   outputs: null
    // };

    // // if (nodes.length === 0) {
    // //   setNodeFlow([newNode])
    // //   // console.log("NODE FLOW", nodeFlow)
    // // }

    // setNodes(prevNodes => [...prevNodes, newNode])
    // if (modelId) removeModel()
  }

  const handleOnClickRetrievalQA = () => {
    // const randomX = window.innerWidth / 2
    // const randomY = window.innerHeight / 2

    // const newNode: BaseNode = {
    //   id: `node_${Math.random().toString(36).substring(2, 8)}`,
    //   type: "retrievalQA",
    //   prevPosition: {
    //     x: randomX,
    //     y: randomY
    //   },
    //   currPosition: {
    //     x: randomX,
    //     y: randomY
    //   },
    //   inputs: {
    //     response: "chatResponse"
    //   },
    //   parameters: null,
    //   outputs: null
    // };

    // if (nodes.length === 0) {
    //   setNodeFlow([newNode])
    //   // console.log("NODE FLOW", nodeFlow)
    // }

    // setNodes(prevNodes => [...prevNodes, newNode])
    if (modelId) removeModel()
  }

  const handleOnClickDelete = () => {
    const node = nodes.find((node) => node.id === selectedNode)

    console.log(selectedNode)

    if (!node) {
      setSelectedNode(null)
      return
    }

    console.log(`INPUT: ${node.inputs}`)
    console.log(`OUTPUT: ${node.outputs}`)

    const connectedEdges = edges.filter(
      (edge) => edge.nodeStartId === selectedNode || edge.nodeEndId === selectedNode
    )

    // Before deleting the node, delete all connections on other nodes.
    // 1. Traverse all input_nodes in the to-be deleted node...
    // 2. For every traversed input_nodes, traverse all elements in the Edges list
    // 3. For every matching Edge, get the nodeStartId and nodeEndId
    // 4. Use the nodeStartId and nodeEndId to filter the nodes
    // 5. Delete the node

    // node.inputEdgeIds.forEach((edgeId) => {
    //   const edgeToDelete = edges.find((edge) => edge.id === edgeId)
    //   if (edgeToDelete) {
    //     const connectedNode = nodes.find(
    //       (node) => node.id === edgeToDelete.nodeStartId
    //     )

    //     if (connectedNode) {
    //       connectedNode.outputEdgeIds = connectedNode.outputEdgeIds.filter(
    //         (id) => id !== edgeId
    //       )
    //     }
    //   }
    // })

    // node.outputEdgeIds.forEach((edgeId) => {
    //   const edgeToDelete = edges.find((edge) => edge.id === edgeId)
    //   if (edgeToDelete) {
    //     const connectedNode = nodes.find(
    //       (node) => node.id === edgeToDelete.nodeEndId
    //     )
    //     if (connectedNode) {
    //       connectedNode.inputEdgeIds = connectedNode.inputEdgeIds.filter(
    //         (id) => id !== edgeId
    //       )
    //     }
    //   }
    // })

    // This deletes the node
    setNodes([...nodes.filter((node) => node.id !== selectedNode)])
    // setNodeFlow([...nodeFlow.filter((node) => node.id !== selectedNode)])

    // Delete all elements starting from the selectedNode


    setEdges(edges.filter((edge) => edge.nodeStartId !== selectedNode && edge.nodeEndId !== selectedNode))
    setSelectedNode(null)
    if (modelId) removeModel()
  }



  const handleOnMouseDownOutput = (outputPositionX: number, outputPositionY: number, nodeId: string, outputKey: string) => {
    setSelectedNode(null)
    const boardWrapperElement = boardWrapperRef.current

    if (boardWrapperElement) {
      // Create New Edge Display
      setNewEdge({
        id: "",
        nodeStartId: nodeId,
        outputKey: outputKey,
        nodeEndId: "",
        inputKey: "",
        prevStartPosition: {
          x: (outputPositionX + boardWrapperElement.scrollLeft) / scale,
          y: (outputPositionY + boardWrapperElement.scrollTop) / scale
        },
        currStartPosition: {
          x: (outputPositionX + boardWrapperElement.scrollLeft) / scale,
          y: (outputPositionY + boardWrapperElement.scrollTop) / scale
        },
        prevEndPosition: {
          x: (outputPositionX + boardWrapperElement.scrollLeft) / scale,
          y: (outputPositionY + boardWrapperElement.scrollTop) / scale
        },
        currEndPosition: {
          x: (outputPositionX + boardWrapperElement.scrollLeft) / scale,
          y: (outputPositionY + boardWrapperElement.scrollTop) / scale
        }
      })
    }
  }

  const handleOnMouseEnterInput = (inputPositionX: number, inputPositionY: number, nodeId: string, inputKey: string) => {
    setInsideInput({ nodeId, inputKey, positionX: inputPositionX, positionY: inputPositionY })
  }

  const handleOnMouseLeaveInput = (nodeId: string, inputKey: string) => {
    if (!insideInput || !nodeId) return
    if (insideInput!.nodeId === nodeId && insideInput!.inputKey === inputKey) setInsideInput(null)
  }

  const handleOnMouseDownEdge = (edgeId: string) => {
    setSelectedNode(null)
    setSelectedEdge(edgeId)
  }

  const handleOnDeleteEdge = (edgeId: string) => {
    // const edge = edges.find((e) => e.id === edgeId)

    // if (edge) {
    //   setNodes((prevNodes) => prevNodes.map((node) => {
    //     if (node.id === edge.nodeStartId) {
    //       return {
    //         ...node,
    //         outputEdgeIds: node.outputEdgeIds.filter(
    //           (id) => id !== edgeId
    //         )
    //       }
    //     } else if (node.id === edge.nodeEndId) {
    //       return {
    //         ...node,
    //         inputEdgeIds: node.inputEdgeIds.filter((id) => id !== edgeId)
    //       }
    //     }
    //     return node
    //   }))

    //   setEdges((prevEdges) => prevEdges.filter((edge) => edge.id !== edgeId))
    // }
  }

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // INDEXING [0, 1, 0, 1]
  const [isChatModelsOpen, setIsChatModelsOpen] = useState<boolean>(false)
  const [isUtilsOpen, setIsUtilsOpen] = useState<boolean>(false)
  const [isDocumentLoadersOpen, setIsDocumentLoadersOpen] = useState<boolean>(false)
  const [isTextSplittersOpen, setIsTextSplittersOpen] = useState<boolean>(false)
  const [isAgentsOpen, setIsAgentsOpen] = useState<boolean>(false)
  const [isEmbeddingsOpen, setIsEmbeddingsOpen] = useState<boolean>(false)
  const [isRetrieversOpen, setIsRetrieversOpen] = useState<boolean>(false)
  const [isVectorStoresOpen, setIsVectorStoresOpen] = useState<boolean>(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[];
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const toggleChatModels = () => {
    setIsChatModelsOpen(!isChatModelsOpen);
  };

  const toggleUtils = () => {
    setIsUtilsOpen(!isUtilsOpen);
  };

  const toggleDocLoaders = () => {
    setIsDocumentLoadersOpen(!isDocumentLoadersOpen);
  };

  const toggleTextSplitters = () => {
    setIsTextSplittersOpen(!isTextSplittersOpen);
  };

  const toggleAgents = () => {
    setIsAgentsOpen(!isAgentsOpen);
  };

  const toggleEmbeddings = () => {
    setIsEmbeddingsOpen(!isEmbeddingsOpen);
  };

  const toggleRetrievers = () => {
    setIsRetrieversOpen(!isRetrieversOpen);
  };

  const toggleVectorStores = () => {
    setIsVectorStoresOpen(!isVectorStoresOpen);
  };

  const getModelTypes = (chatModel: string): string[] => {
    const model = CHAT_MODELS.find(model => model.name === chatModel);
    return model ? model.modelTypes : [];
  }

  const getEmbeddingTypes = (embeddingName: string): string[] => {
    const embedding = EMBEDDINGS.find(embedding => embedding.name === embeddingName);
    return embedding ? embedding.embeddingTypes : [];
  }

  const getFileFormat = (documentLoader: string): string => {
    const docLoader = DOCUMENT_LOADERS.find(docLoader => docLoader.name === documentLoader);
    return docLoader ? docLoader?.fileFormat : '';
  }

  // const handleOnChangeModelType = (nodeId: string, newModelType: string) => {
  //   setNodes((prevNodes) => prevNodes.map((node) => node.id === nodeId && node.type === 'chatModel'
  //     ? { ...node, modelType: newModelType }
  //     : node))

  //   console.log(nodes)
  // }

  const handleOnParameterChange = (nodeId: string, parameter: string, value: any) => {
    console.log

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === nodeId) {
          switch (node.type) {
            case 'chatModel':
              return {
                ...node,
                parameters: {
                  ...(node.parameters as ChatModelParameters), // Spread existing
                  [parameter]: value  // Update the specific property
                }
              };

            case 'documentLoader':
              return {
                ...node,
                parameters: {
                  ...(node.parameters as DocumentLoaderParameters), // Spread existing
                  [parameter]: value
                }
              };

            case 'embedding':
              return {
                ...node,
                parameters: {
                  ...(node.parameters as EmbeddingParameters), // Spread existing
                  [parameter]: value
                }
              };

            case 'retriever':
              return {
                ...node,
                parameters: {
                  ...(node.parameters as RetrieverParameters), // Spread existing
                  [parameter]: value
                }
              };

            case 'textSplitter':
              return {
                ...node,
                parameters: {
                  ...(node.parameters as TextSplitterParameters), // Spread existing
                  [parameter]: value
                }
              };

            case 'systemInstruction':
              return {
                ...node,
                parameters: {
                  ...(node.parameters as SystemInstructionParameters), // Spread existing
                  [parameter]: value
                }
              };


            // ... Add cases for other node types 

            default:
              console.warn('Unhandled node type in handleOnParameterChange:', node.type);
              return node; // Return original node for unhandled types
          }
        } else {
          return node; // Return other nodes unchanged
        }
      })
    );

    if (modelId) removeModel()
  }

  const prepareModelData = () => {
    // O(N)
    updateNodeFlow()
    console.log("NODES", nodes)
    console.log("EDGES", edges)

    const formattedNodes: ApiNode[] = nodes.map(node => ({
      id: node.id,
      type: node.type,
      parameters: node.parameters,
      inputs: node.inputs,
      outputs: node.outputs,
    }));

    const formattedEdges = edges.map(edge => ({
      nodeStartId: edge.nodeStartId,
      nodeEndId: edge.nodeEndId,
      inputKey: edge.inputKey,
      outputKey: edge.outputKey
    }));

    node_data = {
      node_data: {
        nodes: formattedNodes,
        edges: formattedEdges,
      }
    };

    console.log("NODE DATA:", JSON.stringify(node_data))
    if (modelId == null) {
      console.log("Generating a fresh model")
      generateModel()
    }
  }

  const generateModel = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/test", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(node_data)
      })


      if (!response.ok) {
        const errorDetail = await response.text();
        console.log(`${response.status} - ${errorDetail}`)
        throw new Error(`Error: ${response.status} - ${errorDetail}`);
      }

      const responseData = await response.json(); // Parsing the JSON response
      console.log("RESPONSE BODY", responseData);
      setModelId(responseData["model_id"])

    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error
    }
  }

  const removeModel = async () => {
    await deleteModel()
    setModelId(null)
  }

  const deleteModel = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/delete_model/${modelId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorDetail = await response.text();
        console.log(`${response.status} - ${errorDetail}`)
        throw new Error(`Error: ${response.status} - ${errorDetail}`);
      }

      const responseData = await response.json(); // Parsing the JSON response
      console.log("RESPONSE BODY", responseData);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error
    }
  }

  const [draggingData, setDraggingData] = useState<DragData | null>(null);


  const handleOnDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: BaseNode['type'], // Use type from BaseNode
    nodeName: string,
  ) => {
    const data: DragData = { type: nodeType, name: nodeName };
    event.dataTransfer.setData('application/json', JSON.stringify(data));
    setDraggingData(data);
  };

  const handleOnDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow drop
  };

  const handleOnDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const dataStr = event.dataTransfer.getData('application/json');
    if (!dataStr) return;

    const data: DragData = JSON.parse(dataStr);
    setDraggingData(null);

    const boardRect = event.currentTarget.getBoundingClientRect();
    const newNodePosition = {
      x: event.clientX - boardRect.left - 100,
      y: event.clientY - boardRect.top - 25,
    };

    let newNode: Node;

    switch (data.type) {
      case 'chatModel':
        newNode = {
          id: `node_${Math.random().toString(36).substring(2, 8)}`,
          type: 'chatModel',
          // name: data.name,
          currPosition: newNodePosition,
          prevPosition: { x: 0, y: 0 },
          parameters: {
            models: getModelTypes(data.name),
            chatModel: data.name,
            model: getModelTypes(data.name)[0] || '',
            temperature: 0.5,
          },
          inputs: {
            instruction: "systemInstruction"
          },
          outputs: {
            response: "chatResponse"
          },
        };
        break;

      case 'documentLoader':
        newNode = {
          id: `node_${Math.random().toString(36).substring(2, 8)}`,
          type: 'documentLoader',
          currPosition: newNodePosition,
          prevPosition: { x: 0, y: 0 },
          parameters: {
            name: data.name,
            fileFormat: getFileFormat(data.name),
            filePath: null,
          },
          inputs: null,
          outputs: { document: 'document' },
        };
        break;

      case 'embedding':
        newNode = {
          id: `node_${Math.random().toString(36).substring(2, 8)}`,
          type: 'embedding',
          currPosition: newNodePosition,
          prevPosition: { x: 0, y: 0 },
          parameters: {
            name: data.name,
            model: getEmbeddingTypes(data.name)[0],
            embeddingTypes: getEmbeddingTypes(data.name)
          },
          inputs: null,
          outputs: {
            embedding: "embedding"
          },
        };
        break;

      case 'retriever':
        newNode = {
          id: `node_${Math.random().toString(36).substring(2, 8)}`,
          type: 'retriever',
          currPosition: newNodePosition,
          prevPosition: { x: 0, y: 0 },
          parameters: {
            name: data.name,
          },
          inputs: null,
          outputs: {
            document: "document"
          },
        };
        break;

      case 'textSplitter':
        newNode = {
          id: `node_${Math.random().toString(36).substring(2, 8)}`,
          type: 'textSplitter',
          currPosition: newNodePosition,
          prevPosition: { x: 0, y: 0 },
          parameters: {
            name: data.name,
            filePath: null,
            chunk_size: 1000,
            chunk_overlap: 0
          },
          inputs: { prompt: "document" },
          outputs: { response: "document" },
        };
        break;

      case 'systemInstruction':
        newNode = {
          id: `node_${Math.random().toString(36).substring(2, 8)}`,
          type: 'systemInstruction',
          currPosition: newNodePosition,
          prevPosition: { x: 0, y: 0 },
          parameters: {
            instruction: ''
          },
          inputs: null,
          outputs: { instruction: "systemInstruction" },
        };
        break;

      case 'retrievalQA':
        newNode = {
          id: `node_${Math.random().toString(36).substring(2, 8)}`,
          type: 'retrievalQA',
          currPosition: newNodePosition,
          prevPosition: { x: 0, y: 0 },
          parameters: null,
          inputs: {
            response: "chatResponse",
            document: "document",
            parser: "outputParser",
            retriever: "retriever"
          },
          outputs: null,
        };
        break;

      case 'vectorStore':
        newNode = {
          id: `node_${Math.random().toString(36).substring(2, 8)}`,
          type: 'vectorStore',
          currPosition: newNodePosition,
          prevPosition: { x: 0, y: 0 },
          parameters: {
            name: data.name
          },
          inputs: {
            embedding: "embedding",
            document: "document",
          },
          outputs: {
            retriever: "retriever"
          },
        };
        break;

      // ... add cases for other node types

      default:
        console.warn('Invalid node type:', data.type);
        return; // Don't add an invalid node
    }

    setNodes((prevNodes) => [...prevNodes, newNode]);
    if (modelId) removeModel()
    console.log(nodes)
  };



  return (
    <div>

      <div className="fixed overflow-y-auto no-scrollbar top-20 left-8 h-[600px] bg-neutral-800 z-50 space-y-3 py-5 px-3 rounded-2xl w-1/5">
        {/* <p>Add Nodes</p> */}
        <div className="relative">
          <Input placeholder="Search Nodes" className="pl-10 rounded-lg border-neutral-600" />
          <FaSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-700"
          />
        </div>

        {/* Agents */}
        <div>
          <button
            onClick={toggleAgents}
            className="flex items-center justify-between w-full text-left px-2 py-3 rounded-lg focus:outline-none"
          >
            Agents
            <span>
              {isAgentsOpen ? (
                <RxCaretUp></RxCaretUp>
              ) : (<RxCaretDown></RxCaretDown>)}
            </span>
          </button>
          <AnimatePresence>
            {isAgentsOpen && (
              <motion.div
                className="space-y-2"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {AGENTS.map((agent) => (
                  <motion.div
                    key={agent.name}
                    onClick={(event) => { }}
                    variants={itemVariants}
                    className="border border-neutral-600 hover:bg-neutral-700 py-3 px-3 rounded-lg bg-neutral-800 cursor-pointer flex space-x-3 items-center">
                    {/* <img src={`chatmodels_logo/${agent.name}.png`} className="size-8" /> */}
                    <div className="">
                      <div
                        // Pass chatModel here
                        className="text-sm"
                      >
                        {agent.name}
                      </div>
                      {/* <div className="text-xs text-neutral-500">
                      This is a description
                    </div> */}
                    </div>

                  </motion.div>

                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CHATMODELS */}
        <div>
          <button
            onClick={toggleChatModels}
            className="flex items-center justify-between w-full text-left px-2 py-3 rounded-lg focus:outline-none"
          >
            Chat Models
            <span>
              {isChatModelsOpen ? (
                <RxCaretUp></RxCaretUp>
              ) : (<RxCaretDown></RxCaretDown>)}
            </span>
          </button>
          <AnimatePresence>
            {isChatModelsOpen && (
              <motion.div
                className="space-y-2"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden">
                {CHAT_MODELS.map((chatModel) => (
                  <motion.div variants={itemVariants}>
                    <div
                      key={chatModel.name}

                      draggable
                      onDragStart={(e) => handleOnDragStart(e, 'chatModel', chatModel.name)}
                      // onClick={(event) => handleOnClickChatModel(chatModel.name, chatModel.modelTypes)}
                      className="border border-neutral-600 hover:bg-neutral-700 py-3 px-3 rounded-lg bg-neutral-800 cursor-pointer flex space-x-3 items-center">
                      <img src={`chatmodels_logo/${chatModel.name}.png`} className="size-8" />
                      <div className="">
                        <div
                          // Pass chatModel here
                          className="text-sm"
                        >
                          {chatModel.name}
                        </div>
                        {/* <div className="text-xs text-neutral-500">
                      This is a description
                    </div> */}
                      </div>
                    </div>
                  </motion.div>

                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Document Loaders */}
        <div>
          <button
            onClick={toggleDocLoaders}
            className="flex items-center justify-between w-full text-left px-2 py-3 rounded-lg focus:outline-none"
          >
            Document Loaders
            <span>
              {isDocumentLoadersOpen ? (
                <RxCaretUp></RxCaretUp>
              ) : (<RxCaretDown></RxCaretDown>)}
            </span>
          </button>
          <AnimatePresence>
            {isDocumentLoadersOpen && (
              <motion.div
                className="space-y-2"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden">
                {DOCUMENT_LOADERS.map((documentLoader) => (
                  <motion.div variants={itemVariants}>
                    <div
                      draggable
                      key={documentLoader.name}
                      onDragStart={(e) => handleOnDragStart(e, 'documentLoader', documentLoader.name)}
                      // onClick={() => handleOnClickDocumentLoader(documentLoader.name, documentLoader.fileFormat)} // Pass chatModel here
                      className="border border-neutral-600 hover:bg-neutral-700 py-3 px-3 rounded-lg bg-neutral-800 cursor-pointer flex space-x-3 items-center"
                    >
                      {documentLoader.name === "CSV" && (
                        // <img src={`chatmodels_logo/csv.png`} className="size-8" alt="CSV Logo" />
                        <FaFileCsv className="size-7" />
                      )}
                      {documentLoader.name === "HTML" && (
                        // <img src={`chatmodels_logo/csv.png`} className="size-8" alt="CSV Logo" />
                        <FaFileCode className="size-7" />
                      )}
                      {documentLoader.name === "PDF" && (
                        // <img src={`chatmodels_logo/csv.png`} className="size-8" alt="CSV Logo" />
                        <FaFilePdf className="size-7" />
                      )}
                      {documentLoader.name === "JSON" && (
                        // <img src={`chatmodels_logo/csv.png`} className="size-8" alt="CSV Logo" />
                        <BsFiletypeJson className="size-7" />
                      )}
                      {documentLoader.name === "Markdown" && (
                        // <img src={`chatmodels_logo/csv.png`} className="size-8" alt="CSV Logo" />
                        <FaFileAlt className="size-7" />
                      )}

                      <p>{documentLoader.name} Loader</p>

                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Embeddings */}
        <div>
          <button
            onClick={toggleEmbeddings}
            className="flex items-center justify-between w-full text-left px-2 py-3 rounded-lg focus:outline-none"
          >
            Embeddings
            <span>
              {isEmbeddingsOpen ? (
                <RxCaretUp></RxCaretUp>
              ) : (<RxCaretDown></RxCaretDown>)}
            </span>
          </button>
          <AnimatePresence>
            {isEmbeddingsOpen && (
              <motion.div
                className="space-y-2"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden">
                {EMBEDDINGS.map((embedding) => (
                  <motion.div variants={itemVariants}>
                    <div
                      key={embedding.name}
                      draggable
                      onDragStart={(e) => handleOnDragStart(e, 'embedding', embedding.name)}
                      // onClick={() => handleOnClickEmbedding(embedding.name, embedding.embeddingTypes)} // Pass chatModel here
                      className="border border-neutral-600 hover:bg-neutral-700 py-3 px-3 rounded-lg bg-neutral-800 cursor-pointer flex space-x-3 items-center"
                    >
                      {embedding.name}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* Retrievers */}
        <div>
          <button
            onClick={toggleRetrievers}
            className="flex items-center justify-between w-full text-left px-2 py-3 rounded-lg focus:outline-none"
          >
            Retrievers
            <span>
              {isRetrieversOpen ? (
                <RxCaretUp></RxCaretUp>
              ) : (<RxCaretDown></RxCaretDown>)}
            </span>
          </button>
          <AnimatePresence>
            {isRetrieversOpen && (
              <motion.div
                className="space-y-2"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden">
                {RETRIEVERS.map((retriever) => (
                  <motion.div variants={itemVariants}>
                    <div
                      key={retriever.name}
                      draggable
                      // onClick={() => handleOnClickRetriever(retriever.name)} // Pass chatModel here
                      onDragStart={(e) => handleOnDragStart(e, 'retriever', retriever.name)}
                      className="border border-neutral-600 hover:bg-neutral-700 py-3 px-3 rounded-lg bg-neutral-800 cursor-pointer flex space-x-3 items-center"
                    >
                      <img src={`retrievers_logo/${retriever.name}.png`} className="size-8 object-contain" />
                      <div className="">
                        <div
                          // Pass chatModel here
                          className="text-sm"
                        >
                          {retriever.name}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {retriever.description}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* Text Splitters */}
        <div>
          <button
            onClick={toggleTextSplitters}
            className="flex items-center justify-between w-full text-left px-2 py-3 rounded-lg focus:outline-none"
          >
            Text Splitters
            <span>
              {isTextSplittersOpen ? (
                <RxCaretUp></RxCaretUp>
              ) : (<RxCaretDown></RxCaretDown>)}
            </span>
          </button>
          <AnimatePresence>
            {isTextSplittersOpen && (
              <motion.div
                className="space-y-2"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden">
                {TEXT_SPLITTERS.map((textSplitter) => (
                  <motion.div variants={itemVariants}>
                    <div
                      key={textSplitter.name}
                      draggable
                      onDragStart={(e) => handleOnDragStart(e, 'textSplitter', textSplitter.name)}
                      // onClick={() => handleOnClickTextSplitter(textSplitter.name)} // Pass chatModel here
                      className="border border-neutral-600 hover:bg-neutral-700 py-3 px-3 rounded-lg bg-neutral-800 cursor-pointer flex space-x-3 items-center"
                    >
                      {textSplitter.name}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* UTILITIES */}
        <div>
          <button
            onClick={toggleUtils}
            className="flex items-center justify-between w-full text-left px-2 py-3 rounded-lg focus:outline-none"
          >
            Utilities
            <span>
              {isUtilsOpen ? (
                <RxCaretUp></RxCaretUp>
              ) : (<RxCaretDown></RxCaretDown>)}
            </span>
          </button>
          <AnimatePresence>
            {isUtilsOpen && (
              <motion.div
                className="space-y-2"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden">
                {/* {CHAT_MODELS.map((chatModel) => (

                <div
                  key={chatModel.name}
                  onClick={() => handleOnClickChatModel(chatModel.name, chatModel.modelTypes)} // Pass chatModel here
                  className="border-2 py-2 pxS-3 rounded-lg bg-neutral-200 cursor-pointer"
                >
                  {chatModel.name}
                </div>
              ))} */}
                <motion.div variants={itemVariants}>
                  <div
                    key={"systemInstruction"}
                    draggable
                    // onClick={() => handleOnClickSystemInstruction()} // Pass chatModel here
                    onDragStart={(e) => handleOnDragStart(e, 'systemInstruction', "systemInstruction")}
                    className="text-sm border border-neutral-600 hover:bg-neutral-700 py-3 px-3 rounded-lg bg-neutral-800 cursor-pointer flex space-x-3 items-center"
                  >
                    <div className="flex space-x-3 items-center">
                      <FaAssistiveListeningSystems className="size-7" />
                      <p>System Instruction</p>
                    </div>

                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <div
                    key={"functionDeclaration"}
                    onClick={() => handleOnClickSystemInstruction()} // Pass chatModel here
                    className="text-sm border border-neutral-600 hover:bg-neutral-700 py-3 px-3 rounded-lg bg-neutral-800 cursor-pointer flex space-x-3 items-center"
                  >
                    <div className="flex space-x-3 items-center">
                      <FaCogs className="size-7" />
                      <p>Function Declaration</p>
                    </div>
                  </div>
                </motion.div>

                {/* TEMPORARY */}
                <motion.div variants={itemVariants}>
                  <div
                    key={"retrievalQA"}
                    draggable
                    // onClick={() => handleOnClickRetrievalQA()} // Pass chatModel here
                    onDragStart={(e) => handleOnDragStart(e, 'retrievalQA', "retrievalQA")}
                    className="text-sm border border-neutral-600 hover:bg-neutral-700 py-3 px-3 rounded-lg bg-neutral-800 cursor-pointer flex space-x-3 items-center"
                  >
                    <div className="flex space-x-3 items-center">
                      <FaCogs className="size-7" />
                      <p>RetrievalQA Chain</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vector Stores */}
        <div>
          <button
            onClick={toggleVectorStores}
            className="flex items-center justify-between w-full text-left px-2 py-3 rounded-lg focus:outline-none"
          >
            Vector Stores
            <span>
              {isVectorStoresOpen ? (
                <RxCaretUp></RxCaretUp>
              ) : (<RxCaretDown></RxCaretDown>)}
            </span>
          </button>
          <AnimatePresence>
            {isVectorStoresOpen && (
              <motion.div
                className="space-y-2"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {VECTOR_STORES.map((vectorStore) => (
                  <motion.div variants={itemVariants}>
                    <div
                      key={vectorStore.name}
                      draggable
                      // onClick={() => handleOnClickVectorStore(vectorStore.name)} // Pass chatModel here
                      onDragStart={(e) => handleOnDragStart(e, 'vectorStore', vectorStore.name)}
                      className="border border-neutral-600 hover:bg-neutral-700 py-3 px-3 rounded-lg bg-neutral-800 cursor-pointer flex space-x-3 items-center"
                    >
                      {vectorStore.name}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div id="boardWrapper" ref={boardWrapperRef} className="fixed top-0 left-0 w-screen h-screen overflow-scroll no-scrollbar">
        <button onClick={() => prepareModelData()} type="button" className="fixed bottom-5 right-10 p-3 bg-blue-500 z-[999]">DISPLAY</button>

        {/* Adds a default NODE */}
        <div className="fixed items-center space-x-3 w-full flex justify-center py-4">
          <img src="colored_seer.png" className="size-10" />
          <p className="text-3xl font-bold bg-gradient-to-b from-[#7f54dc] from-1% to-[#cb78ff] to-90% bg-clip-text text-transparent">SeerAI</p>
        </div>
        <ButtonComponent
          showDelete={selectedNode !== null}
          onClickAdd={handleOnClickAdd}
          onClickChat={prepareModelData}
          modelId={modelId}
          onClickDelete={handleOnClickDelete}
        >
        </ButtonComponent>


        <div
          id="board"
          ref={boardRef}
          className={`${grabbingBoard ? "boardDragging" : "board"}`}
          onMouseDown={handleOnMouseDownBoard}
          onMouseUp={handleOnMouseUpBoard}
          onMouseMove={handleOnMouseMove}
          onDragOver={handleOnDragOver}
          onDrop={handleOnDrop}
        >
          {nodes.map((node) => (
            <NodeRenderer
              key={node.id}
              id={node.id}
              x={node.currPosition.x}
              y={node.currPosition.y}
              selected={selectedNode === node.id}
              node={node}
              onMouseDownNode={handleOnMouseDownNode}
              onMouseDownOutput={handleOnMouseDownOutput}
              onMouseEnterInput={handleOnMouseEnterInput}
              onMouseLeaveInput={handleOnMouseLeaveInput}
              onParameterChange={handleOnParameterChange}
              uploadedFile={uploadedFile}
              onFileUploaded={handleFileUploaded}
            >
            </NodeRenderer>
          ))}

          {newEdge && (
            <EdgeComponent
              key={newEdge.id}
              selected={false}
              isNew={true}
              position={{
                x0: newEdge!.currStartPosition.x,
                y0: newEdge!.currStartPosition.y,
                x1: newEdge!.currEndPosition.x,
                y1: newEdge!.currEndPosition.y
              }}
              onMouseDownEdge={() => { }}
              onClickDeleteEdge={() => { }}
            >

            </EdgeComponent>
          )}

          {edges.map((edge) => (
            <EdgeComponent
              key={edge.id}
              selected={selectedEdge === edge.id}
              isNew={false}
              position={{
                x0: edge.currStartPosition.x,
                y0: edge.currStartPosition.y,
                x1: edge.currEndPosition.x,
                y1: edge.currEndPosition.y
              }}

              onMouseDownEdge={() => handleOnMouseDownEdge(edge.id)}
              onClickDeleteEdge={() => handleOnDeleteEdge(edge.id)}
            >
            </EdgeComponent>
          ))}
        </div>
      </div>
    </div>
  );
};