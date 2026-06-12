export const REPORT_QUERY_DELAY_MS = 1300;
export const REPORT_CHAT_QUERY_DELAY_MS = 700;
export const REPORT_REVEAL_DELAY_MS = 550;

/** Small inset so the AI banner sits flush below the main column padding edge. */
export const REPORT_STICKY_HEADER_OFFSET = 0;

/** Header layer so filter dropdowns stack above scrollable report content. */
export const reportHeaderClassName = 'relative z-30';

export const reportTitleFilterRowClassName =
  'flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between';

export const reportHeaderPaddingClassName = 'px-4 sm:px-[30px] py-[16px]';

export const reportMainPaddingClassName = 'px-4 sm:px-[30px] pb-28 pt-6 xl:pb-20';

/** Scrollytelling scene — stacked on mobile; side-by-side with sticky chart on lg+ */
export const reportSceneSectionClassName =
  'grid grid-cols-1 gap-4 border-t border-dashed py-6 first:border-t-0 lg:min-h-[72vh] lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-[26px] lg:py-[30px]';

/** Chart card inside a scene — sticky only on lg+ to avoid overlapping narrative on mobile */
export const reportSceneChartCardClassName =
  'relative z-0 flex w-full min-w-0 flex-col rounded-[18px] border bg-white p-4 shadow-sm sm:p-6 lg:sticky lg:top-6 lg:min-h-[430px] lg:justify-center';

export const reportSceneNarrativeClassName = 'relative z-10 min-w-0';

export const reportSceneTitleClassName =
  'mt-2 text-[20px] font-semibold leading-[1.12] lg:text-[22px]';

export const reportSceneStatClassName =
  'mt-2 block text-[28px] font-semibold leading-none sm:mt-3 sm:text-[36px] lg:text-[38px]';

export const reportSceneAskButtonClassName =
  'mt-4 inline-flex w-full max-w-full items-start gap-2 whitespace-normal rounded-lg border px-3 py-2 text-left text-[12px] font-semibold leading-snug sm:w-auto sm:text-[12.5px] disabled:opacity-50';
