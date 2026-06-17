import React from 'react';
import { Sparkles } from 'lucide-react';
import { AnimatedAIResponse, ReportChipButton } from '../../shared';
import type { MigrationRecipeResult } from '../types';
import { MigrationChartRenderer } from './MigrationCharts';

interface MigrationResultPanelProps {
  recipe: MigrationRecipeResult;
  resultTitle: string;
  onBack: () => void;
  onFollowUp: (prompt: string) => void;
}

export function MigrationResultPanel({
  recipe,
  resultTitle,
  onBack,
  onFollowUp,
}: MigrationResultPanelProps) {
  const sourceLabel = recipe.extended
    ? 'IOM DTM ETT + linked reports'
    : 'IOM DTM ETT data';

  return (
    <section>
      <AnimatedAIResponse
        messageKey={`migration-banner-${resultTitle}`}
        className="mb-4 flex items-center justify-between rounded-[14px] border border-[#f0d8c5] bg-gradient-to-r from-[#fbeee5] to-[#fdf6ec] px-4 py-3"
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#c2562a] to-[#d99a21] text-white">
            <Sparkles size={14} />
          </span>
          <div>
            <div className="text-[13.5px] font-semibold text-[#1a1410]">
              {recipe.title}
              {recipe.extended && (
                <span className="ml-2 rounded-full bg-[#DDA63A] px-2 py-0.5 text-[10px] font-bold text-white">
                  EXTENDED
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#8a7d72]">
              AI-generated from {sourceLabel} ·{' '}
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="rounded-lg border border-[#f0d8c5] bg-white px-3 py-2 text-[12px] font-semibold text-[#c2562a]"
        >
          Back
        </button>
      </AnimatedAIResponse>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnimatedAIResponse
          messageKey={`migration-summary-${resultTitle}`}
          className="rounded-2xl border border-[#ece6df] bg-gradient-to-b from-white to-[#faf7f2] p-5 lg:col-span-2"
        >
          <h4 className="mb-2 text-[14px] font-semibold text-[#1a1410]">Summary</h4>
          <p
            className="text-[14px] leading-relaxed text-[#4a3f38]"
            dangerouslySetInnerHTML={{ __html: recipe.summaryHtml }}
          />
          <div className="mt-3.5 grid grid-cols-2 gap-2.5">
            {recipe.findings.map((f) => (
              <div key={f.label} className="rounded-[11px] bg-[#f7f4ef] p-3">
                <div className="text-[21px] font-semibold text-[#c2562a]">{f.value}</div>
                <div className="mt-0.5 text-[11px] text-[#8a7d72]">{f.label}</div>
              </div>
            ))}
          </div>
        </AnimatedAIResponse>

        {recipe.sections.map((section, si) => {
          if (section.type === 'full') {
            return (
              <AnimatedAIResponse
                key={`section-${si}`}
                messageKey={`migration-section-${resultTitle}-${si}`}
                className="rounded-2xl border border-[#ece6df] bg-white p-5 lg:col-span-2"
              >
                <h4 className="text-[14px] font-semibold text-[#1a1410]">{section.title}</h4>
                {section.subtitle && (
                  <p className="mb-4 text-[11.5px] text-[#8a7d72]">{section.subtitle}</p>
                )}
                <MigrationChartRenderer chart={section.chart} />
              </AnimatedAIResponse>
            );
          }

          return (
            <React.Fragment key={`grid-${si}`}>
              {section.items.map((item, ii) => (
                <AnimatedAIResponse
                  key={`grid-item-${si}-${ii}`}
                  messageKey={`migration-grid-${resultTitle}-${si}-${ii}`}
                  className="rounded-2xl border border-[#ece6df] bg-white p-5"
                >
                  <h4 className="text-[14px] font-semibold text-[#1a1410]">{item.title}</h4>
                  {item.subtitle && (
                    <p className="mb-4 text-[11.5px] text-[#8a7d72]">{item.subtitle}</p>
                  )}
                  <MigrationChartRenderer chart={item.chart} />
                </AnimatedAIResponse>
              ))}
            </React.Fragment>
          );
        })}

        {recipe.followUps.length > 0 && (
          <AnimatedAIResponse
            messageKey={`migration-followups-${resultTitle}`}
            className="rounded-2xl border border-[#ece6df] bg-white p-5 lg:col-span-2"
          >
            <h4 className="text-[14px] font-semibold text-[#1a1410]">Suggested follow-ups</h4>
            <p className="mb-3 text-[11.5px] text-[#8a7d72]">Keep exploring</p>
            <div className="flex flex-wrap gap-2">
              {recipe.followUps.map((prompt) => (
                <ReportChipButton
                  key={prompt}
                  label={prompt}
                  onClick={() => onFollowUp(prompt)}
                  className="border-[#ece6df] text-[#4a3f38] hover:border-[#c2562a] hover:!text-[#c2562a]"
                />
              ))}
            </div>
          </AnimatedAIResponse>
        )}
      </div>
    </section>
  );
}
