import { useState, useEffect } from 'react';
import { ClientList } from './components/ClientList';
import { ClientForm } from './components/ClientForm';
import { AccountView } from './components/AccountView';
import { Users, FileText } from 'lucide-react';

export interface Client {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
}

export interface Transaction {
  id: string;
  clientId: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
}

export default function App() {
  const [view, setView] = useState<'clients' | 'account'>('clients');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setView('account');
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-blue-700 border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-white">Sistema de Conta Corrente</h1>
            <nav className="flex gap-2">
              <button
                onClick={() => setView('clients')}
                className={`flex items-center gap-2 px-4 py-2 border-2 border-black ${
                  view === 'clients'
                    ? 'bg-white text-blue-900'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                Clientes
              </button>
              <button
                onClick={() => setView('account')}
                disabled={!selectedClient}
                className={`flex items-center gap-2 px-4 py-2 border-2 border-black ${
                  view === 'account'
                    ? 'bg-white text-blue-900'
                    : 'bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                <FileText className="w-4 h-4" />
                Conta Corrente
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {view === 'clients' && (
          <ClientList onSelectClient={handleSelectClient} />
        )}
        {view === 'account' && selectedClient && (
          <AccountView client={selectedClient} />
        )}
      </main>
    </div>
  );
}