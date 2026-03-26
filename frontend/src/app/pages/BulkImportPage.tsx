import { useEffect, useMemo, useState } from 'react';
import { Upload, Download, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router';
import api from '../api/axios';
import { useStore } from '../store/useStore';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

type PreviewRow = {
  name: string;
  category: string;
  price: string;
  stock: string;
};

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

function detectDelimiter(headerLine: string) {
  // Heuristic: pick the delimiter with the highest count on the first line.
  // Supports comma, semicolon, and tab.
  const comma = (headerLine.match(/,/g) ?? []).length;
  const semi = (headerLine.match(/;/g) ?? []).length;
  const tab = (headerLine.match(/\t/g) ?? []).length;
  const counts = [
    { d: ',', c: comma },
    { d: ';', c: semi },
    { d: '\t', c: tab },
  ];
  counts.sort((a, b) => b.c - a.c);
  return counts[0].c > 0 ? counts[0].d : ',';
}

function parseCSVLine(line: string, delimiter: string) {
  // CSV parser for a single line with quoted fields.
  // Supports escaped quotes inside quotes: "" -> ".
  const out: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === delimiter && !inQuotes) {
      out.push(current.trim());
      current = '';
      continue;
    }

    current += ch;
  }

  out.push(current.trim());
  return out;
}

function parseCSV(text: string): PreviewRow[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);

  const rawHeader = parseCSVLine(lines[0], delimiter).map((h) => String(h).replace(/^\uFEFF/, '').trim().toLowerCase());
  const header = rawHeader.map((h) => h.replace(/\s+/g, ''));

  const findIdx = (...needles: string[]) => {
    const idx = header.findIndex((h) => needles.some((n) => h.includes(n)));
    return idx;
  };

  // Try to match by header names (flexible: includes checks).
  let idxName = findIdx('name', 'productname');
  let idxCategory = findIdx('category', 'productcategory');
  let idxPrice = findIdx('price', 'unitprice');
  let idxStock = findIdx('stock', 'qty', 'quantity');

  // Fallback to column order: 0,1,2,3
  if (idxName === -1) idxName = 0;
  if (idxCategory === -1) idxCategory = header.length >= 2 ? 1 : 0;
  if (idxPrice === -1) idxPrice = header.length >= 3 ? 2 : Math.min(2, header.length - 1);
  if (idxStock === -1) idxStock = header.length >= 4 ? 3 : Math.min(3, header.length - 1);

  const rows: PreviewRow[] = [];
  for (const line of lines.slice(1)) {
    const cols = parseCSVLine(line, delimiter);
    const name = String(cols[idxName] ?? '').trim();
    const category = String(cols[idxCategory] ?? '').trim();
    const price = String(cols[idxPrice] ?? '').trim();
    const stock = String(cols[idxStock] ?? '').trim();

    const hasAny = Boolean(name || category || price || stock);
    const hasCore = Boolean(name && price && stock); // product preview needs these 3

    if (!hasAny) continue;
    if (!hasCore) continue;

    rows.push({ name, category, price, stock });
  }

  return rows;
}

