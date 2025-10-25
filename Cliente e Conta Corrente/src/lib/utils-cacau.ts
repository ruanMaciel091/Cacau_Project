import { Transacao, SaldoCliente } from '../types';

export const formatCPF = (cpf: string): string => {
  const numbers = cpf.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatTelefone = (telefone: string): string => {
  const numbers = telefone.replace(/\D/g, '');
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const calcularSaldo = (transacoes: Transacao[]): SaldoCliente | null => {
  if (transacoes.length === 0) return null;
  
  const total = transacoes.reduce((acc, t) => acc + t.valorTotal, 0);
  
  return {
    clienteId: transacoes[0].clienteId,
    saldo: Math.abs(total),
    tipo: total >= 0 ? 'C' : 'D' // C = empresa deve ao cliente, D = cliente deve à empresa
  };
};

export const getTipoTransacaoLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    'entrada_cacau': 'Entrada de Cacau',
    'venda_produto': 'Venda de Produto',
    'adiantamento': 'Adiantamento/Empréstimo',
    'pagamento': 'Pagamento de Saldo'
  };
  return labels[tipo] || tipo;
};

export const calcularTotalCacau = (transacoes: Transacao[]): number => {
  return transacoes
    .filter(t => t.tipo === 'entrada_cacau' && t.quantidadeKg)
    .reduce((acc, t) => acc + (t.quantidadeKg || 0), 0);
};

export const calcularPrecoMedio = (transacoes: Transacao[]): number => {
  const entradasCacau = transacoes.filter(t => t.tipo === 'entrada_cacau' && t.precoPorKg);
  
  if (entradasCacau.length === 0) return 0;
  
  const totalValor = entradasCacau.reduce((acc, t) => acc + (t.precoPorKg || 0), 0);
  return totalValor / entradasCacau.length;
};
