import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentType, ParsedDocumentResult } from './types';
import { parseOfflineDocument } from './fallbackParser';

const SYSTEM_INSTRUCTIONS: Record<DocumentType, string> = {
  bank_statement: `You are an expert financial data extraction engine. Analyze the provided bank statement raw text and extract every single transaction row accurately.
Format the output STRICTLY as a JSON object matching this schema:
{
  "title": "Bank Statement Transactions",
  "summary": "Summary of statement period, total debits, total credits",
  "totalAmount": 0.00,
  "currency": "USD",
  "columns": [
    { "key": "date", "label": "Date", "type": "date" },
    { "key": "description", "label": "Description", "type": "text" },
    { "key": "category", "label": "Category", "type": "text" },
    { "key": "debit", "label": "Debit ($)", "type": "currency" },
    { "key": "credit", "label": "Credit ($)", "type": "currency" },
    { "key": "balance", "label": "Balance ($)", "type": "currency" }
  ],
  "rows": [
    {
      "date": "YYYY-MM-DD or MM/DD/YYYY",
      "description": "Clean merchant or description",
      "category": "e.g. Office Supplies, Revenue, Meals, Utilities, Travel, Software",
      "debit": "$142.80 or null if credit",
      "credit": "$4,250.00 or null if debit",
      "balance": "$14,707.42 or null"
    }
  ]
}`,

  invoice: `You are an expert invoice and accounting parsing engine. Extract all itemized line items, deliverables, products, services, taxes, and totals from the provided text.
Format the output STRICTLY as a JSON object matching this schema:
{
  "title": "Itemized Invoice Breakdown",
  "summary": "Invoice #, vendor name, client, issue date, due date",
  "totalAmount": 0.00,
  "currency": "USD",
  "columns": [
    { "key": "item", "label": "Item / Service", "type": "text" },
    { "key": "description", "label": "Description", "type": "text" },
    { "key": "quantity", "label": "Quantity", "type": "number" },
    { "key": "unitPrice", "label": "Unit Price ($)", "type": "currency" },
    { "key": "tax", "label": "Tax ($)", "type": "currency" },
    { "key": "total", "label": "Line Total ($)", "type": "currency" }
  ],
  "rows": [
    {
      "item": "Name of service or product",
      "description": "Detailed notes or deliverable summary",
      "quantity": "e.g. 40 hrs or 1 unit",
      "unitPrice": "$175.00",
      "tax": "$0.00",
      "total": "$7,000.00"
    }
  ]
}`,

  lease_summary: `You are a real estate legal analyst. Extract every key clause, obligation, financial term, date, penalty, renewal option, and section reference from the lease text.
Format the output STRICTLY as a JSON object matching this schema:
{
  "title": "Lease Agreement Abstract & Summary",
  "summary": "Premises address, Landlord, Tenant, Lease duration",
  "totalAmount": null,
  "currency": "USD",
  "columns": [
    { "key": "clause", "label": "Clause / Field", "type": "text" },
    { "key": "value", "label": "Value / Amount", "type": "text" },
    { "key": "details", "label": "Details & Obligations", "type": "text" },
    { "key": "section", "label": "Contract Section", "type": "text" }
  ],
  "rows": [
    {
      "clause": "e.g. Initial Monthly Base Rent, Security Deposit, CAM, Late Fee, Renewal Option",
      "value": "e.g. $6,125.00, $12,250.00, 36 Months",
      "details": "e.g. Payable on the 1st of month, 3.5% escalation",
      "section": "e.g. Section 3.1"
    }
  ]
}`
};

export async function parseDocumentWithGemini(
  text: string,
  documentType: DocumentType,
  customApiKey?: string
): Promise<ParsedDocumentResult> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('[DocToSheet AI] No Gemini API key provided. Using deterministic offline fallback parser.');
    return parseOfflineDocument(text, documentType);
  }

  const startTime = Date.now();

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const prompt = `${SYSTEM_INSTRUCTIONS[documentType]}\n\nRAW DOCUMENT TEXT TO CONVERT:\n"""\n${text}\n"""\n\nReturn ONLY the valid JSON matching the schema.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedJson = JSON.parse(responseText);

    const duration = Date.now() - startTime;

    return {
      documentType,
      title: parsedJson.title || `${documentType.replace('_', ' ').toUpperCase()} Sheet`,
      summary: parsedJson.summary || '',
      columns: parsedJson.columns && Array.isArray(parsedJson.columns) ? parsedJson.columns : [],
      rows: parsedJson.rows && Array.isArray(parsedJson.rows) ? parsedJson.rows : [],
      metadata: {
        totalRows: (parsedJson.rows || []).length,
        detectedType: documentType,
        totalAmount: typeof parsedJson.totalAmount === 'number' ? parsedJson.totalAmount : null,
        currency: parsedJson.currency || 'USD',
        processingTimeMs: duration,
        engine: customApiKey ? 'custom-gemini' : 'gemini-1.5-flash',
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Gemini error';
    console.warn('[DocToSheet AI] Gemini API error, failing over to deterministic parser:', message);
    const fallbackResult = parseOfflineDocument(text, documentType);
    return {
      ...fallbackResult,
      summary: `${fallbackResult.summary} (Processed via deterministic offline engine)`
    };
  }
}
