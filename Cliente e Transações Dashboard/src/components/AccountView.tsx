import { useState, useEffect } from 'react';
import { Client, Transaction } from '../App';
import { TransactionForm } from './TransactionForm';
import { Plus, TrendingUp, TrendingDown, DollarSign, Filter, X } from 'lucide-react';

interface AccountViewProps {
  client: Client;
}

export function AccountView({ client }: AccountViewProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadTransactions();
  }, [client.id]);

  const loadTransactions = () => {
    const stored = localStorage.getItem('transactions');
    if (stored) {
      const allTransactions = JSON.parse(stored);
      const clientTransactions = allTransactions.filter(
        (t: Transaction) => t.clientId === client.id
      );
      setTransactions(clientTransactions);
    }
  };

  const handleSaveTransaction = (transaction: Transaction) => {
    const stored = localStorage.getItem('transactions');
    const allTransactions = stored ? JSON.parse(stored) : [];
    const updatedTransactions = [...allTransactions, transaction];
    
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    loadTransactions();
    setShowForm(false);
  };

  const filterTransactionsByDate = (transactions: Transaction[]) => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && transactionDate < start) return false;
      if (end && transactionDate > end) return false;
      return true;
    });
  };

  const filteredTransactions = filterTransactionsByDate(transactions);

  const calculateBalance = () => {
    return filteredTransactions.reduce((acc, t) => {
      return t.type === 'credit' ? acc + t.amount : acc - t.amount;
    }, 0);
  };

  const totalCredit = filteredTransactions
    .filter(t => t.type === 'credit')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalDebit = filteredTransactions
    .filter(t => t.type === 'debit')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = calculateBalance();

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = startDate || endDate;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div>
      {/* Client Info */}
      <div className="bg-white p-4 mb-4" style={{ border: '3px solid black' }}>
        <h2 className="text-blue-900 mb-3 pb-2 border-b-2 border-black">Dados do Cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <p className="text-blue-600 mb-1">Nome</p>
            <p className="text-blue-900">{client.name}</p>
          </div>
          <div>
            <p className="text-blue-600 mb-1">CPF</p>
            <p className="text-blue-900">{client.cpf}</p>
          </div>
          <div>
            <p className="text-blue-600 mb-1">Email</p>
            <p className="text-blue-900">{client.email}</p>
          </div>
          <div>
            <p className="text-blue-600 mb-1">Telefone</p>
            <p className="text-blue-900">{client.phone}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4" style={{ border: '3px solid black' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-200 border-2 border-black">
              <TrendingUp className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-blue-700">Créditos</p>
          </div>
          <p className="text-blue-900">{formatCurrency(totalCredit)}</p>
        </div>

        <div className="bg-white p-4" style={{ border: '3px solid black' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-200 border-2 border-black">
              <TrendingDown className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-blue-700">Débitos</p>
          </div>
          <p className="text-blue-900">{formatCurrency(totalDebit)}</p>
        </div>

        <div className="bg-white p-4" style={{ border: '3px solid black' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 border-2 border-black ${balance >= 0 ? 'bg-blue-700' : 'bg-blue-500'}`}>
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-blue-700">Saldo</p>
          </div>
          <p className={balance >= 0 ? 'text-blue-900' : 'text-blue-700'}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-blue-900">Histórico de Transações</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white border-2 border-black"
        >
          <Plus className="w-4 h-4" />
          Nova Transação
        </button>
      </div>

      {showForm && (
        <TransactionForm
          clientId={client.id}
          onSave={handleSaveTransaction}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Date Filters */}
      <div className="bg-white p-3 mb-4" style={{ border: '3px solid black' }}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-blue-900">Filtrar por período:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-blue-700">De:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-white border-2 border-black"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-blue-700">Até:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-white border-2 border-black"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-blue-700 border-2 border-black hover:bg-blue-100"
            >
              <X className="w-4 h-4" />
              Limpar filtros
            </button>
          )}

          <div className="ml-auto text-blue-700">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transação' : 'transações'}
            {hasActiveFilters && ` de ${transactions.length}`}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white" style={{ border: '3px solid black' }}>
        <table className="w-full">
          <thead className="bg-blue-200 border-b-2 border-black">
            <tr>
              <th className="px-4 py-2 text-left text-blue-900 border-r border-black">Data</th>
              <th className="px-4 py-2 text-left text-blue-900 border-r border-black">Descrição</th>
              <th className="px-4 py-2 text-left text-blue-900 border-r border-black">Tipo</th>
              <th className="px-4 py-2 text-right text-blue-900">Valor</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-blue-700 bg-blue-50 border-t-2 border-black">
                  {transactions.length === 0 
                    ? 'Nenhuma transação registrada'
                    : 'Nenhuma transação encontrada no período selecionado'
                  }
                </td>
              </tr>
            ) : (
              filteredTransactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-blue-100 border-b border-black">
                    <td className="px-4 py-3 text-blue-700 border-r border-black">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-4 py-3 text-blue-900 border-r border-black">
                      {transaction.description}
                    </td>
                    <td className="px-4 py-3 border-r border-black">
                      <span
                        className={`inline-flex px-3 py-1 border-2 border-black ${
                          transaction.type === 'credit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-blue-200 text-blue-900'
                        }`}
                      >
                        {transaction.type === 'credit' ? 'Crédito' : 'Débito'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-blue-900">
                      {transaction.type === 'credit' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}