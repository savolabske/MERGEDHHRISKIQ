import type { WorkflowWizardStep } from './workflowAdminMock';

export type WorkflowAdviserMode = 'manage' | 'wizard';

export interface WorkflowAdviserContext {
  contextLabel: string;
  intro: string;
  chips: string[];
}

export function getWorkflowAdviserContext(
  mode: WorkflowAdviserMode,
  options?: { workflowName?: string; step?: WorkflowWizardStep },
): WorkflowAdviserContext {
  if (mode === 'wizard') {
    const name = options?.workflowName?.trim() || 'New workflow';
    const step = options?.step ?? 1;
    return {
      contextLabel: `Building · ${name} · Step ${step} of 4`,
      intro:
        "I'm drafting this workflow with you. Ask about what makes a good step, or what happens once you publish.",
      chips: [
        'What makes a good step?',
        'Can I add a condition?',
        'What happens after I publish?',
      ],
    };
  }

  return {
    contextLabel: 'Admin · Manage Workflows',
    intro:
      "This is where workflows are created and configured. Click Create workflow to start — describe it in plain language and I'll draft the workflow.",
    chips: [
      'What can a step check?',
      'How is data kept separate?',
      'Can I edit a live workflow?',
    ],
  };
}

/** Mock replies for Manage Workflows / wizard adviser (mirrors HTML demo). */
export function answerWorkflowAdviser(query: string): string {
  const s = query.toLowerCase();

  if (s.includes('what can a step check') || s.includes('check across')) {
    return 'A step can check anything you can describe in documents: approvals, financial reports, policies, training logs, risk registers, audit findings. You write what it needs as evidence in the prompt, and I rate it red, amber or green with a reason.';
  }
  if (s.includes('separate') || s.includes('data kept')) {
    return "Every workflow's records, documents and assessments are filed under its own workflow ID. One workflow can't read another's data, and permissions are checked per workflow — so workflows never mix.";
  }
  if (s.includes('edit a live')) {
    return 'Yes. Open it from Manage Workflows, change any step\'s prompt or the threshold, and republish. Existing evidence and assessments stay in place — only the workflow updates.';
  }
  if (s.includes('good step')) {
    return 'A good step checks one specific thing, names the evidence it needs, and gives a clear rule for red, amber and green — for example "PSEA training completion at or above 90%, amber between 75 and 89%" rather than "PSEA training is adequate."';
  }
  if (s.includes('condition')) {
    return 'Yes — click the + between any two steps, then switch its type to Condition. Write the rule as a prompt too, like "if the score drops below 70%, alert leadership," with a Yes and a No branch.';
  }
  if (s.includes('after i publish') || s.includes('what happens after')) {
    return 'The workflow appears in Custom Workflows for anyone with access. As programme teams add records and upload documents, the AI starts assessing automatically — nothing else to trigger.';
  }

  return 'I can help with building this workflow — ask what a step should check, how conditions work, or what happens after you publish.';
}
