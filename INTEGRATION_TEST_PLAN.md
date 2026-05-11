# Multi-Level Statistics Integration Test Plan

## Overview
This document outlines the test plan for the newly implemented multi-level statistics system that provides country-level, city-level, and sector-level analytics for ArtConnect Africa.

## System Architecture

### Backend Components
1. **statistics_cache.py** - Caching mechanism with 24-hour TTL
2. **statistics_routes.py** - 5 new API routes for multi-level statistics
3. **server.py** - Updated with cache table and route integration

### Frontend Components
1. **store.js** - `useStatisticsStore` with V2 methods and state
2. **CountryStatsOverview.jsx** - Country-level metrics and charts
3. **TimelineChart.jsx** - Monthly evolution trends
4. **SectorComparison.jsx** - Sector distribution analysis
5. **GenderDistributionByCity.jsx** - City-level gender breakdown
6. **DrilldownTable.jsx** - Top artists table with sorting/filtering
7. **StatisticsMultiLevel.jsx** - Master orchestration component

## API Endpoints Implemented

### 1. Country Statistics
**Endpoint:** `GET /api/statistics/v2/by-country/{country}`
**Requires:** Bearer token with paid partner role
**Returns:**
```json
{
  "overview": {
    "total_artists": int,
    "total_posts": int,
    "total_views": int,
    "total_messages": int,
    "by_gender": { "women": int, "men": int, "other": int },
    "collaborations": { "total": int, "local": int, "intra_african": int }
  },
  "by_city": [
    { "city": "string", "artist_count": int, "engagement": int }
  ],
  "by_sector": [
    { "sector": "string", "artist_count": int, "engagement": int }
  ],
  "by_domain": [...],
  "top_artists": [
    { "name": "string", "sector": "string", "engagement_score": int, "views": int, "messages": int }
  ],
  "subregion": "string",
  "cached": boolean
}
```

### 2. City Statistics
**Endpoint:** `GET /api/statistics/v2/by-city/{country}/{city}`
**Returns:** City-specific breakdown with gender distribution, sectors, top artists

### 3. Sector Statistics
**Endpoint:** `GET /api/statistics/v2/by-country/{country}/sector/{sector}`
**Returns:** Sector-specific analytics by gender, city, engagement

### 4. Timeline Data
**Endpoint:** `GET /api/statistics/v2/timeline/{country}?period=monthly`
**Returns:**
```json
{
  "timeline": [
    { "month": "2025-01", "new_artists": int, "posts": int, "collaborations": int }
  ]
}
```

### 5. Comparison Data
**Endpoint:** `GET /api/statistics/v2/compare?countries=Country1,Country2,Country3`
**Returns:** Comparative metrics across multiple countries

## Test Cases

### Unit Tests - Backend

#### Cache Mechanism (statistics_cache.py)
- [ ] `test_cache_key_generation` - Verify unique keys for different queries
- [ ] `test_cache_storage` - Cache stores data correctly
- [ ] `test_cache_retrieval` - Cache retrieves correct data
- [ ] `test_cache_expiration` - Data expires after 24 hours
- [ ] `test_cache_miss` - Returns None for expired/missing cache

#### Statistics Routes (statistics_routes.py)
- [ ] `test_country_stats_route` - Returns valid data structure
- [ ] `test_city_stats_route` - Returns city-specific data
- [ ] `test_sector_stats_route` - Returns sector-specific data
- [ ] `test_timeline_route` - Returns monthly timeline
- [ ] `test_comparison_route` - Returns comparison data
- [ ] `test_auth_required` - Routes require authentication
- [ ] `test_permission_check` - Only paid partners can access

### Integration Tests - Frontend

