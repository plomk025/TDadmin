// Badge de estado
import React from 'react';
import { cn } from '@/utils/helpers';

interface StatusBadgeProps {
  status: string;
  variant?: 'boleto' | 'encomienda';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'boleto' }) => {
  const getBoletoStyles = (status: string) => {
    const styles: Record<string, string> = {
      reservado: 'bg-warning/10 text-warning border border-warning/20',
      pagado: 'bg-success/10 text-success border border-success/20',
      cancelado: 'bg-destructive/10 text-destructive border border-destructive/20',
      usado: 'bg-muted text-muted-foreground border border-border'
    };
    return styles[status] || 'bg-muted text-muted-foreground';
  };

  const getEncomiendaStyles = (status: string) => {
    const styles: Record<string, string> = {
      recibido: 'bg-primary/10 text-primary border border-primary/20',
      en_transito: 'bg-warning/10 text-warning border border-warning/20',
      entregado: 'bg-success/10 text-success border border-success/20',
      devuelto: 'bg-destructive/10 text-destructive border border-destructive/20'
    };
    return styles[status] || 'bg-muted text-muted-foreground';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      variant === 'boleto' ? getBoletoStyles(status) : getEncomiendaStyles(status)
    )}>
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
