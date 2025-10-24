import { useState } from 'react';
import { Transaction } from '../App';
import { X } from 'lucide-react';

interface TransactionFormProps {
  clientId: string;
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
}

export function TransactionForm({ clientId, onSave, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'credit' as 'credit' | 'debit',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      clientId,
      date: formData.date,
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
    };
    
    onSave(transaction);
  };

  return (
    <div className="bg-white p-4 mb-4" style={{ border: '3px solid black' }}>
      <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-black">
        <h3 className="text-blue-900">Nova Transação</h3>
        <button
          onClick={onCancel}
          className="px-3 py-1 text-blue-700 border-2 border-black hover:bg-blue-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-blue-900 mb-1">
              Data *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 bg-white border-2 border-black"
            />
          </div>

          <div>
            <label className="block text-blue-900 mb-1">
              Tipo *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'credit' | 'debit' })}
              className="w-full px-3 py-2 bg-white border-2 border-black"
            >
              <option value="credit">Crédito</option>
              <option value="debit">Débito</option>
            </select>
          </div>

          <div>
            <label className="block text-blue-900 mb-1">
              Valor *
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 bg-white border-2 border-black"
              placeholder="0,00"
            />
          </div>
        </div>

        <div>
          <label className="block text-blue-900 mb-1">
            Descrição *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-white border-2 border-black"
            placeholder="Descreva a transação..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border-2 border-black text-blue-700 bg-white hover:bg-blue-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-700 text-white border-2 border-black"
          >
            Salvar Transação
          </button>
        </div>
      </form>
    </div>
  );
}