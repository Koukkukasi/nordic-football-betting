# Nordic Football Betting - Data Strategy

## Current Approach Issues
The web scraping approach using Cheerio has significant limitations:
- Legal risks with terms of service violations
- Unreliable due to website structure changes
- No real-time capabilities
- High maintenance overhead

## Recommended Data Architecture

### 1. Primary: Sports Data API
**Recommended Provider**: API-Football or Sportradar
- **Cost**: $99-199/month for Nordic leagues
- **Benefits**: 
  - Real-time WebSocket updates
  - 99.9% uptime SLA
  - Legal compliance
  - Sub-second latency

### 2. Secondary: Official Partnerships
- Finnish FA (Veikkausliiga)
- Swedish FA (Allsvenskan)
- Direct data feeds with legal agreements

### 3. Supplementary: Firecrawl (Limited Use)
Use Firecrawl ONLY for:
- Weekly team roster updates
- Player profile enrichment
- Historical match reports
- News article aggregation

**Budget**: ~$16/month (Hobby plan sufficient)

## Implementation Plan

### Phase 1: Replace Live Scraping
```typescript
// Remove current scraping
// lib/data-scraper.ts - DELETE

// Add sports API client
// lib/sports-api-client.ts
import { createSportsAPIClient } from '@sports-api/client';

export const sportsAPI = createSportsAPIClient({
  apiKey: process.env.SPORTS_API_KEY,
  leagues: ['veikkausliiga', 'allsvenskan'],
  websocket: true
});
```

### Phase 2: WebSocket Integration
```typescript
// lib/websocket/live-data-stream.ts
export class LiveDataStream {
  constructor(private supabase: SupabaseClient) {}
  
  async connectToSportsAPI() {
    const stream = await sportsAPI.connectWebSocket();
    
    stream.on('match:update', async (data) => {
      await this.supabase
        .from('matches')
        .update(data)
        .eq('id', data.matchId);
    });
  }
}
```

### Phase 3: Firecrawl for Enrichment
```typescript
// lib/enrichment/firecrawl-client.ts
import { FirecrawlApp } from 'firecrawl-js';

export async function enrichTeamData(teamUrl: string) {
  const app = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY
  });
  
  // Run weekly, not real-time
  const data = await app.scrapeUrl(teamUrl, {
    formats: ['markdown'],
    extractSchema: {
      roster: 'array',
      coach: 'string',
      stadium: 'object'
    }
  });
  
  return data;
}
```

## Cost Analysis

### Current (Scraping)
- Development: 100+ hours
- Maintenance: 20 hours/month
- Reliability: 60-70%
- Legal risk: High

### Recommended (API + Firecrawl)
- Sports API: $149/month
- Firecrawl: $16/month
- Total: $165/month
- Reliability: 99%+
- Legal risk: None

## Migration Timeline

1. **Week 1**: Set up sports API account
2. **Week 2**: Implement WebSocket integration
3. **Week 3**: Remove scraping code
4. **Week 4**: Add Firecrawl enrichment
5. **Week 5**: Testing and optimization

## Conclusion

While Firecrawl is excellent for AI/LLM applications, it's unsuitable for live sports data. The combination of dedicated sports APIs for real-time data and Firecrawl for periodic enrichment provides the best balance of cost, reliability, and legal compliance.