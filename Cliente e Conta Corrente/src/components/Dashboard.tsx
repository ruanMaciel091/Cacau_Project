import { useMemo } from 'react';
import { Cliente, Transacao } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Package, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { formatCurrency, calcularSaldo, calcularTotalCacau } from '../lib/utils-cacau';

interface DashboardProps {
  clientes: Cliente[];
  transacoes: Transacao[];
}

export function Dashboard({ clientes, transacoes }: DashboardProps) {
  const dashboardData = useMemo(() => {
    // Total de cacau em estoque (todas as entradas)
    const totalCacauEstoque = calcularTotalCacau(transacoes);

    // Calcular saldos por cliente
    const saldosPorCliente = clientes.map(cliente => {
      const clienteTransacoes = transacoes.filter(t => t.clienteId === cliente.id);
      const saldo = calcularSaldo(clienteTransacoes);
      return {
        cliente,
        saldo: saldo ? saldo.saldo : 0,
        tipo: saldo ? saldo.tipo : 'C',
        totalCacau: calcularTotalCacau(clienteTransacoes)
      };
    });

    // Separar devedores e credores
    const devedores = saldosPorCliente.filter(s => s.tipo === 'D');
    const credores = saldosPorCliente.filter(s => s.tipo === 'C');

    // Somar saldos
    const totalSaldoDevedor = devedores.reduce((acc, s) => acc + s.saldo, 0);
    const totalSaldoCredor = credores.reduce((acc, s) => acc + s.saldo, 0);

    // Top 5 fornecedores (por quantidade de cacau)
    const topFornecedores = [...saldosPorCliente]
      .sort((a, b) => b.totalCacau - a.totalCacau)
      .slice(0, 5);

    return {
      totalCacauEstoque,
      totalSaldoDevedor,
      totalSaldoCredor,
      totalClientes: clientes.length,
      devedores,
      credores,
      topFornecedores,
      saldoLiquido: totalSaldoCredor - totalSaldoDevedor
    };
  }, [clientes, transacoes]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Dashboard Gerencial</h2>
        <p className="text-gray-600">Visão geral de todos os clientes e transações</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{dashboardData.totalClientes}</div>
            <p className="text-sm text-gray-500 mt-1">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Cacau em Estoque</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{dashboardData.totalCacauEstoque.toFixed(0)} kg</div>
            <p className="text-sm text-gray-500 mt-1">Total fornecido pelos clientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Saldos Devedores</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-red-600">{formatCurrency(dashboardData.totalSaldoDevedor)}</div>
            <p className="text-sm text-gray-500 mt-1">{dashboardData.devedores.length} clientes devendo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Saldos Credores</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-600">{formatCurrency(dashboardData.totalSaldoCredor)}</div>
            <p className="text-sm text-gray-500 mt-1">{dashboardData.credores.length} clientes a receber</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Valores a Pagar (Credores)</span>
                  <span className="text-green-600">{formatCurrency(dashboardData.totalSaldoCredor)}</span>
                </div>
                <Progress 
                  value={dashboardData.totalSaldoCredor > 0 ? 100 : 0} 
                  className="h-2 bg-gray-200"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Valores a Receber (Devedores)</span>
                  <span className="text-red-600">{formatCurrency(dashboardData.totalSaldoDevedor)}</span>
                </div>
                <Progress 
                  value={dashboardData.totalSaldoDevedor > 0 ? 100 : 0} 
                  className="h-2 bg-gray-200"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span>Saldo Líquido:</span>
                  <span className={`text-2xl ${dashboardData.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(dashboardData.saldoLiquido))} {dashboardData.saldoLiquido >= 0 ? 'C' : 'D'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {dashboardData.saldoLiquido >= 0 
                    ? 'Empresa deve aos clientes (no total)' 
                    : 'Clientes devem à empresa (no total)'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Fornecedores de Cacau</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.topFornecedores.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma entrada de cacau registrada
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.topFornecedores.map((item, index) => (
                  <div key={item.cliente.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{item.cliente.nomeCompleto}</p>
                      <p className="text-sm text-gray-500">{item.totalCacau.toFixed(0)} kg fornecidos</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Clientes Devedores</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.devedores.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum cliente devedor
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.devedores
                      .sort((a, b) => b.saldo - a.saldo)
                      .map(item => (
                        <TableRow key={item.cliente.id}>
                          <TableCell>{item.cliente.nomeCompleto}</TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatCurrency(item.saldo)} D
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes Credores</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.credores.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum cliente credor
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.credores
                      .sort((a, b) => b.saldo - a.saldo)
                      .map(item => (
                        <TableRow key={item.cliente.id}>
                          <TableCell>{item.cliente.nomeCompleto}</TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatCurrency(item.saldo)} C
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
