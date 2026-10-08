import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { ArticleSummary } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';
import { usePortal } from './lib';
import { ArticleMeta, Img } from './ui';

const INTERVAL_MS = 7000;

export function EventCarousel({ articles, isEvents }: { articles: ArticleSummary[]; isEvents: boolean }) {
  const { t } = usePortal();
  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [paused, setPaused] = useState(reducedMotion);
  const [hovered, setHovered] = useState(false);
  const [pageHidden, setPageHidden] = useState(document.hidden);
  const [selected, setSelected] = useState(0);
  const [viewport, api] = useEmblaCarousel({ loop: articles.length > 1, duration: reducedMotion ? 0 : 25 });
  const rotating = articles.length > 1 && !paused && !hovered && !pageHidden;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      setReducedMotion(media.matches);
      if (media.matches) setPaused(true);
    };
    const updateVisibility = () => setPageHidden(document.hidden);
    media.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      media.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!api) return;
    const update = () => setSelected(api.selectedScrollSnap());
    update();
    api.on('select', update).on('reInit', update);
    return () => {
      api.off('select', update).off('reInit', update);
    };
  }, [api]);

  // On desktop the middle Events & Conferences carousel is the height reference.
  // Both side columns use the same total height. Their headings stay fixed while
  // only the article lists below them scroll, so the scrollbar uses the entire
  // remaining height instead of producing a short scroll box with blank space.
  useEffect(() => {
    const section = sectionRef.current;
    const middle = section?.parentElement as HTMLElement | null;
    const grid = middle?.parentElement as HTMLElement | null;
    const left = grid?.children.item(0) as HTMLElement | null;
    const right = grid?.children.item(2) as HTMLElement | null;
    if (!section || !middle || !grid || !left || !right) return;

    const desktop = window.matchMedia('(min-width: 1024px)');
    let frame = 0;

    const resetSide = (element: HTMLElement) => {
      element.style.height = '';
      element.style.maxHeight = '';
      element.style.display = '';
      element.style.flexDirection = '';
      element.style.overflow = '';
      element.style.minHeight = '';

      const heading = element.children.item(0) as HTMLElement | null;
      const list = element.children.item(1) as HTMLElement | null;
      if (heading) heading.style.flexShrink = '';
      if (list) {
        list.style.flex = '';
        list.style.minHeight = '';
        list.style.overflowY = '';
        list.style.overscrollBehavior = '';
        list.style.scrollbarGutter = '';
        list.style.paddingRight = '';
      }
    };

    const applySide = (element: HTMLElement, height: number) => {
      element.style.height = `${height}px`;
      element.style.maxHeight = `${height}px`;
      element.style.display = 'flex';
      element.style.flexDirection = 'column';
      element.style.overflow = 'hidden';
      element.style.minHeight = '0';

      const heading = element.children.item(0) as HTMLElement | null;
      const list = element.children.item(1) as HTMLElement | null;
      if (heading) heading.style.flexShrink = '0';
      if (list) {
        list.style.flex = '1 1 auto';
        list.style.minHeight = '0';
        list.style.overflowY = 'auto';
        list.style.overscrollBehavior = 'contain';
        list.style.scrollbarGutter = 'stable';
        list.style.paddingRight = '0.5rem';
      }
    };

    const reset = () => {
      grid.style.alignItems = '';
      middle.style.height = '';
      resetSide(left);
      resetSide(right);
    };

    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (!desktop.matches) {
          reset();
          return;
        }

        // Let the middle carousel define the row height naturally.
        grid.style.alignItems = 'start';
        middle.style.height = '';
        resetSide(left);
        resetSide(right);

        frame = window.requestAnimationFrame(() => {
          const height = Math.ceil(section.getBoundingClientRect().height);
          if (height <= 0) return;
          applySide(left, height);
          applySide(right, height);
        });
      });
    };

    const observer = new ResizeObserver(sync);
    observer.observe(section);
    desktop.addEventListener('change', sync);
    window.addEventListener('resize', sync);
    sync();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      desktop.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
      reset();
    };
  }, [articles.length]);

  // Use a one-shot timeout instead of a permanent interval. Every real slide
  // change (including a manual swipe/click) resets the 7-second countdown.
  // Vertical page scrolling on touch devices therefore never pauses autoplay.
  useEffect(() => {
    if (!api || !rotating) return;
    const timer = window.setTimeout(() => api.scrollNext(), INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [api, rotating, selected]);

  const changeSlide = (index: number) => api?.scrollTo(index);
  const controlClass = 'grid h-11 w-11 shrink-0 place-items-center border border-rule text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white';

  return (
    <section
      ref={sectionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={isEvents ? t('Sự kiện – Hội thảo', 'Events & Conferences') : t('Tin nổi bật', 'Top stories')}
      className="min-w-0"
      data-testid="event-carousel"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setHovered(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          api?.scrollPrev();
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          api?.scrollNext();
        }
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3 border-b-2 border-ink pb-2">
        <h2 className="text-[0.8rem] font-bold uppercase tracking-[0.06em] text-seal">
          {isEvents ? t('Sự kiện – Hội thảo', 'Events & Conferences') : t('Tin nổi bật', 'Top stories')}
        </h2>
        <span className="num shrink-0 text-xs text-muted-foreground" data-testid="event-slide-count">{String(selected + 1).padStart(2, '0')} / {String(articles.length).padStart(2, '0')}</span>
      </div>

      <div ref={viewport} className="overflow-hidden" aria-live={rotating ? 'off' : 'polite'}>
        <div className="flex touch-pan-y">
          {articles.map((article, index) => (
            <article
              key={article.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${articles.length}`}
              aria-hidden={index !== selected}
              inert={index !== selected}
              className="flex min-w-0 shrink-0 grow-0 basis-full flex-col"
              data-testid={`event-slide-${index + 1}`}
            >
              <Link href={`/tin-tuc/${article.slug}`} tabIndex={-1} aria-hidden>
                <Img src={article.coverImage} alt={article.title} ratio="aspect-[16/9.5]" />
              </Link>
              <h3 className="mt-4 font-display text-[1.4rem] font-bold leading-[1.25] text-ink sm:text-[1.65rem]">
                <Link href={`/tin-tuc/${article.slug}`} className="headline-link" data-testid={`event-slide-link-${index + 1}`}>{article.title}</Link>
              </h3>
              <p className="mb-3 mt-2.5 line-clamp-3 text-[0.94rem] leading-relaxed text-foreground/80">{article.summary}</p>
              <ArticleMeta a={article} className="mt-auto pt-1" />
            </article>
          ))}
        </div>
      </div>

      {articles.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-3">
          <div className="flex" role="group" aria-label={t('Chọn bài viết', 'Choose a story')}>
            {articles.map((article, index) => (
              <button key={article.id} onClick={() => changeSlide(index)} className="grid h-11 w-8 place-items-center" aria-label={`${t('Bài', 'Story')} ${index + 1}: ${article.title}`} aria-current={selected === index ? 'true' : undefined} data-testid={`button-slide-${index + 1}`}>
                <span className={cn('h-1.5 rounded-full transition-[width,background-color] motion-reduce:transition-none', selected === index ? 'w-6 bg-seal' : 'w-1.5 bg-navy/25')} />
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <button className={controlClass} onClick={() => api?.scrollPrev()} aria-label={t('Bài trước', 'Previous story')} data-testid="button-slide-prev"><ChevronLeft className="h-4 w-4" /></button>
            <button className={controlClass} onClick={() => setPaused((value) => !value)} aria-label={paused ? t('Tiếp tục trình chiếu', 'Resume slideshow') : t('Tạm dừng trình chiếu', 'Pause slideshow')} data-testid="button-slide-pause">{paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}</button>
            <button className={controlClass} onClick={() => api?.scrollNext()} aria-label={t('Bài tiếp theo', 'Next story')} data-testid="button-slide-next"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </section>
  );
}
