import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface SentimentScores {
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentData {
  _id?: string;
  id?: string;
  userName?: string;
  user_name?: string;
  sessionId?: string;
  session_id?: string;
  agentId?: string;
  agent_id?: string;
  createdAt?: Date | string;
  created_at?: Date | string;
  rating?: number;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  overall_sentiment?: 'Positive' | 'Neutral' | 'Negative';
  scores?: SentimentScores;
  positive_score?: number;
  negative_score?: number;
  overall_score?: number;
  summary?: string;
  originalFeedback?: string;
  original_feedback?: string;
  feedback?: string;
  positiveAspects?: string[];
  positive_aspects?: string[];
  positive?: string[];
  negativeAspects?: string[];
  negative_aspects?: string[];
  negative?: string[];
  categories?: { [key: string]: Array<{ sentence?: string; sentiment?: string; score?: number }> };
  request?: string;
  response?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SentimentService {
  constructor(private apiService: ApiService) {}

  // Get sentiment feedback by date range and agent
  getSentimentByDateRange(params: Record<string, string>): Observable<any> {
    const baseUrl = 'https://feedback-assistant-api.westus2.cloudapp.azure.com/feedback_sentiment/date-range/by-user-or-agent';
    return this.apiService.get<any>(baseUrl, params);
  }

  // Get sentiment by agent code (sentiment analysis endpoints should use feedback-assistant-api base URL)
  getSentimentByAgent(agentCode: string): Observable<SentimentData[]> {
    const baseUrl = 'https://feedback-assistant-api.westus2.cloudapp.azure.com/feedback_sentiment/agent/' + agentCode;
    return this.apiService.get<SentimentData[]>(baseUrl);
  }

  // Get all sentiment data (if needed)
  getAllSentiment(): Observable<SentimentData[]> {
    const baseUrl = 'https://feedback-assistant-api.westus2.cloudapp.azure.com/feedback_sentiment';
    return this.apiService.get<SentimentData[]>(baseUrl);
  }
}
