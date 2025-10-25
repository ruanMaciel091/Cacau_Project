import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { formatCPF, formatTelefone } from '../lib/utils-cacau';

interface ClienteFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (cliente: Omit<Cliente, 'id' | 'dataCadastro'> & { id?: string }) => void;
  cliente?: Cliente;
}

export function ClienteForm({ open, onClose, onSave, cliente }: ClienteFormProps) {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpf: '',
    telefone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cliente) {
      setFormData({
        nomeCompleto: cliente.nomeCompleto,
        cpf: cliente.cpf,
        telefone: cliente.telefone
      });
    } else {
      setFormData({
        nomeCompleto: '',
        cpf: '',
        telefone: ''
      });
    }
    setErrors({});
  }, [cliente, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = 'Nome completo é obrigatório';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (formData.telefone.replace(/\D/g, '').length < 10) {
      newErrors.telefone = 'Telefone inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    onSave({
      ...(cliente && { id: cliente.id }),
      nomeCompleto: formData.nomeCompleto,
      cpf: formatCPF(formData.cpf),
      telefone: formatTelefone(formData.telefone)
    });

    onClose();
  };

  const handleCPFChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      setFormData(prev => ({ ...prev, cpf: formatCPF(numbers) }));
    }
  };

  const handleTelefoneChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      setFormData(prev => ({ ...prev, telefone: formatTelefone(numbers) }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {cliente ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {cliente ? 'Atualize as informações do cliente' : 'Preencha os campos para cadastrar um novo cliente'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCompleto">Nome Completo *</Label>
              <Input
                id="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={(e) => setFormData(prev => ({ ...prev, nomeCompleto: e.target.value }))}
                placeholder="Digite o nome completo"
              />
              {errors.nomeCompleto && (
                <p className="text-sm text-red-500">{errors.nomeCompleto}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleCPFChange(e.target.value)}
                placeholder="000.000.000-00"
              />
              {errors.cpf && (
                <p className="text-sm text-red-500">{errors.cpf}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleTelefoneChange(e.target.value)}
                placeholder="(00) 00000-0000"
              />
              {errors.telefone && (
                <p className="text-sm text-red-500">{errors.telefone}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {cliente ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}