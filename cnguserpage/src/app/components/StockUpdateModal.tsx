import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { CNGStation } from './CNGStationCard';

interface StockUpdateModalProps {
  station: CNGStation | null;
  onClose: () => void;
  onUpdate: (stationId: string, newStock: number, newPrice: number) => void;
}

export function StockUpdateModal({ station, onClose, onUpdate }: StockUpdateModalProps) {
  const [stockLevel, setStockLevel] = useState(station?.stockLevel || 0);
  const [price, setPrice] = useState(station?.pricePerKg || 0);

  if (!station) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(station.id, stockLevel, price);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Update Stock - {station.name}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Stock Level: {stockLevel}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={stockLevel}
              onChange={(e) => setStockLevel(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Empty</span>
              <span>Full</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Price per Kg (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
