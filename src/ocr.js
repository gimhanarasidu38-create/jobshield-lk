// Offline fallback: read text from a screenshot with Tesseract (eng + sin + tam).
// First use downloads language data (~tens of MB) from the tesseract.js CDN, so it
// needs internet once. If anything fails we return '' and the caller asks for pasted text.

let workerPromise;

const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('OCR timeout')), ms))]);

export async function ocrImage(buffer) {
  try {
    const { createWorker } = await import('tesseract.js');
    workerPromise ??= createWorker('eng+sin+tam');
    const worker = await withTimeout(workerPromise, 90000);
    const { data } = await withTimeout(worker.recognize(buffer), 60000);
    return String(data.text || '').trim();
  } catch (e) {
    console.warn('[ocr] unavailable:', e.message);
    workerPromise = undefined;
    return '';
  }
}
