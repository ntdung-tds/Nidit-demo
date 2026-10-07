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
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col gap-0">
        <SheetHeader className="px-5 py-4 border-b border-border text-left">
          <SheetTitle className="adm-serif text-[22px]">{title}</SheetTitle>
          {desc && <SheetDescription>{desc}</SheetDescription>}
        </SheetHeader>
        <form className="flex-1 overflow-y-auto adm-scroll px-5 py-4 space-y-4" onSubmit={(e) => { e.preventDefault(); if (canSubmit) onSubmit(); }} id="adm-sheet-form">
          {children}
        </form>
        <div className="flex items-center gap-2 px-5 py-3 border-t border-border bg-muted/40">
          {onDelete}
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" form="adm-sheet-form" disabled={!canSubmit || saving} data-testid="button-save-sheet">
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Lưu
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="adm-eyebrow pt-2 border-t border-border">{children}</div>;
}

/** Editable list of plain strings */
export function StringList({ value, onChange, placeholder, testId }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; testId: string }) {
  return (
    <div className="space-y-1.5">
      {value.map((v, i) => (
        <div key={i} className="flex gap-1.5">
          <span className="adm-num text-[12px] text-muted-foreground w-5 pt-2 text-right">{i + 1}.</span>
          <Input value={v} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} placeholder={placeholder} data-testid={`${testId}-${i}`} />
          <Button type="button" size="icon" variant="ghost" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Xóa dòng"><X className="h-4 w-4" /></Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={() => onChange([...value, ''])} data-testid={`${testId}-add`}><Plus className="h-3.5 w-3.5 mr-1" />Thêm dòng</Button>
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
        <div key={i} className="relative rounded-md border border-border bg-background p-3 pr-10">
          {render(it, (p) => onChange(value.map((x, j) => (j === i ? { ...x, ...p } : x))), i)}
          <Button type="button" size="icon" variant="ghost" className="absolute top-1.5 right-1.5 h-7 w-7 text-destructive" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Xóa"><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={() => onChange([...value, blank()])} data-testid={`${testId}-add`}><Plus className="h-3.5 w-3.5 mr-1" />{addLabel}</Button>
    </div>
  );
}
