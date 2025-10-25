import { useState, useMemo } from 'react';
import { Cliente, Transacao } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FileText, Download } from 'lucide-react';
import { formatCurrency, getTipoTransacaoLabel, calcularTotalCacau, calcularPrecoMedio } from '../lib/utils-cacau';

interface RelatorioIndividualProps {
  clientes: Cliente[];
  transacoes: Transacao[];
}

export function RelatorioIndividual({ clientes, transacoes }: RelatorioIndividualProps) {
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [showReport, setShowReport] = useState(false);

  const selectedCliente = clientes.find(c => c.id === selectedClienteId);

  const filteredTransacoes = useMemo(() => {
    if (!selectedClienteId) return [];
    
    let filtered = transacoes.filter(t => t.clienteId === selectedClienteId);
    
    if (dataInicio) {
      filtered = filtered.filter(t => new Date(t.data) >= new Date(dataInicio));
    }
    
    if (dataFim) {
      filtered = filtered.filter(t => new Date(t.data) <= new Date(dataFim));
    }
    
    return filtered.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [selectedClienteId, transacoes, dataInicio, dataFim]);

  const reportData = useMemo(() => {
    const totalCacau = calcularTotalCacau(filteredTransacoes);
    const precoMedio = calcularPrecoMedio(filteredTransacoes);
    
    let saldoInicial = 0;
    let saldoFinal = 0;

    // Calcular saldo inicial (antes do período)
    if (dataInicio) {
      const transacoesAntes = transacoes
        .filter(t => t.clienteId === selectedClienteId)
        .filter(t => new Date(t.data) < new Date(dataInicio));
      
      saldoInicial = transacoesAntes.reduce((acc, t) => acc + t.valorTotal, 0);
    }

    // Calcular saldo final
    saldoFinal = saldoInicial + filteredTransacoes.reduce((acc, t) => acc + t.valorTotal, 0);

    return {
      totalCacau,
      precoMedio,
      saldoInicial,
      saldoFinal,
      totalTransacoes: filteredTransacoes.length
    };
  }, [filteredTransacoes, selectedClienteId, transacoes, dataInicio]);

  const handleGerarRelatorio = () => {
    if (!selectedClienteId) {
      alert('Selecione um cliente');
      return;
    }
    setShowReport(true);
  };

  const handleExportar = () => {
    if (!selectedCliente) return;

    const reportText = `
RELATÓRIO INDIVIDUAL DE CLIENTE
================================

Cliente: ${selectedCliente.nomeCompleto}
CPF: ${selectedCliente.cpf}
Telefone: ${selectedCliente.telefone}

Período: ${dataInicio ? new Date(dataInicio).toLocaleDateString('pt-BR') : 'Início'} até ${dataFim ? new Date(dataFim).toLocaleDateString('pt-BR') : 'Hoje'}

RESUMO
------
Total de Cacau Fornecido: ${reportData.totalCacau.toFixed(2)} kg
Preço Médio Pago: ${formatCurrency(reportData.precoMedio)}/kg
Total de Transações: ${reportData.totalTransacoes}

Saldo Inicial: ${formatCurrency(Math.abs(reportData.saldoInicial))} ${reportData.saldoInicial >= 0 ? 'C' : 'D'}
Saldo Final: ${formatCurrency(Math.abs(reportData.saldoFinal))} ${reportData.saldoFinal >= 0 ? 'C' : 'D'}

EXTRATO DE TRANSAÇÕES
---------------------
${filteredTransacoes.map(t => 
  `${new Date(t.data).toLocaleDateString('pt-BR')} | ${getTipoTransacaoLabel(t.tipo)} | ${t.quantidadeKg ? t.quantidadeKg + ' kg' : '-'} | ${formatCurrency(t.valorTotal)}`
).join('\n')}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${selectedCliente.nomeCompleto.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Relatório Individual por Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={selectedClienteId} onValueChange={setSelectedClienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nomeCompleto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGerarRelatorio} disabled={!selectedClienteId}>
              <FileText className="mr-2 h-4 w-4" />
              Gerar Relatório
            </Button>
            {showReport && (
              <Button onClick={handleExportar} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            )}
          </div>

          {showReport && selectedCliente && (
            <div className="space-y-6 border-t pt-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="mb-4">Dados do Cliente</h3>
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
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total de Cacau</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl">{reportData.totalCacau.toFixed(2)} kg</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Preço Médio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl">{formatCurrency(reportData.precoMedio)}/kg</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Saldo Inicial</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl ${reportData.saldoInicial >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(reportData.saldoInicial))} {reportData.saldoInicial >= 0 ? 'C' : 'D'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Saldo Final</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl ${reportData.saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(reportData.saldoFinal))} {reportData.saldoFinal >= 0 ? 'C' : 'D'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="mb-4">Extrato Completo de Transações</h3>
                {filteredTransacoes.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <p className="text-gray-500">Nenhuma transação no período selecionado</p>
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
                          <TableHead className="text-right">Valor Total</TableHead>
                          <TableHead>Observação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransacoes.map((transacao) => (
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
                            <TableCell className="text-sm text-gray-500">
                              {transacao.observacao || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}

          {!showReport && (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Selecione um cliente e clique em "Gerar Relatório"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
