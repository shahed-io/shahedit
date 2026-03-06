/**
 * RichDescriptionEditor — lightweight inline toolbar editor (no external deps)
 * Stores output as HTML string in `value`/`onChange`.
 */
import { useRef, useCallback, useEffect } from "react";
import {
  Bold, Italic, List, ListOrdered, Heading2, Heading3,
  Quote, Minus, Undo, Redo, AlignLeft, AlignCenter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

type Cmd = "bold" | "italic" | "insertUnorderedList" | "insertOrderedList" |
  "undo" | "redo" | "justifyLeft" | "justifyCenter";

const ToolBtn = ({
  onClick, title, active, children
}: { onClick: () => void; title: string; active?: boolean; children: React.ReactNode }) => (
  <button
    type="button"
    title={title}
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    className={cn(
      "w-7 h-7 rounded flex items-center justify-center transition-all text-slate-400 hover:text-white hover:bg-slate-700",
      active && "bg-slate-700 text-white"
    )}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-slate-700 mx-0.5" />;

export default function RichDescriptionEditor({
  value, onChange, placeholder = "বিবরণ লিখুন...", className, minHeight = "120px"
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const ignoreNextChange = useRef(false);

  // Sync external value → editor (only on mount / external reset)
  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== value) {
      ignoreNextChange.current = true;
      ref.current.innerHTML = value ?? "";
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const exec = useCallback((cmd: Cmd, val?: string) => {
    document.execCommand(cmd, false, val);
    ref.current?.focus();
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  const execFormat = useCallback((tag: string) => {
    document.execCommand("formatBlock", false, tag);
    ref.current?.focus();
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  const handleInput = () => {
    if (ignoreNextChange.current) { ignoreNextChange.current = false; return; }
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const isEmpty = !value || value === "<br>" || value === "";

  return (
    <div className={cn("rounded-xl border border-slate-700 bg-slate-900 overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-800 bg-slate-900/80">
        <ToolBtn onClick={() => execFormat("h2")} title="শিরোনাম (H2)"><Heading2 size={13} /></ToolBtn>
        <ToolBtn onClick={() => execFormat("h3")} title="উপশিরোনাম (H3)"><Heading3 size={13} /></ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec("bold")} title="Bold (굵게)"><Bold size={13} /></ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="Italic (তির্যক)"><Italic size={13} /></ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec("insertUnorderedList")} title="বুলেট তালিকা"><List size={13} /></ToolBtn>
        <ToolBtn onClick={() => exec("insertOrderedList")} title="সংখ্যা তালিকা"><ListOrdered size={13} /></ToolBtn>
        <Divider />
        <ToolBtn onClick={() => execFormat("blockquote")} title="উদ্ধৃতি"><Quote size={13} /></ToolBtn>
        <ToolBtn onClick={() => execFormat("p")} title="সাধারণ টেক্সট"><AlignLeft size={13} /></ToolBtn>
        <ToolBtn onClick={() => exec("justifyCenter")} title="মাঝখানে"><AlignCenter size={13} /></ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec("undo")} title="Undo"><Undo size={13} /></ToolBtn>
        <ToolBtn onClick={() => exec("redo")} title="Redo"><Redo size={13} /></ToolBtn>
        <Divider />
        <button
          type="button"
          title="Horizontal line"
          onMouseDown={e => { e.preventDefault(); document.execCommand("insertHorizontalRule"); if (ref.current) onChange(ref.current.innerHTML); }}
          className="w-7 h-7 rounded flex items-center justify-center transition-all text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <Minus size={13} />
        </button>
      </div>

      {/* Editable area */}
      <div className="relative">
        {isEmpty && (
          <p className="absolute top-3 left-3 text-slate-600 text-sm pointer-events-none select-none">
            {placeholder}
          </p>
        )}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          style={{ minHeight }}
          className={cn(
            "outline-none px-3 py-3 text-sm text-slate-200 leading-relaxed",
            "[&_h2]:text-base [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-3 [&_h2]:mb-1",
            "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-slate-200 [&_h3]:mt-2 [&_h3]:mb-0.5",
            "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-0.5",
            "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-0.5",
            "[&_li]:text-slate-300",
            "[&_blockquote]:border-l-2 [&_blockquote]:border-purple-500 [&_blockquote]:pl-3 [&_blockquote]:text-slate-400 [&_blockquote]:italic [&_blockquote]:my-2",
            "[&_strong]:text-white [&_strong]:font-bold",
            "[&_em]:italic [&_em]:text-slate-300",
            "[&_hr]:border-slate-700 [&_hr]:my-2",
            "[&_p]:mb-1",
          )}
        />
      </div>

      {/* Hint */}
      <div className="px-3 py-1 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-600 flex gap-3">
        <span>টেক্সট সিলেক্ট করে Bold/Italic করুন</span>
        <span>•</span>
        <span>Enter দিয়ে নতুন লাইন</span>
      </div>
    </div>
  );
}
