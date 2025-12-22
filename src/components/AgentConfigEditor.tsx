import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const configSections = [
  { id: 'model', label: 'Model Settings', icon: '⚙️' },
  { id: 'prompt', label: 'Prompt Template', icon: '📝' },
  { id: 'memory', label: 'Memory Config', icon: '🧠' },
  { id: 'tools', label: 'Tools & Actions', icon: '🔧' },
  { id: 'custom', label: 'Custom Settings', icon: '⚡' },
  { id: 'advanced', label: 'Advanced', icon: '🔬' },
];

const availableTools = [
  { id: 'web_search', name: 'Web Search', description: 'Search the internet for information', enabled: true },
  { id: 'calculator', name: 'Calculator', description: 'Perform mathematical calculations', enabled: true },
  { id: 'database_query', name: 'Database Query', description: 'Query internal databases', enabled: false },
  { id: 'api_call', name: 'API Call', description: 'Make external API calls', enabled: false },
  { id: 'code_execution', name: 'Code Execution', description: 'Execute Python code snippets', enabled: true },
];

export function AgentConfigEditor() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('model');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [topP, setTopP] = useState(1.0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.0);
  const [presencePenalty, setPresencePenalty] = useState(0.0);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [memoryType, setMemoryType] = useState('long-term');
  const [toolSearch, setToolSearch] = useState('');
  const [enabledTools, setEnabledTools] = useState(['web_search', 'calculator', 'code_execution']);

  const handleSave = () => {
    toast.success('Configuration saved successfully');
    setHasUnsavedChanges(false);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const filteredTools = availableTools.filter(tool =>
    tool.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
    tool.description.toLowerCase().includes(toolSearch.toLowerCase())
  );

  const sectionValid = {
    model: true,
    prompt: true,
    memory: true,
    tools: enabledTools.length > 0,
    custom: true,
    advanced: true,
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <span className="text-[#999]">Home</span>
        <span className="text-[#999]">/</span>
        <span className="text-[#999]">Agents</span>
        <span className="text-[#999]">/</span>
        <span className="text-[#999]">{agentId}</span>
        <span className="text-[#999]">/</span>
        <span className="text-[#333]">Configuration</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[#333] mb-2">Configure Agent - Customer Support Agent</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#999]">Last Saved: Dec 12, 2025 10:30 AM</span>
              {hasUnsavedChanges && (
                <span className="flex items-center gap-1 px-3 py-1 bg-[#FF9800]/10 text-[#FF9800] text-xs rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  Unsaved Changes
                </span>
              )}
              {!hasUnsavedChanges && (
                <span className="flex items-center gap-1 px-3 py-1 bg-[#10b981]/10 text-[#10b981] text-xs rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  All Changes Saved
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 border border-[#ddd] rounded-lg text-[#666] hover:bg-[#f8f9fa] transition-colors"
            >
              Cancel
            </button>
            <button className="px-6 py-2.5 border border-[#8B5CF6] text-[#8B5CF6] rounded-lg hover:bg-[#f8f5ff] transition-colors">
              Validate
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="grid grid-cols-[250px_1fr] gap-6 mb-8">
        {/* Sidebar */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="space-y-1">
            {configSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white font-medium shadow-md'
                    : 'text-[#666] hover:bg-[#f8f9fa]'
                }`}
              >
                <span className="text-lg">{section.icon}</span>
                <span className="flex-1">{section.label}</span>
                {sectionValid[section.id as keyof typeof sectionValid] ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {activeSection === 'model' && (
            <ModelSettings
              temperature={temperature}
              setTemperature={(v) => { setTemperature(v); setHasUnsavedChanges(true); }}
              maxTokens={maxTokens}
              setMaxTokens={(v) => { setMaxTokens(v); setHasUnsavedChanges(true); }}
              topP={topP}
              setTopP={(v) => { setTopP(v); setHasUnsavedChanges(true); }}
              frequencyPenalty={frequencyPenalty}
              setFrequencyPenalty={(v) => { setFrequencyPenalty(v); setHasUnsavedChanges(true); }}
              presencePenalty={presencePenalty}
              setPresencePenalty={(v) => { setPresencePenalty(v); setHasUnsavedChanges(true); }}
            />
          )}
          {activeSection === 'prompt' && <PromptTemplate />}
          {activeSection === 'memory' && (
            <MemoryConfig
              memoryEnabled={memoryEnabled}
              setMemoryEnabled={(v) => { setMemoryEnabled(v); setHasUnsavedChanges(true); }}
              memoryType={memoryType}
              setMemoryType={(v) => { setMemoryType(v); setHasUnsavedChanges(true); }}
            />
          )}
          {activeSection === 'tools' && (
            <ToolsActions
              toolSearch={toolSearch}
              setToolSearch={setToolSearch}
              filteredTools={filteredTools}
              enabledTools={enabledTools}
              setEnabledTools={(v) => { setEnabledTools(v); setHasUnsavedChanges(true); }}
            />
          )}
          {activeSection === 'custom' && <CustomSettings />}
          {activeSection === 'advanced' && <AdvancedSettings />}
        </div>
      </div>

      {/* Validation Panel */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-[#333] mb-4">Validation Results</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-[#10b981]">
            <CheckCircle className="w-4 h-4" />
            Model settings valid
          </div>
          <div className="flex items-center gap-2 text-sm text-[#10b981]">
            <CheckCircle className="w-4 h-4" />
            Prompt template valid
          </div>
          <div className="flex items-center gap-2 text-sm text-[#FF9800]">
            <AlertCircle className="w-4 h-4" />
            Memory configuration: Warning - High memory usage expected
          </div>
          {enabledTools.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-[#ef4444]">
              <X className="w-4 h-4" />
              Tools: Error - At least one tool must be enabled
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModelSettings({ temperature, setTemperature, maxTokens, setMaxTokens, topP, setTopP, frequencyPenalty, setFrequencyPenalty, presencePenalty, setPresencePenalty }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-[#333]">Model Settings</h3>

      <div>
        <label className="block text-sm text-[#666] mb-2">Model Name *</label>
        <select className="w-full px-4 py-2.5 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent">
          <option>GPT-4</option>
          <option>GPT-3.5 Turbo</option>
          <option>Claude 3</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-[#666] mb-2">Temperature * ({temperature})</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full h-2 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
        />
        <div className="flex justify-between text-xs text-[#999] mt-1">
          <span>0.0 (Focused)</span>
          <span>1.0 (Creative)</span>
        </div>
      </div>

      <div>
        <label className="block text-sm text-[#666] mb-2">Max Tokens * ({maxTokens})</label>
        <input
          type="range"
          min="1"
          max="4000"
          step="100"
          value={maxTokens}
          onChange={(e) => setMaxTokens(parseInt(e.target.value))}
          className="w-full h-2 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
        />
        <div className="text-xs text-[#999] mt-1">Estimated cost per call: ${(maxTokens * 0.00005).toFixed(2)}</div>
      </div>

      <div>
        <label className="block text-sm text-[#666] mb-2">Top P ({topP})</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={topP}
          onChange={(e) => setTopP(parseFloat(e.target.value))}
          className="w-full h-2 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
        />
      </div>

      <div>
        <label className="block text-sm text-[#666] mb-2">Frequency Penalty ({frequencyPenalty})</label>
        <input
          type="range"
          min="-2"
          max="2"
          step="0.1"
          value={frequencyPenalty}
          onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
          className="w-full h-2 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
        />
      </div>

      <div>
        <label className="block text-sm text-[#666] mb-2">Presence Penalty ({presencePenalty})</label>
        <input
          type="range"
          min="-2"
          max="2"
          step="0.1"
          value={presencePenalty}
          onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
          className="w-full h-2 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
        />
      </div>
    </div>
  );
}

function PromptTemplate() {
  return (
    <div className="space-y-6">
      <h3 className="text-[#333]">Prompt Template</h3>

      <div>
        <label className="block text-sm text-[#666] mb-2">System Message *</label>
        <textarea
          defaultValue="You are a helpful customer support assistant. Be polite, professional, and provide accurate information."
          rows={6}
          className="w-full px-4 py-3 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent font-mono text-sm resize-none"
        />
        <div className="text-xs text-[#999] mt-1">Character count: 156 / 2000</div>
      </div>

      <div>
        <label className="block text-sm text-[#666] mb-2">User Prompt Template</label>
        <textarea
          defaultValue={`{{user_input}}\n\nContext: {{context}}\nHistory: {{history}}`}
          rows={8}
          className="w-full px-4 py-3 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent font-mono text-sm resize-none bg-[#1e1e1e] text-[#d4d4d4]"
        />
        <div className="mt-2 p-3 bg-[#06B6D4]/10 rounded-lg text-sm text-[#666]">
          <div className="font-medium mb-1">Available variables:</div>
          <div className="space-y-1">
            <div>• <code className="text-[#8B5CF6]">{'{{user_input}}'}</code> - User's message</div>
            <div>• <code className="text-[#8B5CF6]">{'{{context}}'}</code> - Additional context</div>
            <div>• <code className="text-[#8B5CF6]">{'{{history}}'}</code> - Conversation history</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="px-4 py-2 border border-[#8B5CF6] text-[#8B5CF6] rounded-lg hover:bg-[#f8f5ff] transition-colors">
          Load Template ▼
        </button>
        <button className="px-4 py-2 border border-[#8B5CF6] text-[#8B5CF6] rounded-lg hover:bg-[#f8f5ff] transition-colors">
          Test Prompt
        </button>
      </div>
    </div>
  );
}

function MemoryConfig({ memoryEnabled, setMemoryEnabled, memoryType, setMemoryType }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-[#333]">Memory Configuration</h3>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-[#333] font-medium mb-1">Enable Memory</div>
          <div className="text-xs text-[#666]">Store conversation history for context</div>
        </div>
        <button
          onClick={() => setMemoryEnabled(!memoryEnabled)}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            memoryEnabled ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]' : 'bg-[#d1d5db]'
          }`}
        >
          <div
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
              memoryEnabled ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {memoryEnabled && (
        <>
          <div>
            <label className="block text-sm text-[#666] mb-2">Max History Messages</label>
            <input
              type="number"
              defaultValue={10}
              min={1}
              max={100}
              className="w-full px-4 py-2.5 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
            />
            <div className="text-xs text-[#999] mt-1">Keep last N messages in context</div>
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-3">Memory Type</label>
            <div className="space-y-2">
              {[
                { value: 'short-term', label: 'Short-term (session only)' },
                { value: 'long-term', label: 'Long-term (persistent)' },
                { value: 'hybrid', label: 'Hybrid' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="memoryType"
                    value={option.value}
                    checked={memoryType === option.value}
                    onChange={(e) => setMemoryType(e.target.value)}
                    className="w-4 h-4 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                  />
                  <span className="text-[#333]">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-2">Memory Storage</label>
            <select className="w-full px-4 py-2.5 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent">
              <option>Cosmos DB</option>
              <option>Redis</option>
              <option>PostgreSQL</option>
            </select>
          </div>

          <div className="p-4 bg-[#06B6D4]/10 border border-[#06B6D4]/20 rounded-lg flex gap-3">
            <div className="text-[#06B6D4] flex-shrink-0">ℹ️</div>
            <div className="text-sm text-[#666]">
              Memory settings affect how the agent remembers previous conversations and context.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ToolsActions({ toolSearch, setToolSearch, filteredTools, enabledTools, setEnabledTools }: any) {
  const toggleTool = (toolId: string) => {
    if (enabledTools.includes(toolId)) {
      setEnabledTools(enabledTools.filter((id: string) => id !== toolId));
    } else {
      setEnabledTools([...enabledTools, toolId]);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-[#333]">Tools & Actions</h3>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
        <input
          type="text"
          placeholder="Search tools..."
          value={toolSearch}
          onChange={(e) => setToolSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
        />
      </div>

      <div className="space-y-3">
        {filteredTools.map((tool: any) => (
          <label
            key={tool.id}
            className="flex items-start gap-3 p-4 border border-[#ddd] rounded-lg cursor-pointer hover:border-[#8B5CF6] transition-colors"
          >
            <input
              type="checkbox"
              checked={enabledTools.includes(tool.id)}
              onChange={() => toggleTool(tool.id)}
              className="mt-1 w-4 h-4 text-[#8B5CF6] rounded focus:ring-[#8B5CF6]"
            />
            <div className="flex-1">
              <div className="text-sm text-[#333] font-medium mb-1">{tool.name}</div>
              <div className="text-xs text-[#666]">{tool.description}</div>
            </div>
          </label>
        ))}
      </div>

      <button className="w-full py-3 border-2 border-dashed border-[#ddd] rounded-lg text-[#666] hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-colors">
        + Add Custom Tool
      </button>
    </div>
  );
}

function CustomSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-[#333]">Custom Settings (JSON)</h3>

      <textarea
        defaultValue={`{\n  "custom_field_1": "value",\n  "custom_field_2": 123,\n  "nested_object": {\n    "key": "value"\n  }\n}`}
        rows={12}
        className="w-full px-4 py-3 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent font-mono text-sm resize-none bg-[#1e1e1e] text-[#d4d4d4]"
      />

      <div className="flex gap-2">
        <button className="px-4 py-2 border border-[#8B5CF6] text-[#8B5CF6] rounded-lg hover:bg-[#f8f5ff] transition-colors">
          Format JSON
        </button>
        <button className="px-4 py-2 border border-[#8B5CF6] text-[#8B5CF6] rounded-lg hover:bg-[#f8f5ff] transition-colors">
          Validate JSON
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-[#10b981]">
        <CheckCircle className="w-4 h-4" />
        Valid JSON
      </div>
    </div>
  );
}

function AdvancedSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-[#333]">Advanced Settings</h3>
      <div className="p-8 text-center text-[#999]">
        <div className="text-4xl mb-4">🔬</div>
        <div>Advanced configuration options will appear here</div>
      </div>
    </div>
  );
}
