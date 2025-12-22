import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Message {
  message_id: string;
  user_message: string;
  ai_response: string;
  timestamp: string;
  model: string;
  token_count: number;
  intent_code?: string;
  agent_code?: string;
}

export interface Session {
  session_id: string;
  user_name: string;
  email: string;
  start_date: string;
  end_date: string;
  messages: Message[];
  expanded?: boolean;
}

export interface SessionSearchRequest {
  start_date?: string;
  end_date?: string;
  include_ongoing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor(private apiService: ApiService) {}

  // Get sessions with query parameters using search endpoint
  getSessions(queryParams?: Record<string, any>): Observable<any> {
    const params: Record<string, string> = {
      limit: '10',
      offset: '0'
    };
    
    if (queryParams) {
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== undefined && queryParams[key] !== null) {
          params[key] = queryParams[key].toString();
        }
      });
    }
    
    return this.apiService.get<any>('/sessions/search', params);
  }

  // Get session by ID
  getSessionById(sessionId: string): Observable<Session> {
    return this.apiService.get<Session>(`/sessions/${sessionId}`);
  }

  // Get session messages
  getSessionMessages(sessionId: string): Observable<Message[]> {
    return this.apiService.get<Message[]>(`/sessions/${sessionId}/messages`);
  }

  // Get message by ID
  getMessageById(messageId: string): Observable<Message> {
    return this.apiService.get<Message>(`/messages/${messageId}`);
  }

  // Legacy methods for backward compatibility
  searchSessions(request: SessionSearchRequest): Observable<Session[]> {
    return this.apiService.post<Session[]>('/sessions/search', request);
  }

  saveSessionMemory(sessionId: string): Observable<any> {
    return this.apiService.post('/sessions/memory', { session_id: sessionId });
  }
}
