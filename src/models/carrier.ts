// src/models/carrier.ts
export interface Carrier {
  carrier_number: string;
  agent_number: string;
  home_city: string;
  carrier_email: string;
  mc_number: string;
  company_name: string;
  company_phone: string;
  truck_type_spam: string;
  spam: string;
  truck_count?: number;
  driver_count?: number;
}
