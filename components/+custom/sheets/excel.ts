import XLSX from 'xlsx';

export const Excel_exportFile = (columns, data) => {
  let header = [];
  columns.map(c => c.name !== null && header.push(c.name));

  let rows = [];
  data.map(item => {
    let row = [];
    columns.map(c => item[c.id] && row.push(item[c.id]));
    rows.push(row);
  });
  rows[0] = header;

  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');

  XLSX.writeFile(wb, 'data-grid.xlsx', {compression: true});
};
