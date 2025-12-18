import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Interface for table column definition in exports
 */
export interface ExportColumn {
    header: string;
    dataKey: string;
}

/**
 * Exports data to a PDF file with a profesional table layout
 * @param filename Name of the file (without extension)
 * @param title Title to show in the PDF document
 * @param columns Array of column definitions
 * @param data Array of objects containing the data
 */
export const exportToPDF = (
    filename: string,
    title: string,
    columns: ExportColumn[],
    data: any[]
) => {
    try {
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(18);
        doc.text(title, 14, 22);

        // Add Date
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 30);

        // Prepare body data - Ensure we extract correct keys
        const body = data.map(item =>
            columns.map(col => {
                const val = item[col.dataKey];
                return val !== undefined && val !== null ? String(val) : '';
            })
        );

        // Generate Table
        autoTable(doc, {
            startY: 35,
            head: [columns.map(col => col.header)],
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [212, 175, 55] }, // Gold color from theme (#d4af37)
            styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            margin: { top: 35 }
        });

        doc.save(`${filename}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Hubo un error al generar el PDF. Revisa la consola para más detalles.");
    }
};

/**
 * Exports data to an Excel (XLSX) file
 * @param filename Name of the file (without extension)
 * @param sheetName Name of the sheet inside the Excel
 * @param data Array of objects containing the data
 */
export const exportToExcel = (
    filename: string,
    sheetName: string,
    data: any[]
) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Create XLSX file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};