export function BulkImportPage() {
  const { plan } = useApp();
  const { fetchProducts, fetchActivity } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [previewText, setPreviewText] = useState('');
  const [previewKind, setPreviewKind] = useState<'table' | 'text'>('table');

  const previewRowsToShow = useMemo(() => previewRows.slice(0, 50), [previewRows]);

  const selectFile = (nextFile: File) => {
    setFile(nextFile);
    setImported(false);
    setErrors([]);
    setErrorMessage(null);
    setPreviewRows([]);
    setPreviewText('');
    setPreviewKind('table');
    setPreviewError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      selectFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (!file) return;
    let cancelled = false;

    const run = async () => {
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const lowerName = file.name.toLowerCase();
        const ext = lowerName.includes('.') ? lowerName.split('.').pop() ?? '' : '';
        if (cancelled) return;
        if (ext === 'csv') {
          const content = await file.text();
          const rows = parseCSV(content);
          setPreviewKind('table');
          setPreviewRows(rows);
          setPreviewText('');
          if (rows.length === 0) {
            setPreviewError(
              'No valid rows found. Expected headers like `name, category, price, stock` (or matching columns/order). Also ensure delimiter is comma/semicolon/tab.'
            );
          }
          return;
        }

        if (ext === 'json') {
          const content = await file.text();
          try {
            const parsed = JSON.parse(content);
            setPreviewKind('text');
            setPreviewRows([]);
            setPreviewText(JSON.stringify(parsed, null, 2));
            return;
          } catch {
            setPreviewKind('text');
            setPreviewRows([]);
            setPreviewText(content);
            setPreviewError('Invalid JSON. Showing raw file content.');
            return;
          }
        }

        if (ext === 'pdf') {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let text = '';
          const maxPages = Math.min(pdf.numPages, 10);
          for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const txt = await page.getTextContent();
            const pageText = txt.items
              .map((it: any) => ('str' in it ? String(it.str) : ''))
              .join(' ')
              .trim();
            if (pageText) text += `\n\n--- Page ${i} ---\n${pageText}`;
          }
          setPreviewKind('text');
          setPreviewRows([]);
          setPreviewText(text.trim() || 'No readable text found in PDF.');
          return;
        }

        if (ext === 'docx' || ext === 'doc') {
          if (ext === 'doc') {
            setPreviewKind('text');
            setPreviewRows([]);
            setPreviewText('Legacy .doc parsing is limited in-browser. Please use .docx for full preview.');
            setPreviewError('Limited preview for .doc files.');
            return;
          }

          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          setPreviewKind('text');
          setPreviewRows([]);
          setPreviewText(result.value?.trim() || 'No readable text found in this Word file.');
          return;
        }

        // Fallback for txt/unknown types
        const content = await file.text();
        setPreviewKind('text');
        setPreviewRows([]);
        setPreviewText(content);
        if (!['txt'].includes(ext)) {
          setPreviewError('Previewed as plain text. Structured preview is available for CSV/JSON/PDF/DOCX.');
        }
      } catch (e: any) {
        if (cancelled) return;
        setPreviewError(e?.message || 'Failed to read CSV.');
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);

    try {
      const form = new FormData();
      form.append('file', file);

      await api.post('/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setImported(true);
      setErrors([]);
      setErrorMessage(null);

      // Ensure products/warehouse UI updates right away.
      await fetchProducts();
      await fetchActivity();
    } catch (e: any) {
      const status = e?.response?.status;
      const message = e?.response?.data?.message;
      if (status === 402 || status === 403) {
        setErrorMessage(message || 'This feature is not available in your plan.');
      } else {
        setErrorMessage(message || 'Import failed.');
      }

      const maybeErrors = e?.response?.data?.errors;
      if (Array.isArray(maybeErrors)) {
        setErrors(maybeErrors.map((x: any) => String(x)));
      } else {
        setErrors([]);
      }
    } finally {
      setImporting(false);
    }
  };

  if (plan === 'free') {
    return (
      <div className="page-animate-right">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1F2937]">Bulk Import Products</h1>
          <p className="text-[#6B7280] mt-1">Upload files to add products in bulk (CSV is required for import)</p>
        </div>

        {/* Locked State */}
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center bg-white rounded-2xl p-12 shadow-md max-w-md">
            <Lock className="w-16 h-16 text-[#C89B5A] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1F2937] mb-3">🔒 Bulk Import is a Pro Feature</h2>
            <p className="text-[#6B7280] mb-6">Unlock bulk import with Pro plan:</p>
            
            <div className="text-left mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✔</span>
                <span className="text-[#1F2937]">Faster product creation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✔</span>
                <span className="text-[#1F2937]">Bulk updates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✔</span>
                <span className="text-[#1F2937]">Category-based import</span>
              </div>
            </div>

            <Link
              to="/user/subscription"
              className="block px-8 py-3 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors"
            >
              Upgrade to Pro 🚀
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-animate-right">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2937]">Bulk Import Products</h1>
        <p className="text-[#6B7280] mt-1">Upload files to add products in bulk (CSV is required for import)</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl p-8 shadow-md mb-6">
        <label
          htmlFor="file-upload"
          className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#C89B5A] bg-[#F3E8D9] dark:bg-[#2B2114]'
              : 'border-gray-300 hover:border-[#C89B5A] hover:bg-[#F3E8D9] dark:border-gray-700 dark:hover:bg-[#2B2114]'
          }`}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const dropped = e.dataTransfer.files?.[0];
            if (dropped) selectFile(dropped);
          }}
        >
          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-200 mb-4" />
          <p className="text-lg font-semibold !text-black dark:!text-white mb-2">
            📂 Drag & Drop File Here
          </p>
          <p className="text-sm !text-black/80 dark:!text-gray-200 mb-4">or click to select</p>
          {file && (
            <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
              ✓ Selected: {file.name}
            </p>
          )}
          <input
            id="file-upload"
            type="file"
              accept=".csv,.json,.pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="mt-4 text-xs !text-black/70 dark:!text-gray-300">
              <p>Supported formats: .csv, .json, .pdf, .doc, .docx, .txt</p>
            <p>Max file size: 5MB</p>
          </div>
        </label>
      </div>

      {/* Preview Table */}
      {file && !importing && !imported && (
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h3 className="text-lg font-bold text-[#1F2937] mb-4">File Preview</h3>
          {previewLoading ? (
            <div className="text-[#6B7280]">Parsing CSV...</div>
          ) : previewError ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-[#1F2937]">
              {previewError}
            </div>
          ) : previewKind === 'table' ? (
            previewRowsToShow.length === 0 ? (
              <div className="text-[#6B7280]">No preview rows to show.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F2937]">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F2937]">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F2937]">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F2937]">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {previewRowsToShow.map((r, idx) => (
                      <tr key={`${r.name}-${idx}`}>
                        <td className="px-4 py-3">{r.name || '-'}</td>
                        <td className="px-4 py-3">{r.category || '-'}</td>
                        <td className="px-4 py-3">{r.price || '-'}</td>
                        <td className="px-4 py-3">{r.stock || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewRows.length > previewRowsToShow.length && (
                  <div className="mt-3 text-sm text-[#6B7280]">
                    Showing first {previewRowsToShow.length} rows of {previewRows.length}.
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <pre className="whitespace-pre-wrap break-words text-sm text-[#1F2937] max-h-[420px] overflow-auto">
                {previewText || 'No preview text available.'}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {importing && (
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <p className="text-lg font-semibold text-[#1F2937] mb-4">Importing products...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-[#C89B5A] h-2 rounded-full animate-pulse" style={{ width: '80%' }}></div>
          </div>
          <p className="text-sm text-[#6B7280]">80% complete</p>
        </div>
      )}

      {/* Success/Error State */}
      {imported && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">✔ Import completed successfully</p>
              </div>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900 mb-2">❌ Errors Found:</p>
                  <ul className="space-y-1 text-sm text-red-700">
                    {errors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-[#1F2937]">
          {errorMessage}
        </div>
      )}

      {/* Actions */}
      {file && !importing && !imported && (
        <div className="flex gap-4">
          <button
            onClick={() => {
              setFile(null);
              setPreviewRows([]);
              setPreviewError(null);
            }}
            className="flex-1 px-6 py-3 bg-[#EFEAE4] text-[#1F2937] rounded-xl hover:bg-[#E5DFD8] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={file ? !file.name.toLowerCase().endsWith('.csv') : true}
            className="flex-1 px-6 py-3 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors"
          >
            {file && !file.name.toLowerCase().endsWith('.csv')
              ? 'Import supports CSV only'
              : 'Import Products'}
          </button>
        </div>
      )}
    </div>
  );
}
