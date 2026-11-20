import React, { useState } from 'react';
import { Upload, Download, X, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import * as XLSX from 'xlsx';

const BulkProductUpload = ({ onUploadComplete, categories, brands }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const downloadTemplate = () => {
    const template = [
      {
        productName: 'Sample Bluetooth Earbuds',
        productCode: 'PROD001',
        skuCode: 'SKU001',
        shortDescription: 'Wireless earbuds with 24hr battery',
        longDescription: 'Premium wireless earbuds with active noise cancellation and 24 hour battery life.',
        mrp: '2999',
        salesPrice: '1999',
        purchaseRate: '1400',
        stock: '50',
        handlingTime: '2',
        compatibleWith: 'Android, iOS',
        connectivity: 'Bluetooth 5.3',
        warranty: '1 Year',
        categoryName: 'Mobile Accessories',
        brandName: 'Brand Name',
        isActive: 'TRUE',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'mobile_accessories_upload_template.xlsx');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (validTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setResults(null);
    } else {
      alert('Please upload a valid Excel or CSV file');
    }
  };

  const parseFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          resolve(XLSX.utils.sheet_to_json(worksheet));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

  const validateRow = (row, index) => {
    const errors = [];
    const rowNum = index + 2;

    if (!row.productName?.trim()) errors.push(`Row ${rowNum}: Product name is required`);
    if (!row.productCode?.trim()) errors.push(`Row ${rowNum}: Product code is required`);
    if (!row.skuCode?.trim()) errors.push(`Row ${rowNum}: SKU code is required`);
    if (!row.shortDescription?.trim()) errors.push(`Row ${rowNum}: Short description is required`);
    if (!row.longDescription?.trim()) errors.push(`Row ${rowNum}: Long description is required`);

    if (!row.mrp || isNaN(row.mrp) || parseFloat(row.mrp) <= 0)
      errors.push(`Row ${rowNum}: Valid MRP is required`);
    if (!row.salesPrice || isNaN(row.salesPrice) || parseFloat(row.salesPrice) <= 0)
      errors.push(`Row ${rowNum}: Valid sales price is required`);
    if (parseFloat(row.salesPrice) > parseFloat(row.mrp))
      errors.push(`Row ${rowNum}: Sales price cannot exceed MRP`);
    if (!row.purchaseRate || isNaN(row.purchaseRate) || parseFloat(row.purchaseRate) <= 0)
      errors.push(`Row ${rowNum}: Valid purchase rate is required`);
    if (row.handlingTime === undefined || isNaN(row.handlingTime) || parseInt(row.handlingTime) < 0)
      errors.push(`Row ${rowNum}: Valid handling time is required`);

    const categoryName = row.categoryName?.toString().trim();
    const category = categories.find(
      (c) => c.label.toLowerCase().trim() === categoryName?.toLowerCase()
    );
    if (!categoryName) errors.push(`Row ${rowNum}: Category name is required`);
    else if (!category)
      errors.push(
        `Row ${rowNum}: Category "${categoryName}" not found. Available: ${categories.map((c) => c.label).join(', ')}`
      );

    const brandName = row.brandName?.toString().trim();
    const brand = brands.find((b) => b.label.toLowerCase().trim() === brandName?.toLowerCase());
    if (!brandName) errors.push(`Row ${rowNum}: Brand name is required`);
    else if (!brand)
      errors.push(
        `Row ${rowNum}: Brand "${brandName}" not found. Available: ${brands.map((b) => b.label).join(', ')}`
      );

    return {
      isValid: errors.length === 0,
      errors,
      categoryId: category?.value,
      brandId: brand?.value,
    };
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const data = await parseFile(file);

      if (!data || data.length === 0) {
        alert('No data found in the file');
        return;
      }

      const validProducts = [];
      const errors = [];

      data.forEach((row, index) => {
        const validation = validateRow(row, index);
        if (validation.isValid) {
          validProducts.push({
            productName: row.productName.trim(),
            productCode: row.productCode.trim(),
            skuCode: row.skuCode.trim(),
            shortDescription: row.shortDescription.trim(),
            longDescription: row.longDescription.trim(),
            mrp: row.mrp.toString(),
            salesPrice: row.salesPrice.toString(),
            purchaseRate: row.purchaseRate.toString(),
            stock: row.stock ? parseInt(row.stock) : 0,
            handlingTime: row.handlingTime.toString(),
            compatibleWith: row.compatibleWith?.toString().trim() || '',
            connectivity: row.connectivity?.toString().trim() || '',
            warranty: row.warranty?.toString().trim() || '',
            categoryId: validation.categoryId,
            categoryName: row.categoryName.trim(),
            brandId: validation.brandId,
            brandName: row.brandName.trim(),
            thumbnail: null,
            productImages: [],
            isActive: row.isActive?.toString().toUpperCase() === 'TRUE',
            oneRating: 0,
            twoRating: 0,
            threeRating: 0,
            fourRating: 0,
            fiveRating: 0,
          });
        } else {
          errors.push(...validation.errors);
        }
      });

      setResults({
        total: data.length,
        valid: validProducts.length,
        invalid: errors.length,
        errors,
      });

      if (validProducts.length > 0 && errors.length === 0) {
        await onUploadComplete(validProducts);
        setFile(null);
        setTimeout(() => setIsOpen(false), 2000);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
      >
        <Upload size={16} />
        Bulk Upload
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="p-5 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Smartphone size={18} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Bulk Product Upload</h2>
                  <p className="text-xs text-gray-500">Mobile Accessories</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Step 1 */}
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <h3 className="font-medium text-sm mb-1 flex items-center gap-2 text-blue-800">
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
                  Download Template
                </h3>
                <p className="text-xs text-blue-700 mb-3 ml-7">
                  Download the Excel template. Includes fields for compatibility, connectivity, and warranty.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="ml-7 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium flex items-center gap-2"
                >
                  <Download size={14} />
                  Download Template
                </button>
              </div>

              {/* Step 2 */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                <h3 className="font-medium text-sm mb-1 flex items-center gap-2 text-gray-800">
                  <span className="w-5 h-5 bg-gray-600 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
                  Upload Filled Template
                </h3>
                <div className="ml-7 mt-2">
                  <label className="block">
                    <span className="sr-only">Choose file</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".xlsx,.xls,.csv"
                      className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                  </label>
                  {file && (
                    <p className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                      <CheckCircle size={12} className="text-green-500" />
                      {file.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Results */}
              {results && (
                <div
                  className={`p-4 rounded-xl border ${
                    results.invalid > 0
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                    {results.invalid > 0 ? (
                      <AlertCircle size={16} className="text-red-600" />
                    ) : (
                      <CheckCircle size={16} className="text-green-600" />
                    )}
                    Upload Results
                  </h3>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-lg font-semibold text-gray-800">{results.total}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="text-xs text-green-600">Valid</p>
                      <p className="text-lg font-semibold text-green-700">{results.valid}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="text-xs text-red-600">Invalid</p>
                      <p className="text-lg font-semibold text-red-700">{results.invalid}</p>
                    </div>
                  </div>

                  {results.errors.length > 0 && (
                    <div className="max-h-36 overflow-y-auto bg-white p-3 rounded-lg border border-red-200">
                      <p className="font-medium text-xs text-red-600 mb-2">Errors:</p>
                      {results.errors.map((error, idx) => (
                        <p key={idx} className="text-xs text-red-600 mb-1 flex items-start gap-1">
                          <span className="mt-0.5">•</span> {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                <p className="text-xs font-semibold text-amber-800 mb-2">Important Notes</p>
                <ul className="text-xs text-amber-700 space-y-1 list-disc pl-4">
                  <li>Category Name and Brand Name must match exactly with existing records</li>
                  <li>isActive field accepts TRUE or FALSE only</li>
                  <li>Sales Price must not exceed MRP</li>
                  <li>New fields: <strong>compatibleWith</strong>, <strong>connectivity</strong>, <strong>warranty</strong> are optional</li>
                  <li>Images must be added manually after bulk upload</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Upload size={14} />
                {uploading ? 'Processing...' : 'Upload Products'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkProductUpload;