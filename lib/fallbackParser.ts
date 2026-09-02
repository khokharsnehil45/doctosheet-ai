import { DocumentType, ParsedDocumentResult, ColumnDefinition, TableRow } from './types';

export function parseOfflineDocument(
  text: string,
  documentType: DocumentType
): ParsedDocumentResult {
  const startTime = Date.now();
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let columns: ColumnDefinition[] = [];
  let rows: TableRow[] = [];
  let title = 'Structured Document Output';
  let summary = '';
  let totalAmount: number | null = null;

  switch (documentType) {
    case 'bank_statement': {
      title = 'Bank Statement Transactions';
      summary = 'Extracted banking debits, credits, merchants, and balance changes.';
      columns = [
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'debit', label: 'Debit ($)', type: 'currency' },
        { key: 'credit', label: 'Credit ($)', type: 'currency' },
        { key: 'balance', label: 'Balance ($)', type: 'currency' },
      ];

      let runningDebitSum = 0;
      let runningCreditSum = 0;

      for (const line of lines) {
        // Match dates: 01/02/2025, 2025-01-02, Jan 02, etc.
        const dateMatch = line.match(/^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})/i);
        
        if (dateMatch) {
          const date = dateMatch[1];
          let remainder = line.substring(dateMatch[0].length).trim();
          
          // Extract balance if present (e.g. Bal: $14,707.42 or Balance 18000)
          let balanceVal: string | number = '';
          const balMatch = remainder.match(/(?:Bal|Balance):?\s*\$?([\d,]+\.\d{2})/i);
          if (balMatch) {
            balanceVal = parseFloat(balMatch[1].replace(/,/g, ''));
            remainder = remainder.replace(balMatch[0], '').trim();
          }

          // Extract amounts like +$4,250.00, -$142.80, $14.75, 42.00
          let debit: number | null = null;
          let credit: number | null = null;

          const amountMatches = Array.from(remainder.matchAll(/([+-]?)\s*\$?([\d,]+\.\d{2})/g));
          if (amountMatches.length > 0) {
            const lastAmtMatch = amountMatches[amountMatches.length - 1];
            const sign = lastAmtMatch[1];
            const rawVal = parseFloat(lastAmtMatch[2].replace(/,/g, ''));

            if (sign === '-' || remainder.includes('-$') || remainder.toLowerCase().includes('withdrawal') || remainder.toLowerCase().includes('debit')) {
              debit = rawVal;
              runningDebitSum += rawVal;
            } else if (sign === '+' || remainder.includes('+$') || remainder.toLowerCase().includes('deposit') || remainder.toLowerCase().includes('credit') || remainder.toLowerCase().includes('payout')) {
              credit = rawVal;
              runningCreditSum += rawVal;
            } else {
              debit = rawVal;
              runningDebitSum += rawVal;
            }

            // Remove the amount from description
            remainder = remainder.replace(lastAmtMatch[0], '').trim();
          }

          // Guess category based on merchant
          let category = 'General Expense';
          const lowerDesc = remainder.toLowerCase();
          if (lowerDesc.includes('amzn') || lowerDesc.includes('office') || lowerDesc.includes('hardware')) category = 'Office Supplies';
          else if (lowerDesc.includes('stripe') || lowerDesc.includes('wire inward') || lowerDesc.includes('client') || lowerDesc.includes('deposit')) category = 'Revenue / Income';
          else if (lowerDesc.includes('starbucks') || lowerDesc.includes('coffee') || lowerDesc.includes('restaurant') || lowerDesc.includes('food')) category = 'Meals & Entertainment';
          else if (lowerDesc.includes('github') || lowerDesc.includes('google cloud') || lowerDesc.includes('jetbrains') || lowerDesc.includes('aws') || lowerDesc.includes('software')) category = 'Software & Subscriptions';
          else if (lowerDesc.includes('wework') || lowerDesc.includes('rent')) category = 'Rent & Facilities';
          else if (lowerDesc.includes('verizon') || lowerDesc.includes('telecom') || lowerDesc.includes('utility')) category = 'Utilities';
          else if (lowerDesc.includes('delta') || lowerDesc.includes('uber') || lowerDesc.includes('airline') || lowerDesc.includes('flight')) category = 'Travel & Transport';
          else if (lowerDesc.includes('insurance') || lowerDesc.includes('anthem') || lowerDesc.includes('health')) category = 'Insurance';

          rows.push({
            date,
            description: remainder.replace(/[-+]$/, '').trim() || 'Transaction',
            category,
            debit: debit !== null ? `$${debit.toFixed(2)}` : '-',
            credit: credit !== null ? `$${credit.toFixed(2)}` : '-',
            balance: balanceVal !== '' ? `$${typeof balanceVal === 'number' ? balanceVal.toFixed(2) : balanceVal}` : '-',
          });
        }
      }

      totalAmount = runningCreditSum - runningDebitSum;
      break;
    }

    case 'invoice': {
      title = 'Invoice Itemized Breakdown';
      summary = 'Extracted line items, quantities, hourly/unit rates, and line totals.';
      columns = [
        { key: 'item', label: 'Item / Service', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'quantity', label: 'Quantity', type: 'number' },
        { key: 'unitPrice', label: 'Unit Price ($)', type: 'currency' },
        { key: 'tax', label: 'Tax ($)', type: 'currency' },
        { key: 'total', label: 'Line Total ($)', type: 'currency' },
      ];

      let calculatedTotal = 0;

      for (const line of lines) {
        // Check for numbered or bulleted service lines
        const isItemLine = /^\d+[\.\)]|\b(?:Qty|Rate|Total|Hours|hrs|units?):/i.test(line) && /\$[\d,]+(?:\.\d{2})?/.test(line);

        if (isItemLine || (line.includes('|') && line.includes('$'))) {
          // Splitting by pipe or scanning components
          let itemName = 'Service Item';
          let itemDesc = '';
          let qty = '1';
          let unitPrice = '-';
          let tax = '$0.00';
          let lineTotal = '-';

          // Check for Qty
          const qtyMatch = line.match(/(?:Qty|Quantity):\s*([\d\.]+)\s*(?:hrs?|hours?|units?|items?)?/i);
          if (qtyMatch) qty = qtyMatch[1];

          // Check for Rate / Unit Price
          const rateMatch = line.match(/(?:Rate|Unit Price|Price):\s*\$?([\d,]+(?:\.\d{2})?)/i);
          if (rateMatch) unitPrice = `$${rateMatch[1]}`;

          // Check for Tax
          const taxMatch = line.match(/(?:Tax):\s*\$?([\d,]+(?:\.\d{2})?)/i);
          if (taxMatch) tax = `$${taxMatch[1]}`;

          // Check for Total
          const totalMatch = line.match(/(?:Total|Amount):\s*\$?([\d,]+(?:\.\d{2})?)/i);
          if (totalMatch) {
            const numTotal = parseFloat(totalMatch[1].replace(/,/g, ''));
            lineTotal = `$${totalMatch[1]}`;
            calculatedTotal += numTotal;
          }

          // Parse Name & Description from before pipe or dash
          const mainPart = line.split(/\|/)[0].replace(/^\d+[\.\)]\s*/, '').trim();
          if (mainPart.includes(' - ')) {
            const splitParts = mainPart.split(' - ');
            itemName = splitParts[0].trim();
            itemDesc = splitParts.slice(1).join(' - ').trim();
          } else {
            itemName = mainPart;
            itemDesc = line.split(/\|/)[1]?.trim() || '';
          }

          rows.push({
            item: itemName,
            description: itemDesc,
            quantity: qty,
            unitPrice,
            tax,
            total: lineTotal,
          });
        }
      }

      totalAmount = calculatedTotal > 0 ? calculatedTotal : null;
      break;
    }

    case 'lease_summary': {
      title = 'Lease Agreement Abstract';
      summary = 'Extracted legal obligations, financial terms, dates, and covenants.';
      columns = [
        { key: 'clause', label: 'Clause / Field', type: 'text' },
        { key: 'value', label: 'Value / Amount', type: 'text' },
        { key: 'details', label: 'Details & Obligations', type: 'text' },
        { key: 'section', label: 'Contract Section', type: 'text' },
      ];

      for (const line of lines) {
        // Match key-value patterns: "- Key: Value (Section X)" or "Key: Value"
        const cleanLine = line.replace(/^[-*•]\s*/, '').trim();
        const colonIndex = cleanLine.indexOf(':');

        if (colonIndex > 0 && !cleanLine.startsWith('http')) {
          const clauseName = cleanLine.substring(0, colonIndex).trim();
          let rightSide = cleanLine.substring(colonIndex + 1).trim();
          let section = 'General';

          // Extract section if in parentheses e.g. (Section 1.2) or (Exhibit B)
          const sectionMatch = rightSide.match(/\((Section\s*[\d\.]+|Exhibit\s*[A-Z]+|Clause\s*[\d\.]+)\)/i);
          if (sectionMatch) {
            section = sectionMatch[1];
            rightSide = rightSide.replace(sectionMatch[0], '').trim();
          }

          // Separate simple value from detailed notes
          let value = rightSide;
          let details = '';

          // Look for dollar amounts or dates as primary value
          const moneyOrDateMatch = rightSide.match(/^(\$[\d,]+(?:\.\d{2})?|\d{1,2}\s+[A-Za-z]+\s+\d{4}|[A-Za-z]+\s+\d{1,2},\s+\d{4}|\d+\s+Months?)/i);
          if (moneyOrDateMatch) {
            value = moneyOrDateMatch[1];
            details = rightSide.substring(moneyOrDateMatch[0].length).replace(/^[\s,;\-]+/, '').trim();
          }

          rows.push({
            clause: clauseName,
            value: value || '-',
            details: details || rightSide || '-',
            section,
          });
        }
      }
      break;
    }
  }

  // If no rows could be parsed using specialized rules, fallback to generic line-by-line extractor
  if (rows.length === 0) {
    columns = [
      { key: 'index', label: '#', type: 'number' },
      { key: 'content', label: 'Extracted Content', type: 'text' },
      { key: 'length', label: 'Char Count', type: 'number' },
    ];
    rows = lines.slice(0, 50).map((l, idx) => ({
      index: idx + 1,
      content: l,
      length: l.length,
    }));
  }

  const duration = Date.now() - startTime;

  return {
    documentType,
    title,
    summary,
    columns,
    rows,
    metadata: {
      totalRows: rows.length,
      detectedType: documentType,
      totalAmount,
      currency: 'USD',
      processingTimeMs: duration,
      engine: 'deterministic-fallback',
    },
  };
}
