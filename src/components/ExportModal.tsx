import { X, Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

interface ExportModalProps {
  onClose: () => void;
}

export function ExportModal({ onClose }: ExportModalProps) {
  const [format, setFormat] = useState('xlsx');
  const [includeStats, setIncludeStats] = useState(true);
  const [includeBreakdown, setIncludeBreakdown] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);

  const handleExport = () => {
    toast.success('Export initiated', {
      description: `Downloading data in ${format.toUpperCase()} format...`,
    });
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-[#eee]">
          <h3 className="text-[#333]">Export Aggregated Cost Data</h3>
          <button onClick={onClose} className="text-[#999] hover:text-[#333]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-[#666] mb-3">Format:</label>
            <div className="space-y-2">
              {[
                { value: 'csv', label: 'CSV' },
                { value: 'xlsx', label: 'Excel (XLSX)' },
                { value: 'pdf', label: 'PDF Report' },
                { value: 'json', label: 'JSON' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={option.value}
                    checked={format === option.value}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-4 h-4 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                  />
                  <span className="text-[#333]">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-3">Include:</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStats}
                  onChange={(e) => setIncludeStats(e.target.checked)}
                  className="w-4 h-4 text-[#8B5CF6] rounded focus:ring-[#8B5CF6]"
                />
                <span className="text-[#333]">Summary Statistics</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBreakdown}
                  onChange={(e) => setIncludeBreakdown(e.target.checked)}
                  className="w-4 h-4 text-[#8B5CF6] rounded focus:ring-[#8B5CF6]"
                />
                <span className="text-[#333]">Agent Breakdown</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="w-4 h-4 text-[#8B5CF6] rounded focus:ring-[#8B5CF6]"
                  disabled={format !== 'pdf'}
                />
                <span className={format !== 'pdf' ? 'text-[#999]' : 'text-[#333]'}>
                  Charts (PDF only)
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-2">Date Range:</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#999] mb-1">From:</label>
                <input
                  type="date"
                  defaultValue="2025-12-01"
                  className="w-full px-3 py-2 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-[#999] mb-1">To:</label>
                <input
                  type="date"
                  defaultValue="2025-12-31"
                  className="w-full px-3 py-2 border border-[#ddd] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#eee]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-[#ddd] rounded-lg text-[#666] hover:bg-[#f8f9fa] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
