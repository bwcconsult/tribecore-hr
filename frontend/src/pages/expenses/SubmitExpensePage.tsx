import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import expenseService, { ExpenseItem } from '../../services/expense.service';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CurrencySelector } from '../../components/expenses/CurrencySelector';
import { ReceiptUploader } from '../../components/expenses/ReceiptUploader';

export default function SubmitExpensePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('GBP');
  const [notes, setNotes] = useState('');
  const [uploadedReceipts, setUploadedReceipts] = useState<{ [key: number]: any }>({});
  const [items, setItems] = useState<Partial<ExpenseItem>[]>([
    {
      categoryId: '',
      amount: 0,
      currency: 'GBP',
      expenseDate: new Date().toISOString().split('T')[0],
      description: '',
      vendor: '',
    },
  ]);

  const createMutation = useMutation({
    mutationFn: expenseService.createClaim,
    onSuccess: (data) => {
      toast.success('Expense claim created successfully!');
      navigate(`/expenses/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create expense claim');
    },
  });

  const addItem = () => {
    setItems([
      ...items,
      {
        categoryId: '',
        amount: 0,
        currency: currency,
        expenseDate: new Date().toISOString().split('T')[0],
        description: '',
        vendor: '',
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const handleSaveDraft = () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const validItems = items.filter(
      (item) => item.amount && item.amount > 0 && item.description
    );

    if (validItems.length === 0) {
      toast.error('Please add at least one valid expense item');
      return;
    }

    createMutation.mutate({
      title,
      description,
      currency,
      notes,
      items: validItems as ExpenseItem[],
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const validItems = items.filter(
      (item) => item.amount && item.amount > 0 && item.description
    );

    if (validItems.length === 0) {
      toast.error('Please add at least one valid expense item');
      return;
    }

    try {
      const claim = await createMutation.mutateAsync({
        title,
        description,
        currency,
        notes,
        items: validItems as ExpenseItem[],
      });

      // Submit the claim
      await expenseService.submitClaim(claim.id);
      toast.success('Expense claim submitted for approval!');
      navigate('/expenses');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit expense claim');
    }
  };

  // Fetch categories from API
  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => expenseService.getCategories(),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/expenses')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Expenses
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Submit New Expense</h1>
        <p className="text-gray-600 mt-1">Fill in the details of your expense claim</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Claim Details */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Claim Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Business Trip to London"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide additional details about this expense claim..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <CurrencySelector
                value={currency}
                onChange={setCurrency}
                amount={calculateTotal()}
                showConversion={true}
              />
            </div>
          </div>
        </div>

        {/* Expense Items */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Expense Items</h2>
            <button
              onClick={addItem}
              className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Item #{index + 1}</h3>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={item.categoryId}
                      onChange={(e) => updateItem(index, 'categoryId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.amount}
                      onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={item.expenseDate}
                      onChange={(e) => updateItem(index, 'expenseDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor/Merchant
                    </label>
                    <input
                      type="text"
                      value={item.vendor}
                      onChange={(e) => updateItem(index, 'vendor', e.target.value)}
                      placeholder="e.g., Tesco, Uber"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Brief description of the expense"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Receipt
                    </label>
                    <ReceiptUploader
                      onUploadComplete={(receipt, ocrData) => {
                        // Store uploaded receipt
                        setUploadedReceipts({ ...uploadedReceipts, [index]: receipt });
                        
                        // Auto-fill from OCR data if available
                        if (ocrData) {
                          const newItems = [...items];
                          if (ocrData.amount && !newItems[index].amount) {
                            newItems[index].amount = ocrData.amount;
                          }
                          if (ocrData.vendor && !newItems[index].vendor) {
                            newItems[index].vendor = ocrData.vendor;
                          }
                          if (ocrData.date && !newItems[index].expenseDate) {
                            newItems[index].expenseDate = ocrData.date;
                          }
                          setItems(newItems);
                          toast.success('Receipt uploaded and data extracted!');
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information for your manager or finance team..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Total and Actions */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: currency,
                }).format(calculateTotal())}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={createMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </button>
            <button
              onClick={() => navigate('/expenses')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
