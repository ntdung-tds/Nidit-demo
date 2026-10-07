import {
  db,
  activityFieldsTable,
  categoriesTable,
  type ActivityFieldRow,
  type ActivityLogRow,
  type AlbumRow,
  type ArticleHistoryRow,
  type ArticleRow,
  type BackupRow,
  type CategoryRow,
  type CrawlItemRow,
  type CrawlSourceRow,
  type DatasetRow,
  type DocumentRow,
  type EvaluationServiceRow,
  type InquiryRow,
  type LeaderRow,
  type MediaRow,
  type MenuItemRow,
  type OrgUnitRow,
  type ProjectRow,
  type PublicationRow,
  type SiteSettingsRow,
  type StaticPageRow,
  type UserRow,
} from "@workspace/db";
import type {
  ActivityField,
  ActivityLog,
  AdminArticle,
  AdminArticleSummary,
  Album,
  Article,
  ArticleHistoryEntry,
  ArticleSummary,
  Backup,
  Category,
  CrawlItem,
  CrawlSource,
  Dataset,
  DocumentItem,
  EvaluationService,
  Inquiry,
  Leader,
  MediaItem,
  MenuItem,
  OrgUnit,
  Project,
  Publication,
  SiteSettings,
  StaticPage,
  TransitionAction,
  User,
} from "@workspace/api-zod";
import { readingMinutes } from "./text";

/** Bảng tra cứu nhỏ dùng chung (chuyên mục, lĩnh vực) */
export interface Lookups {
  categories: Map<number, CategoryRow>;
  fields: Map<number, ActivityFieldRow>;
}

export async function loadLookups(): Promise<Lookups> {
  const [categories, fields] = await Promise.all([
    db.select().from(categoriesTable),
    db.select().from(activityFieldsTable),
  ]);
  return {
    categories: new Map(categories.map((c) => [c.id, c])),
    fields: new Map(fields.map((f) => [f.id, f])),
  };
}

type Lang = "vi" | "en";
const asLang = (value: string): Lang => (value === "en" ? "en" : "vi");

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    role: row.role as User["role"],
    title: row.title,
    unit: row.unit,
    isActive: row.isActive,
    lastLoginAt: row.lastLoginAt,
    createdAt: row.createdAt,
  };
}

export function toSiteSettings(row: SiteSettingsRow): SiteSettings {
  return {
    siteName: row.siteName,
    siteNameEn: row.siteNameEn,
    shortName: row.shortName,
    parentOrg: row.parentOrg,
    parentOrgEn: row.parentOrgEn,
    parentPortalUrl: row.parentPortalUrl,
    address: row.address,
    addressEn: row.addressEn,
    phone: row.phone,
    email: row.email,
    responsiblePerson: row.responsiblePerson,
    responsibleTitle: row.responsibleTitle,
    copyrightNote: row.copyrightNote,
    workingHours: row.workingHours,
    mapEmbedUrl: row.mapEmbedUrl,
    facebookUrl: row.facebookUrl,
    youtubeUrl: row.youtubeUrl,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    seoKeywords: row.seoKeywords,
    demoNotice: row.demoNotice,
    updatedAt: row.updatedAt,
  };
}

export function toMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    label: row.label,
    labelEn: row.labelEn,
    url: row.url,
    parentId: row.parentId,
    location: row.location as MenuItem["location"],
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    openInNewTab: row.openInNewTab,
  };
}

export function toCategory(row: CategoryRow, articleCount: number): Category {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.nameEn,
    slug: row.slug,
    parentId: row.parentId,
    description: row.description,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    articleCount,
  };
}

export function toStaticPage(row: StaticPageRow, updatedByName: string | null): StaticPage {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    titleEn: row.titleEn,
    summary: row.summary,
    content: row.content,
    contentEn: row.contentEn,
    status: row.status as StaticPage["status"],
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    updatedAt: row.updatedAt,
    updatedByName,
  };
}

