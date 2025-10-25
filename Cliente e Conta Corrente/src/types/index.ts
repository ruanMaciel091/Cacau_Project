export interface Cliente {
  id: string;
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  dataCadastro: string;
}

export type TipoTransacao = 
  | 'entrada_cacau' 
  | 'venda_produto' 
  | 'adiantamento' 
  | 'pagamento';

export interface Transacao {
  id: string;
  clienteId: string;
  data: string;
  tipo: TipoTransacao;
  quantidadeKg?: number;
  precoPorKg?: number;
  valorTotal: number;
  observacao?: string;
}

export interface SaldoCliente {
  clienteId: string;
  saldo: number;
  tipo: 'D' | 'C'; // D = Devedor (cliente deve), C = Credor (empresa deve)
}
