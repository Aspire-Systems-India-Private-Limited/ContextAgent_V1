import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit, Trash2, FileText, Settings, Phone, CheckCircle, Clock, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner@2.0.3';

const callsOverTimeData = [
  { day: 'Mon', calls: 85 },
  { day: 'Tue', calls: 92 },
  { day: 'Wed', calls: 78 },
  { day: 'Thu', calls: 105 },
  { day: 'Fri', calls: 98 },
];

const responseTimeData = [
  { range: '<1s', count: 85 },
  { range: '1-2s', count: 65 },
  { range: '2-5s', count: 25 },
  { range: '>5s', count: 10 },
];

const successErrorData = [
  { name: 'Success', value: 98.5 },
  { name: 'Error', value: 1.5 },
];

const recentActivity = [
  { timestamp: '10:30 AM', user: 'User1', status: 'success', cost: 0.05 },
  { timestamp: '10:25 AM', user: 'User2', status: 'success', cost: 0.04 },
  { timestamp: '10:20 AM', user: 'User3', status: 'error', cost: 0.03 },
  { timestamp: '10:15 AM', user: 'User4', status: 'success', cost: 0.05 },
  { timestamp: '10:10 AM', user: 'User5', status: 'success', cost: 0.04 },
];

const activityLogs = [
  { timestamp: '2025-12-12 10:30', level: 'INFO', message: 'Call completed successfully', user: 'User1' },
  { timestamp: '2025-12-12 10:25', level: 'INFO', message: 'Call completed successfully', user: 'User2' },
  { timestamp: '2025-12-12 10:20', level: 'ERROR', message: 'Timeout error occurred', user: 'User3' },
  { timestamp: '2025-12-12 10:15', level: 'INFO', message: 'Call completed successfully', user: 'User4' },
  { timestamp: '2025-12-12 10:10', level: 'WARN', message: 'High response time detected', user: 'User5' },
];

const historyTimeline = [
  { date: 'Dec 12, 2025 10:30 AM', action: 'Configuration Updated', user: 'admin@example.com', type: 'config' },
  { date: 'Dec 11, 2025 3:45 PM', action: 'Status Changed: Active → Inactive', user: 'user@example.com', type: 'status' },
  { date: 'Dec 10, 2025 9:00 AM', action: 'Agent Created', user: 'admin@example.com', type: 'create' },
];

