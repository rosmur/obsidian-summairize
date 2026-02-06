// Matches the full summary block: from "# Summary" through the "---" separator line
const SUMMARY_BLOCK_REGEX = /^# Summary\n[\s\S]*?---\n+(?:# Original Article\n+)?/m;

export class NoteUtils {
  static insertSummary(content: string, summary: string): string {
    const timestamp = new Date().toLocaleString();
    const summaryBlock = `# Summary\n\n*Generated on ${timestamp}*\n\n${summary}\n\n---\n\n`;

    // Strip any existing summary block, then prepend the new one
    const stripped = content.replace(SUMMARY_BLOCK_REGEX, '').trimStart();
    return summaryBlock + stripped;
  }

  static extractContentForSummary(content: string): string {
    // Remove existing summary block before sending to AI
    const cleanContent = content.replace(SUMMARY_BLOCK_REGEX, '').trim();

    // Collapse excessive whitespace
    return cleanContent.replace(/\n{3,}/g, '\n\n');
  }

  static validateContent(content: string): { isValid: boolean; reason?: string } {
    if (!content || content.trim().length === 0) {
      return { isValid: false, reason: 'Note is empty' };
    }

    if (content.trim().length < 50) {
      return { isValid: false, reason: 'Note is too short to summarize (minimum 50 characters)' };
    }

    // Check if content is mostly just summaries
    const contentWithoutSummaries = content.replace(SUMMARY_BLOCK_REGEX, '').trim();

    if (contentWithoutSummaries.length < 50) {
      return { isValid: false, reason: 'Note contains only summaries or insufficient content' };
    }

    return { isValid: true };
  }

  static truncateForAI(content: string, maxLength: number = 8000): string {
    if (content.length <= maxLength) {
      return content;
    }

    // Truncate and add notice
    const truncated = content.substring(0, maxLength - 100);
    return truncated + '\n\n[Note: Content truncated for processing]';
  }
}
