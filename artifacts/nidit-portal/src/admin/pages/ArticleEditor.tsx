import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetAdminArticle, useCreateArticle, useUpdateArticle, useDeleteArticle, useTransitionArticle, useListCategories, useSuggestWithAi,
  getGetAdminArticleQueryKey, getListAdminArticlesQueryKey, getGetDashboardQueryKey,
} from '@workspace/api-client-react';
import type { AdminArticle, ArticleInput, TransitionAction, AiTask, AiSuggestion, ContentLanguage } from '@workspace/api-client-react';
import {
  ArrowLeft, Save, Trash2, Sparkles, Loader2, Rss, ExternalLink, Send, CheckCircle2, Globe, EyeOff, Undo, MessageSquareWarning, Check, Plus, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useMe } from '../auth';
import { F, Panel, StatusChip, TagInput, ImageField, RichEditor, Confirm, ErrorBox, useNotify, Chip, Empty } from '../ui';
import { ACTION_LABEL, HISTORY_LABEL, STATUS_LABEL, ROLE_LABEL, fmtDateTime, fromNow, toLocalInput, fromLocalInput, nn, errMsg, slugify } from '../lib';
import type { ArticleStatus } from '@workspace/api-client-react';

type Form = {
  title: string; slug: string; summary: string; content: string; categoryId: string; language: ContentLanguage;
  coverImage: string; coverCaption: string; authorName: string; keywords: string[]; tags: string[];
  sourceName: string; sourceUrl: string; isFeatured: boolean; eventStartAt: string; eventLocation: string;
  seoTitle: string; seoDescription: string; unpublishAt: string;
};
const EMPTY: Form = {
  title: '', slug: '', summary: '', content: '', categoryId: 'none', language: 'vi', coverImage: '', coverCaption: '', authorName: '',
  keywords: [], tags: [], sourceName: '', sourceUrl: '', isFeatured: false, eventStartAt: '', eventLocation: '', seoTitle: '', seoDescription: '', unpublishAt: '',
};
function fromArticle(a: AdminArticle): Form {
  return {
    title: a.title, slug: a.slug, summary: a.summary, content: a.content, categoryId: a.categoryId ? String(a.categoryId) : 'none', language: a.language,
    coverImage: a.coverImage ?? '', coverCaption: a.coverCaption ?? '', authorName: a.authorName ?? '', keywords: a.keywords, tags: a.tags,
    sourceName: a.sourceName ?? '', sourceUrl: a.sourceUrl ?? '', isFeatured: a.isFeatured, eventStartAt: toLocalInput(a.eventStartAt),
    eventLocation: a.eventLocation ?? '', seoTitle: a.seoTitle ?? '', seoDescription: a.seoDescription ?? '', unpublishAt: toLocalInput(a.unpublishAt),
  };
}
function toPayload(f: Form): ArticleInput {
  return {
    title: f.title.trim(), slug: f.slug.trim() || undefined, summary: f.summary, content: f.content,
    categoryId: f.categoryId === 'none' ? null : Number(f.categoryId), language: f.language,
    coverImage: nn(f.coverImage), coverCaption: nn(f.coverCaption), authorName: nn(f.authorName), keywords: f.keywords, tags: f.tags,
    sourceName: nn(f.sourceName), sourceUrl: nn(f.sourceUrl), isFeatured: f.isFeatured, eventStartAt: fromLocalInput(f.eventStartAt),
    eventLocation: nn(f.eventLocation), seoTitle: nn(f.seoTitle), seoDescription: nn(f.seoDescription), unpublishAt: fromLocalInput(f.unpublishAt),
  };
}

const ACTION_ICON: Record<TransitionAction, typeof Send> = { submit: Send, request_changes: MessageSquareWarning, approve: CheckCircle2, publish: Globe, unpublish: EyeOff, revert_to_draft: Undo };

