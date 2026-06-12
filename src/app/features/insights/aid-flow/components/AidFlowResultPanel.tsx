import React from 'react';
import { Sparkles } from 'lucide-react';
import { AnimatedAIResponse } from '../../shared';
import type { AidFlowRecipeResult } from '../types';
import { AidFlowChartRenderer } from './AidFlowCharts';

interface AidFlowResultPanelProps {
  recipe: AidFlowRecipeResult;
  resultTitle: string;
  onBack: () => void;
  onFollowUp: (prompt: string) => void;
}

export function AidFlowResultPanel({
  recipe,
  resultTitle,
  onBack,
  onFollowUp,
}: AidFlowResultPanelProps) {
  return (
    <section>
      <AnimatedAIResponse
        messageKey={`aidflow-banner-${resultTitle}`}
        className="mb-4 flex items-center justify-between rounded-[14px] border border-[#cfe0fd] bg-gradient-to-r from-[#eaf1fe] to-[#e6f7f4] px-4 py-3"
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1f6feb] to-[#16a39a] text-white">
            <Sparkles size={14} />
          </span>
          <div>
            <div className="text-[13.5px] font-semibold text-[#0d1b2a]">{recipe.title}</div>
            <div className="text-[11px] text-[#6b7a8d]">
              AI-generated from AIMS + SSF data ·{' '}
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="rounded-lg border border-[#cfe0fd] bg-white px-3 py-2 text-[12px] font-semibold text-[#1f6feb]"
        >
          Back
        </button>
      </AnimatedAIResponse>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnimatedAIResponse
          messageKey={`aidflow-summary-${resultTitle}`}
          className="rounded-2xl border border-[#e6e9ef] bg-gradient-to-b from-white to-[#fbfcfe] p-5 lg:col-span-2"
        >
          <h4 className="mb-2 text-[14px] font-semibold text-[#0d1b2a]">Summary</h4>
          <p
            className="text-[14px] leading-relaxed text-[#3a4a5c]"
            dangerouslySetInnerHTML={{ __html: recipe.summaryHtml }}
          />
          <div className="mt-3.5 grid grid-cols-2 gap-2.5">
            {recipe.findings.map((f) => (
              <div key={f.label} className="rounded-[11px] bg-[#f6f7f9] p-3">
                <div className="text-[21px] font-semibold text-[#1f6feb]">{f.value}</div>
                <div className="mt-0.5 text-[11px] text-[#6b7a8d]">{f.label}</div>
              </div>
            ))}
          </div>
        </AnimatedAIResponse>

        {recipe.sections.map((section, si) => {
          if (section.type === 'full') {
            return (
              <AnimatedAIResponse
                key={`section-${si}`}
                messageKey={`aidflow-section-${resultTitle}-${si}`}
                className="rounded-2xl border border-[#e6e9ef] bg-white p-5 lg:col-span-2"
              >
                <h4 className="text-[14px] font-semibold text-[#0d1b2a]">{section.title}</h4>
                {section.subtitle && (
                  <p className="mb-4 text-[11.5px] text-[#6b7a8d]">{section.subtitle}</p>
                )}
                <AidFlowChartRenderer chart={section.chart} />
              </AnimatedAIResponse>
            );
          }

          return (
            <React.Fragment key={`grid-${si}`}>
              {section.items.map((item, ii) => (
                <AnimatedAIResponse
                  key={`grid-item-${si}-${ii}`}
                  messageKey={`aidflow-grid-${resultTitle}-${si}-${ii}`}
                  className="rounded-2xl border border-[#e6e9ef] bg-white p-5"
                >
                  <h4 className="text-[14px] font-semibold text-[#0d1b2a]">{item.title}</h4>
                  {item.subtitle && (
                    <p className="mb-4 text-[11.5px] text-[#6b7a8d]">{item.subtitle}</p>
                  )}
                  <AidFlowChartRenderer chart={item.chart} />
                </AnimatedAIResponse>
              ))}
            </React.Fragment>
          );
        })}

        {recipe.followUps.length > 0 && (
          <AnimatedAIResponse
            messageKey={`aidflow-followups-${resultTitle}`}
            className="rounded-2xl border border-[#e6e9ef] bg-white p-5 lg:col-span-2"
          >
            <h4 className="text-[14px] font-semibold text-[#0d1b2a]">Suggested follow-ups</h4>
            <p className="mb-3 text-[11.5px] text-[#6b7a8d]">Keep exploring</p>
            <div className="flex flex-wrap gap-2">
              {recipe.followUps.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onFollowUp(prompt)}
                  className="rounded-full border border-[#e6e9ef] px-3 py-1.5 text-[11.5px] text-[#3a4a5c] hover:border-[#1f6feb] hover:text-[#1f6feb]"
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
