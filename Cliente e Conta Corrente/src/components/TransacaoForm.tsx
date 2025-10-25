import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { getTipoTransacaoLabel } from '../lib/utils-cacau';

interface TransacaoFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (transacao: Omit<Transacao, 'id'>) => void;
  clienteId: string;
}

export function TransacaoForm({ open, onClose, onSave, clienteId }: TransacaoFormProps) {
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    tipo: 'entrada_cacau' as TipoTransacao,
    quantidadeKg: '',
    precoPorKg: '',
    valorTotal: '',
    observacao: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData({
        data: new Date().toISOString().split('T')[0],
        tipo: 'entrada_cacau' as TipoTransacao,
        quantidadeKg: '',
        precoPorKg: '',
        valorTotal: '',
        observacao: ''
      });
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    // Calcular valor total automaticamente para entrada de cacau
    if (formData.tipo === 'entrada_cacau' && formData.quantidadeKg && formData.precoPorKg) {
      const total = parseFloat(formData.quantidadeKg) * parseFloat(formData.precoPorKg);
      setFormData(prev => ({ ...prev, valorTotal: total.toFixed(2) }));
    }
  }, [formData.quantidadeKg, formData.precoPorKg, formData.tipo]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    }

    if (formData.tipo === 'entrada_cacau') {
      if (!formData.quantidadeKg || parseFloat(formData.quantidadeKg) <= 0) {
        newErrors.quantidadeKg = 'Quantidade deve ser maior que zero';
      }
      if (!formData.precoPorKg || parseFloat(formData.precoPorKg) <= 0) {
        newErrors.precoPorKg = 'Preço deve ser maior que zero';
      }
    }

    if (!formData.valorTotal || parseFloat(formData.valorTotal) === 0) {
      newErrors.valorTotal = 'Valor total é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    let valorFinal = parseFloat(formData.valorTotal);
    
    // Para adiantamentos e pagamentos, o valor é negativo
    if (formData.tipo === 'adiantamento' || formData.tipo === 'pagamento') {
      valorFinal = -Math.abs(valorFinal);
    }

    onSave({
      clienteId,
      data: formData.data,
      tipo: formData.tipo,
      quantidadeKg: formData.quantidadeKg ? parseFloat(formData.quantidadeKg) : undefined,
      precoPorKg: formData.precoPorKg ? parseFloat(formData.precoPorKg) : undefined,
      valorTotal: valorFinal,
      observacao: formData.observacao || undefined
    });

    onClose();
  };

  const tiposTransacao: TipoTransacao[] = ['entrada_cacau', 'venda_produto', 'adiantamento', 'pagamento'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Registre uma nova transação para o cliente.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data da Transação *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                />
                {errors.data && (
                  <p className="text-sm text-red-500">{errors.data}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Transação *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: TipoTransacao) => setFormData(prev => ({ ...prev, tipo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposTransacao.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>
                        {getTipoTransacaoLabel(tipo)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.tipo === 'entrada_cacau' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidadeKg">Quantidade (Kg) *</Label>
                  <Input
                    id="quantidadeKg"
                    type="number"
                    step="0.01"
                    value={formData.quantidadeKg}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantidadeKg: e.target.value }))}
                    placeholder="0.00"
                  />
                  {errors.quantidadeKg && (
                    <p className="text-sm text-red-500">{errors.quantidadeKg}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precoPorKg">Preço por Kg (R$) *</Label>
                  <Input
                    id="precoPorKg"
                    type="number"
                    step="0.01"
                    value={formData.precoPorKg}
                    onChange={(e) => setFormData(prev => ({ ...prev, precoPorKg: e.target.value }))}
                    placeholder="0.00"
                  />
                  {errors.precoPorKg && (
                    <p className="text-sm text-red-500">{errors.precoPorKg}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="valorTotal">Valor Total (R$) *</Label>
              <Input
                id="valorTotal"
                type="number"
                step="0.01"
                value={formData.valorTotal}
                onChange={(e) => setFormData(prev => ({ ...prev, valorTotal: e.target.value }))}
                placeholder="0.00"
                disabled={formData.tipo === 'entrada_cacau'}
              />
              {errors.valorTotal && (
                <p className="text-sm text-red-500">{errors.valorTotal}</p>
              )}
              {(formData.tipo === 'adiantamento' || formData.tipo === 'pagamento') && (
                <p className="text-sm text-gray-500">
                  Este valor será registrado como débito (saída de dinheiro)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacao">Observação</Label>
              <Textarea
                id="observacao"
                value={formData.observacao}
                onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                placeholder="Informações adicionais (opcional)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Registrar Transação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}