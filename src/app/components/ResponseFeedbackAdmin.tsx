import { useEffect, useMemo, useState } from 'react';
import { MessageSquareText, ThumbsDown, ThumbsUp } from 'lucide-react';
import { PageScrollShell } from './PageScrollShell';
import { Button } from './ui/button';
import {
  ListPageHeader,
  ListPageToolbar,
  listRowClass,
} from './ui/list-page';
import { cn } from './ui/utils';
import {
  listFilterTriggerClass,
} from './ui/interaction';
import { ResponseFeedbackThreadDrawer } from './feedback/ResponseFeedbackThreadDrawer';
import {
  formatFeedbackOneLinePreview,
  getFeedbackResponseContent,
  loadResponseFeedback,
  type FeedbackRating,
  type ResponseFeedback,
  RESPONSE_FEEDBACK_CHANGED_EVENT,
} from '../data/responseFeedbackStore';

type RatingFilter = 'all' | FeedbackRating;

function formatSubmittedAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function RatingBadge({ rating }: { rating: FeedbackRating }) {
  const isPositive = rating === 'positive';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        isPositive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive',
      )}
    >
      {isPositive ? (
        <ThumbsUp size={12} fill="currentColor" />
      ) : (
        <ThumbsDown size={12} fill="currentColor" />
      )}
      {isPositive ? 'Positive' : 'Negative'}
    </span>
  );
}

export function ResponseFeedbackAdmin() {
  const [feedbackItems, setFeedbackItems] = useState<ResponseFeedback[]>(() => loadResponseFeedback());
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drawerFeedback, setDrawerFeedback] = useState<ResponseFeedback | null>(null);

  useEffect(() => {
    const refresh = () => setFeedbackItems(loadResponseFeedback());
    refresh();
    window.addEventListener(RESPONSE_FEEDBACK_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(RESPONSE_FEEDBACK_CHANGED_EVENT, refresh);
  }, []);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return feedbackItems.filter((item) => {
      if (ratingFilter !== 'all' && item.rating !== ratingFilter) return false;
      if (!query) return true;

      const haystack = [
        item.responsePreview,
        getFeedbackResponseContent(item),
        item.userQueryPreview,
        item.submittedBy,
        item.threadTitle,
        item.details,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [feedbackItems, ratingFilter, searchQuery]);

  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const openConversation = (item: ResponseFeedback) => {
    setDrawerFeedback(item);
  };

  return (
    <>
      <PageScrollShell innerClassName="space-y-6">
        <ListPageHeader
          title="Response Feedback"
          subtitle="Review thumbs up and thumbs down submissions from chat responses"
        />

        <ListPageToolbar
          search={{
            value: searchQuery,
            onChange: setSearchQuery,
            placeholder: 'Search by response, user, thread, or details...',
          }}
          filters={
            <select
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value as RatingFilter)}
              className={cn(listFilterTriggerClass, 'min-w-[140px]')}
              aria-label="Filter by rating"
            >
              <option value="all">All ratings</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
            </select>
          }
        />

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="hidden min-h-10 lg:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/70 border-b border-border">
            <div className="col-span-2 table-header-label">Rating</div>
            <div className="col-span-4 table-header-label">Response</div>
            <div className="col-span-2 table-header-label">User</div>
            <div className="col-span-2 table-header-label">Thread</div>
            <div className="col-span-2 table-header-label">Submitted</div>
          </div>

          <div className="divide-y divide-border">
            {filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                No feedback submissions match your search.
              </div>
            ) : (
              filtered.map((item) => {
                const isExpanded = expandedId === item.id;
                const fullResponse = getFeedbackResponseContent(item);

                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.id)}
                      className={cn(listRowClass, 'w-full text-left py-4 hover:bg-surface-row-hover cursor-pointer')}
                    >
                      <div className="lg:col-span-2 flex items-center">
                        <RatingBadge rating={item.rating} />
                      </div>
                      <div className="lg:col-span-4 min-w-0">
                        <p className="table-primary-text line-clamp-2">{item.responsePreview}</p>
                        {item.details && (
                          <p className="table-supporting-text mt-1 line-clamp-1">{item.details}</p>
                        )}
                      </div>
                      <div className="lg:col-span-2">
                        <p className="table-primary-text">{item.submittedBy}</p>
                      </div>
                      <div className="lg:col-span-2 min-w-0">
                        <p className="table-supporting-text line-clamp-2">
                          {item.threadTitle || 'Untitled thread'}
                        </p>
                      </div>
                      <div className="lg:col-span-2">
                        <p className="table-supporting-text">{formatSubmittedAt(item.submittedAt)}</p>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border bg-muted/30 px-4 sm:px-6 py-4 space-y-4">
                        {item.userQueryPreview && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                              User query
                            </p>
                            <p className="text-sm text-foreground">{item.userQueryPreview}</p>
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                            Rated response
                          </p>
                          <p
                            className="truncate text-sm text-foreground"
                            title={formatFeedbackOneLinePreview(fullResponse, 500).replace(/ \.\.\.$/, '')}
                          >
                            {formatFeedbackOneLinePreview(fullResponse)}
                          </p>
                        </div>

                        {item.details && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                              Feedback details
                            </p>
                            <p className="text-sm text-foreground">{item.details}</p>
                          </div>
                        )}

                        <div className="pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openConversation(item)}
                          >
                            <MessageSquareText size={16} />
                            View conversation
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </PageScrollShell>

      <ResponseFeedbackThreadDrawer
        feedback={drawerFeedback}
        open={drawerFeedback !== null}
        onClose={() => setDrawerFeedback(null)}
      />
    </>
  );
}
