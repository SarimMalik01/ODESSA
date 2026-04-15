export function computeImportanceScore(issue, geminiData) {
    const severity = {
      high: 1,
      medium: 0.6,
      low: 0.3,
    }[issue.severity?.toLowerCase()] || 0.5;
  
    const category = {
      security: 1,
      architecture: 0.8,
      performance: 0.6,
      browser: 0.4,
    }[issue.category?.toLowerCase()] || 0.5;
  
    let structure = 0;
    if (issue.evidence?.cycle?.length > 2) structure += 1;
    if (issue.related?.fromFile && issue.related?.toFile) structure += 1;
    structure = structure / 2; // normalize → [0,1]
  
    const location = issue.location?.line ? 1 : 0.5;
  
    const confidence = geminiData?.confidenceScore || 0.5;
  
    // weights sum to 1
    return (
      0.35 * severity +
      0.25 * category +
      0.15 * structure +
      0.1 * location +
      0.15 * confidence
    );
  }