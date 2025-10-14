import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Shield,
  Edit,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

export default function ContractorDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock contractor data
  const contractor = {
    id,
    contractorId: 'CTR-001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+44 7700 900123',
    company: 'Smith Consulting Ltd',
    taxId: 'GB123456789',
    address: '123 Business Street, London, SW1A 1AA',
    status: 'ACTIVE',
    rate: 500,
    currency: 'GBP',
    paymentFrequency: 'DAILY',
    contractStartDate: '2024-01-15',
    contractEndDate: '2025-01-14',
    totalPaid: 45000,
    invoiceCount: 9,
    ir35Status: 'OUTSIDE',
    ir35AssessmentDate: '2024-01-10',
    scopeOfWork: 'Senior Software Developer - Full stack development for core platform features',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
  };

  const payments = [
    { id: '1', periodStart: '2024-10-01', periodEnd: '2024-10-31', hoursWorked: 160, amount: 8000, status: 'PAID', paidDate: '2024-11-05' },
    { id: '2', periodStart: '2024-09-01', periodEnd: '2024-09-30', hoursWorked: 168, amount: 8400, status: 'PAID', paidDate: '2024-10-05' },
    { id: '3', periodStart: '2024-08-01', periodEnd: '2024-08-31', hoursWorked: 152, amount: 7600, status: 'PAID', paidDate: '2024-09-05' },
  ];

  const invoices = [
    { id: '1', invoiceNumber: 'INV-CTR-001-2024-10', date: '2024-10-31', dueDate: '2024-11-30', amount: 8000, status: 'PAID' },
    { id: '2', invoiceNumber: 'INV-CTR-001-2024-09', date: '2024-09-30', dueDate: '2024-10-30', amount: 8400, status: 'PAID' },
    { id: '3', invoiceNumber: 'INV-CTR-001-2024-08', date: '2024-08-31', dueDate: '2024-09-30', amount: 7600, status: 'PAID' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/contractors">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {contractor.firstName} {contractor.lastName}
            </h1>
            <p className="text-gray-600 mt-1">{contractor.contractorId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('Editing contractor...')}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button onClick={() => toast.success('Generating report...')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          <button
            className={`pb-3 px-1 font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`pb-3 px-1 font-medium ${
              activeTab === 'payments'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </button>
          <button
            className={`pb-3 px-1 font-medium ${
              activeTab === 'invoices'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('invoices')}
          >
            Invoices
          </button>
          <button
            className={`pb-3 px-1 font-medium ${
              activeTab === 'ir35'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('ir35')}
          >
            IR35 Assessment
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{contractor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{contractor.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Company</p>
                      <p className="font-medium">{contractor.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Tax ID</p>
                      <p className="font-medium">{contractor.taxId}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-medium">{contractor.address}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contract Details */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Rate</p>
                    <p className="text-lg font-bold text-gray-900">
                      {contractor.currency}{contractor.rate}
                      <span className="text-sm font-normal text-gray-500">/{contractor.paymentFrequency.toLowerCase()}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contract Start</p>
                    <p className="font-medium">{new Date(contractor.contractStartDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contract End</p>
                    <p className="font-medium">{new Date(contractor.contractEndDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Scope of Work</p>
                  <p className="text-gray-900">{contractor.scopeOfWork}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {contractor.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Contract Status</p>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {contractor.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">IR35 Status</p>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {contractor.ir35Status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Total Paid (YTD)</p>
                    <p className="text-2xl font-bold text-gray-900">£{(contractor.totalPaid / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Invoices</p>
                    <p className="text-lg font-medium text-gray-900">{contractor.invoiceCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment History</CardTitle>
              <Button onClick={() => toast.success('Recording new payment...')}>
                <DollarSign className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium">Period</th>
                    <th className="pb-3 font-medium">Hours Worked</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Paid Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="text-sm">
                      <td className="py-3">
                        {new Date(payment.periodStart).toLocaleDateString()} - {new Date(payment.periodEnd).toLocaleDateString()}
                      </td>
                      <td className="py-3">{payment.hoursWorked} hours</td>
                      <td className="py-3 font-medium">£{payment.amount.toLocaleString()}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3">{new Date(payment.paidDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invoices</CardTitle>
              <Button onClick={() => toast.success('Generating new invoice...')}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium">Invoice Number</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Due Date</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="text-sm">
                      <td className="py-3 font-medium">{invoice.invoiceNumber}</td>
                      <td className="py-3">{new Date(invoice.date).toLocaleDateString()}</td>
                      <td className="py-3">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 font-medium">£{invoice.amount.toLocaleString()}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <Button variant="outline" size="sm" onClick={() => toast.success('Downloading invoice...')}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* IR35 Tab */}
      {activeTab === 'ir35' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>IR35 Assessment</CardTitle>
              <Button onClick={() => toast.success('Running new assessment...')}>
                <Shield className="h-4 w-4 mr-2" />
                New Assessment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">IR35 Status: {contractor.ir35Status}</p>
                    <p className="text-sm text-green-700">
                      Last assessed: {new Date(contractor.ir35AssessmentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-green-800 mt-3">
                  This contractor is operating outside IR35, meaning they are considered genuinely self-employed
                  and not subject to PAYE deductions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Assessment Criteria</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Control & Supervision</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">PASS</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Substitution Rights</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">PASS</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Financial Risk</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">PASS</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Business Integration</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">PASS</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