function categoryLabel(row: ArticleRow, lk: Lookups): { name: string | null; slug: string | null } {
  const cat = row.categoryId ? lk.categories.get(row.categoryId) : undefined;
  if (!cat) return { name: null, slug: null };
  return { name: row.language === "en" && cat.nameEn ? cat.nameEn : cat.name, slug: cat.slug };
}

export function toArticleSummary(row: ArticleRow, lk: Lookups): ArticleSummary {
  const cat = categoryLabel(row, lk);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    coverImage: row.coverImage,
    categoryId: row.categoryId,
    categoryName: cat.name,
    categorySlug: cat.slug,
    publishedAt: row.publishedAt,
    viewCount: row.viewCount,
    isFeatured: row.isFeatured,
    tags: row.tags,
    authorName: row.authorName,
    sourceName: row.sourceName,
    language: asLang(row.language),
    eventStartAt: row.eventStartAt,
    eventLocation: row.eventLocation,
    readingMinutes: readingMinutes(row.content),
  };
}

export function toArticle(row: ArticleRow, lk: Lookups): Article {
  const cat = categoryLabel(row, lk);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    coverImage: row.coverImage,
    coverCaption: row.coverCaption,
    categoryId: row.categoryId,
    categoryName: cat.name,
    categorySlug: cat.slug,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    viewCount: row.viewCount,
    isFeatured: row.isFeatured,
    tags: row.tags,
    keywords: row.keywords,
    authorName: row.authorName,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    language: asLang(row.language),
    eventStartAt: row.eventStartAt,
    eventLocation: row.eventLocation,
    readingMinutes: readingMinutes(row.content),
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
  };
}

export function toAdminArticleSummary(
  row: ArticleRow,
  lk: Lookups,
  users: Map<number, string>,
): AdminArticleSummary {
  const cat = row.categoryId ? lk.categories.get(row.categoryId) : undefined;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status as AdminArticleSummary["status"],
    categoryId: row.categoryId,
    categoryName: cat?.name ?? null,
    language: asLang(row.language),
    coverImage: row.coverImage,
    createdById: row.createdById,
    createdByName: row.createdById ? (users.get(row.createdById) ?? null) : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    publishedAt: row.publishedAt,
    unpublishAt: row.unpublishAt,
    viewCount: row.viewCount,
    isFeatured: row.isFeatured,
    origin: row.origin as AdminArticleSummary["origin"],
    sourceName: row.sourceName,
    reviewerNote: row.reviewerNote,
  };
}

export function toHistoryEntry(row: ArticleHistoryRow): ArticleHistoryEntry {
  return {
    id: row.id,
    action: row.action,
    fromStatus: row.fromStatus,
    toStatus: row.toStatus,
    actorId: row.actorId,
    actorName: row.actorName,
    actorRole: row.actorRole,
    note: row.note,
    createdAt: row.createdAt,
  };
}

export function toAdminArticle(
  row: ArticleRow,
  lk: Lookups,
  users: Map<number, string>,
  history: ArticleHistoryRow[],
  availableActions: TransitionAction[],
): AdminArticle {
  const cat = row.categoryId ? lk.categories.get(row.categoryId) : undefined;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    status: row.status as AdminArticle["status"],
    categoryId: row.categoryId,
    categoryName: cat?.name ?? null,
    language: asLang(row.language),
    coverImage: row.coverImage,
    coverCaption: row.coverCaption,
    authorName: row.authorName,
    keywords: row.keywords,
    tags: row.tags,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    isFeatured: row.isFeatured,
    eventStartAt: row.eventStartAt,
    eventLocation: row.eventLocation,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    createdById: row.createdById,
    createdByName: row.createdById ? (users.get(row.createdById) ?? null) : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    publishedAt: row.publishedAt,
    unpublishAt: row.unpublishAt,
    viewCount: row.viewCount,
    origin: row.origin as AdminArticle["origin"],
    reviewerNote: row.reviewerNote,
    history: history.map(toHistoryEntry),
    availableActions,
  };
}

export interface FieldCounts {
  projectCount: number;
  publicationCount: number;
  datasetCount: number;
  serviceCount: number;
  documentCount: number;
}

