import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Context {
  id?: string;
  PromptCode: string;
  ParentPromptCode?: string;
  AgentCode?: string;
  Type?: string;
  Intent?: string;
  VersionId?: string;
  ContextVersion?: string;
  Entity?: {Key: string; Value: string}[];
  Content: string;
  Default?: boolean;
  Latest?: boolean;
  CreatedBy?: string;
  ModifiedBy?: string;
  CreatedOn?: Date;
  ModifiedOn?: Date;
}

export interface FeedbackContext {
  id?: string;
  Reason: string;
  AgentCode: string;
  Intent: string;
  Entity?: {Key: string; Value: string}[];
  Content?: string;
  CreatedBy?: string;
  ModifiedBy?: string;
  CreatedOn?: Date;
  ModifiedOn?: Date;
}

export interface AIGenerateRequest {
  intent: string;
  task: string;
  contextType: string;
  additionalInfo?: string;
}

export interface ContextSearchResult {
  contexts: Context[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  constructor(private apiService: ApiService) {}

  // Create context
  createContext(context: Context): Observable<any> {
    return this.apiService.post('/contexts', context);
  }

  // Get all contexts
  getAllContexts(params?: any): Observable<ContextSearchResult> {
    return this.apiService.get<ContextSearchResult>('/contexts', params);
  }

  // Search contexts
  searchContexts(agentCode: string, versionId?: string): Observable<Context[]> {
    const endpoint = `/agents/${agentCode}/contexts${versionId ? `?version_id=${versionId}` : ''}`;
    return this.apiService.get<Context[]>(endpoint);
  }

  // Get context by ID
  getContextById(id: string): Observable<Context> {
    return this.apiService.get<Context>(`/contexts/${id}?doc_id=${id}`);
  }

  // Update context
  updateContext(id: string, context: Partial<Context>, updateContextVersion: boolean = false): Observable<any> {
    return this.apiService.put(`/contexts/${id}?doc_id=${id}&update_context_version=${updateContextVersion}`, context);
  }

  // Delete context
  deleteContext(id: string): Observable<any> {
    return this.apiService.delete(`/contexts/${id}?doc_id=${id}`);
  }

  // Get context history
  getContextHistory(promptCode: string): Observable<Context[]> {
    return this.apiService.get<Context[]>(`/context-code/${promptCode}/contexts`);
  }

  // AI Generate context
  aiGenerateContext(request: AIGenerateRequest): Observable<any> {
    return this.apiService.post('/generate/context', request);
  }

  // Test context
  testContext(testData: any): Observable<any> {
    return this.apiService.post('/validate_multiple_output', testData);
  }

  // Get tree view
  getContextTree(): Observable<any> {
    return this.apiService.get('/context/tree');
  }

  // Feedback Context APIs
  createGoodFeedback(feedback: FeedbackContext): Observable<any> {
    // API expects an array of feedback contexts
    return this.apiService.post('/good-feedback/contexts', [feedback]);
  }

  createBadFeedback(feedback: FeedbackContext): Observable<any> {
    // API expects an array of feedback contexts
    return this.apiService.post('/bad-feedback/contexts', [feedback]);
  }

  searchFeedback(agentCode: string, feedbackType: 'good' | 'bad'): Observable<FeedbackContext[]> {
    const endpoint = `/agent-code/${agentCode}/feedback-type/${feedbackType}/feedback-contexts`;
    console.log('ContextService.searchFeedback called with:', { agentCode, feedbackType });
    console.log('Full endpoint:', endpoint);
    return this.apiService.get<FeedbackContext[]>(endpoint);
  }

  getFeedbackById(id: string, feedbackType: 'good' | 'bad'): Observable<FeedbackContext> {
    return this.apiService.get<FeedbackContext>(`/contexts/feedback/${id}/feedback-type/${feedbackType}`);
  }

  updateFeedback(id: string, feedbackType: 'good' | 'bad', feedback: Partial<FeedbackContext>): Observable<any> {
    return this.apiService.put(`/contexts/feedback/${id}/feedback-type/${feedbackType}`, feedback);
  }

  deleteFeedback(id: string, feedbackType: 'good' | 'bad'): Observable<any> {
    return this.apiService.delete(`/contexts/feedback/${id}/feedback-type/${feedbackType}`);
  }
}
