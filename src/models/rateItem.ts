// src/models/rateItem.ts
export interface RateItem {
  id?: number;
  rate_number: number;
  search_number: number;
  dead_head: number;
  min_miles: number;
  max_miles: number;
  RPM: number;
  min_rate: number;
  round_to: number;
  extra_$: number;
}