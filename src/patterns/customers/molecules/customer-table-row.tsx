// Customer Table Row - Molecule
// Individual row component for customer table

import React from 'react';
import { CustomerTableCell } from '../atoms/customer-table-cell';
import { CustomerAvatar } from '../atoms/customer-avatar';
import { CustomerStatusBadge } from '../atoms/customer-status-badge';
import { Button } from '@/components/ui/button';
import { Eye, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';

interface CustomerRowData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  status: 'active' | 'inactive';
  totalSpent?: number;
  orders?: string[];
  createdAt: string;
}

interface CustomerTableRowProps {
  customer: CustomerRowData;
  onViewDetails: (customerId: string) => void;
  isSelected?: boolean;
  onSelect?: (customerId: string, selected: boolean) => void;
}

export const CustomerTableRow: React.FC<CustomerTableRowProps> = ({ 
  customer, 
  onViewDetails,
  isSelected = false,
  onSelect
}) => {
  const handleViewDetails = () => {
    onViewDetails(customer._id);
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(customer._id, event.target.checked);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {onSelect && (
        <CustomerTableCell>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </CustomerTableCell>
      )}

      <CustomerTableCell>
        <div className="flex items-center space-x-3">
          <CustomerAvatar
            src={customer.profileImage}
            alt={customer.name}
            name={customer.name}
            size="md"
          />
          <div>
            <p className="font-medium text-gray-900">{customer.name}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Mail className="h-3 w-3 text-gray-400" />
              <p className="text-xs text-gray-500">{customer.email}</p>
            </div>
          </div>
        </div>
      </CustomerTableCell>

      <CustomerTableCell>
        <CustomerStatusBadge status={customer.status} />
      </CustomerTableCell>

      <CustomerTableCell>
        {customer.phone ? (
          <div className="flex items-center space-x-1">
            <Phone className="h-3 w-3 text-gray-400" />
            <span className="text-sm">{customer.phone}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">No phone</span>
        )}
      </CustomerTableCell>

      <CustomerTableCell align="right">
        {customer.orders?.length || 0} orders
      </CustomerTableCell>

      <CustomerTableCell align="right">
        {customer.totalSpent ? (
          <span className="font-medium">
            ${customer.totalSpent.toLocaleString()}
          </span>
        ) : (
          <span className="text-gray-400">$0</span>
        )}
      </CustomerTableCell>

      <CustomerTableCell>
        <span className="text-sm text-gray-500">
          {format(new Date(customer.createdAt), 'MMM d, yyyy')}
        </span>
      </CustomerTableCell>

      <CustomerTableCell align="right">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetails}
          className="flex items-center space-x-1"
        >
          <Eye className="h-3 w-3" />
          <span>View</span>
        </Button>
      </CustomerTableCell>
    </tr>
  );
};