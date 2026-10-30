export type ReleaseCategory = 'ai' | 'data' | 'features' | 'fixes';

export interface Release {
  version: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Omitted when the release notes have not been written yet. */
  changes?: Partial<Record<ReleaseCategory, string[]>>;
  summary?: string;
}

/** AI and data changes come first because they can change answers. */
export const RELEASE_CATEGORY_ORDER: ReleaseCategory[] = ['ai', 'data', 'features', 'fixes'];

export const RELEASE_CATEGORY_LABELS: Record<ReleaseCategory, string> = {
  ai: 'AI and answers',
  data: 'Data sources',
  features: 'Features',
  fixes: 'Fixes',
};

/** Newest first. The first entry is the running version. */
export const RELEASES: Release[] = [
  {
    version: '1.4.0',
    date: '2026-10-22',
    changes: {
      ai: [
        'Answers lead with the direct answer and match the question: a quick fact gets one line, a broad question gets a briefing.',
        'Web and internal sources are combined into one answer. Web facts are marked "Web, unverified".',
        'When sources disagree, both figures are shown with their source and date.',
        'Generic recommendations removed. Only specific, sourced actions remain.',
      ],
      data: [
        'Each source shows its region. Documents about other countries are left out of Somalia answers.',
      ],
      features: [
        'Privacy Notice published, linked from sign-in, the footer, Help and the account menu.',
        '"Private to me" renamed "My library only".',
        '"Was this helpful?" added to answers, with a "Report a wrong answer" tooltip.',
        'Notifications grouped, with All / Unread tabs and time sections.',
        'Version number and this changelog added.',
      ],
      fixes: ['Emoji removed from the Home greeting.'],
    },
  },
  {
    version: '1.3.0',
    date: '2026-09-15',
    summary: '[Previous release notes from engineering]',
  },
];

export const APP_VERSION = RELEASES[0].version;

export function formatReleaseDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
