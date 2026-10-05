/** Demo stand-in for an assistant request that fails. Retry skips this check. */
export function querySimulatesAssistantFailure(query: string): boolean {
  return /\b(?:api|llm)\s+fail(?:ure)?\b/i.test(query.trim());
}

/** Demo stand-in for a knowledge-base search that fails while web sources still return. */
export function querySimulatesKnowledgeBaseFailure(query: string): boolean {
  return /\b(?:kb|knowledge\s*base)\s+fail(?:ure)?\b/i.test(query.trim());
}