export function toField(row: ActivityFieldRow, counts: FieldCounts): ActivityField {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameEn: row.nameEn,
    shortName: row.shortName,
    summary: row.summary,
    summaryEn: row.summaryEn,
    description: row.description,
    highlights: row.highlights,
    icon: row.icon,
    coverImage: row.coverImage,
    sortOrder: row.sortOrder,
    ...counts,
  };
}

export function toProject(row: ProjectRow, lk: Lookups): Project {
  const field = row.fieldId ? lk.fields.get(row.fieldId) : undefined;
  return {
    id: row.id,
    slug: row.slug,
    code: row.code,
    title: row.title,
    type: row.type,
    level: row.level,
    status: row.status as Project["status"],
    fieldId: row.fieldId,
    fieldName: field?.name ?? null,
    fieldSlug: field?.slug ?? null,
    leadName: row.leadName,
    leadUnit: row.leadUnit,
    startYear: row.startYear,
    endYear: row.endYear,
    budget: row.budget,
    summary: row.summary,
    objectives: row.objectives,
    results: row.results,
    partners: row.partners,
    milestones: row.milestones,
    keywords: row.keywords,
    coverImage: row.coverImage,
    updatedAt: row.updatedAt,
  };
}

export function toPublication(
  row: PublicationRow,
  lk: Lookups,
  projects: Map<number, Pick<ProjectRow, "title" | "slug">>,
): Publication {
  const field = row.fieldId ? lk.fields.get(row.fieldId) : undefined;
  const project = row.projectId ? projects.get(row.projectId) : undefined;
  return {
    id: row.id,
    title: row.title,
    authors: row.authors,
    venue: row.venue,
    type: row.type as Publication["type"],
    year: row.year,
    doi: row.doi,
    url: row.url,
    abstract: row.abstract,
    keywords: row.keywords,
    indexing: row.indexing,
    isInternational: row.isInternational,
    citationCount: row.citationCount,
    fieldId: row.fieldId,
    fieldName: field?.name ?? null,
    projectId: row.projectId,
    projectTitle: project?.title ?? null,
    projectSlug: project?.slug ?? null,
  };
}

export function toDataset(row: DatasetRow, lk: Lookups): Dataset {
  const field = row.fieldId ? lk.fields.get(row.fieldId) : undefined;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    fieldId: row.fieldId,
    fieldName: field?.name ?? null,
    fieldSlug: field?.slug ?? null,
    publisher: row.publisher,
    contactEmail: row.contactEmail,
    license: row.license,
    accessLevel: row.accessLevel as Dataset["accessLevel"],
    accessMethods: row.accessMethods,
    formats: row.formats,
    sizeLabel: row.sizeLabel,
    recordCount: row.recordCount,
    language: row.language,
    updateFrequency: row.updateFrequency,
    version: row.version,
    keywords: row.keywords,
    aiTasks: row.aiTasks,
    conditions: row.conditions,
    columns: row.columns,
    coverImage: row.coverImage,
    downloadCount: row.downloadCount,
    requestCount: row.requestCount,
    issuedDate: row.issuedDate,
    updatedAt: row.updatedAt,
  };
}

export function toService(row: EvaluationServiceRow, lk: Lookups): EvaluationService {
  const field = row.fieldId ? lk.fields.get(row.fieldId) : undefined;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    fieldId: row.fieldId,
    fieldName: field?.name ?? null,
    standards: row.standards,
    process: row.process,
    deliverables: row.deliverables,
    targetAudience: row.targetAudience,
    turnaround: row.turnaround,
    feeNote: row.feeNote,
    icon: row.icon,
    contactEmail: row.contactEmail,
    sortOrder: row.sortOrder,
  };
}

