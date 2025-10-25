import { useState, useMemo } from 'react';
import { Cliente, Transacao } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { TransacaoForm } from './TransacaoForm';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, getTipoTransacaoLabel, calcularSaldo } from '../lib/utils-cacau';

interface ContaCorrenteProps {
  clientes: Cliente[];
  transacoes: Transacao[];
  onAddTransacao: (transacao: Omit<Transacao, 'id'>) => void;
}

export function ContaCorrente({ clientes, transacoes, onAddTransacao }: ContaCorrenteProps) {
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [formOpen, setFormOpen] = useState(false);

  const selectedCliente = clientes.find(c => c.id === selectedClienteId);

  const filteredTransacoes = useMemo(() => {
    if (!selectedClienteId) return [];
    
    return transacoes
      .filter(t => t.clienteId === selectedClienteId)
      .filter(t => {
        if (selectedYear === 'all') return true;
        return new Date(t.data).getFullYear().toString() === selectedYear;
      })
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [selectedClienteId, transacoes, selectedYear]);

  const allClienteTransacoes = useMemo(() => {
    if (!selectedClienteId) return [];
    return transacoes
      .filter(t => t.clienteId === selectedClienteId)
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [selectedClienteId, transacoes]);

  const saldoInfo = useMemo(() => {
    return calcularSaldo(allClienteTransacoes);
  }, [allClienteTransacoes]);

  // Gerar lista de anos disponíveis
  const availableYears = useMemo(() => {
    const years = new Set(transacoes.map(t => new Date(t.data).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [transacoes]);

  // Calcular saldo acumulado para cada transação
  const transacoesComSaldo = useMemo(() => {
    let saldoAcumulado = 0;
    return filteredTransacoes.map(t => {
      saldoAcumulado += t.valorTotal;
      return { ...t, saldoAcumulado };
    }).reverse();
  }, [filteredTransacoes]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Conta Corrente do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Selecionar Cliente</label>
              <Select value={selectedClienteId} onValueChange={setSelectedClienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nomeCompleto} - {cliente.cpf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClienteId && (
              <div className="space-y-2">
                <label className="text-sm">Filtrar por Ano</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Anos</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {selectedCliente && (
            <>
              <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p>{selectedCliente.nomeCompleto}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CPF</p>
                    <p>{selectedCliente.cpf}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p>{selectedCliente.telefone}</p>
                  </div>
                </div>

                {saldoInfo && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {saldoInfo.tipo === 'C' ? (
                          <TrendingUp className="h-8 w-8 text-green-600" />
                        ) : (
                          <TrendingDown className="h-8 w-8 text-red-600" />
                        )}
                        <div>
                          <p className="text-sm text-gray-600">Saldo Atual</p>
                          <p className="text-3xl">
                            {formatCurrency(saldoInfo.saldo)} {saldoInfo.tipo}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {saldoInfo.tipo === 'C' 
                              ? 'A empresa deve ao cliente' 
                              : 'Cliente deve à empresa'}
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => setFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Transação
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-4">
                  Histórico de Transações
                  {selectedYear !== 'all' && ` - ${selectedYear}`}
                </h3>
                
                {transacoesComSaldo.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <p className="text-gray-500">Nenhuma transação encontrada</p>
                    <Button onClick={() => setFormOpen(true)} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Primeira Transação
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Quantidade (Kg)</TableHead>
                          <TableHead className="text-right">Preço/Kg</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-right">Saldo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transacoesComSaldo.map((transacao) => (
                          <TableRow key={transacao.id}>
                            <TableCell>
                              {new Date(transacao.data).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getTipoTransacaoLabel(transacao.tipo)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {transacao.quantidadeKg ? `${transacao.quantidadeKg} kg` : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {transacao.precoPorKg ? formatCurrency(transacao.precoPorKg) : '-'}
                            </TableCell>
                            <TableCell className={`text-right ${transacao.valorTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transacao.valorTotal >= 0 ? '+' : ''}
                              {formatCurrency(transacao.valorTotal)}
                            </TableCell>
                            <TableCell className={`text-right ${transacao.saldoAcumulado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(Math.abs(transacao.saldoAcumulado))} {transacao.saldoAcumulado >= 0 ? 'C' : 'D'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </>
          )}

          {!selectedCliente && (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <p className="text-gray-500">Selecione um cliente para visualizar a conta corrente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedClienteId && (
        <TransacaoForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={onAddTransacao}
          clienteId={selectedClienteId}
        />
      )}
    </div>
  );
}
