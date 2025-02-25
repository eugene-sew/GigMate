export function cleanJson(content: string): any {
    /**
     * Cleans a JSON string by removing Markdown-style code block delimiters
     * and ensuring valid JSON formatting.
     *
     * @param content - The input JSON string, potentially wrapped in Markdown backticks.
     * @returns The parsed JSON object.
     * @throws Error if the JSON content is invalid.
     */

    // Remove leading and trailing Markdown-style code block delimiters
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```json")) {
        cleanedContent = cleanedContent.slice("```json".length).trim();
    }
    if (cleanedContent.endsWith("```")) {
        cleanedContent = cleanedContent.slice(0, -3).trim();
    }

    // Parse and return the JSON content
    try {
        return JSON.parse(cleanedContent);
    } catch (error) {
        throw new Error(`Invalid JSON content: ${error}`);
    }
}