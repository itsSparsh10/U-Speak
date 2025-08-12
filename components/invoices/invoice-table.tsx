'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Search, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  dueDate: string;
  createdDate: string;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    client: 'Acme Corporation',
    amount: 2500.00,
    status: 'paid',
    dueDate: '2024-01-15',
    createdDate: '2023-12-15'
  },
  {
    id: '2',
    invoiceNumber: 'INV-002',
    client: 'Tech Solutions Ltd',
    amount: 1800.50,
    status: 'pending',
    dueDate: '2024-01-20',
    createdDate: '2023-12-20'
  },
  {
    id: '3',
    invoiceNumber: 'INV-003',
    client: 'Digital Agency Inc',
    amount: 3200.00,
    status: 'overdue',
    dueDate: '2024-01-10',
    createdDate: '2023-12-10'
  },
  {
    id: '4',
    invoiceNumber: 'INV-004',
    client: 'StartUp Ventures',
    amount: 950.75,
    status: 'draft',
    dueDate: '2024-01-25',
    createdDate: '2023-12-25'
  },
  {
    id: '5',
    invoiceNumber: 'INV-005',
    client: 'Global Enterprises',
    amount: 4500.00,
    status: 'paid',
    dueDate: '2024-01-18',
    createdDate: '2023-12-18'
  }
];

export function InvoiceTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invoices] = useState<Invoice[]>(mockInvoices);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Invoice['status']) => {
    const variants = {
      paid: 'bg-green-100 text-green-800 hover:bg-green-100',
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      overdue: 'bg-red-100 text-red-800 hover:bg-red-100',
      draft: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    };

    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-4 px-6 font-medium text-gray-600">Invoice</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Client</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Amount</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Status</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Due Date</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Created</th>
              <th className="text-right py-4 px-6 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-gray-900">{invoice.client}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-semibold text-gray-900">{formatCurrency(invoice.amount)}</div>
                </td>
                <td className="py-4 px-6">
                  {getStatusBadge(invoice.status)}
                </td>
                <td className="py-4 px-6">
                  <div className="text-gray-600">{formatDate(invoice.dueDate)}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-gray-600">{formatDate(invoice.createdDate)}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                      <Download className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No invoices found matching your criteria.</div>
        </div>
      )}
    </div>
  );
}