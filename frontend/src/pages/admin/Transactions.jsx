import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar } from 'lucide-react';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import GlassCard from '../../components/ui/GlassCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import useStore from '../../store/useStore';
import { format } from 'date-fns';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  const { user, shopSettings } = useStore();

  useEffect(() => {
    fetch('https://barber-management-backend.onrender.com/api/transactions', {
      headers: { Authorization: `Bearer ${user?.token}` }
    })
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error(err));
  }, [user]);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? format(new Date(t.timestamp), 'yyyy-MM-dd') === filterDate : true;
    return matchesSearch && matchesDate;
  });

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Customer,Service,Amount,Status,Reason\n"
      + filteredTransactions.map(t => 
          `${format(new Date(t.timestamp), 'yyyy-MM-dd HH:mm')},${t.customerName},${t.serviceName},${t.amountCharged},${t.status},${t.cancelReason || ''}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Transaction History</h2>
          <p className="text-muted">View all completed and cancelled services.</p>
        </div>
        <Button onClick={handleExport} variant="secondary" className="w-auto flex items-center gap-2">
          <Download size={18} /> Export CSV
        </Button>
      </div>

      <GlassCard className="p-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <Input 
            placeholder="Search customer or service..." 
            className="pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <Input 
            type="date" 
            className="pl-12"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Date & Time</Th>
              <Th>Customer</Th>
              <Th>Service</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredTransactions.map(t => (
              <Tr key={t._id}>
                <Td className="text-muted whitespace-nowrap">
                  {format(new Date(t.timestamp), 'MMM dd, yyyy HH:mm')}
                </Td>
                <Td className="font-bold text-white">{t.customerName}</Td>
                <Td className="text-white">{t.serviceName}</Td>
                <Td className="font-medium text-primary">
                  {shopSettings?.currency || '$'}{t.amountCharged}
                </Td>
                <Td>
                  {t.status === 'completed' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-success/20 text-success border border-success/20">
                      Completed
                    </span>
                  ) : (
                    <div className="flex flex-col items-start gap-1">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-danger/20 text-danger border border-danger/20">
                        Cancelled
                      </span>
                      <span className="text-[10px] text-muted">{t.cancelReason}</span>
                    </div>
                  )}
                </Td>
              </Tr>
            ))}
            {filteredTransactions.length === 0 && (
              <Tr>
                <Td colSpan="5" className="text-center py-8 text-muted">No transactions found.</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </GlassCard>
    </div>
  );
};

export default Transactions;
