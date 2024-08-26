import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Function to fetch CSV files
export const fetchFromCSV = async (csvFilePath) => {
    return new Promise((resolve, reject) => {
        Papa.parse(csvFilePath, {
            download: true,
            header: true,
            complete: (results) => resolve(results.data),
            error: (error) => reject(error),
        });
    });
};

// Function to fetch XLSX files
export const fetchFromXLSX = async (xlsxFilePath) => {
    const response = await fetch(xlsxFilePath);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0]; // Read the first sheet
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Read as array of arrays
    const headers = data[0]; // First row as headers
    const rows = data.slice(1); // All subsequent rows

    return rows.map(row => 
        headers.reduce((obj, header, index) => ({ ...obj, [header]: row[index] }), {})
    );
};