import { useState, useEffect } from 'react';
import { Client } from '../App';
import { ClientForm } from './ClientForm';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';

interface ClientListProps {
  onSelectClient: (client: Client) => void;
}

export function ClientList({ onSelectClient }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    const stored = localStorage.getItem('clients');
    if (stored) {
      setClients(JSON.parse(stored));
    }
  };

  const handleSave = (client: Client) => {
    let updatedClients;
    if (editingClient) {
      updatedClients = clients.map(c => c.id === client.id ? client : c);
    } else {
      updatedClients = [...clients, client];
    }
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    setShowForm(false);
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      const updatedClients = clients.filter(c => c.id !== id);
      setClients(updatedClients);
      localStorage.setItem('clients', JSON.stringify(updatedClients));
      
      // Também remove as transações do cliente
      const stored = localStorage.getItem('transactions');
      if (stored) {
        const transactions = JSON.parse(stored);
        const updatedTransactions = transactions.filter((t: any) => t.clientId !== id);
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      }
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-blue-900">Gestão de Clientes</h2>
        <button
          onClick={() => {
            setEditingClient(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white border-2 border-black"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {showForm && (
        <ClientForm
          client={editingClient}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
        />
      )}

      {!showForm && (
        <>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border-2 border-black"
              />
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-white border-3 border-black" style={{ border: '3px solid black' }}>
            <table className="w-full">
              <thead className="bg-blue-200 border-b-2 border-black">
                <tr>
                  <th className="px-4 py-2 text-left text-blue-900 border-r border-black">Nome</th>
                  <th className="px-4 py-2 text-left text-blue-900 border-r border-black">CPF</th>
                  <th className="px-4 py-2 text-left text-blue-900 border-r border-black">Email</th>
                  <th className="px-4 py-2 text-left text-blue-900 border-r border-black">Telefone</th>
                  <th className="px-4 py-2 text-right text-blue-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-blue-700 bg-blue-50 border-t-2 border-black">
                      {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr 
                      key={client.id}
                      className="hover:bg-blue-100 border-b border-black"
                    >
                      <td 
                        className="px-4 py-3 text-blue-900 cursor-pointer border-r border-black"
                        onClick={() => onSelectClient(client)}
                      >
                        {client.name}
                      </td>
                      <td 
                        className="px-4 py-3 text-blue-700 cursor-pointer border-r border-black"
                        onClick={() => onSelectClient(client)}
                      >
                        {client.cpf}
                      </td>
                      <td 
                        className="px-4 py-3 text-blue-700 cursor-pointer border-r border-black"
                        onClick={() => onSelectClient(client)}
                      >
                        {client.email}
                      </td>
                      <td 
                        className="px-4 py-3 text-blue-700 cursor-pointer border-r border-black"
                        onClick={() => onSelectClient(client)}
                      >
                        {client.phone}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(client)}
                            className="p-2 text-blue-700 border-2 border-black hover:bg-blue-100"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
                            className="p-2 text-blue-700 border-2 border-black hover:bg-blue-100"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}