export function toDocument(row: DocumentRow, lk: Lookups): DocumentItem {
  const field = row.fieldId ? lk.fields.get(row.fieldId) : undefined;
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    docType: row.docType,
    docGroup: row.docGroup as DocumentItem["docGroup"],
    issuer: row.issuer,
    signer: row.signer,
    issuedDate: row.issuedDate,
    effectiveDate: row.effectiveDate,
    fieldId: row.fieldId,
    fieldName: field?.name ?? null,
    projectId: row.projectId,
    summary: row.summary,
    fileUrl: row.fileUrl,
    fileName: row.fileName,
    fileSize: row.fileSize,
    fileFormat: row.fileFormat,
    downloadCount: row.downloadCount,
    createdAt: row.createdAt,
  };
}

export function toAlbum(row: AlbumRow): Album {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type as Album["type"],
    description: row.description,
    coverImage: row.coverImage ?? row.items[0]?.thumbnailUrl ?? row.items[0]?.url ?? null,
    eventDate: row.eventDate,
    itemCount: row.items.length,
    items: row.items,
    createdAt: row.createdAt,
  };
}

export function toLeader(row: LeaderRow): Leader {
  return {
    id: row.id,
    fullName: row.fullName,
    position: row.position,
    responsibilities: row.responsibilities,
    email: row.email,
    phone: row.phone,
    bio: row.bio,
    photoUrl: row.photoUrl,
    sortOrder: row.sortOrder,
  };
}

export function toOrgUnit(row: OrgUnitRow): OrgUnit {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.nameEn,
    type: row.type as OrgUnit["type"],
    headName: row.headName,
    headTitle: row.headTitle,
    description: row.description,
    tasks: row.tasks,
    email: row.email,
    phone: row.phone,
    sortOrder: row.sortOrder,
  };
}

export function toInquiry(
  row: InquiryRow,
  refs: { datasetTitle: string | null; serviceName: string | null; handledByName: string | null },
): Inquiry {
  return {
    id: row.id,
    code: row.code,
    type: row.type as Inquiry["type"],
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    organization: row.organization,
    subject: row.subject,
    message: row.message,
    datasetId: row.datasetId,
    datasetTitle: refs.datasetTitle,
    serviceId: row.serviceId,
    serviceName: refs.serviceName,
    status: row.status as Inquiry["status"],
    adminNote: row.adminNote,
    handledByName: refs.handledByName,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toCrawlSource(
  row: CrawlSourceRow,
  categoryName: string | null,
  counts: { pending: number; total: number },
): CrawlSource {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    categoryId: row.categoryId,
    categoryName,
    isActive: row.isActive,
    intervalMinutes: row.intervalMinutes,
    keywords: row.keywords,
    lastRunAt: row.lastRunAt,
    nextRunAt: row.nextRunAt,
    lastStatus: row.lastStatus,
    lastMessage: row.lastMessage,
    pendingCount: counts.pending,
    totalCount: counts.total,
    createdAt: row.createdAt,
  };
}

export function toCrawlItem(row: CrawlItemRow, sourceName: string): CrawlItem {
  return {
    id: row.id,
    sourceId: row.sourceId,
    sourceName,
    title: row.title,
    link: row.link,
    summary: row.summary,
    imageUrl: row.imageUrl,
    publishedAt: row.publishedAt,
    fetchedAt: row.fetchedAt,
    status: row.status as CrawlItem["status"],
    articleId: row.articleId,
    matchedKeywords: row.matchedKeywords,
  };
}

export function toActivityLog(row: ActivityLogRow): ActivityLog {
  return {
    id: row.id,
    actorId: row.actorId,
    actorName: row.actorName,
    actorRole: row.actorRole,
    action: row.action,
    actionLabel: row.actionLabel,
    entityType: row.entityType,
    entityId: row.entityId,
    entityTitle: row.entityTitle,
    detail: row.detail,
    createdAt: row.createdAt,
  };
}

export function toBackup(row: Omit<BackupRow, "data">): Backup {
  return {
    id: row.id,
    note: row.note,
    createdByName: row.createdByName,
    createdAt: row.createdAt,
    sizeBytes: row.sizeBytes,
    tables: row.tables,
  };
}

export function toMedia(row: MediaRow): MediaItem {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    alt: row.alt,
    type: row.type as MediaItem["type"],
    createdAt: row.createdAt,
  };
}
