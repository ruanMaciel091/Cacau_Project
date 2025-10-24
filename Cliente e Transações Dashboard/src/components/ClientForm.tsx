import { useState, useEffect } from 'react';
import { Client } from '../App';
import { X } from 'lucide-react';

interface ClientFormProps {
  client: Client | null;
  onSave: (client: Client) => void;
  onCancel: () => void;
}

export function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        cpf: client.cpf,
        email: client.email,
        phone: client.phone,
      });
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const clientData: Client = {
      id: client?.id || Date.now().toString(),
      ...formData,
    };
    
    onSave(clientData);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  return (
    <div className="bg-white p-4 mb-4" style={{ border: '3px solid black' }}>
      <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-black">
        <h3 className="text-blue-900">
          {client ? 'Editar Cliente' : 'Novo Cliente'}
        </h3>
        <button
          onClick={onCancel}
          className="px-3 py-1 text-blue-700 border-2 border-black hover:bg-blue-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-blue-900 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border-2 border-black"
              placeholder="Digite o nome completo"
            />
          </div>

          <div>
            <label className="block text-blue-900 mb-1">
              CPF *
            </label>
            <input
              type="text"
              required
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
              className="w-full px-3 py-2 bg-white border-2 border-black"
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>

          <div>
            <label className="block text-blue-900 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-white border-2 border-black"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-blue-900 mb-1">
              Telefone *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
              className="w-full px-3 py-2 bg-white border-2 border-black"
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </div>
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
            {client ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}