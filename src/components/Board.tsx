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
import { ChatModelNode } from "./interfaces/ChatModelNode";
import NodeRenderer from "./NodeRenderer";
import { NodeDataContainer } from "./interfaces/NodeData";
import { createChatModelNode } from "./factories/ChatModelFactory";
import { SystemInstructionNode } from "./interfaces/SystemInstructionNode";
import { DocumentLoaderNode } from "./interfaces/DocumentLoaderNode";

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
    name: "CharacterTextSplitter"
  }
]

export const Board = () => {
  const [grabbingBoard, setGrabbingBoard] = useState<boolean>(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [clickedPosition, setClickedPosition] = useState<{ x: number, y: number }>({ x: -1, y: -1 });

  const [newEdge, setNewEdge] = useState<Edge | null>(null)
  const [nodes, setNodes] = useState<BaseNode[]>([])
  const [copiedNode, setCopiedNode] = useState<BaseNode | null>(null);
  const [edges, setEdges] = useState<Edge[]>([])

  const [scale, setScale] = useState<number>(1);
  const [isScaling, setIsScaling] = useState(false);
  const initialScaleRef = useRef(1);

  const [nodeFlow, setNodeFlow] = useState<BaseNode[]>([])

  const [modelId, setModelId] = useState<string | null>(null);


  // let node_data: { node_data: { nodes: { id: string; type: "default" | "chatModel" | "output"; parameters: Record<string, any> | null; inputs: Record<string, string>; outputs: Record<string, string> | null; }[]; edges: { nodeStartId: string; nodeEndId: string; inputKey: string; outputKey: string; }[]; }; };
  let node_data: NodeDataContainer
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
    const outputNode: BaseNode = {
      id: outputNodeId,
      type: "output",
      prevPosition: { x: window.innerWidth - 400, y: 300 },
      currPosition: { x: window.innerWidth - 400, y: 300 },
      inputs: {
        response: "chatResponse"
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


        const startHasEdge = nodeStart.outputs![newEdge.outputKey] === edgeId;
        const endHasEdge = nodeEnd.inputs![insideInput.inputKey] === edgeId;


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

    setNodes(prevNodes => [...prevNodes, newNode])
    if (modelId) removeModel()

    console.log(nodes)
  }

  const handleOnClickChatModel = (chatModelName: string, modelTypes: string[]) => {
    const randomX = window.innerWidth / 2 - 50
    const randomY = window.innerHeight / 2 - 100

    const newNode: ChatModelNode = {
      id: `node_${Math.random().toString(36).substring(2, 8)}`,
      type: "chatModel",
      models: modelTypes,

      parameters: {
        chatModel: chatModelName,
        model: modelTypes[0],
        temperature: 0.5
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
    // `node_${Math.random().toString(36).substring(2, 8)}`,
    // { x: randomX, y: randomY },
    // chatModelName,
    // modelTypes,
    // modelTypes[0],
    // )

    setNodes(prevNodes => [...prevNodes, newNode])
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
        fileFormat: fileFormat
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
    // `node_${Math.random().toString(36).substring(2, 8)}`,
    // { x: randomX, y: randomY },
    // chatModelName,
    // modelTypes,
    // modelTypes[0],
    // )

    setNodes(prevNodes => [...prevNodes, newNode])
    if (modelId) removeModel()

    console.log(nodes)
  }

  const handleOnClickAdd = () => {
    const randomX = window.innerWidth / 2
    const randomY = window.innerHeight / 2

    const newNode: BaseNode = {
      id: `node_${Math.random().toString(36).substring(2, 8)}`,
      type: "output",
      prevPosition: {
        x: randomX,
        y: randomY
      },
      currPosition: {
        x: randomX,
        y: randomY
      },
      inputs: {
        response: "chatResponse"
      },
      parameters: null,
      outputs: null
    };

    // if (nodes.length === 0) {
    //   setNodeFlow([newNode])
    //   // console.log("NODE FLOW", nodeFlow)
    // }

    setNodes(prevNodes => [...prevNodes, newNode])
    if (modelId) removeModel()
  }

  // const handleOnClickDelete = () => {
  //   const node = nodes.find((node) => node.id === selectedNode)

  //   if (!node || node!.type === "output") {
  //     setSelectedNode(null)
  //     return
  //   }

  //   console.log(`INPUT: ${node.inputEdgeIds}`)
  //   console.log(`OUTPUT: ${node.outputEdgeIds}`)

  //   // Before deleting the node, delete all connections on other nodes.
  //   // 1. Traverse all input_nodes in the to-be deleted node...
  //   // 2. For every traversed input_nodes, traverse all elements in the Edges list
  //   // 3. For every matching Edge, get the nodeStartId and nodeEndId
  //   // 4. Use the nodeStartId and nodeEndId to filter the nodes
  //   // 5. Delete the node

  //   node.inputEdgeIds.forEach((edgeId) => {
  //     const edgeToDelete = edges.find((edge) => edge.id === edgeId)
  //     if (edgeToDelete) {
  //       const connectedNode = nodes.find(
  //         (node) => node.id === edgeToDelete.nodeStartId
  //       )

  //       if (connectedNode) {
  //         connectedNode.outputEdgeIds = connectedNode.outputEdgeIds.filter(
  //           (id) => id !== edgeId
  //         )
  //       }
  //     }
  //   })

  //   node.outputEdgeIds.forEach((edgeId) => {
  //     const edgeToDelete = edges.find((edge) => edge.id === edgeId)
  //     if (edgeToDelete) {
  //       const connectedNode = nodes.find(
  //         (node) => node.id === edgeToDelete.nodeEndId
  //       )
  //       if (connectedNode) {
  //         connectedNode.inputEdgeIds = connectedNode.inputEdgeIds.filter(
  //           (id) => id !== edgeId
  //         )
  //       }
  //     }
  //   })

  //   // This deletes the node
  //   setNodes([...nodes.filter((node) => node.id !== selectedNode)])
  //   // setNodeFlow([...nodeFlow.filter((node) => node.id !== selectedNode)])

  //   // Delete all elements starting from the selectedNode


  //   setEdges(edges.filter((edge) => edge.nodeStartId !== selectedNode && edge.nodeEndId !== selectedNode))
  //   setSelectedNode(null)
  // }



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

  const getModelTypes = (chatModel: string): string[] => {
    const model = CHAT_MODELS.find(model => model.name === chatModel);
    return model ? model.modelTypes : [];
  }

  // const handleOnChangeModelType = (nodeId: string, newModelType: string) => {
  //   setNodes((prevNodes) => prevNodes.map((node) => node.id === nodeId && node.type === 'chatModel'
  //     ? { ...node, modelType: newModelType }
  //     : node))

  //   console.log(nodes)
  // }

  const handleOnParameterChange = (nodeId: string, parameter: string, value: any) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId
          ? {
            ...node,
            parameters: {
              ...node.parameters, // Spread existing parameters to keep others
              [parameter]: value // Update the specific parameter 
            }
          }
          : node
      )
    );
    if (modelId) removeModel()
  }

  const prepareModelData = () => {
    // O(N)
    updateNodeFlow()
    console.log("NODES", nodes)
    console.log("EDGES", edges)

    const formattedNodes = nodes.map(node => ({
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

  return (
    <div>
      <div className="fixed top-0 left-0 h-screen bg-white z-50 space-y-3 py-5 px-3 border-r w-1/6">
        <p>Add Nodes</p>
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
          {isChatModelsOpen && (
            <div className="space-y-2">
              {CHAT_MODELS.map((chatModel) => (

                <div
                  key={chatModel.name}
                  onClick={() => handleOnClickChatModel(chatModel.name, chatModel.modelTypes)} // Pass chatModel here
                  className="border-2 py-2 px-3 rounded-lg bg-neutral-200 cursor-pointer"
                >
                  {chatModel.name}
                </div>
              ))}
            </div>
          )}
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
          {isUtilsOpen && (
            <div className="space-y-2">
              {/* {CHAT_MODELS.map((chatModel) => (

                <div
                  key={chatModel.name}
                  onClick={() => handleOnClickChatModel(chatModel.name, chatModel.modelTypes)} // Pass chatModel here
                  className="border-2 py-2 pxS-3 rounded-lg bg-neutral-200 cursor-pointer"
                >
                  {chatModel.name}
                </div>
              ))} */}
              <div
                key={"systemInstruction"}
                onClick={() => handleOnClickSystemInstruction()} // Pass chatModel here
                className="border-2 py-2 px-3 rounded-lg bg-neutral-200 cursor-pointer"
              >
                System Instruction
              </div>
            </div>
          )}
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
          {isDocumentLoadersOpen && (
            <div className="space-y-2">
              {DOCUMENT_LOADERS.map((documentLoader) => (

                <div
                  key={documentLoader.name}
                  onClick={() => handleOnClickDocumentLoader(documentLoader.name, documentLoader.fileFormat)} // Pass chatModel here
                  className="border-2 py-2 px-3 rounded-lg bg-neutral-200 cursor-pointer"
                >
                  {documentLoader.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      <div id="boardWrapper" ref={boardWrapperRef} className="fixed top-0 left-0 w-screen h-screen overflow-scroll">
        <button onClick={() => prepareModelData()} type="button" className="fixed bottom-5 right-10 p-3 bg-blue-500 z-[999]">DISPLAY</button>

        {/* Adds a default NODE */}
        <ButtonComponent
          showDelete={selectedNode !== null}
          onClickAdd={handleOnClickAdd}
          onClickChat={prepareModelData}
          modelId={modelId}
        // onClickDelete={handleOnClickDelete}
        >
        </ButtonComponent>


        <div
          id="board"
          ref={boardRef}
          className={`${grabbingBoard ? "boardDragging" : "board"}`}
          onMouseDown={handleOnMouseDownBoard}
          onMouseUp={handleOnMouseUpBoard}
          onMouseMove={handleOnMouseMove}
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