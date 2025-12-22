import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Agent {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  type?: string;
  agentCode?: string;
  code?: string;
  url?: string;
  support?: {
    email?: string;
    phone?: string;
  };
  supportEmail?: string;  // Flat property for backward compatibility
  supportPhone?: string;  // Flat property for backward compatibility
  thumbnail?: string;
  thumbnail_url?: string;
  configuration?: any;
  intents?: any[];
  entities?: string[];
  scopes?: string[];
  permission_scopes?: string[];  // API uses this field name
  status?: 'active' | 'inactive';
  category?: string;
  provider?: string;
  version?: string;
  environment?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  constructor(private apiService: ApiService) {}

  // ===== AGENT SOLUTIONS ENDPOINTS =====
  
  // Get all agent solutions
  getAllAgentSolutions(params?: any): Observable<Agent[]> {
    return this.apiService.get<Agent[]>('/agent-solutions', params);
  }

  // Get agent solution by ID
  getAgentSolutionById(id: string): Observable<Agent> {
    return this.apiService.get<Agent>(`/agent-solutions/${id}`);
  }

  // Create agent solution
  createAgentSolution(agent: Agent): Observable<any> {
    return this.apiService.post('/agent-solutions', agent);
  }

  // Update agent solution
  updateAgentSolution(id: string, agent: Partial<Agent>): Observable<any> {
    return this.apiService.put(`/agent-solutions/${id}`, agent);
  }

  // Delete agent solution
  deleteAgentSolution(id: string): Observable<any> {
    return this.apiService.delete(`/agent-solutions/${id}`);
  }

  // Get agent solution thumbnail
  getAgentSolutionImage(id: string): Observable<any> {
    return this.apiService.get(`/agent-solutions/${id}/image`);
  }

  // ===== AGENTS ENDPOINTS =====
  
  // Get all agents (basic list)
  getAllAgents(params?: any): Observable<Agent[]> {
    return this.apiService.get<Agent[]>('/agents', params);
  }

  // Get agents for a specific solution
  getAgentsForSolution(solutionId: string): Observable<Agent[]> {
    return this.apiService.get<Agent[]>(`/agent-solutions/${solutionId}/agents`);
  }

  // Get agent by ID
  getAgentById(id: string): Observable<Agent> {
    return this.apiService.get<Agent>(`/agents/${id}`);
  }

  // Create agent
  createAgent(agent: Agent): Observable<any> {
    return this.apiService.post('/agents', agent);
  }

  // Update agent
  updateAgent(id: string, agent: Partial<Agent>): Observable<any> {
    return this.apiService.put(`/agents/${id}`, agent);
  }

  // Delete agent
  deleteAgent(id: string): Observable<any> {
    return this.apiService.delete(`/agents/${id}`);
  }

  // ===== AGENT CONFIGURATION ENDPOINTS =====

  // Save agent configuration
  saveAgentConfig(agentId: string, config: any): Observable<any> {
    return this.apiService.post(`/agents/${agentId}/config`, config);
  }

  // Get agent configuration by code and type
  getAgentConfigByType(agentCode: string, configType: string): Observable<any> {
    return this.apiService.get(`/agents/${agentCode}/config/${configType}`);
  }

  // Get configuration by ID
  getConfigById(configId: string): Observable<any> {
    return this.apiService.get(`/agents/config/${configId}`);
  }

  // Upload agent thumbnail
  uploadThumbnail(agentId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('thumbnail', file);
    return this.apiService.post(`/agent-solutions/${agentId}/thumbnail`, formData);
  }
}