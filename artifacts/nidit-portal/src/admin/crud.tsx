import type { ReactNode } from 'react';
import { Loader2, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export function SheetForm({ open, onOpenChange, title, desc, onSubmit, saving, canSubmit = true, children, onDelete }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; desc?: string; onSubmit: () => void; saving?: boolean; canSubmit?: boolean; children: ReactNode; onDelete?: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-[100dvh] max-h-[100dvh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <SheetHeader className="shrink-0 border-b border-border px-4 py-4 text-left sm:px-5">
          <SheetTitle className="adm-serif text-[20px] leading-tight sm:text-[22px]">{title}</SheetTitle>
          {desc && <SheetDescription className="leading-relaxed">{desc}</SheetDescription>}
        </SheetHeader>
        <form className="adm-scroll min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5" onSubmit={(e) => { e.preventDefault(); if (canSubmit) onSubmit(); }} id="adm-sheet-form">
          {children}
        </form>
        <div className="shrink-0 border-t border-border bg-muted/40 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            {onDelete && <div className="w-full sm:w-auto">{onDelete}</div>}
            <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
              <Button type="button" variant="outline" className="min-h-10 flex-1 sm:flex-none" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" form="adm-sheet-form" className="min-h-10 flex-1 sm:flex-none" disabled={!canSubmit || saving} data-testid="button-save-sheet">
                {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Lưu
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="adm-eyebrow border-t border-border pt-2">{children}</div>;
}

/** Editable list of plain strings */
export function StringList({ value, onChange, placeholder, testId }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; testId: string }) {
  return (
    <div className="space-y-1.5">
      {value.map((v, i) => (
        <div key={i} className="flex min-w-0 items-start gap-1.5">
          <span className="adm-num w-5 shrink-0 pt-2 text-right text-[12px] text-muted-foreground">{i + 1}.</span>
          <Input className="min-w-0 flex-1" value={v} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} placeholder={placeholder} data-testid={`${testId}-${i}`} />
          <Button type="button" size="icon" variant="ghost" className="h-10 w-10 shrink-0" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Xóa dòng"><X className="h-4 w-4" /></Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" className="min-h-10 sm:min-h-8" onClick={() => onChange([...value, ''])} data-testid={`${testId}-add`}><Plus className="mr-1 h-3.5 w-3.5" />Thêm dòng</Button>
    </div>
  );
}

/** Generic list of objects with a custom row renderer */
export function ObjList<T>({ value, onChange, blank, render, testId, addLabel = 'Thêm' }: {
  value: T[]; onChange: (v: T[]) => void; blank: () => T; render: (item: T, set: (patch: Partial<T>) => void, i: number) => ReactNode; testId: string; addLabel?: string;
}) {
  return (
    <div className="space-y-2">
      {value.map((it, i) => (
        <div key={i} className="relative min-w-0 rounded-md border border-border bg-background p-3 pr-11">
          {render(it, (p) => onChange(value.map((x, j) => (j === i ? { ...x, ...p } : x))), i)}
          <Button type="button" size="icon" variant="ghost" className="absolute right-1.5 top-1.5 h-9 w-9 text-destructive sm:h-7 sm:w-7" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Xóa"><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" className="min-h-10 sm:min-h-8" onClick={() => onChange([...value, blank()])} data-testid={`${testId}-add`}><Plus className="mr-1 h-3.5 w-3.5" />{addLabel}</Button>
    </div>
  );
}