export function AgentDetailView() {
  const { solutionId, agentId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      toast.success('Agent deleted successfully');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <span className="text-[#999]">Home</span>
        <span className="text-[#999]">/</span>
        <span className="text-[#999]">Agents</span>
        <span className="text-[#999]">/</span>
        <span className="text-[#999]">{solutionId}</span>
        <span className="text-[#999]">/</span>
        <span className="text-[#333]">{agentId}</span>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center flex-shrink-0">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[#333]">Customer Support Agent</h1>
                <span className="px-3 py-1 bg-[#10b981] text-white text-sm rounded-full">Active</span>
              </div>
              <div className="text-sm text-[#666] mb-1">Agent Code: {agentId}</div>
              <div className="flex items-center gap-2 text-xs text-[#999]">
                <Clock className="w-3 h-3" />
                Last Updated: Dec 12, 2025 10:30 AM
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/agent/${agentId}/config`}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-[#8B5CF6] text-[#8B5CF6] rounded-lg hover:bg-[#f8f5ff] transition-colors">
              <FileText className="w-4 h-4" />
              View Logs
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Calls', value: '12,547', change: '+12%', icon: Phone, color: '#06B6D4' },
          { label: 'Success Rate', value: '98.5%', change: '+2.1%', icon: CheckCircle, color: '#10b981' },
          { label: 'Avg Response Time', value: '1.2s', change: '-0.3s', icon: Clock, color: '#FF9800' },
          { label: 'Total Cost', value: '$4,391', change: '+15%', icon: DollarSign, color: '#8B5CF6' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}aa 100%)` }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-medium text-[#10b981]">{stat.change}</div>
              </div>
              <div className="text-sm text-[#666] mb-1">{stat.label}</div>
              <div className="text-[#333]">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex border-b border-[#eee]">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'configuration', label: 'Configuration' },
            { id: 'metrics', label: 'Metrics' },
            { id: 'logs', label: 'Logs' },
            { id: 'history', label: 'History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-[#8B5CF6] border-b-3 border-[#8B5CF6] bg-gradient-to-b from-[#8B5CF6]/5 to-transparent'
                  : 'text-[#666] hover:bg-[#f8f9fa] hover:text-[#333]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'configuration' && <ConfigurationTab />}
          {activeTab === 'metrics' && <MetricsTab />}
          {activeTab === 'logs' && <LogsTab />}
          {activeTab === 'history' && <HistoryTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-[#f8f9fa] rounded-lg p-6">
          <h3 className="text-[#333] mb-4">Basic Information</h3>
          <div className="space-y-3">
            {[
              { label: 'Name', value: 'Customer Support Agent' },
              { label: 'Code', value: 'agent-001' },
              { label: 'Solution', value: 'sol-001' },
              { label: 'Created Date', value: 'Dec 10, 2025' },
              { label: 'Modified Date', value: 'Dec 12, 2025' },
              { label: 'Created By', value: 'admin@example.com' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-[#666]">{item.label}:</span>
                <span className="text-sm text-[#333] font-medium">{item.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666]">Status:</span>
              <span className="px-3 py-1 bg-[#10b981] text-white text-xs rounded-full">Active</span>
            </div>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="bg-[#f8f9fa] rounded-lg p-6">
          <h3 className="text-[#333] mb-4">Configuration Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Model', value: 'GPT-4' },
              { label: 'Temperature', value: '0.7' },
              { label: 'Max Tokens', value: '1000' },
              { label: 'Memory Enabled', value: 'Yes' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-[#666]">{item.label}:</span>
                <span className="text-sm text-[#333] font-medium">{item.value}</span>
              </div>
            ))}
          </div>
          <Link
            to="/agent/agent-001/config"
            className="mt-4 block w-full text-center px-4 py-2 border border-[#8B5CF6] text-[#8B5CF6] rounded-lg hover:bg-[#f8f5ff] transition-colors"
          >
            View Full Configuration
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-[#333] mb-4">Recent Activity (Last 10 calls)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white">
                <th className="px-4 py-3 text-left rounded-tl-lg">Timestamp</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Cost</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity, index) => (
                <tr key={index} className="border-b border-[#eee] hover:bg-[#f8f5ff] transition-colors">
                  <td className="px-4 py-3 text-[#666]">{activity.timestamp}</td>
                  <td className="px-4 py-3 text-[#333]">{activity.user}</td>
                  <td className="px-4 py-3">
                    {activity.status === 'success' ? (
                      <span className="flex items-center gap-1 text-[#10b981]">
                        <CheckCircle className="w-4 h-4" />
                        Success
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#ef4444]">
                        <AlertCircle className="w-4 h-4" />
                        Error
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-[#333] font-medium">${activity.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ConfigurationTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#333]">Agent Configuration</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-[#8B5CF6] text-[#8B5CF6] rounded-lg hover:bg-[#f8f5ff] transition-colors">
            Export JSON
          </button>
          <Link
            to="/agent/agent-001/config"
            className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Edit Configuration
          </Link>
        </div>
      </div>
      <div className="bg-[#1e1e1e] rounded-lg p-6 text-[#d4d4d4] font-mono text-sm overflow-x-auto">
        <pre>{`{
  "model": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 1000,
  "system_message": "You are a helpful customer support assistant.",
  "tools": [
    "web_search",
    "calculator",
    "code_execution"
  ],
  "memory_config": {
    "enabled": true,
    "max_history": 10,
    "storage": "cosmos_db"
  }
}`}</pre>
      </div>
    </div>
  );
}

function MetricsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Calls Over Time */}
        <div>
          <h3 className="text-[#333] mb-4">Calls Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={callsOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#999" fontSize={12} />
              <YAxis stroke="#999" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="calls" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Success vs Error Rate */}
        <div>
          <h3 className="text-[#333] mb-4">Success vs Error Rate</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={successErrorData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Response Time Distribution */}
        <div>
          <h3 className="text-[#333] mb-4">Response Time Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" stroke="#999" fontSize={12} />
              <YAxis stroke="#999" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#06B6D4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Trend */}
        <div>
          <h3 className="text-[#333] mb-4">Cost Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={callsOverTimeData}>
              <defs>
                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#999" fontSize={12} />
              <YAxis stroke="#999" fontSize={12} tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => `$${value}`} />
              <Bar dataKey="calls" fill="url(#costGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function LogsTab() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <input
          type="date"
          defaultValue="2025-12-12"
          className="px-4 py-2 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
        />
        <select className="px-4 py-2 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent">
          <option>All Levels</option>
          <option>INFO</option>
          <option>WARN</option>
          <option>ERROR</option>
        </select>
        <input
          type="text"
          placeholder="Search logs..."
          className="flex-1 px-4 py-2 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white">
              <th className="px-4 py-3 text-left rounded-tl-lg">Timestamp</th>
              <th className="px-4 py-3 text-left">Level</th>
              <th className="px-4 py-3 text-left">Message</th>
              <th className="px-4 py-3 text-left rounded-tr-lg">User</th>
            </tr>
          </thead>
          <tbody>
            {activityLogs.map((log, index) => (
              <tr key={index} className="border-b border-[#eee] hover:bg-[#f8f5ff] transition-colors">
                <td className="px-4 py-3 text-[#666]">{log.timestamp}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                      log.level === 'INFO' ? 'bg-[#06B6D4]/10 text-[#06B6D4]' :
                      log.level === 'WARN' ? 'bg-[#FF9800]/10 text-[#FF9800]' :
                      'bg-[#ef4444]/10 text-[#ef4444]'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        log.level === 'INFO' ? 'bg-[#06B6D4]' :
                        log.level === 'WARN' ? 'bg-[#FF9800]' :
                        'bg-[#ef4444]'
                      }`}
                    />
                    {log.level}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#333]">{log.message}</td>
                <td className="px-4 py-3 text-[#666]">{log.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HistoryTab() {
  return (
    <div>
      <h3 className="text-[#333] mb-6">Agent Modification History</h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#ddd]" />
        <div className="space-y-6">
          {historyTimeline.map((item, index) => (
            <div key={index} className="relative pl-12">
              <div
                className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  item.type === 'config' ? 'bg-[#8B5CF6]' :
                  item.type === 'status' ? 'bg-[#FF9800]' :
                  'bg-[#10b981]'
                }`}
              >
                {item.type === 'config' && <Settings className="w-4 h-4 text-white" />}
                {item.type === 'status' && <AlertCircle className="w-4 h-4 text-white" />}
                {item.type === 'create' && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
              <div className="bg-[#f8f9fa] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-[#666]">{item.date}</div>
                  <button className="text-xs text-[#8B5CF6] hover:underline">View Details</button>
                </div>
                <div className="text-[#333] font-medium mb-1">{item.action}</div>
                <div className="text-sm text-[#666]">by: {item.user}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
