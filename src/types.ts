export interface AnalysisResult {
  analysis: {
    type: string;
    origin: string;
    luxuryLevel: string;
    estimatedCategory: string;
    targetAudience: string;
    estimatedMarketPrice: string;
  };
  luxuryStory: {
    title: string;
    description: string;
    hashtags: string;
    slogan: string;
    cta: string;
  };
}

