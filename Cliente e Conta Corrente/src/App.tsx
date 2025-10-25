import { useState } from 'react';
import { Cliente, Transacao } from './types';
import { mockClientes, mockTransacoes } from './lib/mock-data';
import { ClienteList } from './components/ClienteList';
import { ContaCorrente } from './components/ContaCorrente';
import { RelatorioIndividual } from './components/RelatorioIndividual';
import { Dashboard } from './components/Dashboard';
import { Button } from './components/ui/button';
import { LayoutDashboard, Users, FileText, Receipt } from 'lucide-react';

type View = 'dashboard' | 'clientes' | 'conta-corrente' | 'relatorios';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [transacoes, setTransacoes] = useState<Transacao[]>(mockTransacoes);

  const handleAddCliente = (clienteData: Omit<Cliente, 'id' | 'dataCadastro'>) => {
    const novoCliente: Cliente = {
      ...clienteData,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString().split('T')[0]
    };
    setClientes([...clientes, novoCliente]);
  };

  const handleEditCliente = (clienteEditado: Cliente) => {
    setClientes(clientes.map(c => c.id === clienteEditado.id ? clienteEditado : c));
  };

  const handleDeleteCliente = (id: string) => {
    setClientes(clientes.filter(c => c.id !== id));
    setTransacoes(transacoes.filter(t => t.clienteId !== id));
  };

  const handleAddTransacao = (transacaoData: Omit<Transacao, 'id'>) => {
    const novaTransacao: Transacao = {
      ...transacaoData,
      id: `t${Date.now()}`
    };
    setTransacoes([...transacoes, novaTransacao]);
  };

  const navigationItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'conta-corrente' as View, label: 'Conta Corrente', icon: Receipt },
    { id: 'clientes' as View, label: 'Clientes', icon: Users },
    { id: 'relatorios' as View, label: 'Relatórios', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Sistema de Gestão de Cacau</h1>
              <p className="text-sm text-gray-600 mt-1">Controle de clientes e conta corrente</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-lg border p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setCurrentView(item.id)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>

            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mt-4">
              <h3 className="text-sm mb-2">Resumo Rápido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Clientes:</span>
                  <span>{clientes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transações:</span>
                  <span>{transacoes.length}</span>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {currentView === 'dashboard' && (
              <Dashboard clientes={clientes} transacoes={transacoes} />
            )}

            {currentView === 'conta-corrente' && (
              <ContaCorrente
                clientes={clientes}
                transacoes={transacoes}
                onAddTransacao={handleAddTransacao}
              />
            )}

            {currentView === 'clientes' && (
              <ClienteList
                clientes={clientes}
                onAdd={handleAddCliente}
                onEdit={handleEditCliente}
                onDelete={handleDeleteCliente}
              />
            )}

            {currentView === 'relatorios' && (
              <RelatorioIndividual clientes={clientes} transacoes={transacoes} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
