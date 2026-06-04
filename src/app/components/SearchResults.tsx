import { useState, useEffect } from 'react';

interface SearchResultsProps {
  query: string;
  onBack: () => void;
  onSourceClick: (title: string) => void;
}

export function SearchResults({ query, onBack, onSourceClick }: SearchResultsProps) {
  const fullSummary = "The 2024 security landscape in Somalia is defined by persistent counter-insurgency and environmental risks. Key priorities include securing humanitarian access and implementing integrated field protocols to mitigate threats from both conflict and climate-driven displacement.";
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < fullSummary.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullSummary.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 20); // Typing speed in milliseconds
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullSummary]);

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center">
        <div className="max-w-[800px] w-full px-8 pt-12">
          {/* Search Bar */}
          <div className="relative mb-12">
            <div className="w-full h-[50px] bg-card border border-border rounded-full shadow-sm flex items-center px-6 pr-14">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mr-3">
                <path d="M14.2518 0.751796V3.7518M15.7518 2.2518H12.7518M7.51455 1.3623C7.54668 1.19025 7.63798 1.03486 7.77262 0.923035C7.90726 0.811212 8.07677 0.75 8.2518 0.75C8.42682 0.75 8.59633 0.811212 8.73097 0.923035C8.86562 1.03486 8.95691 1.19025 8.98905 1.3623L9.7773 5.5308C9.83328 5.82716 9.9773 6.09976 10.1906 6.31302C10.4038 6.52629 10.6764 6.67031 10.9728 6.7263L15.1413 7.51455C15.3133 7.54668 15.4687 7.63798 15.5806 7.77262C15.6924 7.90726 15.7536 8.07677 15.7536 8.2518C15.7536 8.42682 15.6924 8.59633 15.5806 8.73097C15.4687 8.86562 15.3133 8.95691 15.1413 8.98905L10.9728 9.7773C10.6764 9.83328 10.4038 9.9773 10.1906 10.1906C9.9773 10.4038 9.83328 10.6764 9.7773 10.9728L8.98905 15.1413C8.95691 15.3133 8.86562 15.4687 8.73097 15.5806C8.59633 15.6924 8.42682 15.7536 8.2518 15.7536C8.07677 15.7536 7.90726 15.6924 7.77262 15.5806C7.63798 15.4687 7.54668 15.3133 7.51455 15.1413L6.7263 10.9728C6.67031 10.6764 6.52629 10.4038 6.31302 10.1906C6.09976 9.9773 5.82716 9.83328 5.5308 9.7773L1.3623 8.98905C1.19025 8.95691 1.03486 8.86562 0.923035 8.73097C0.811212 8.59633 0.75 8.42682 0.75 8.2518C0.75 8.07677 0.811212 7.90726 0.923035 7.77262C1.03486 7.63798 1.19025 7.54668 1.3623 7.51455L5.5308 6.7263C5.82716 6.67031 6.09976 6.52629 6.31302 6.31302C6.52629 6.09976 6.67031 5.82716 6.7263 5.5308L7.51455 1.3623Z" stroke="var(--text-subtle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="2.25" cy="14.25" r="1.5" stroke="var(--text-subtle)" strokeWidth="1.5"/>
              </svg>
              <input
                type="text"
                value={query}
                readOnly
                className="flex-1 bg-transparent border-none outline-none text-base text-foreground"
              />
            </div>
            <button 
              onClick={onBack}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3.75 9L9 3.75M9 3.75L14.25 9M9 3.75V14.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* AI Summary Section */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <path d="M7.51455 1.3623C7.54668 1.19025 7.63798 1.03486 7.77262 0.923035C7.90726 0.811212 8.07677 0.75 8.2518 0.75C8.42682 0.75 8.59633 0.811212 8.73097 0.923035C8.86562 1.03486 8.95691 1.19025 8.98905 1.3623L9.7773 5.5308C9.83328 5.82716 9.9773 6.09976 10.1906 6.31302C10.4038 6.52629 10.6764 6.67031 10.9728 6.7263L15.1413 7.51455C15.3133 7.54668 15.4687 7.63798 15.5806 7.77262C15.6924 7.90726 15.7536 8.07677 15.7536 8.2518C15.7536 8.42682 15.6924 8.59633 15.5806 8.73097C15.4687 8.86562 15.3133 8.95691 15.1413 8.98905L10.9728 9.7773C10.6764 9.83328 10.4038 9.9773 10.1906 10.1906C9.9773 10.4038 9.83328 10.6764 9.7773 10.9728L8.98905 15.1413C8.95691 15.3133 8.86562 15.4687 8.73097 15.5806C8.59633 15.6924 8.42682 15.7536 8.2518 15.7536C8.07677 15.7536 7.90726 15.6924 7.77262 15.5806C7.63798 15.4687 7.54668 15.3133 7.51455 15.1413L6.7263 10.9728C6.67031 10.6764 6.52629 10.4038 6.31302 10.1906C6.09976 9.9773 5.82716 9.83328 5.5308 9.7773L1.3623 8.98905C1.19025 8.95691 1.03486 8.86562 0.923035 8.73097C0.811212 8.59633 0.75 8.42682 0.75 8.2518C0.75 8.07677 0.811212 7.90726 0.923035 7.77262C1.03486 7.63798 1.19025 7.54668 1.3623 7.51455L5.5308 6.7263C5.82716 6.67031 6.09976 6.52629 6.31302 6.31302C6.52629 6.09976 6.67031 5.82716 6.7263 5.5308L7.51455 1.3623Z" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="2.25" cy="14.25" r="1.5" stroke="var(--primary)" strokeWidth="1.5"/>
              </svg>
              <h3 className="text-base font-semibold text-primary">AI Summary</h3>
            </div>

            <p className="text-base text-foreground leading-[1.7]">
              {displayedText}
              {currentIndex < fullSummary.length && <span className="animate-pulse">|</span>}
            </p>
          </div>

          {/* Sources Section */}
          {currentIndex >= fullSummary.length && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="2" width="10" height="12" rx="1" stroke="var(--text-subtle)" strokeWidth="1.5" fill="none"/>
                  <line x1="5" y1="5" x2="11" y2="5" stroke="var(--text-subtle)" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="5" y1="8" x2="11" y2="8" stroke="var(--text-subtle)" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="5" y1="11" x2="9" y2="11" stroke="var(--text-subtle)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <h3 className="text-sm font-bold text-text-subtle uppercase tracking-wider">Sources</h3>
              </div>

              <div className="space-y-4">
                {/* Source 1 - PDF */}
                <button className="w-full text-left hover:text-primary transition-colors group" onClick={() => onSourceClick("2024 Security Trend Analysis")}>
                  <div className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="var(--destructive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="var(--destructive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-foreground group-hover:text-primary mb-1">
                        2024 Security Trend Analysis
                      </h4>
                      <p className="text-sm text-text-subtle">PDF • Feb 12, 2024</p>
                    </div>
                  </div>
                </button>

                {/* Source 2 - WEBLINK */}
                <button className="w-full text-left hover:text-primary transition-colors group" onClick={() => onSourceClick("RMU Humanitarian Portal")}>
                  <div className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-foreground group-hover:text-primary mb-1">
                        RMU Humanitarian Portal
                      </h4>
                      <p className="text-sm text-text-subtle">WEBLINK • LIVEDASHBOARD</p>
                    </div>
                  </div>
                </button>

                {/* Source 3 - DOCX */}
                <button className="w-full text-left hover:text-primary transition-colors group" onClick={() => onSourceClick("Q1 Risk Assessment Framework")}>
                  <div className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="var(--chart-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="var(--chart-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-foreground group-hover:text-primary mb-1">
                        Q1 Risk Assessment Framework
                      </h4>
                      <p className="text-sm text-text-subtle">DOCX • Jan 05, 2024</p>
                    </div>
                  </div>
                </button>

                {/* Source 4 - PDF */}
                <button className="w-full text-left hover:text-primary transition-colors group" onClick={() => onSourceClick("Climate Impact on Displacement Patterns")}>
                  <div className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="var(--destructive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="var(--destructive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-foreground group-hover:text-primary mb-1">
                        Climate Impact on Displacement Patterns
                      </h4>
                      <p className="text-sm text-text-subtle">PDF • Jan 28, 2024</p>
                    </div>
                  </div>
                </button>

                {/* Source 5 - DOCX */}
                <button className="w-full text-left hover:text-primary transition-colors group" onClick={() => onSourceClick("Field Protocol Guidelines 2024")}>
                  <div className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="var(--chart-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="var(--chart-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-foreground group-hover:text-primary mb-1">
                        Field Protocol Guidelines 2024
                      </h4>
                      <p className="text-sm text-text-subtle">DOCX • Feb 01, 2024</p>
                    </div>
                  </div>
                </button>

                {/* Source 6 - PDF */}
                <button className="w-full text-left hover:text-primary transition-colors group" onClick={() => onSourceClick("Counter-Insurgency Operations Review")}>
                  <div className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="var(--destructive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="var(--destructive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-foreground group-hover:text-primary mb-1">
                        Counter-Insurgency Operations Review
                      </h4>
                      <p className="text-sm text-text-subtle">PDF • Dec 18, 2023</p>
                    </div>
                  </div>
                </button>

                {/* Source 7 - WEBLINK */}
                <button className="w-full text-left hover:text-primary transition-colors group" onClick={() => onSourceClick("Humanitarian Access Monitoring Dashboard")}>
                  <div className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-foreground group-hover:text-primary mb-1">
                        Humanitarian Access Monitoring Dashboard
                      </h4>
                      <p className="text-sm text-text-subtle">WEBLINK • LIVEDASHBOARD</p>
                    </div>
                  </div>
                </button>

                {/* Source 8 - PDF */}
                <button className="w-full text-left hover:text-primary transition-colors group" onClick={() => onSourceClick("Environmental Risk Mitigation Strategy")}>
                  <div className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="var(--destructive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="var(--destructive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-foreground group-hover:text-primary mb-1">
                        Environmental Risk Mitigation Strategy
                      </h4>
                      <p className="text-sm text-text-subtle">PDF • Jan 15, 2024</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pb-8 text-border-muted text-xs font-bold tracking-[3px] uppercase">
          United Nations • Somalia
        </div>
      </div>
    </div>
  );
}