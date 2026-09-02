import { SampleDocument } from './types';

export const SAMPLE_DOCUMENTS: Record<string, SampleDocument> = {
  bank_statement: {
    id: 'bank_statement',
    name: 'Bank Statement',
    badge: 'Financial Records',
    description: 'Messy text from a monthly checking account statement with debits, credits, and merchant descriptions.',
    sampleColumns: ['Date', 'Description', 'Category', 'Debit', 'Credit', 'Balance'],
    rawText: `CHASE BUSINESS CHECKING ACCOUNT # *******8921
STATEMENT PERIOD: JAN 01, 2025 - JAN 31, 2025
Account Summary:
Beginning Balance: $14,850.22 | Total Deposits: $8,450.00 | Total Withdrawals: $4,912.45 | Ending Balance: $18,387.77

TRANSACTION DETAILS:
01/02/2025  AMZN Mktp US*9B20K  Seattle WA - Office Supplies Hardware  -$142.80  Bal: $14,707.42
01/04/2025  STRIPE PAYOUT TRANSFER REF_TX998231 AUTO-DEPOSIT  +$4,250.00  Bal: $18,957.42
01/07/2025  STARBUCKS STORE #10492 SAN FRANCISCO CA  -$14.75  Bal: $18,942.67
01/10/2025  GITHUB *MONTHLY TEAM PLAN SAN FRANCISCO CA  -$42.00  Bal: $18,900.67
01/12/2025  VERIZON WIRELESS PAYMENT 800-922-0204 FL  -$185.30  Bal: $18,715.37
01/15/2025  WEWORK CO-WORKING RENT JAN 2025 NYC  -$850.00  Bal: $17,865.37
01/18/2025  CLIENT WIRE INWARD - ACME CORP CONSULTING  +$4,200.00  Bal: $22,065.37
01/22/2025  GOOGLE CLOUD *SERVICES G.CO/HELPPAY CA  -$324.60  Bal: $21,740.77
01/25/2025  DELTA AIR LINES 0062391823 ATLANTA GA - Travel  -$612.00  Bal: $21,128.77
01/28/2025  UBER TRIP HELP.UBER.COM CA  -$38.50  Bal: $21,090.27
01/30/2025  DRI*JETBRAINS SUBSCRIPTION REF_88192  -$299.00  Bal: $20,791.27
01/31/2025  HEALTH INSURANCE ANTHEM BCBS MONTHLY PREMIUM  -$2,403.50  Bal: $18,387.77
`
  },
  invoice: {
    id: 'invoice',
    name: 'Invoice / Receipt',
    badge: 'B2B Billing',
    description: 'Unstructured contractor invoice or supplier bill with line items, quantities, rates, and tax calculations.',
    sampleColumns: ['Item / Service', 'Description', 'Quantity', 'Unit Price ($)', 'Tax ($)', 'Line Total ($)'],
    rawText: `INVOICE #INV-2025-089
APEX CLOUD ARCHITECTURE LLC
450 Mission Street, Suite 800, San Francisco, CA 94105
Billed To: Vanguard Media Group Inc. (Attn: Accounts Payable)
Date of Issue: February 15, 2025 | Due Date: March 01, 2025 | PO Number: PO-99014

SERVICES RENDERED & DELIVERABLES:
1. Cloud Infrastructure Migration & Kubernetes Setup - Automated cluster provisioning on AWS EKS with Terraform | Qty: 40 hrs | Rate: $175.00/hr | Tax: $0.00 | Total: $7,000.00
2. Security & Compliance Hardening - SOC2 Type II compliance audit remediation and IAM role policy consolidation | Qty: 15 hrs | Rate: $190.00/hr | Tax: $0.00 | Total: $2,850.00
3. CI/CD Pipeline Automation - GitHub Actions workflow with zero-downtime deployment rollback strategies | Qty: 20 hrs | Rate: $160.00/hr | Tax: $0.00 | Total: $3,200.00
4. Database Sharding & Read Replica Setup - PostgreSQL 16 read-pool distribution and query optimization | Qty: 12 hrs | Rate: $180.00/hr | Tax: $0.00 | Total: $2,160.00
5. Dedicated Team Support & On-Call Retainer - 24/7 incident response SLA coverage for Month of Feb | Qty: 1 unit | Rate: $1,500.00 | Tax: $120.00 | Total: $1,620.00

Subtotal: $16,710.00
State Tax (Selected items): $120.00
Early Payment Discount (2%): -$334.20
TOTAL AMOUNT DUE: $16,495.80
Payment Terms: Net 15 via ACH / Wire Transfer
`
  },
  lease_summary: {
    id: 'lease_summary',
    name: 'Lease Summary',
    badge: 'Real Estate & Legal',
    description: 'Dense legal lease agreement clauses extracted into key fields, dates, amounts, and obligations.',
    sampleColumns: ['Clause / Field', 'Value', 'Details & Obligations', 'Contract Section'],
    rawText: `STANDARD COMMERCIAL LEASE AGREEMENT EXTRACT
Premises: 742 Evergreen Terrace, Suite 3B, Austin, TX 78701 (Approx. 2,450 RSF)
Landlord: Austin Metro Commercial Properties LLC
Tenant: Helios AI Technologies Inc.

KEY PROVISIONS & ABSTRACT:
- Lease Commencement Date: April 1, 2025 (Section 1.1)
- Initial Lease Term: 36 Months, expiring March 31, 2028 (Section 1.2)
- Initial Monthly Base Rent: $6,125.00 ($30.00/RSF/year) payable on the 1st of each month (Section 3.1)
- Annual Rent Escalation: 3.5% compounding on each anniversary of Commencement Date (Section 3.3)
- Security Deposit: $12,250.00 (equivalent to two months' base rent) held in non-interest escrow (Section 4.1)
- Common Area Maintenance (CAM): Pro-rata share of 4.8% of building operating expenses, estimated at $480.00/mo (Section 5.2)
- Permitted Use: General administrative and engineering software offices only (Section 6.0)
- Late Payment Fee: 5% penalty of overdue installment if unpaid after 5 business days grace period (Section 3.5)
- Renewal Option: One (1) 3-year extension at 95% of Fair Market Value with 6 months prior written notice (Section 14.1)
- Tenant Improvement Allowance: $25,000 provided by Landlord towards turnkey fiber and partitioning (Exhibit B)
`
  }
};
