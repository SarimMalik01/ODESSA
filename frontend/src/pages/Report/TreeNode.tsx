import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";
import type { SelectedNode, FileTreeNode } from "./types";
import { normalizePath } from "../../utils/normalizePath";

type Props = {
  node: FileTreeNode;
  depth: number;
  selectedNode: SelectedNode | null;
  onSelect: (node: SelectedNode) => void;
  workspacePath: string;
};

export default function TreeNode({
  node,
  depth,
  selectedNode,
  onSelect,
  workspacePath,
}: Props) {
  const [expanded, setExpanded] = useState(true);

  const isFolder = node.type === "directory";

  const normalizedNodePath = normalizePath(
    node.path,
    workspacePath
  );

  const isSelected =
    selectedNode?.type === node.type &&
    selectedNode?.path === normalizedNodePath;

  const paddingLeft = 12 + depth * 14;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer
          ${
            isSelected
              ? "bg-blue-500/15 text-blue-400"
              : "hover:bg-slate-800"
          }
        `}
        style={{ paddingLeft }}
        onClick={() => {
          onSelect({
            type: node.type,
            path: normalizedNodePath!,
          });

          if (isFolder) {
            setExpanded((prev) => !prev);
          }
        }}
      >
        {isFolder ? (
          expanded ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )
        ) : (
          <span className="w-[14px]" />
        )}

        {isFolder ? (
          <Folder size={14} className="text-slate-400" />
        ) : (
          <File size={14} className="text-slate-500" />
        )}

        <span className="truncate">{node.name}</span>
      </div>

      {isFolder && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedNode={selectedNode}
              onSelect={onSelect}
              workspacePath={workspacePath}
            />
          ))}
        </div>
      )}
    </div>
  );
}
