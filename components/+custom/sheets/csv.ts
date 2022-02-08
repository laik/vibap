const SEPARATOR = ',';

export function downloadBlob(blob, fileName = 'grid-data.csv') {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.position = 'absolute';
  link.style.visibility = 'hidden';

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}

export function CSV_exportFile(columns, data) {
  const header = columns.map(c => c.name).join(SEPARATOR);
  const rows = data.map(item => columns.map(c => item[c.id]).join(SEPARATOR));

  const contents = [header].concat(rows).join('\n');
  const blob = new Blob([contents], {type: 'text/csv;charset=utf-8;'});

  downloadBlob(blob, 'grid-data.csv');
}

export function CSV_importFile(file) {
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onloadend = function (event) {
    console.log(event.target.result);
  };
}
