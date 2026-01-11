import type { SelectedNode, FileTreeNode } from "./types";
import TreeNode from "./TreeNode";

type Props = {
  fileTree: FileTreeNode;
  selectedNode: SelectedNode | null;
  onSelect: (node: SelectedNode) => void;
  workspacePath:string
};

export default function ProjectExplorer({
  fileTree,
  selectedNode,
  onSelect,
  workspacePath
}: Props) {
  console.log(" fileTree : ",fileTree);
  console.log("Selected_Node : ",selectedNode);
  return (
    <div className="p-3 text-sm text-slate-300 border-r border-slate-800">
      <div className="mb-3 text-xs uppercase tracking-wide text-slate-500">
        Project Explorer
      </div>

      <TreeNode
        node={fileTree}
        depth={0}
        selectedNode={selectedNode}
        onSelect={onSelect}
        workspacePath={workspacePath}
      />
    </div>
  );
}