#### Store Integration
- [ ] `test_store_fetchCountryStats` - Fetches and stores country data
- [ ] `test_store_fetchCityStats` - Fetches and stores city data
- [ ] `test_store_fetchSectorStats` - Fetches and stores sector data
- [ ] `test_store_fetchTimeline` - Fetches timeline data
- [ ] `test_store_error_handling` - Sets errorV2 on API error
- [ ] `test_store_loading_state` - Sets isLoadingV2 during fetch

#### Component Rendering
- [ ] `test_CountrySelector_loads` - Renders with country list
- [ ] `test_CountryStatsOverview_displays` - Shows metrics cards and charts
- [ ] `test_TimelineChart_renders` - Displays monthly evolution
- [ ] `test_SectorComparison_renders` - Shows sector data
- [ ] `test_GenderDistributionByCity_renders` - Shows city breakdown
- [ ] `test_DrilldownTable_sorts_filters` - Table sorting and search work
- [ ] `test_StatisticsMultiLevel_integration` - All tabs load correctly

### End-to-End Tests

#### User Flow
1. [ ] User navigates to Statistics page
2. [ ] "Geographic Insights" tab is visible and clickable
3. [ ] Click tab loads StatisticsMultiLevel component
4. [ ] Country selector dropdown shows African countries
5. [ ] Select "Cameroon" → CountryStatsOverview loads with data
6. [ ] Timeline tab shows 12-month evolution
7. [ ] Sectors tab shows sector distribution
8. [ ] Cities tab shows gender breakdown by city
9. [ ] Artists tab shows top artists with sorting/search
10. [ ] Switch between countries updates all visualizations
11. [ ] Error states display gracefully if data unavailable

#### Data Validation
- [ ] Country stats data structure matches spec
- [ ] All numeric fields are numbers
- [ ] Arrays contain expected item count
- [ ] Gender data sums to total artists count
- [ ] Sector data represents all sectors
- [ ] Top artists list ordered by engagement

#### Performance
- [ ] First country load completes < 2s
- [ ] Switching countries completes < 1s
- [ ] Cache hit (second load) completes < 500ms
- [ ] All charts render within viewport without lag
- [ ] Table pagination works smoothly

## Test Execution Commands

### Backend Tests
```bash
cd backend
pytest tests/test_statistics_multilevel.py -v
pytest tests/test_statistics_multilevel.py::test_cache_key_generation -v
```

### Frontend Unit Tests (if Jest configured)
```bash
cd frontend
npm test -- --testPathPattern="statistics"
```

### Frontend Manual Testing
```bash
cd frontend
npm start
# Navigate to http://localhost:3000/statistics
# Click "Geographic Insights" tab
```

## Known Limitations

1. **Cache TTL** - Set to 24 hours; may need adjustment based on data freshness requirements
2. **Pagination** - DrilldownTable shows top 20 artists; may need pagination for larger datasets
3. **Real-time Updates** - Cached data not updated in real-time; requires cache expiration
4. **Mobile Responsiveness** - Charts may need adjustment for mobile screens < 768px
5. **Accessibility** - Color-coded charts may need additional patterns for colorblind users

## Deployment Checklist

- [ ] Database migration executed (adds StatisticsCache table)
- [ ] Backend environment variables configured
- [ ] Frontend .env.production configured with correct API_URL
- [ ] Cache warming strategy defined (optional)
- [ ] Monitoring/alerting for failed statistics routes
- [ ] User documentation updated
- [ ] Admin access to statistics verified
- [ ] Paid partner access verified
- [ ] Public overview statistics still accessible

## Rollback Plan

If issues arise:
1. Revert `backend/statistics_routes.py` additions from `server.py`
2. Disable `/statistics/v2/*` routes via feature flag
3. Database: Drop StatisticsCache table if needed
4. Frontend: Remove Geographic Insights tab from sidebar navigation
5. Clear browser cache and restart frontend

## Notes

- System requires paid partner or admin access for V2 routes
- Public overview statistics (/statistics/overview) remains accessible
- All components use Zustand store for state management
- Error handling includes user-friendly messages
- Loading states prevent UI flickering
