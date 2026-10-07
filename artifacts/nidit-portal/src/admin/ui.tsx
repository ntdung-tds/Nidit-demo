import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import {
  AlertTriangle, Bold, ChevronLeft, ChevronRight, Heading2, Heading3, ImageIcon, ImageOff, Italic, Link2, List,
  ListOrdered, Quote, Redo2, RotateCw, Search, Underline as UIcon, Undo2, X, AlignLeft, AlignCenter, AlignRight,
  Unlink, Check, Lock, FileText, Film,
} from 'lucide-react';
import { useListMedia, getListMediaQueryKey } from '@workspace/api-client-react';
import type { MediaType, ArticleStatus } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { STATUS_LABEL, errMsg } from './lib';

export function PageHeader({ eyebrow, title, desc, actions }: { eyebrow?: string; title: string; desc?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between pb-4 mb-5 border-b border-border">
      <div className="min-w-0">
        {eyebrow && <div className="adm-eyebrow mb-1">{eyebrow}</div>}
        <h1 className="adm-serif text-[28px] leading-tight font-semibold text-foreground" data-testid="text-page-title">{title}</h1>
        {desc && <p className="text-[13px] text-muted-foreground mt-1 max-w-2xl">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function StatusChip({ status }: { status: ArticleStatus }) {
  return <span className={cn('st', `st-${status}`)} data-testid={`status-${status}`}>{STATUS_LABEL[status]}</span>;
}

export function Chip({ children, tone = 'muted', className }: { children: ReactNode; tone?: 'muted' | 'blue' | 'red' | 'green' | 'amber'; className?: string }) {
  const tones = {
    muted: 'bg-muted text-muted-foreground border-border',
    blue: 'bg-accent text-accent-foreground border-[hsl(214_40%_84%)]',
    red: 'bg-[hsl(6_80%_95%)] text-[hsl(4_70%_40%)] border-[hsl(6_60%_86%)]',
    green: 'bg-[hsl(152_44%_91%)] text-[hsl(158_60%_24%)] border-[hsl(152_30%_80%)]',
    amber: 'bg-[hsl(42_92%_91%)] text-[hsl(32_90%_30%)] border-[hsl(40_70%_80%)]',
  };
  return <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap', tones[tone], className)}>{children}</span>;
}

export function Empty({ icon, title, desc, action }: { icon?: ReactNode; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6" data-testid="state-empty">
      <div className="relative mb-4">
        <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-md border border-dashed border-border" />
        <div className="relative h-12 w-12 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground">
          {icon ?? <FileText className="h-5 w-5" />}
        </div>
      </div>
      <div className="font-semibold text-foreground">{title}</div>
      {desc && <p className="text-[13px] text-muted-foreground mt-1 max-w-sm">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorBox({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-[hsl(6_60%_86%)] bg-[hsl(6_80%_97%)] p-4" data-testid="state-error">
      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
      <div className="flex-1 text-[13px]">
        <div className="font-semibold text-destructive">Không tải được dữ liệu</div>
        <div className="text-muted-foreground mt-0.5">{errMsg(error)}</div>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} data-testid="button-retry"><RotateCw className="h-3.5 w-3.5 mr-1" />Thử lại</Button>
      )}
    </div>
  );
}

export function RowsSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          {Array.from({ length: cols }).map((__, j) => (
            <Skeleton key={j} className={cn('h-3.5', j === 0 ? 'flex-1' : 'w-24')} style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Panel({ title, actions, children, className, bodyClass }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={cn('bg-card border border-card-border rounded-md shadow-sm', className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-2 px-4 h-11 border-b border-border">
          <h2 className="text-[13px] font-semibold text-foreground truncate">{title}</h2>
          <div className="flex items-center gap-1.5">{actions}</div>
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

export function Confirm({ trigger, title, desc, confirmLabel = 'Xóa', onConfirm, destructive = true }: {
  trigger: ReactNode; title: string; desc?: string; confirmLabel?: string; onConfirm: () => void; destructive?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {desc && <AlertDialogDescription>{desc}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-confirm">Hủy</AlertDialogCancel>
          <AlertDialogAction
            data-testid="button-confirm"
            onClick={onConfirm}
            className={destructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : undefined}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function Pager({ page, totalPages, total, onPage }: { page: number; totalPages: number; total: number; onPage: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-border text-[12.5px] text-muted-foreground">
      <span className="adm-num">Tổng {total.toLocaleString('vi-VN')} mục · Trang {page}/{Math.max(totalPages, 1)}</span>
      <div className="flex gap-1">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPage(page - 1)} data-testid="button-prev-page"><ChevronLeft className="h-3.5 w-3.5" /></Button>
        <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => onPage(page + 1)} data-testid="button-next-page"><ChevronRight className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder = 'Tìm kiếm…', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  const [v, setV] = useState(value);
  const cb = useRef(onChange);
  cb.current = onChange;
  useEffect(() => { setV(value); }, [value]);
  useEffect(() => {
    const t = setTimeout(() => { if (v !== value) cb.current(v); }, 350);
    return () => clearTimeout(t);
  }, [v, value]);
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <Input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} className="pl-8 h-9" data-testid="input-search" />
    </div>
  );
}

export function F({ label, hint, children, className, required }: { label: string; hint?: string; children: ReactNode; className?: string; required?: boolean }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-[12px] font-semibold text-foreground/80">{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {children}
      {hint && <p className="text-[11.5px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TagInput({ value, onChange, placeholder = 'Nhập rồi Enter', testId = 'input-tags' }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; testId?: string }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const parts = draft.split(',').map((s) => s.trim()).filter(Boolean).filter((s) => !value.includes(s));
    if (parts.length) onChange([...value, ...parts]);
    setDraft('');
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 min-h-9 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring/30">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded bg-secondary text-secondary-foreground text-[12px] pl-2 pr-1 py-0.5">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="hover:text-destructive" aria-label={`Bỏ ${t}`}><X className="h-3 w-3" /></button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
          else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        placeholder={value.length ? '' : placeholder}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-[13px]"
        data-testid={testId}
      />
    </div>
  );
}

export function Thumb({ src, alt = '', className, kind = 'image' }: { src: string | null | undefined; alt?: string; className?: string; kind?: 'image' | 'video' | 'file' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed || kind !== 'image') {
    const Icon = kind === 'video' ? Film : kind === 'file' ? FileText : ImageOff;
    return (
      <div className={cn('flex items-center justify-center bg-[repeating-linear-gradient(135deg,hsl(var(--muted))_0_6px,hsl(var(--secondary))_6px_12px)] text-muted-foreground', className)}>
        <Icon className="h-4 w-4 opacity-70" />
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setFailed(true)} className={cn('object-cover', className)} loading="lazy" />;
}

export function useNotify() {
  const { toast } = useToast();
  return {
    ok: (title: string, description?: string) => toast({ title, description }),
    fail: (e: unknown, title = 'Không thực hiện được') => toast({ title, description: errMsg(e), variant: 'destructive' }),
  };
}

export function Forbidden() {
  return (
    <Empty icon={<Lock className="h-5 w-5" />} title="Không có quyền truy cập" desc="Vai trò của bạn không được phép sử dụng chức năng này. Liên hệ quản trị nếu cần cấp quyền." />
  );
}

/* ---------- Media picker ---------- */
export function MediaPicker({ open, onOpenChange, onPick, type = 'image' }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (url: string, title: string, kind: MediaType) => void; type?: MediaType }) {
  const [q, setQ] = useState('');
  const params = { type, q: q || undefined };
  const { data, isLoading, error, refetch } = useListMedia(params, { query: { enabled: open, queryKey: getListMediaQueryKey(params) } });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chọn từ thư viện media</DialogTitle>
          <DialogDescription>Media được đăng ký bằng đường dẫn tại mục Thư viện media.</DialogDescription>
        </DialogHeader>
        <SearchBox value={q} onChange={setQ} placeholder="Tìm theo tiêu đề…" />
        <div className="max-h-[55vh] overflow-auto adm-scroll -mx-1 px-1">
          {isLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3]" />)}</div>
          ) : error ? (
            <ErrorBox error={error} onRetry={() => refetch()} />
          ) : !data?.length ? (
            <Empty icon={<ImageIcon className="h-5 w-5" />} title="Thư viện trống" desc="Chưa có tệp nào phù hợp. Đăng ký media mới ở mục Thư viện media." />
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {data.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { onPick(m.url, m.title, m.type); onOpenChange(false); }}
                  className="group text-left rounded-md border border-border overflow-hidden bg-card hover:border-primary transition-colors"
                  data-testid={`button-pick-media-${m.id}`}
                >
                  <Thumb src={m.url} kind={m.type} alt={m.alt ?? m.title} className="w-full aspect-[4/3]" />
                  <div className="px-2 py-1.5 text-[12px] truncate group-hover:text-primary">{m.title}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ImageField({ value, onChange, testId = 'input-image' }: { value: string; onChange: (v: string) => void; testId?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex gap-3 items-start">
      <Thumb src={value || null} className="h-16 w-24 rounded border border-border shrink-0" />
      <div className="flex-1 space-y-1.5 min-w-0">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/ten-anh.jpg hoặc https://…" data-testid={testId} />
        <div className="flex gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)} data-testid={`${testId}-pick`}><ImageIcon className="h-3.5 w-3.5 mr-1" />Chọn từ thư viện</Button>
          {value && <Button type="button" size="sm" variant="ghost" onClick={() => onChange('')}>Bỏ ảnh</Button>}
        </div>
      </div>
      <MediaPicker open={open} onOpenChange={setOpen} onPick={(url) => onChange(url)} />
    </div>
  );
}

/* ---------- Rich text editor ---------- */
export function RichEditor({ value, onChange, placeholder = 'Soạn nội dung…', editable = true, resetKey }: { value: string; onChange: (html: string) => void; placeholder?: string; editable?: boolean; resetKey?: string | number }) {
  const cb = useRef(onChange);
  cb.current = onChange;
  const [pickOpen, setPickOpen] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false, underline: false, heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    editable,
    editorProps: { attributes: { class: 'prose prose-sm max-w-none prose-headings:font-semibold' } },
    onUpdate: ({ editor: ed }) => cb.current(ed.getHTML()),
  });
  // Replace content only when an external reset happens (record switch or applied AI suggestion)
  useEffect(() => {
    if (editor && editor.getHTML() !== value) editor.commands.setContent(value, { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, resetKey]);
  useEffect(() => { editor?.setEditable(editable); }, [editor, editable]);

  if (!editor) return <Skeleton className="h-[380px]" />;
  const B = ({ on, active, children, label }: { on: () => void; active?: boolean; children: ReactNode; label: string }) => (
    <button type="button" title={label} aria-label={label} onMouseDown={(e) => e.preventDefault()} onClick={on} disabled={!editable}
      className={cn('h-7 w-7 inline-flex items-center justify-center rounded text-foreground/70 hover:bg-secondary hover:text-foreground disabled:opacity-40', active && 'bg-accent text-accent-foreground')}>
      {children}
    </button>
  );
  const c = () => editor.chain().focus();
  return (
    <div className="adm-editor rounded-md border border-input bg-background overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 px-1.5 py-1 border-b border-border bg-muted/50 sticky top-0 z-10">
        <B label="Đậm" on={() => c().toggleBold().run()} active={editor.isActive('bold')}><Bold className="h-3.5 w-3.5" /></B>
        <B label="Nghiêng" on={() => c().toggleItalic().run()} active={editor.isActive('italic')}><Italic className="h-3.5 w-3.5" /></B>
        <B label="Gạch chân" on={() => c().toggleUnderline().run()} active={editor.isActive('underline')}><UIcon className="h-3.5 w-3.5" /></B>
        <span className="w-px h-4 bg-border mx-1" />
        <B label="Tiêu đề 2" on={() => c().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}><Heading2 className="h-3.5 w-3.5" /></B>
        <B label="Tiêu đề 3" on={() => c().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}><Heading3 className="h-3.5 w-3.5" /></B>
        <B label="Danh sách" on={() => c().toggleBulletList().run()} active={editor.isActive('bulletList')}><List className="h-3.5 w-3.5" /></B>
        <B label="Danh sách số" on={() => c().toggleOrderedList().run()} active={editor.isActive('orderedList')}><ListOrdered className="h-3.5 w-3.5" /></B>
        <B label="Trích dẫn" on={() => c().toggleBlockquote().run()} active={editor.isActive('blockquote')}><Quote className="h-3.5 w-3.5" /></B>
        <span className="w-px h-4 bg-border mx-1" />
        <B label="Căn trái" on={() => c().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}><AlignLeft className="h-3.5 w-3.5" /></B>
        <B label="Căn giữa" on={() => c().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}><AlignCenter className="h-3.5 w-3.5" /></B>
        <B label="Căn phải" on={() => c().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}><AlignRight className="h-3.5 w-3.5" /></B>
        <span className="w-px h-4 bg-border mx-1" />
        <B label="Chèn liên kết" active={editor.isActive('link')} on={() => {
          const prev = editor.getAttributes('link').href as string | undefined;
          const url = window.prompt('Đường dẫn liên kết', prev ?? 'https://');
          if (url === null) return;
          if (!url) c().unsetLink().run(); else c().extendMarkRange('link').setLink({ href: url }).run();
        }}><Link2 className="h-3.5 w-3.5" /></B>
        <B label="Bỏ liên kết" on={() => c().unsetLink().run()}><Unlink className="h-3.5 w-3.5" /></B>
        <B label="Chèn ảnh từ thư viện" on={() => setPickOpen(true)}><ImageIcon className="h-3.5 w-3.5" /></B>
        <span className="flex-1" />
        <B label="Hoàn tác" on={() => c().undo().run()}><Undo2 className="h-3.5 w-3.5" /></B>
        <B label="Làm lại" on={() => c().redo().run()}><Redo2 className="h-3.5 w-3.5" /></B>
      </div>
      <EditorContent editor={editor} />
      <MediaPicker open={pickOpen} onOpenChange={setPickOpen} onPick={(url, title) => c().setImage({ src: url, alt: title }).run()} />
    </div>
  );
}

export function SavedTick({ show }: { show: boolean }) {
  return show ? <span className="inline-flex items-center gap-1 text-[12px] text-[hsl(158_60%_28%)] adm-rise"><Check className="h-3.5 w-3.5" />Đã lưu</span> : null;
}
