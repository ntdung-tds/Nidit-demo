import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetSiteSettings, useUpdateSiteSettings, getGetSiteSettingsQueryKey } from '@workspace/api-client-react';
import type { SiteSettings, SiteSettingsUpdate } from '@workspace/api-client-react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { PageHeader, Panel, ErrorBox, F, TagInput, useNotify } from '../ui';
import { fmtDateTime, nn } from '../lib';

type FormT = Omit<SiteSettings, 'updatedAt' | 'mapEmbedUrl' | 'facebookUrl' | 'youtubeUrl' | 'demoNotice'> & { mapEmbedUrl: string; facebookUrl: string; youtubeUrl: string; demoNotice: string; demoOn: boolean };

export default function SettingsPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const { data, isLoading, error, refetch } = useGetSiteSettings();
  const save = useUpdateSiteSettings();
  const [f, setF] = useState<FormT | null>(null);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (data && !f) {
      const { updatedAt: _u, ...rest } = data;
      setF({ ...rest, mapEmbedUrl: data.mapEmbedUrl ?? '', facebookUrl: data.facebookUrl ?? '', youtubeUrl: data.youtubeUrl ?? '', demoNotice: data.demoNotice ?? '', demoOn: !!data.demoNotice });
    }
  }, [data, f]);

  if (isLoading || (!f && !error)) return <div className="space-y-3"><Skeleton className="h-10 w-72" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div>;
  if (error || !f) return <ErrorBox error={error} onRetry={() => refetch()} />;
  const set = <K extends keyof FormT>(k: K, v: FormT[K]) => { setF((p) => (p ? { ...p, [k]: v } : p)); setDirty(true); };
  const T = (k: keyof FormT, label: string, opts: { hint?: string; mono?: boolean; area?: boolean; span?: boolean } = {}) => (
    <F label={label} hint={opts.hint} className={opts.span ? 'sm:col-span-2' : undefined}>
      {opts.area
        ? <Textarea value={f[k] as string} onChange={(e) => set(k, e.target.value as never)} rows={2} data-testid={`input-settings-${k}`} />
        : <Input value={f[k] as string} onChange={(e) => set(k, e.target.value as never)} className={opts.mono ? 'adm-mono' : undefined} data-testid={`input-settings-${k}`} />}
    </F>
  );
  const submit = () => {
    const body: SiteSettingsUpdate = {
      siteName: f.siteName, siteNameEn: f.siteNameEn, shortName: f.shortName, parentOrg: f.parentOrg, parentOrgEn: f.parentOrgEn, parentPortalUrl: f.parentPortalUrl,
      address: f.address, addressEn: f.addressEn, phone: f.phone, email: f.email, responsiblePerson: f.responsiblePerson, responsibleTitle: f.responsibleTitle,
      copyrightNote: f.copyrightNote, workingHours: f.workingHours, mapEmbedUrl: nn(f.mapEmbedUrl), facebookUrl: nn(f.facebookUrl), youtubeUrl: nn(f.youtubeUrl),
      seoTitle: f.seoTitle, seoDescription: f.seoDescription, seoKeywords: f.seoKeywords, demoNotice: f.demoOn ? nn(f.demoNotice) : null,
    };
    save.mutate({ data: body }, {
      onSuccess: (s) => { qc.setQueryData(getGetSiteSettingsQueryKey(), s); setDirty(false); notify.ok('Đã lưu cấu hình', 'Trang công khai cập nhật ngay.'); },
      onError: (e) => notify.fail(e),
    });
  };

  return (
    <div className="pb-16">
      <PageHeader eyebrow="Hệ thống" title="Cấu hình website" desc={`Thông tin đơn vị, liên hệ, mạng xã hội và SEO. Cập nhật lần cuối ${fmtDateTime(data?.updatedAt)}.`}
        actions={<Button onClick={submit} disabled={!dirty || save.isPending} data-testid="button-save-settings">{save.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}Lưu cấu hình</Button>} />
      <div className="grid xl:grid-cols-2 gap-4">
        <Panel title="Đơn vị" bodyClass="p-4 grid sm:grid-cols-2 gap-3">
          {T('siteName', 'Tên đơn vị', { span: true })}{T('siteNameEn', 'Tên tiếng Anh', { span: true })}
          {T('shortName', 'Tên viết tắt')}{T('parentPortalUrl', 'Cổng cơ quan chủ quản', { mono: true })}
          {T('parentOrg', 'Cơ quan chủ quản')}{T('parentOrgEn', 'Cơ quan chủ quản (EN)')}
        </Panel>
        <Panel title="Liên hệ" bodyClass="p-4 grid sm:grid-cols-2 gap-3">
          {T('address', 'Địa chỉ', { span: true })}{T('addressEn', 'Địa chỉ (EN)', { span: true })}
          {T('phone', 'Điện thoại')}{T('email', 'Email')}
          {T('workingHours', 'Giờ làm việc', { span: true })}
          {T('mapEmbedUrl', 'Bản đồ nhúng', { mono: true, span: true, hint: 'Đường dẫn iframe Google Maps' })}
        </Panel>
        <Panel title="Chịu trách nhiệm nội dung" bodyClass="p-4 grid sm:grid-cols-2 gap-3">
          {T('responsiblePerson', 'Người chịu trách nhiệm')}{T('responsibleTitle', 'Chức vụ')}
          {T('copyrightNote', 'Ghi chú bản quyền', { area: true, span: true })}
        </Panel>
        <Panel title="Mạng xã hội" bodyClass="p-4 grid gap-3">
          {T('facebookUrl', 'Facebook', { mono: true })}{T('youtubeUrl', 'YouTube', { mono: true })}
        </Panel>
        <Panel title="SEO mặc định" bodyClass="p-4 grid gap-3">
          {T('seoTitle', 'Tiêu đề', { hint: `${f.seoTitle.length}/60` })}
          {T('seoDescription', 'Mô tả', { area: true, hint: `${f.seoDescription.length}/160` })}
          <F label="Từ khóa"><TagInput value={f.seoKeywords} onChange={(v) => set('seoKeywords', v)} testId="input-settings-seoKeywords" /></F>
        </Panel>
        <Panel title="Thông báo bản demo" bodyClass="p-4 grid gap-3">
          <label className="flex items-center gap-2 text-[13px]"><Switch checked={f.demoOn} onCheckedChange={(v) => set('demoOn', v)} data-testid="switch-demo-notice" />Hiển thị dải thông báo trên trang công khai</label>
          {f.demoOn && <Textarea value={f.demoNotice} onChange={(e) => set('demoNotice', e.target.value)} rows={2} placeholder="Đây là bản trình diễn, dữ liệu mang tính minh họa." data-testid="input-settings-demoNotice" />}
        </Panel>
      </div>
      {dirty && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-[calc(50%+116px)] z-40 flex items-center gap-3 rounded-md bg-sidebar text-sidebar-foreground px-4 py-2 shadow-lg adm-rise">
          <span className="text-[12.5px]">Có thay đổi chưa lưu</span>
          <Button size="sm" onClick={submit} disabled={save.isPending}>Lưu ngay</Button>
        </div>
      )}
    </div>
  );
}
