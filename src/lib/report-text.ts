interface ReportTextInput {
  shopName: string;
  marketplace: string;
  userName: string;
  intervalDays: number;
  totalOrders: number;
  totalRevenue: number;
  totalItemsCost: number;
  totalGovernmentTaxes: number;
  totalShopeeCommission: number;
  totalShipping: number;
  totalCost: number;
  totalNetProfit: number;
  topSelling: { name: string } | null;
  topProfitable: { name: string } | null;
  sellingRanking: Array<{
    itemId: number;
    name: string;
    sku?: string | null;
    quantity: number;
    revenue: number;
  }>;
  profitableRanking: Array<{
    itemId: number;
    name: string;
    sku?: string | null;
    quantity: number;
    net_profit: number;
    revenue: number;
  }>;
}

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatBRL(value: number): string {
  return BRL.format(value);
}

function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR');
}

function formatPercent(share: number): string {
  if (share <= 0) return '0,0%';
  return `${Math.min(share, 100).toFixed(1).replace('.', ',')}%`;
}

function percentOf(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}

function unitPrice(total: number, quantity: number): number {
  return quantity > 0 ? total / quantity : 0;
}

export function generateReportText(input: ReportTextInput): string {
  const {
    shopName,
    marketplace,
    userName,
    intervalDays,
    totalOrders,
    totalRevenue,
    totalItemsCost,
    totalGovernmentTaxes,
    totalShopeeCommission,
    totalShipping,
    totalCost,
    totalNetProfit,
    topSelling,
    topProfitable,
    sellingRanking,
    profitableRanking,
  } = input;

  const now = new Date();
  const dateTime = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;

  const lines: string[] = [];

  lines.push(`RELATÓRIO DOS ÚLTIMOS ${intervalDays} DIAS`);
  lines.push(`Loja: ${shopName}`);
  lines.push(`Marketplace: ${marketplace}`);
  lines.push(`Emitido por: ${userName}`);
  lines.push(`Data e horário: ${dateTime}`);

  lines.push('');
  lines.push('FATURAMENTO');
  lines.push(
    `Nos últimos ${intervalDays} dias a loja ${shopName} realizou ${formatNumber(totalOrders)} vendas, faturando dentro desse período um total bruto de ${formatBRL(totalRevenue)}. Dessas ${formatNumber(totalOrders)} vendas, a loja teve um custo de ${formatBRL(totalItemsCost)} com o valor pago pelos produtos vendidos, mais ${formatBRL(totalGovernmentTaxes)} pagos de impostos, além da tarifa paga para o marketplace no valor de ${formatBRL(totalShopeeCommission)} e gastos com frete no valor de ${formatBRL(totalShipping)}. Concluímos então que a loja ${shopName} no período de ${intervalDays} dias realizou ${formatNumber(totalOrders)} vendas, faturou ${formatBRL(totalRevenue)}, teve um total de custos de ${formatBRL(totalCost)} e obteve um lucro líquido no valor de ${formatBRL(totalNetProfit)}.`,
  );

  lines.push('');
  lines.push('RESUMO DO FATURAMENTO');
  lines.push(`Total de vendas: ${formatNumber(totalOrders)}`);
  lines.push(
    `Total custo de produtos: ${formatBRL(totalItemsCost)} (${formatPercent(percentOf(totalItemsCost, totalRevenue))})`,
  );
  lines.push(
    `Total de impostos: ${formatBRL(totalGovernmentTaxes)} (${formatPercent(percentOf(totalGovernmentTaxes, totalRevenue))})`,
  );
  lines.push(
    `Total tarifa marketplace: ${formatBRL(totalShopeeCommission)} (${formatPercent(percentOf(totalShopeeCommission, totalRevenue))})`,
  );
  lines.push(
    `Total de frete: ${formatBRL(totalShipping)} (${formatPercent(percentOf(totalShipping, totalRevenue))})`,
  );
  lines.push(`Faturamento: ${formatBRL(totalRevenue)}`);
  lines.push(
    `Total de custos: ${formatBRL(totalCost)} (${formatPercent(percentOf(totalCost, totalRevenue))})`,
  );
  lines.push(
    `Lucro líquido: ${formatBRL(totalNetProfit)} (${formatPercent(percentOf(totalNetProfit, totalRevenue))})`,
  );

  lines.push('');
  lines.push('RANKING DE PRODUTOS');
  lines.push(
    `DESTAQUES: ${topSelling?.name ?? '-'} é o produto com o maior número de vendas e ${topProfitable?.name ?? '-'} é o produto com a maior margem de lucro da loja.`,
  );

  lines.push('');
  lines.push('PRODUTOS MAIS VENDIDOS');
  if (sellingRanking.length === 0) {
    lines.push('Sem dados de vendas ainda.');
  } else {
    lines.push(
      ...sellingRanking.map(
        (product, index) =>
          `${String(index + 1).padStart(2, '0')}. ${product.name} (ID: ${product.itemId}${product.sku ? `; SKU: ${product.sku}` : ''}) - ${formatNumber(product.quantity)} unid - preço unid. ${formatBRL(unitPrice(product.revenue, product.quantity))}`,
      ),
    );
  }

  lines.push('');
  lines.push('PRODUTOS MAIS LUCRATIVOS');
  if (profitableRanking.length === 0) {
    lines.push('Sem dados de vendas ainda.');
  } else {
    lines.push(
      ...profitableRanking.map(
        (product, index) =>
          `${String(index + 1).padStart(2, '0')}. ${product.name} (ID: ${product.itemId}${product.sku ? `; SKU: ${product.sku}` : ''}) - Lucro unid. ${formatBRL(unitPrice(product.net_profit, product.quantity))} (${formatPercent(percentOf(product.net_profit, product.revenue))})`,
      ),
    );
  }

  lines.push('');
  lines.push('Powered by ShopixTurbo');

  return lines.join('\n');
}
