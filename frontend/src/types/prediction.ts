export interface PredictionResponse {
  severity: string;
  clearance: string;

  risk_score: number;
  risk_level: string;

  resources: {
    officers: number;
    barricades: number;
    tow_truck: boolean;
    diversion_required: boolean;
    response_priority: string;
  };

  diversion: {
    required: boolean;
    routes: string[];
  };
}