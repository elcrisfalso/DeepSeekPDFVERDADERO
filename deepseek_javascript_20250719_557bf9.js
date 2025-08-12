 const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const editor = document.getElementById('editor');
const downloadBtn = document.getElementById('download-btn');

let originalPdfBytes = null;
let pdfDoc = null;
let page = null;
let scale = 1.5;
let selectedX = 0;
let selectedY = 0;

document.getElementById('file-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const fileReader = new FileReader();

  fileReader.onload = async function () {
    originalPdfBytes = new Uint8Array(this.result);

    const loadingTask = pdfjsLib.getDocument({ data: originalPdfBytes });
    pdfDoc = await loadingTask.promise;
    page = await pdfDoc.getPage(1);

    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    downloadBtn.style.display = 'inline-block';
  };

  fileReader.readAsArrayBuffer(file);
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  selectedX = e.clientX - rect.left;
  selectedY = e.clientY - rect.top;

  editor.style.left = `${e.clientX}px`;
  editor.style.top = `${e.clientY}px`;
  editor.style.display = 'block';
  editor.innerText = '';
  editor.focus();
});

editor.addEventListener('blur', () => {
  const text = editor.innerText.trim();
  if (text !== '') {
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(text, selectedX, selectedY);
  }
  editor.style.display = 'none';
  editor.innerText = '';
});

downloadBtn.addEventListener('click', async () => {
  const pdfDocModified = await PDFLib.PDFDocument.load(originalPdfBytes);
  const pages = pdfDocModified.getPages();
  const firstPage = pages[0];

  const { width, height } = firstPage.getSize();

  // Añade ejemplo de texto (puedes personalizarlo)
  firstPage.drawText('Texto añadido desde el editor', {
    x: 100,
    y: height - 150,
    size: 16,
    color: PDFLib.rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDocModified.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'editado.pdf';
  link.click();
});
