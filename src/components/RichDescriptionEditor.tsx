/**
 * RichDescriptionEditor — lightweight inline toolbar editor (no external deps)
 * Stores output as HTML string in `value`/`onChange`.
 */
import { useRef, useCallback, useEffect } from "react";
import {
  Bold, Italic, List, ListOrdered, Heading2, Heading3,
  Quote, Minus, Undo, Redo, Gift, LayoutTemplate
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
  "undo" | "redo";

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
  value, onChange, placeholder = "বিবরণ লিখুন...", className, minHeight = "200px"
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

  // Insert a Bonus section blockquote template
  const insertBonusSection = useCallback(() => {
    if (!ref.current) return;
    ref.current.focus();
    const bonusHtml = `<blockquote><strong>🎁 Bonus সুবিধা</strong><ul><li>বোনাস ফিচার ১</li><li>বোনাস ফিচার ২</li></ul></blockquote>`;
    document.execCommand("insertHTML", false, bonusHtml);
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  // Insert a full starter template
  const insertTemplate = useCallback(() => {
    if (!ref.current) return;
    const template = `<p>সংক্ষিপ্ত পরিচিতি এখানে লিখুন।</p><h2>এই প্ল্যানে যা যা থাকছে</h2><ul><li><strong>প্রথম ফিচার</strong> — বিস্তারিত বিবরণ</li><li><strong>দ্বিতীয় ফিচার</strong> — বিস্তারিত বিবরণ</li><li><strong>তৃতীয় ফিচার</strong></li></ul><blockquote><strong>🎁 Bonus সুবিধা</strong><ul><li>বোনাস ফিচার ১</li><li>বোনাস ফিচার ২</li></ul></blockquote>`;
    ref.current.innerHTML = template;
    onChange(template);
  }, [onChange]);

  const isEmpty = !value || value === "<br>" || value === "";

  return (
    <div className={cn("rounded-xl border border-slate-700 bg-slate-900 overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-800 bg-slate-900/80">
        <ToolBtn onClick={() => execFormat("h2")} title="সেকশন শিরোনাম (H2)"><Heading2 size={13} /></ToolBtn>
        <ToolBtn onClick={() => execFormat("h3")} title="উপশিরোনাম (H3)"><Heading3 size={13} /></ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec("bold")} title="Bold (굵게)"><Bold size={13} /></ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="Italic (তির্যক)"><Italic size={13} /></ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec("insertUnorderedList")} title="চেকলিস্ট তালিকা"><List size={13} /></ToolBtn>
        <ToolBtn onClick={() => exec("insertOrderedList")} title="সংখ্যা তালিকা"><ListOrdered size={13} /></ToolBtn>
        <Divider />
        <ToolBtn onClick={insertBonusSection} title="Bonus সেকশন যোগ করুন"><Gift size={13} /></ToolBtn>
        <ToolBtn onClick={() => execFormat("blockquote")} title="উদ্ধৃতি / বিশেষ বক্স"><Quote size={13} /></ToolBtn>
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
        <Divider />
        {/* Template button */}
        <button
          type="button"
          title="স্টার্টার টেমপ্লেট লোড করুন"
          onMouseDown={e => { e.preventDefault(); insertTemplate(); }}
          className="flex items-center gap-1 px-2 h-7 rounded text-[10px] font-semibold transition-all text-purple-400 hover:text-white hover:bg-purple-900/50 border border-purple-800/60"
        >
          <LayoutTemplate size={11} /> টেমপ্লেট
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
            "outline-none px-4 py-3 text-sm text-slate-200 leading-relaxed",
            "[&_h2]:text-base [&_h2]:font-extrabold [&_h2]:text-white [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h2]:pb-1 [&_h2]:border-b [&_h2]:border-slate-700",
            "[&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-purple-300 [&_h3]:mt-2 [&_h3]:mb-1",
            "[&_ul]:list-none [&_ul]:pl-0 [&_ul]:space-y-1",
            "[&_ul_li]:flex [&_ul_li]:items-start [&_ul_li]:gap-2 [&_ul_li]:text-slate-300 [&_ul_li]:py-0.5",
            "[&_ul_li::before]:content-['✔'] [&_ul_li::before]:inline-flex [&_ul_li::before]:items-center [&_ul_li::before]:justify-center [&_ul_li::before]:min-w-[1rem] [&_ul_li::before]:h-4 [&_ul_li::before]:text-[9px] [&_ul_li::before]:text-white [&_ul_li::before]:bg-purple-600 [&_ul_li::before]:rounded-full [&_ul_li::before]:mt-0.5 [&_ul_li::before]:shrink-0",
            "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-0.5",
            "[&_li]:text-slate-300",
            "[&_blockquote]:bg-purple-950/40 [&_blockquote]:border [&_blockquote]:border-purple-700/40 [&_blockquote]:border-l-2 [&_blockquote]:border-l-purple-500 [&_blockquote]:rounded-lg [&_blockquote]:px-3 [&_blockquote]:py-2 [&_blockquote]:my-2 [&_blockquote]:text-slate-300",
            "[&_strong]:text-white [&_strong]:font-bold",
            "[&_em]:italic [&_em]:text-slate-400",
            "[&_hr]:border-slate-700 [&_hr]:my-2",
            "[&_p]:mb-1",
          )}
        />
      </div>

      {/* Hint */}
      <div className="px-3 py-1.5 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5">
        <span>💡 H2 = সেকশন শিরোনাম</span>
        <span>•</span>
        <span>☑ তালিকা = চেকমার্ক বুলেট</span>
        <span>•</span>
        <span>🎁 Bonus বাটন = বোনাস বক্স</span>
        <span>•</span>
        <span>টেমপ্লেট বাটনে ক্লিক করুন শুরু করতে</span>
      </div>
    </div>
  );
}
