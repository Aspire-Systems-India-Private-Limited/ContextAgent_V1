import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface AgentMetric {
  agent_code: string;
  metric_code: string;
  MetricCode?: string;  // Alternative field name from API
  metric_value: number;
  model?: string;
  cost?: number;
  token_count?: number;
  refinement?: string;
  user_id?: string;
  context_code?: string;
  ai_call_time?: number;
  iteration_time?: number;
  version?: string;
  user_name?: string;
  timestamp?: string;
  start_time?: string;
  end_time?: string;
  DateTime?: string;
  IntentCode?: string;
  UserName?: string;
  RequestId?: string;
  SessionId?: string;
  TokenCount?: number;
  MetricValue?: number;
  Model?: string;
}

export interface AggregatedCost {
  AgentCode: string;
  TotalCost: number;
  Month: string;
  UpdatedOn: string;
}

export interface MonthlyUserCost {
  AgentCode: string;
  UserName: string;
  Month: string;
  TotalCost: number;
  UpdatedOn: string;
}

export interface AggregatedResponse {
  uploaded: AggregatedCost[];
}

export interface MonthlyUserCostResponse {
  monthly_costs: MonthlyUserCost[];
}

@Injectable({
  providedIn: 'root'
})
export class CostMetricsService {
  constructor(private apiService: ApiService) {}

  // Get agent metrics with filters
  getAgentMetrics(params: {
    agent_code?: string;
    metric_code?: string;
    start_time?: string;
    end_time?: string;
  }): Observable<AgentMetric[]> {
    const queryParams: Record<string, string> = {};
    
    if (params.agent_code) queryParams['agent_code'] = params.agent_code;
    if (params.metric_code) queryParams['metric_code'] = params.metric_code;
    if (params.start_time) queryParams['start_time'] = params.start_time;
    if (params.end_time) queryParams['end_time'] = params.end_time;

    return this.apiService.get<AgentMetric[]>('/agent-metrics', queryParams);
  }

  // Get aggregated agent monthly costs
  getAggregatedAgentMonthlyCost(): Observable<AggregatedCost[]> {
    return this.apiService.get<AggregatedResponse>('/aggregated-agent-monthly-cost')
      .pipe(
        map(response => response.uploaded || [])
      );
  }

  // Get monthly user costs
  getMonthlyUserCost(): Observable<MonthlyUserCost[]> {
    return this.apiService.get<MonthlyUserCostResponse>('/monthly-user-agent-cost')
      .pipe(
        map(response => response.monthly_costs || [])
      );
  }
}
