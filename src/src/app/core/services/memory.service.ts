import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Memory {
  id: string;
  user_id: string;
  session_id: string;
  agent_code: string;
  memory_text: string;
  context: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  constructor(private apiService: ApiService) {}

  // Add new memory
  addMemory(memory: any): Observable<any> {
    return this.apiService.post('/memory/add', memory);
  }

  // Search memories
  searchMemories(filters: any): Observable<Memory[]> {
    return this.apiService.post<Memory[]>('/memory/search', filters);
  }

  // Get user memories
  getUserMemories(userId: string): Observable<Memory[]> {
    return this.apiService.get<Memory[]>(`/memory-user/list?user_id=${userId}`);
  }

  // Delete memory
  deleteMemory(memoryId: string, userId: string): Observable<any> {
    return this.apiService.delete(`/memory/delete/${memoryId}?user_id=${userId}`);
  }

  // Legacy methods for backward compatibility
  getAllMemories(): Observable<Memory[]> {
    return this.apiService.get<Memory[]>('/memory');
  }

  getMemoryById(id: string): Observable<Memory> {
    return this.apiService.get<Memory>(`/memory/${id}`);
  }

  createMemory(memory: Memory): Observable<any> {
    return this.addMemory(memory);
  }

  updateMemory(id: string, memory: Partial<Memory>): Observable<any> {
    return this.apiService.put(`/memory/${id}`, memory);
  }
}
