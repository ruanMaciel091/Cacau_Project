import { Cliente, Transacao } from '../types';

export const mockClientes: Cliente[] = [
  {
    id: '1',
    nomeCompleto: 'João da Silva Santos',
    cpf: '123.456.789-00',
    telefone: '(75) 98765-4321',
    dataCadastro: '2024-01-15'
  },
  {
    id: '2',
    nomeCompleto: 'Maria Oliveira Costa',
    cpf: '987.654.321-00',
    telefone: '(75) 99876-5432',
    dataCadastro: '2024-02-20'
  },
  {
    id: '3',
    nomeCompleto: 'Pedro Almeida Rocha',
    cpf: '456.789.123-00',
    telefone: '(75) 98888-7777',
    dataCadastro: '2024-03-10'
  }
];

export const mockTransacoes: Transacao[] = [
  {
    id: 't1',
    clienteId: '1',
    data: '2025-01-10',
    tipo: 'entrada_cacau',
    quantidadeKg: 150,
    precoPorKg: 12.50,
    valorTotal: 1875.00
  },
  {
    id: 't2',
    clienteId: '1',
    data: '2025-02-15',
    tipo: 'adiantamento',
    valorTotal: -500.00,
    observacao: 'Adiantamento solicitado pelo cliente'
  },
  {
    id: 't3',
    clienteId: '1',
    data: '2025-03-20',
    tipo: 'entrada_cacau',
    quantidadeKg: 200,
    precoPorKg: 13.00,
    valorTotal: 2600.00
  },
  {
    id: 't4',
    clienteId: '1',
    data: '2025-04-05',
    tipo: 'pagamento',
    valorTotal: -1000.00,
    observacao: 'Pagamento parcial'
  },
  {
    id: 't5',
    clienteId: '2',
    data: '2025-01-20',
    tipo: 'entrada_cacau',
    quantidadeKg: 180,
    precoPorKg: 12.80,
    valorTotal: 2304.00
  },
  {
    id: 't6',
    clienteId: '2',
    data: '2025-03-15',
    tipo: 'entrada_cacau',
    quantidadeKg: 220,
    precoPorKg: 13.20,
    valorTotal: 2904.00
  },
  {
    id: 't7',
    clienteId: '3',
    data: '2025-02-10',
    tipo: 'entrada_cacau',
    quantidadeKg: 100,
    precoPorKg: 12.00,
    valorTotal: 1200.00
  },
  {
    id: 't8',
    clienteId: '3',
    data: '2025-03-25',
    tipo: 'adiantamento',
    valorTotal: -800.00
  }
];