export default function ArticleEditorPage({ id }: { id?: number }) {
  const isNew = !id;
  const me = useMe();
  const qc = useQueryClient();
  const notify = useNotify();
  const [, navigate] = useLocation();
  const { data: article, isLoading, error, refetch } = useGetAdminArticle(id ?? 0, { query: { enabled: !!id, queryKey: getGetAdminArticleQueryKey(id ?? 0) } });
  const cats = useListCategories();
  const create = useCreateArticle();
  const update = useUpdateArticle();
  const del = useDeleteArticle();
  const transition = useTransitionArticle();

  const [f, setF] = useState<Form>(EMPTY);
  const [dirty, setDirty] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const initFor = useRef<number | null>(null);
  useEffect(() => {
    if (article && initFor.current !== article.id) {
      initFor.current = article.id;
      setF(fromArticle(article));
      setDirty(false);
      setEditorKey((k) => k + 1);
    }
  }, [article]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF((p) => ({ ...p, [k]: v })); setDirty(true); };
  const setContent = (html: string) => { set('content', html); };
  const replaceContent = (html: string) => { set('content', html); setEditorKey((k) => k + 1); };

  const status: ArticleStatus = article?.status ?? 'draft';
  const editable = isNew
    ? me.role !== 'reviewer'
    : me.role === 'admin' || (me.role === 'editor' && (status === 'draft' || status === 'changes_requested')) || (me.role === 'reviewer' && (status === 'pending' || status === 'approved'));
  const canDelete = !isNew && (me.role === 'admin' || (me.role === 'editor' && article?.createdById === me.id && (status === 'draft' || status === 'changes_requested')));

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListAdminArticlesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
  };

  const save = async (silent = false): Promise<boolean> => {
    if (!f.title.trim()) { notify.fail(new Error('Tiêu đề không được để trống'), 'Chưa thể lưu'); return false; }
    try {
      if (isNew) {
        const a = await create.mutateAsync({ data: toPayload(f) });
        invalidate();
        notify.ok('Đã tạo bản nháp', 'Bài viết được lưu ở trạng thái Nháp.');
        navigate(`/quan-tri/bai-viet/${a.id}`);
      } else {
        const a = await update.mutateAsync({ id: id!, data: toPayload(f) });
        qc.setQueryData(getGetAdminArticleQueryKey(id!), a);
        setDirty(false);
        invalidate();
        if (!silent) notify.ok('Đã lưu thay đổi', fmtDateTime(a.updatedAt));
      }
      return true;
    } catch (e) { notify.fail(e, 'Lưu không thành công'); return false; }
  };

  // ctrl+s
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); void saveRef.current(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  /* workflow */
  const [dlg, setDlg] = useState<TransitionAction | null>(null);
  const [note, setNote] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [unpubAt, setUnpubAt] = useState('');
  const openAction = (a: TransitionAction) => { setNote(''); setPublishAt(''); setUnpubAt(f.unpublishAt); setDlg(a); };
  const runAction = async () => {
    if (!dlg || !id) return;
    if (dlg === 'request_changes' && !note.trim()) { notify.fail(new Error('Vui lòng ghi rõ nội dung cần chỉnh sửa'), 'Thiếu ghi chú'); return; }
    if (dirty && editable) { const ok = await save(true); if (!ok) return; }
    transition.mutate({ id, data: { action: dlg, note: nn(note), publishAt: dlg === 'publish' ? fromLocalInput(publishAt) : undefined, unpublishAt: dlg === 'publish' ? fromLocalInput(unpubAt) : undefined } }, {
      onSuccess: (a) => {
        qc.setQueryData(getGetAdminArticleQueryKey(id), a);
        initFor.current = null;
        invalidate();
        setDlg(null);
        const msg = a.status === 'scheduled' ? `Bài sẽ tự động đăng lúc ${fmtDateTime(a.publishedAt)}.` : `Trạng thái mới: ${STATUS_LABEL[a.status]}.`;
        notify.ok(`${ACTION_LABEL[dlg]} thành công`, msg);
      },
      onError: (e) => notify.fail(e),
    });
  };

  if (!isNew && isLoading) return <div className="grid lg:grid-cols-[1fr_340px] gap-5"><div className="space-y-3"><Skeleton className="h-10" /><Skeleton className="h-24" /><Skeleton className="h-96" /></div><Skeleton className="h-96" /></div>;
  if (!isNew && (error || !article)) return <ErrorBox error={error} onRetry={() => refetch()} />;
  if (isNew && me.role === 'reviewer') return <Empty icon={<Lock className="h-5 w-5" />} title="Cán bộ duyệt không tạo bài mới" desc="Vai trò Duyệt nội dung chỉ duyệt và xuất bản bài do biên tập viên gửi." />;

  const saving = create.isPending || update.isPending;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4 sticky top-12 z-10 -mx-4 md:-mx-6 px-4 md:px-6 py-2 bg-background/90 backdrop-blur border-b border-border">
        <Button variant="ghost" size="sm" asChild><Link href="/quan-tri/bai-viet" data-testid="link-back"><ArrowLeft className="h-4 w-4 mr-1" />Bài viết</Link></Button>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-[13px] font-medium truncate max-w-[40ch]">{isNew ? 'Bài viết mới' : article!.title}</span>
        {!isNew && <StatusChip status={status} />}
        {!editable && <Chip><Lock className="h-3 w-3" />Chỉ xem</Chip>}
        <div className="ml-auto flex items-center gap-2">
          {dirty && <span className="text-[12px] text-[hsl(32_90%_32%)]">Có thay đổi chưa lưu</span>}
          {canDelete && (
            <Confirm title="Xóa bài viết này?" desc="Bài viết và lịch sử xử lý sẽ bị xóa vĩnh viễn. Không thể hoàn tác."
              onConfirm={() => del.mutate({ id: id! }, { onSuccess: () => { invalidate(); notify.ok('Đã xóa bài viết'); navigate('/quan-tri/bai-viet'); }, onError: (e) => notify.fail(e) })}
              trigger={<Button variant="ghost" size="sm" className="text-destructive" data-testid="button-delete-article"><Trash2 className="h-4 w-4 mr-1" />Xóa</Button>} />
          )}
          {editable && (
            <Button size="sm" onClick={() => void save()} disabled={saving || (!dirty && !isNew)} data-testid="button-save-article">
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}{isNew ? 'Tạo bản nháp' : 'Lưu'}
            </Button>
          )}
        </div>
      </div>

      {article?.origin === 'crawler' && (
        <div className="mb-4 flex items-start gap-2.5 rounded-md border border-[hsl(214_40%_84%)] bg-accent/60 px-3 py-2.5 text-[12.5px]">
          <Rss className="h-4 w-4 text-primary mt-0.5" />
          <div>Bài này được nhập từ nguồn tin tự động <strong>{article.sourceName}</strong>. Cần biên tập lại nội dung, ghi rõ nguồn và gửi duyệt trước khi xuất bản.
            {article.sourceUrl && <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="ml-1.5 text-primary inline-flex items-center gap-0.5 hover:underline">Xem bài gốc<ExternalLink className="h-3 w-3" /></a>}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
        <div className="space-y-4 min-w-0">
          <div className="bg-card border border-card-border rounded-md shadow-sm p-4 space-y-3">
            <textarea value={f.title} onChange={(e) => set('title', e.target.value)} disabled={!editable} rows={2} placeholder="Tiêu đề bài viết"
              className="w-full resize-none bg-transparent outline-none adm-serif text-[26px] font-semibold leading-tight placeholder:text-muted-foreground/50" data-testid="input-title" />
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <span className="shrink-0">Đường dẫn: /tin-tuc/</span>
              <input value={f.slug} onChange={(e) => set('slug', e.target.value)} disabled={!editable} placeholder={slugify(f.title) || 'tu-dong-sinh'} className="flex-1 bg-transparent outline-none adm-mono text-foreground/80 border-b border-dashed border-border focus:border-primary" data-testid="input-slug" />
            </div>
            <Textarea value={f.summary} onChange={(e) => set('summary', e.target.value)} disabled={!editable} rows={3} placeholder="Sapo / tóm tắt — 1–3 câu nêu ý chính" className="text-[13.5px]" data-testid="input-summary" />
          </div>

          <RichEditor value={f.content} onChange={setContent} editable={editable} resetKey={`${id ?? 'new'}-${editorKey}`} placeholder="Soạn nội dung bài viết…" />

          <Tabs defaultValue="meta" className="bg-card border border-card-border rounded-md shadow-sm">
            <TabsList className="m-2">
              <TabsTrigger value="meta">Phân loại</TabsTrigger>
              <TabsTrigger value="cover">Ảnh đại diện</TabsTrigger>
              <TabsTrigger value="source">Nguồn & sự kiện</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>
            <fieldset disabled={!editable} className="contents">
              <TabsContent value="meta" className="p-4 pt-1 grid md:grid-cols-2 gap-4">
                <F label="Chuyên mục">
                  <Select value={f.categoryId} onValueChange={(v) => set('categoryId', v)} disabled={!editable}>
                    <SelectTrigger data-testid="select-article-category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Chưa phân loại</SelectItem>
                      {cats.data?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.parentId ? '— ' : ''}{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </F>
                <F label="Ngôn ngữ">
                  <Select value={f.language} onValueChange={(v) => set('language', v as ContentLanguage)} disabled={!editable}>
                    <SelectTrigger data-testid="select-language"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="vi">Tiếng Việt</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
                  </Select>
                </F>
                <F label="Tác giả hiển thị"><Input value={f.authorName} onChange={(e) => set('authorName', e.target.value)} placeholder="VD: Phòng Truyền thông" data-testid="input-author" /></F>
                <F label="Nổi bật trên trang chủ">
                  <label className="flex items-center gap-2 h-9 text-[13px]"><Switch checked={f.isFeatured} onCheckedChange={(v) => set('isFeatured', v)} disabled={!editable} data-testid="switch-featured" />Đánh dấu tin nổi bật</label>
                </F>
                <F label="Thẻ (tags)"><TagInput value={f.tags} onChange={(v) => set('tags', v)} testId="input-tags" /></F>
                <F label="Từ khóa"><TagInput value={f.keywords} onChange={(v) => set('keywords', v)} testId="input-keywords" /></F>
              </TabsContent>
              <TabsContent value="cover" className="p-4 pt-1 space-y-4">
                <F label="Ảnh đại diện"><ImageField value={f.coverImage} onChange={(v) => set('coverImage', v)} testId="input-cover" /></F>
                <F label="Chú thích ảnh"><Input value={f.coverCaption} onChange={(e) => set('coverCaption', e.target.value)} data-testid="input-cover-caption" /></F>
              </TabsContent>
              <TabsContent value="source" className="p-4 pt-1 grid md:grid-cols-2 gap-4">
                <F label="Tên nguồn tin"><Input value={f.sourceName} onChange={(e) => set('sourceName', e.target.value)} placeholder="VD: Bộ Khoa học và Công nghệ" data-testid="input-source-name" /></F>
                <F label="Đường dẫn nguồn"><Input value={f.sourceUrl} onChange={(e) => set('sourceUrl', e.target.value)} placeholder="https://" data-testid="input-source-url" /></F>
                <F label="Thời gian sự kiện" hint="Chỉ dùng cho tin sự kiện"><Input type="datetime-local" value={f.eventStartAt} onChange={(e) => set('eventStartAt', e.target.value)} data-testid="input-event-start" /></F>
                <F label="Địa điểm sự kiện"><Input value={f.eventLocation} onChange={(e) => set('eventLocation', e.target.value)} data-testid="input-event-location" /></F>
              </TabsContent>
              <TabsContent value="seo" className="p-4 pt-1 space-y-4">
                <F label="Tiêu đề SEO" hint={`${f.seoTitle.length}/60 ký tự`}><Input value={f.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} placeholder={f.title} data-testid="input-seo-title" /></F>
                <F label="Mô tả SEO" hint={`${f.seoDescription.length}/160 ký tự`}><Textarea value={f.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} rows={3} placeholder={f.summary} data-testid="input-seo-description" /></F>
                <div className="rounded border border-border p-3 bg-background">
                  <div className="adm-eyebrow mb-1">Xem trước kết quả tìm kiếm</div>
                  <div className="text-[hsl(216_66%_36%)] text-[15px] truncate">{f.seoTitle || f.title || 'Tiêu đề bài viết'}</div>
                  <div className="text-[12px] text-[hsl(158_50%_28%)] adm-mono truncate">…/tin-tuc/{f.slug || slugify(f.title)}</div>
                  <div className="text-[12.5px] text-muted-foreground line-clamp-2">{f.seoDescription || f.summary || 'Mô tả ngắn sẽ hiển thị tại đây.'}</div>
                </div>
              </TabsContent>
            </fieldset>
          </Tabs>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28">
          {!isNew && article && (
            <Panel title="Quy trình duyệt" bodyClass="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <StatusChip status={article.status} />
                <span className="text-[11.5px] text-muted-foreground">bởi {article.createdByName ?? '—'}</span>
              </div>
              {article.status === 'scheduled' && <div className="text-[12.5px] rounded bg-[hsl(262_40%_96%)] text-[hsl(262_40%_32%)] px-2.5 py-2">Tự động đăng lúc <strong>{fmtDateTime(article.publishedAt)}</strong></div>}
              {article.status === 'published' && <div className="text-[12.5px] text-muted-foreground">Xuất bản {fmtDateTime(article.publishedAt)}</div>}
              {article.unpublishAt && <div className="text-[12.5px] text-muted-foreground">Tự động gỡ lúc <strong className="text-foreground">{fmtDateTime(article.unpublishAt)}</strong></div>}
              {article.reviewerNote && (
                <div className="rounded border-l-2 border-sidebar-primary bg-[hsl(6_80%_97%)] px-3 py-2">
                  <div className="adm-eyebrow mb-0.5">Ghi chú duyệt</div>
                  <div className="text-[12.5px]">{article.reviewerNote}</div>
                </div>
              )}
              {article.availableActions.length ? (
                <div className="grid gap-1.5">
                  {article.availableActions.map((a) => {
                    const Icon = ACTION_ICON[a];
                    const primary = a === 'publish' || a === 'approve' || a === 'submit';
                    return (
                      <Button key={a} variant={primary ? 'default' : a === 'unpublish' || a === 'request_changes' ? 'outline' : 'secondary'}
                        className={cn('justify-start', a === 'publish' && 'bg-[hsl(158_60%_28%)] border-[hsl(158_60%_24%)] text-[hsl(40_40%_98%)]')}
                        onClick={() => openAction(a)} disabled={transition.isPending} data-testid={`button-action-${a}`}>
                        <Icon className="h-4 w-4 mr-2" />{ACTION_LABEL[a]}
                      </Button>
                    );
                  })}
                </div>
              ) : <div className="text-[12px] text-muted-foreground">Không có thao tác nào dành cho vai trò {ROLE_LABEL[me.role]} ở trạng thái này.</div>}
              <div className="text-[11.5px] text-muted-foreground border-t border-border pt-2">Lượt xem: <span className="adm-num">{article.viewCount.toLocaleString('vi-VN')}</span> · Cập nhật {fromNow(article.updatedAt)}</div>
            </Panel>
          )}
          {isNew && (
            <Panel title="Quy trình duyệt" bodyClass="p-4 text-[12.5px] text-muted-foreground">
              Bài mới được lưu ở trạng thái <span className="st st-draft">Nháp</span>. Sau khi tạo, bạn có thể gửi duyệt; cán bộ duyệt sẽ phê duyệt và xuất bản.
            </Panel>
          )}

          <AiPanel form={f} editable={editable}
            onTitle={(v) => set('title', v)} onSummary={(v) => set('summary', v)}
            onKeywords={(v) => set('keywords', Array.from(new Set([...f.keywords, ...v])))}
            onContent={replaceContent} onSeo={(t, d) => { if (t) set('seoTitle', t); if (d) set('seoDescription', d); }} />

          {!isNew && article && (
            <Panel title="Lịch sử xử lý" bodyClass="max-h-[420px] overflow-auto adm-scroll">
              {article.history.length ? (
                <ol className="px-4 py-3">
                  {[...article.history].reverse().map((h) => (
                    <li key={h.id} className="relative pl-5 pb-3.5 last:pb-0 border-l border-border ml-1" data-testid={`history-${h.id}`}>
                      <span className={cn('absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-card', `st-${h.toStatus}`)} style={{ background: 'currentColor' }} />
                      <div className="text-[12.5px] font-semibold">{HISTORY_LABEL[h.action] ?? h.action}</div>
                      <div className="text-[11.5px] text-muted-foreground">{h.actorName}{h.actorRole ? ` (${ROLE_LABEL[h.actorRole as keyof typeof ROLE_LABEL] ?? h.actorRole})` : ''} · {fmtDateTime(h.createdAt)}</div>
                      {h.fromStatus !== h.toStatus && <div className="text-[11px] text-muted-foreground mt-0.5">{h.fromStatus ? `${STATUS_LABEL[h.fromStatus as ArticleStatus] ?? h.fromStatus} → ` : ''}{STATUS_LABEL[h.toStatus as ArticleStatus] ?? h.toStatus}</div>}
                      {h.note && <div className="mt-1 text-[12px] bg-muted rounded px-2 py-1">{h.note}</div>}
                    </li>
                  ))}
                </ol>
              ) : <Empty title="Chưa có lịch sử" />}
            </Panel>
          )}
        </aside>
      </div>

      <Dialog open={!!dlg} onOpenChange={(o) => !o && setDlg(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dlg ? ACTION_LABEL[dlg] : ''}</DialogTitle>
            <DialogDescription>
              {dlg === 'publish' && 'Để trống thời điểm để xuất bản ngay. Chọn thời điểm trong tương lai để hẹn giờ đăng.'}
              {dlg === 'request_changes' && 'Ghi rõ những điểm biên tập viên cần chỉnh sửa. Ghi chú sẽ hiển thị trên bài viết.'}
              {dlg === 'submit' && 'Bài viết sẽ chuyển sang Chờ duyệt và không thể chỉnh sửa cho tới khi có phản hồi.'}
              {dlg === 'approve' && 'Xác nhận nội dung đạt yêu cầu. Bài sẵn sàng để xuất bản.'}
              {dlg === 'unpublish' && 'Bài viết sẽ không còn hiển thị trên trang công khai.'}
              {dlg === 'revert_to_draft' && 'Bài viết quay về trạng thái Nháp để biên tập lại.'}
            </DialogDescription>
          </DialogHeader>
          {dlg === 'publish' && (
            <div className="grid sm:grid-cols-2 gap-3">
              <F label="Thời điểm xuất bản" hint="Trống = đăng ngay"><Input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} data-testid="input-publish-at" /></F>
              <F label="Tự động gỡ lúc" hint="Không bắt buộc"><Input type="datetime-local" value={unpubAt} onChange={(e) => setUnpubAt(e.target.value)} data-testid="input-unpublish-at" /></F>
            </div>
          )}
          <F label={dlg === 'request_changes' ? 'Nội dung cần chỉnh sửa' : 'Ghi chú (không bắt buộc)'} required={dlg === 'request_changes'}>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} data-testid="input-transition-note" />
          </F>
          {dirty && editable && <p className="text-[12px] text-[hsl(32_90%_32%)]">Thay đổi chưa lưu sẽ được lưu trước khi thực hiện.</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlg(null)}>Hủy</Button>
            <Button onClick={() => void runAction()} disabled={transition.isPending} data-testid="button-confirm-transition">
              {transition.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {dlg === 'publish' && publishAt && new Date(publishAt) > new Date() ? 'Hẹn giờ đăng' : dlg ? ACTION_LABEL[dlg] : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- AI assistant ---------------- */
const TASKS: { t: AiTask; label: string }[] = [
  { t: 'titles', label: 'Gợi ý tiêu đề' }, { t: 'summary', label: 'Viết sapo' }, { t: 'keywords', label: 'Từ khóa' },
  { t: 'seo', label: 'SEO' }, { t: 'proofread', label: 'Soát lỗi' }, { t: 'rewrite', label: 'Viết lại' },
];

function AiPanel({ form, editable, onTitle, onSummary, onKeywords, onContent, onSeo }: {
  form: Form; editable: boolean; onTitle: (v: string) => void; onSummary: (v: string) => void; onKeywords: (v: string[]) => void;
  onContent: (html: string) => void; onSeo: (t: string | null, d: string | null) => void;
}) {
  const ai = useSuggestWithAi();
  const [task, setTask] = useState<AiTask>('titles');
  const [instruction, setInstruction] = useState('');
  const [res, setRes] = useState<AiSuggestion | null>(null);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const mark = (k: string) => setUsed((s) => new Set(s).add(k));
  const run = () => {
    setRes(null); setUsed(new Set());
    ai.mutate({ data: { task, title: form.title || null, summary: form.summary || null, content: form.content || null, instruction: instruction || null } }, { onSuccess: setRes });
  };
  const UseBtn = ({ k, on }: { k: string; on: () => void }) => used.has(k)
    ? <span className="inline-flex items-center gap-0.5 text-[11px] text-[hsl(158_60%_28%)] shrink-0"><Check className="h-3 w-3" />Đã dùng</span>
    : <Button size="sm" variant="outline" className="h-6 px-2 text-[11px] shrink-0" disabled={!editable} onClick={() => { on(); mark(k); }} data-testid={`button-ai-apply-${k}`}>Dùng</Button>;

  return (
    <Panel title={<span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-sidebar-primary" />Trợ lý AI</span>} bodyClass="p-4 space-y-3">
      <p className="text-[11.5px] text-muted-foreground leading-snug">Gợi ý chỉ mang tính tham khảo — <strong className="text-foreground">cán bộ phải kiểm tra</strong> trước khi sử dụng. Không có gì được áp dụng tự động.</p>
      <div className="flex flex-wrap gap-1">
        {TASKS.map((x) => (
          <button key={x.t} onClick={() => setTask(x.t)} className={cn('text-[12px] px-2 py-1 rounded border transition-colors', task === x.t ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted')} data-testid={`button-ai-task-${x.t}`}>{x.label}</button>
        ))}
      </div>
      <Input value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Yêu cầu thêm (không bắt buộc)" className="h-8 text-[12.5px]" data-testid="input-ai-instruction" />
      <Button className="w-full" variant="secondary" onClick={run} disabled={ai.isPending || (!form.title && !form.content)} data-testid="button-ai-run">
        {ai.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}{ai.isPending ? 'Đang phân tích…' : 'Tạo gợi ý'}
      </Button>
      {ai.isError && <div className="text-[12px] rounded border border-[hsl(6_60%_86%)] bg-[hsl(6_80%_97%)] text-destructive px-2.5 py-2">{errMsg(ai.error)}</div>}
      {res && (
        <div className="space-y-3 adm-rise border-t border-border pt-3 text-[12.5px]">
          {res.titles.length > 0 && <div className="space-y-1.5">{res.titles.map((t, i) => <div key={i} className="flex gap-2 items-start"><span className="flex-1">{t}</span><UseBtn k={`t${i}`} on={() => onTitle(t)} /></div>)}</div>}
          {res.summary && <div className="flex gap-2 items-start"><p className="flex-1 bg-muted rounded p-2">{res.summary}</p><UseBtn k="sum" on={() => onSummary(res.summary!)} /></div>}
          {res.keywords.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-1 mb-1.5">{res.keywords.map((k) => <span key={k} className="rounded bg-secondary px-1.5 py-0.5 text-[11.5px]">{k}</span>)}</div>
              {used.has('kw') ? <span className="text-[11px] text-[hsl(158_60%_28%)]">Đã thêm vào từ khóa</span> : <Button size="sm" variant="outline" className="h-6 text-[11px]" disabled={!editable} onClick={() => { onKeywords(res.keywords); mark('kw'); }}><Plus className="h-3 w-3 mr-0.5" />Thêm tất cả</Button>}
            </div>
          )}
          {(res.seoTitle || res.seoDescription) && (
            <div className="flex gap-2 items-start"><div className="flex-1 bg-muted rounded p-2"><div className="font-semibold">{res.seoTitle}</div><div className="text-muted-foreground">{res.seoDescription}</div></div><UseBtn k="seo" on={() => onSeo(res.seoTitle, res.seoDescription)} /></div>
          )}
          {res.rewrite && (
            <div>
              <div className="prose prose-sm max-w-none bg-muted rounded p-2 max-h-56 overflow-auto adm-scroll" dangerouslySetInnerHTML={{ __html: res.rewrite }} />
              <div className="mt-1.5 flex justify-end">
                {used.has('rw') ? <span className="text-[11px] text-[hsl(158_60%_28%)]">Đã thay nội dung</span> : (
                  <Confirm title="Thay toàn bộ nội dung?" desc="Nội dung hiện tại trong trình soạn thảo sẽ được thay bằng bản viết lại. Bạn vẫn có thể hoàn tác trước khi lưu." confirmLabel="Thay nội dung" destructive={false}
                    onConfirm={() => { onContent(res.rewrite!); mark('rw'); }} trigger={<Button size="sm" variant="outline" className="h-6 text-[11px]" disabled={!editable}>Thay nội dung</Button>} />
                )}
              </div>
            </div>
          )}
          {res.task === 'proofread' && (res.issues.length ? (
            <div className="space-y-2">{res.issues.map((is, i) => (
              <div key={i} className="rounded border border-border p-2">
                <div><span className="line-through text-destructive/80">{is.original}</span> → <strong>{is.suggestion}</strong></div>
                <div className="text-muted-foreground text-[11.5px] mt-0.5">{is.reason}</div>
                <div className="mt-1 flex justify-end"><UseBtn k={`i${i}`} on={() => {
                  if (form.content.includes(is.original)) onContent(form.content.replace(is.original, is.suggestion));
                  else if (form.title.includes(is.original)) onTitle(form.title.replace(is.original, is.suggestion));
                  else if (form.summary.includes(is.original)) onSummary(form.summary.replace(is.original, is.suggestion));
                }} /></div>
              </div>
            ))}</div>
          ) : <div className="text-[hsl(158_60%_28%)] flex items-center gap-1"><Check className="h-3.5 w-3.5" />Không phát hiện lỗi.</div>)}
          <div className="text-[10.5px] text-muted-foreground">Mô hình {res.model} · {fmtDateTime(res.generatedAt)}</div>
        </div>
      )}
    </Panel>
  );
}
