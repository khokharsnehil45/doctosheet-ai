import { ColumnDefinition, TableRow } from './types';

/**
 * Escapes a field for CSV format conforming to RFC 4180
 */
function escapeCSVField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Converts column headers and table rows into standard CSV text with UTF-8 BOM
 */
export function generateCSV(columns: ColumnDefinition[], rows: TableRow[]): string {
  const headers = columns.map((c) => escapeCSVField(c.label)).join(',');
  const rowLines = rows.map((row) =>
    columns.map((col) => escapeCSVField(row[col.key] ?? '')).join(',')
  );

  // Prepend UTF-8 BOM (\uFEFF) so Excel accurately recognizes special characters and UTF-8 encoding
  return '\uFEFF' + [headers, ...rowLines].join('\r\n');
}

/**
 * Converts table data to TSV (Tab Separated Values) for seamless paste into Excel & Google Sheets
 */
export function generateTSV(columns: ColumnDefinition[], rows: TableRow[]): string {
  const headers = columns.map((c) => c.label.replace(/\t/g, ' ')).join('\t');
  const rowLines = rows.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key] ?? '';
        return String(val).replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
      })
      .join('\t')
  );

  return [headers, ...rowLines].join('\n');
}

/**
 * Generates an Excel XML 2003 Spreadsheet format string that opens natively in Microsoft Excel
 */
export function generateExcelXML(
  title: string,
  columns: ColumnDefinition[],
  rows: TableRow[]
): string {
  const sanitizedTitle = (title || 'DocToSheet Export').replace(/[<>&"]/g, '');

  const headerCells = columns
    .map(
      (c) =>
        `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXML(c.label)}</Data></Cell>`
    )
    .join('');

  const bodyRows = rows
    .map((row) => {
      const cells = columns
        .map((col) => {
          const val = row[col.key] ?? '';
          const str = String(val);
          // Detect numeric values
          const cleanNum = str.replace(/[$,]/g, '');
          const isNumeric = !isNaN(Number(cleanNum)) && cleanNum.trim() !== '';

          if (isNumeric && (col.type === 'currency' || col.type === 'number')) {
            return `<Cell ss:StyleID="Number"><Data ss:Type="Number">${cleanNum}</Data></Cell>`;
          }
          return `<Cell><Data ss:Type="String">${escapeXML(str)}</Data></Cell>`;
        })
        .join('');
      return `<Row>${cells}</Row>`;
    })
    .join('');

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Inter, Segoe UI, sans-serif" ss:Size="10" ss:Color="#18181B"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Inter, Segoe UI, sans-serif" ss:Size="10" ss:Bold="1" ss:Color="#09090B"/>
   <Interior ss:Color="#F4F4F5" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E4E4E7"/>
   </Borders>
  </Style>
  <Style ss:ID="Number">
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sanitizedTitle.substring(0, 31)}">
  <Table>
   <Row ss:Height="22">${headerCells}</Row>
   ${bodyRows}
  </Table>
 </Worksheet>
</Workbook>`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Triggers a browser download of the given text content with the specified filename and MIME type
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
