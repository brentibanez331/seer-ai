"use client"

import { useCallback } from "react";
import ReactFlow, { addEdge, Background, Connection, Controls, Edge, MiniMap, Node, useEdgesState, useNodesState } from "reactflow";
import "reactflow/dist/style.css"

const initialNodes: Node[] = [
    {
        id: "1",
        data: {
            label: "Node 1"
        },
        position: { x: 0, y: 0 }
    },
    {
        id: "2",
        data: {
            label: "Node 2"
        },
        position: { x: 200, y: 200 }
    },
    {
        id: "3",
        data: {
            label: "Node 3"
        },
        position: { x: 100, y: 100 }
    }
]

const initialEdges: Edge[] = [
    { id: '1-2', source: "1", target: "2", animated: true }
]

export const Workflow = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const onConnect = useCallback((connection: Connection) => {
        const edge = { ...connection, animated: true, id: `${edges.length} + 1` }
        setEdges(prevEdges => addEdge(edge, prevEdges))
    }, [])

    const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
        setEdges(prevEdges => prevEdges.filter(edge => !deletedEdges.includes(edge)))
    }, []);

    return (
        <div className="w-full min-h-screen border-2">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect} onEdgesDelete={onEdgesDelete} fitView >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    )
}