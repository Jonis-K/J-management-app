"use client";

import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionLineType,
  Panel
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import * as dagre from "dagre";
import CustomNode from "./CustomNode";

const nodeTypes = {
  custom: CustomNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 260; // CustomNodeのサイズにおおまかに合わせる
const nodeHeight = 84;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = { ...node };

    newNode.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};

type Props = {
  initialNodes: Node[];
  initialEdges: Edge[];
};

export default function OrgChartClient({ initialNodes, initialEdges }: Props) {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    [initialNodes, initialEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, setNodes, setEdges]
  );

  return (
    <div style={{ width: "100%", height: "75vh" }} className="rounded-2xl border border-sky-200 bg-slate-50 overflow-hidden shadow-inner relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        className="bg-slate-50"
      >
        <Background gap={16} size={1} color="#cbd5e1" />
        <MiniMap zoomable pannable nodeClassName="!bg-sky-300 !rounded-md" />
        <Controls />
        <Panel position="top-right" className="bg-white/90 p-2 rounded-lg shadow-sm border border-slate-200 backdrop-blur-sm m-2">
          <div className="flex gap-2">
            <button
              onClick={() => onLayout("TB")}
              className="px-3 py-1.5 text-xs bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-md transition-colors font-bold"
            >
              縦方向
            </button>
            <button
              onClick={() => onLayout("LR")}
              className="px-3 py-1.5 text-xs bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-md transition-colors font-bold"
            >
              横方向
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
