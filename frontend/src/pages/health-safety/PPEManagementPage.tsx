import { useState, useEffect } from 'react';
import { HardHat, Plus, AlertTriangle, Package } from 'lucide-react';
import * as healthSafetyService from '../../services/healthSafety.service';

export default function PPEManagementPage() {
  const [ppe, setPPE] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allPPE, lowStockItems] = await Promise.all([
        healthSafetyService.getAllPPE('org-1'),
        healthSafetyService.getLowStockPPE('org-1'),
      ]);
      setPPE(allPPE);
      setLowStock(lowStockItems);
    } catch (error) {
      console.error('Failed to load PPE data', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PPE Management</h1>
          <p className="text-gray-600 mt-1">PPE at Work Regulations 1992</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add PPE Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total PPE Items</p>
            <HardHat className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{ppe.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Low Stock Items</p>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{lowStock.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Stock Value</p>
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            £{ppe.reduce((sum, item) => sum + (item.quantityInStock * item.unitCost), 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Items Issued</p>
            <HardHat className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {ppe.reduce((sum, item) => sum + (item.issueRecords?.length || 0), 0)}
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Low Stock Alert - Reorder Required
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lowStock.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.description}</p>
                    <p className="text-sm text-gray-600">Type: {item.ppeType}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Stock: {item.quantityInStock} / Min: {item.minimumStockLevel}
                    </p>
                  </div>
                  <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                    Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PPE Requirements */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">PPE at Work Regulations 1992 - Key Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-900 mb-2">Risk Assessment</p>
            <p className="text-sm text-blue-700">PPE must only be used as last resort after other control measures</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="font-medium text-green-900 mb-2">Suitable & Sufficient</p>
            <p className="text-sm text-green-700">PPE must be appropriate for risks and properly fit the user</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="font-medium text-purple-900 mb-2">Training & Maintenance</p>
            <p className="text-sm text-purple-700">Provide training, storage, maintenance, and replacement</p>
          </div>
        </div>
      </div>

      {/* PPE Inventory */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">PPE Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-700">PPE Number</th>
                <th className="text-left p-4 font-medium text-gray-700">Type</th>
                <th className="text-left p-4 font-medium text-gray-700">Description</th>
                <th className="text-left p-4 font-medium text-gray-700">Stock</th>
                <th className="text-left p-4 font-medium text-gray-700">Min Level</th>
                <th className="text-left p-4 font-medium text-gray-700">Unit Cost</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ppe.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium text-blue-600">{item.ppeNumber}</td>
                  <td className="p-4 text-gray-600">{item.ppeType?.replace(/_/g, ' ')}</td>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{item.description}</p>
                    <p className="text-sm text-gray-500">{item.manufacturer}</p>
                  </td>
                  <td className="p-4 text-gray-600">{item.quantityInStock}</td>
                  <td className="p-4 text-gray-600">{item.minimumStockLevel}</td>
                  <td className="p-4 text-gray-600">£{item.unitCost}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      item.status === 'IN_STOCK' ? 'bg-green-100 text-green-700' :
                      item.status === 'NEEDS_REPLACEMENT' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-2">Issue</button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">Edit</button>
                  </td>
                </tr>
              ))}
              {ppe.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No PPE items in inventory
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
