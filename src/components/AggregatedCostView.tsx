import { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const mockData = [
  { agentCode: 'agent_001', timestamp: '2025-12-12 10:30:00', value: 4.25, status: 'Success' },
  { agentCode: 'agent_002', timestamp: '2025-12-12 10:25:00', value: 3.75, status: 'Success' },
  { agentCode: 'agent_003', timestamp: '2025-12-12 10:20:00', value: 5.10, status: 'Success' },
  { agentCode: 'agent_001', timestamp: '2025-12-12 10:15:00', value: 2.80, status: 'Success' },
  { agentCode: 'agent_004', timestamp: '2025-12-12 10:10:00', value: 6.50, status: 'Success' },
  { agentCode: 'agent_002', timestamp: '2025-12-12 10:05:00', value: 3.20, status: 'Success' },
  { agentCode: 'agent_005', timestamp: '2025-12-12 10:00:00', value: 4.90, status: 'Success' },
  { agentCode: 'agent_003', timestamp: '2025-12-12 09:55:00', value: 3.45, status: 'Success' },
];

export function AggregatedCostView() {
  const [agentCode, setAgentCode] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [data, setData] = useState(mockData);

  const handleFetch = () => {
    toast.success('Fetching cost metrics...');
    // Filter logic would go here
    const filtered = mockData.filter(item => {
      if (agentCode && !item.agentCode.includes(agentCode)) return false;
      if (minValue && item.value < parseFloat(minValue)) return false;
      if (maxValue && item.value > parseFloat(maxValue)) return false;
      return true;
    });
    setData(filtered);
  };

  const handleReset = () => {
    setAgentCode('');
    setStartTime('');
    setEndTime('');
    setMinValue('');
    setMaxValue('');
    setData(mockData);
    toast.info('Filters reset');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <span className="text-[#999]">Home</span>
        <span className="text-[#999]">/</span>
        <span className="text-[#999]">Metrics</span>
        <span className="text-[#999]">/</span>
        <span className="text-[#333]">Cost</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-[#333] mb-6">Agent Metrics [Cost]</h1>
        
        {/* Filter Row */}
        <div className="grid grid-cols-[1fr_1fr_1fr_0.8fr_0.8fr_auto] gap-4 items-end">
          <div>
            <label className="block text-sm text-[#666] mb-2">Agent Code:</label>
            <input
              type="text"
              placeholder="e.g., agent_code"
              value={agentCode}
              onChange={(e) => setAgentCode(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-2">Start Time:</label>
            <div className="relative">
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-2">End Time:</label>
            <div className="relative">
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-2">Min Value:</label>
            <input
              type="text"
              placeholder="Optional"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-2">Max Value:</label>
            <input
              type="text"
              placeholder="Optional"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
            />
          </div>

          <button
            onClick={handleFetch}
            className="px-8 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Fetch
          </button>
        </div>

        {/* Reset Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleReset}
            className="px-6 py-2 border border-[#8B5CF6] text-[#8B5CF6] rounded-lg hover:bg-[#f8f5ff] transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* All Aggregated Cost Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#333]">All Aggregated Cost</h3>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#8B5CF6] text-[#8B5CF6] rounded-lg hover:bg-[#f8f5ff] transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white">
                <th className="px-4 py-3 text-left rounded-tl-lg">Agent Code</th>
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-right">Cost Value</th>
                <th className="px-4 py-3 text-left rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b border-[#eee] hover:bg-[#f8f5ff] transition-colors">
                  <td className="px-4 py-3 text-[#333] font-medium">{row.agentCode}</td>
                  <td className="px-4 py-3 text-[#666]">{row.timestamp}</td>
                  <td className="px-4 py-3 text-right text-[#333] font-medium">${row.value.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#10b981]/10 text-[#10b981] text-xs rounded-full">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#eee]">
          <div className="text-sm text-[#666]">
            Showing 1-{data.length} of {data.length} records
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-[#ddd] rounded-lg text-[#666] hover:bg-[#f8f9fa] transition-colors disabled:opacity-50" disabled>
              ‹ Previous
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-[#ddd] rounded-lg text-[#666] hover:bg-[#f8f9fa] transition-colors">2</button>
            <button className="px-4 py-2 border border-[#ddd] rounded-lg text-[#666] hover:bg-[#f8f9fa] transition-colors">3</button>
            <button className="px-4 py-2 border border-[#ddd] rounded-lg text-[#666] hover:bg-[#f8f9fa] transition-colors">
              Next ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
