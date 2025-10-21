import React, { useState } from 'react';
import { Upload, Download, X, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const BulkProductUpload = ({ onUploadComplete, categories, brands }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const downloadTemplate = () => {
    const template = [
      {
        productName: 'Sample Product',
        productCode: 'PROD001',
        skuCode: 'SKU001',
        shortDescription: 'Short description here',
        longDescription: 'Detailed description here',
        mrp: '1000',
        salesPrice: '800',
        purchaseRate: '600',
        handlingTime: '3',
        categoryName: 'Category Name',
        brandName: 'Brand Name',
        thumbnailUrl: 'https://example.com/image.jpg',
        productImageUrls: 'https://example.com/img1.jpg,https://example.com/img2.jpg',
        isActive: 'TRUE'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'product_upload_template.xlsx');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setResults(null);
      } else {
        alert('Please upload a valid Excel or CSV file');
      }
    }
  };

  const parseFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const validateRow = (row, index) => {
    const errors = [];
    const rowNum = index + 2; // +2 because Excel rows start at 1 and we have a header

    if (!row.productName?.trim()) errors.push(`Row ${rowNum}: Product name is required`);
    if (!row.productCode?.trim()) errors.push(`Row ${rowNum}: Product code is required`);
    if (!row.skuCode?.trim()) errors.push(`Row ${rowNum}: SKU code is required`);
    if (!row.shortDescription?.trim()) errors.push(`Row ${rowNum}: Short description is required`);
    if (!row.longDescription?.trim()) errors.push(`Row ${rowNum}: Long description is required`);
    
    if (!row.mrp || isNaN(row.mrp) || parseFloat(row.mrp) <= 0) {
      errors.push(`Row ${rowNum}: Valid MRP is required`);
    }
    if (!row.salesPrice || isNaN(row.salesPrice) || parseFloat(row.salesPrice) <= 0) {
      errors.push(`Row ${rowNum}: Valid sales price is required`);
    }
    if (parseFloat(row.salesPrice) > parseFloat(row.mrp)) {
      errors.push(`Row ${rowNum}: Sales price cannot exceed MRP`);
    }
    if (!row.purchaseRate || isNaN(row.purchaseRate) || parseFloat(row.purchaseRate) <= 0) {
      errors.push(`Row ${rowNum}: Valid purchase rate is required`);
    }
    if (row.handlingTime === undefined || isNaN(row.handlingTime) || parseInt(row.handlingTime) < 0) {
      errors.push(`Row ${rowNum}: Valid handling time is required`);
    }

    // Validate category
    const category = categories.find(c => 
      c.label.toLowerCase() === row.categoryName?.toLowerCase()
    );
    if (!category) {
      errors.push(`Row ${rowNum}: Category "${row.categoryName}" not found`);
    }

    // Validate brand
    const brand = brands.find(b => 
      b.label.toLowerCase() === row.brandName?.toLowerCase()
    );
    if (!brand) {
      errors.push(`Row ${rowNum}: Brand "${row.brandName}" not found`);
    }

    if (!row.thumbnailUrl?.trim()) {
      errors.push(`Row ${rowNum}: Thumbnail URL is required`);
    }
    if (!row.productImageUrls?.trim()) {
      errors.push(`Row ${rowNum}: At least one product image URL is required`);
    }

    return { 
      isValid: errors.length === 0, 
      errors,
      categoryId: category?.value,
      brandId: brand?.value
    };
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const data = await parseFile(file);
      
      if (!data || data.length === 0) {
        alert('No data found in the file');
        setUploading(false);
        return;
      }

      const validProducts = [];
      const errors = [];

      data.forEach((row, index) => {
        const validation = validateRow(row, index);
        
        if (validation.isValid) {
          const imageUrls = row.productImageUrls
            .split(',')
            .map(url => url.trim())
            .filter(url => url);

          validProducts.push({
            productName: row.productName.trim(),
            productCode: row.productCode.trim(),
            skuCode: row.skuCode.trim(),
            shortDescription: row.shortDescription.trim(),
            longDescription: row.longDescription.trim(),
            mrp: row.mrp.toString(),
            salesPrice: row.salesPrice.toString(),
            purchaseRate: row.purchaseRate.toString(),
            handlingTime: row.handlingTime.toString(),
            categoryId: validation.categoryId,
            categoryName: row.categoryName.trim(),
            brandId: validation.brandId,
            brandName: row.brandName.trim(),
            thumbnail: row.thumbnailUrl.trim(),
            productImages: imageUrls,
            isActive: row.isActive?.toString().toUpperCase() === 'TRUE',
            oneRating: 0,
            twoRating: 0,
            threeRating: 0,
            fourRating: 0,
            fiveRating: 0
          });
        } else {
          errors.push(...validation.errors);
        }
      });

      setResults({
        total: data.length,
        valid: validProducts.length,
        invalid: errors.length,
        errors
      });

      if (validProducts.length > 0 && errors.length === 0) {
        // Pass products to parent component for saving
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
        className="px-4 py-2 bg-[#81184e] text-white rounded-lg hover:bg-[#6b1442] transition-colors flex items-center gap-2"
      >
        <Upload size={18} />
        Bulk Upload
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-[#00000077] flex items-center justify-center z-[9999999999999] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Bulk Product Upload</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Download Template */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Download size={18} />
                  Step 1: Download Template
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Download the Excel template and fill in your product data
                </p>
                <button
                  onClick={downloadTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Download Template
                </button>
              </div>

              {/* Upload File */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Upload size={18} />
                  Step 2: Upload Filled Template
                </h3>
                <div className="mt-3">
                  <label className="block">
                    <span className="sr-only">Choose file</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".xlsx,.xls,.csv"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#81184e] file:text-white hover:file:bg-[#6b1442] cursor-pointer"
                    />
                  </label>
                  {file && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Results */}
              {results && (
                <div className={`p-4 rounded-lg ${results.invalid > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    {results.invalid > 0 ? (
                      <AlertCircle size={18} className="text-red-600" />
                    ) : (
                      <CheckCircle size={18} className="text-green-600" />
                    )}
                    Upload Results
                  </h3>
                  <div className="text-sm space-y-1">
                    <p>Total rows: {results.total}</p>
                    <p className="text-green-600">Valid: {results.valid}</p>
                    {results.invalid > 0 && (
                      <p className="text-red-600">Invalid: {results.invalid}</p>
                    )}
                  </div>
                  
                  {results.errors.length > 0 && (
                    <div className="mt-3 max-h-40 overflow-y-auto bg-white p-3 rounded border border-red-200">
                      <p className="font-medium text-sm text-red-600 mb-2">Errors:</p>
                      {results.errors.map((error, idx) => (
                        <p key={idx} className="text-xs text-red-600 mb-1">
                          • {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium">Important Notes:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Category Name and Brand Name must match exactly with existing categories/brands</li>
                  <li>All image URLs must be valid and accessible</li>
                  <li>Multiple product image URLs should be comma-separated</li>
                  <li>isActive field accepts TRUE or FALSE</li>
                  <li>All numeric fields (MRP, Sales Price, etc.) must be valid numbers</li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-4 py-2 bg-[#81184e] text-white rounded hover:bg-[#6b1442] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
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