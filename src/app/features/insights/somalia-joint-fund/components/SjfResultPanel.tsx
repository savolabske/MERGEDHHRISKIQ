import React from 'react';
import { AnimatedAIResponse } from '../../shared';
import type { SjfRecipeResult } from '../types';
import { SjfChartRenderer } from './SjfCharts';

interface SjfResultPanelProps {
  recipe: SjfRecipeResult;
  resultTitle: string;
  onBack: () => void;
  onFollowUp: (prompt: string) => void;
}

export function SjfResultPanel({ recipe, resultTitle, onBack, onFollowUp }: SjfResultPanelProps) {
  const sourceLabel = recipe.extended
    ? 'SJF + linked reports'
    : 'SJF Annual Reports + MPTF Gateway';

  return (
    <section>
      <AnimatedAIResponse
        messageKey={`sjf-banner-${resultTitle}`}
        className="mb-4 flex items-center justify-between rounded-[14px] border border-[#B8D9EE] bg-gradient-to-r from-[#E5F3FB] to-[#FFF4D6] px-4 py-3"
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00689D] to-[#19486A] text-white">
            ✦
          </span>
          <div>
            <div className="text-[13.5px] font-semibold text-[#0b1a2c]">
              {recipe.title}
              {recipe.extended && (
                <span className="ml-2 rounded-full bg-[#DDA63A] px-2 py-0.5 text-[10px] font-bold text-white">
                  EXTENDED
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#6f8094]">
              AI-generated from {sourceLabel} ·{' '}
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="rounded-lg border border-[#B8D9EE] bg-white px-3 py-2 text-[12px] font-semibold text-[#00689D]"
        >
          Back
        </button>
      </AnimatedAIResponse>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnimatedAIResponse
          messageKey={`sjf-summary-${resultTitle}`}
          className="rounded-2xl border border-[#e2e6ee] bg-gradient-to-b from-white to-[#fafdfc] p-5 lg:col-span-2"
        >
          <h4 className="mb-2 text-[14px] font-semibold text-[#0b1a2c]">Summary</h4>
          <p
            className="text-[14px] leading-relaxed text-[#324559]"
            dangerouslySetInnerHTML={{ __html: recipe.summaryHtml }}
          />
          <div className="mt-3.5 grid grid-cols-2 gap-2.5">
            {recipe.findings.map((f) => (
              <div key={f.label} className="rounded-[11px] bg-[#f4f6fa] p-3">
                <div className="text-[21px] font-semibold text-[#00689D]">{f.value}</div>
                <div className="mt-0.5 text-[11px] text-[#6f8094]">{f.label}</div>
              </div>
            ))}
          </div>
        </AnimatedAIResponse>

        {recipe.sections.map((section, si) => {
          if (section.type === 'full') {
            return (
              <AnimatedAIResponse
                key={`section-${si}`}
                messageKey={`sjf-section-${resultTitle}-${si}`}
                className="rounded-2xl border border-[#e2e6ee] bg-white p-5 lg:col-span-2"
              >
                <h4 className="text-[14px] font-semibold text-[#0b1a2c]">{section.title}</h4>
                {section.subtitle && (
                  <p className="mb-4 text-[11.5px] text-[#6f8094]">{section.subtitle}</p>
                )}
                <SjfChartRenderer chart={section.chart} />
              </AnimatedAIResponse>
            );
          }
          if (section.type === 'grid') {
            return (
              <React.Fragment key={`grid-${si}`}>
                {section.items.map((item, ii) => (
                  <AnimatedAIResponse
                    key={`grid-item-${si}-${ii}`}
                    messageKey={`sjf-grid-${resultTitle}-${si}-${ii}`}
                    className="rounded-2xl border border-[#e2e6ee] bg-white p-5"
                  >
                    <h4 className="text-[14px] font-semibold text-[#0b1a2c]">{item.title}</h4>
                    {item.subtitle && (
                      <p className="mb-4 text-[11.5px] text-[#6f8094]">{item.subtitle}</p>
                    )}
                    <SjfChartRenderer chart={item.chart} />
                  </AnimatedAIResponse>
                ))}
              </React.Fragment>
            );
          }
          if (section.type === 'chips') {
            return (
              <AnimatedAIResponse
                key={`chips-${si}`}
                messageKey={`sjf-chips-${resultTitle}-${si}`}
                className="rounded-2xl border border-[#e2e6ee] bg-white p-5 lg:col-span-2"
              >
                <h4 className="text-[14px] font-semibold text-[#0b1a2c]">{section.title}</h4>
                {section.subtitle && (
                  <p className="mb-3 text-[11.5px] text-[#6f8094]">{section.subtitle}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {section.prompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => onFollowUp(prompt)}
                      className="rounded-full border border-[#e2e6ee] px-3 py-1.5 text-[11.5px] text-[#324559] hover:border-[#00689D] hover:text-[#00689D]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </AnimatedAIResponse>
            );
          }
          return null;
        })}

        {recipe.followUps.length > 0 && (
          <AnimatedAIResponse
            messageKey={`sjf-followups-${resultTitle}`}
            className="rounded-2xl border border-[#e2e6ee] bg-white p-5 lg:col-span-2"
          >
            <h4 className="text-[14px] font-semibold text-[#0b1a2c]">Suggested follow-ups</h4>
            <p className="mb-3 text-[11.5px] text-[#6f8094]">Keep exploring</p>
            <div className="flex flex-wrap gap-2">
              {recipe.followUps.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onFollowUp(prompt)}
                  className="rounded-full border border-[#e2e6ee] px-3 py-1.5 text-[11.5px] text-[#324559] hover:border-[#00689D] hover:text-[#00689D]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </AnimatedAIResponse>
        )}
      </div>
    </section>
  );
}
