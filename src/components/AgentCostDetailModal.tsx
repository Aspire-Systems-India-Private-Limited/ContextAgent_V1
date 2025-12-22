import { X, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AgentCostDetailModalProps {
  agent: string;
  onClose: () => void;
}

const dailyCostData = [
  { day: 'Dec 1', cost: 120 },
  { day: 'Dec 5', cost: 145 },
  { day: 'Dec 10', cost: 230 },
  { day: 'Dec 15', cost: 250 },
  { day: 'Dec 20', cost: 245 },
  { day: 'Dec 25', cost: 180 },
  { day: 'Dec 31', cost: 200 },
];

export function AgentCostDetailModal({ agent, onClose }: AgentCostDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#eee] sticky top-0 bg-white">
          <h3 className="text-[#333]">Agent Cost Details: {agent}</h3>
          <button onClick={onClose} className="text-[#999] hover:text-[#333]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#06B6D4]/10 rounded-lg p-4">
            <div className="text-sm text-[#666] mb-2">Period: December 2025</div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#f8f9fa] rounded-lg p-4">
              <div className="text-xs text-[#666] mb-1">Total Cost</div>
              <div className="text-xl text-[#333]">$4,391.50</div>
            </div>
            <div className="bg-[#f8f9fa] rounded-lg p-4">
              <div className="text-xs text-[#666] mb-1">Total Calls</div>
              <div className="text-xl text-[#333]">12,547</div>
            </div>
            <div className="bg-[#f8f9fa] rounded-lg p-4">
              <div className="text-xs text-[#666] mb-1">Success Rate</div>
              <div className="text-xl text-[#10b981]">98.5%</div>
            </div>
            <div className="bg-[#f8f9fa] rounded-lg p-4">
              <div className="text-xs text-[#666] mb-1">Avg Cost/Call</div>
              <div className="text-xl text-[#333]">$0.35</div>
            </div>
          </div>

          <div>
            <h4 className="text-[#333] mb-4">Daily Cost Breakdown</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#999" fontSize={12} />
                <YAxis stroke="#999" fontSize={12} tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => `$${value}`} />
                <Line type="monotone" dataKey="cost" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-[#333] mb-3">Top Cost Days</h4>
            <div className="space-y-2">
              {[
                { date: 'Dec 15', cost: 250, calls: 1200 },
                { date: 'Dec 20', cost: 245, calls: 1150 },
                { date: 'Dec 10', cost: 230, calls: 1100 },
              ].map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#f8f9fa] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="text-[#333] font-medium">{day.date}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[#333] font-medium">${day.cost}</div>
                    <div className="text-xs text-[#666]">{day.calls.toLocaleString()} calls</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#eee]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-[#ddd] rounded-lg text-[#666] hover:bg-[#f8f9fa] transition-colors"
          >
            Close
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white rounded-lg hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4" />
            Export Details
          </button>
        </div>
      </div>
    </div>
  );
}
