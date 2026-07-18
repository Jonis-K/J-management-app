import { Handle, Position } from "@xyflow/react";
import Image from "next/image";
import { Member } from "@/lib/csv";
import { fixImageUrl, shouldSkipOptimization } from "@/lib/image";

export default function CustomNode({ data }: { data: Member }) {
  const imgUrl = fixImageUrl(data.photo_url);
  const skipOptimization = shouldSkipOptimization(imgUrl);

  return (
    <div className="flex items-center space-x-3 rounded-2xl border border-sky-200 bg-white p-3 shadow-md min-w-[220px]">
      <Handle type="target" position={Position.Top} className="!bg-sky-400 !w-3 !h-3" />
      
      <div className="relative h-12 w-12 overflow-hidden rounded-full bg-sky-50 border border-sky-100 flex-shrink-0">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={data.name || "Member"}
            fill
            className="object-cover"
            sizes="48px"
            unoptimized={skipOptimization}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-sky-400 font-bold whitespace-nowrap">
            No Img
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="text-sm font-bold text-slate-800 truncate">{data.name}</div>
        <div className="text-xs text-slate-500 truncate">{data.job || "職種未設定"}</div>
        <div className="mt-1 inline-flex w-fit items-center rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
          {data.role || "メンバー"}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-sky-400 !w-3 !h-3" />
    </div>
  );
}
