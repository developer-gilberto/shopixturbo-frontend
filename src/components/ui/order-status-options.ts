export const ORDER_STATUSES: { value: string; label: string }[] = [
  { value: 'UNPAID', label: 'Não pago' },
  { value: 'READY_TO_SHIP', label: 'Pronto para envio' },
  { value: 'PROCESSED', label: 'Processado' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'IN_CANCEL', label: 'Em cancelamento' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'INVOICE_PENDING', label: 'Fatura pendente' },
];

export const DEFAULT_ORDER_STATUS = 'READY_TO_SHIP';
