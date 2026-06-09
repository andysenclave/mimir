// Barrel — public surface of the AI module.
// Only the module class and public types are exported.
// AIService is exported for pre-compute job use.

export { AIModule } from './ai.module';
export { AIService } from './ai.service';
export type { GenerateInsightOptions } from './ai.service';
export { AIInsightGql } from './entities/ai-insight.entity';
