import { cropImage, formatBytes } from '../utils/image-utils.js';

let originalImage = null;
let originalFile = null;
let currentRatio = 16 / 9;

const init = () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const downloadBtn = document.getElementById('btn-download');

  // Crop Ratios
  document.querySelectorAll('.btn-ratio').forEach(btn => {
    btn.onclick = () => setCropRatio(btn.dataset.ratio);
  });

  if (!dropZone) return;

  dropZone.onclick = (e) => {
    if (originalImage) return; // Prevent clicking when image is loaded (unless reset)
    fileInput.click();
  };

  fileInput.onchange = (e) => handleFile(e.target.files[0]);

  dropZone.ondragover = (e) => {
    e.preventDefault();
  };

  dropZone.ondrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  downloadBtn.onclick = () => download();

  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) {
    resetBtn.onclick = (e) => {
      e.stopPropagation();
      window.location.reload();
    };
  }
};

const handleFile = (file) => {
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      originalImage = img;
      originalFile = file;
      showPreview(img, file);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const showPreview = (img, file) => {
  document.getElementById('upload-prompt').style.display = 'none';
  document.getElementById('drop-zone').style.border = 'none'; // Remove border for cleaner look
  document.getElementById('preview-container').style.display = 'block';

  const previewImg = document.getElementById('preview-img');
  previewImg.src = img.src;

  document.getElementById('btn-download').disabled = false;
  document.getElementById('btn-reset').style.display = 'inline-flex';

  setCropRatio('16:9'); // Default
};

const setCropRatio = (ratioType) => {
  document.querySelectorAll('.btn-ratio').forEach(b => b.classList.remove('active'));
  document.querySelector(`.btn-ratio[data-ratio="${ratioType}"]`).classList.add('active');

  let targetRatio = 16 / 9;
  if (ratioType === '16:9') targetRatio = 16 / 9;
  if (ratioType === '4:3') targetRatio = 4 / 3;
  if (ratioType === '1:1') targetRatio = 1;
  if (ratioType === 'original') targetRatio = originalImage.width / originalImage.height;

  currentRatio = targetRatio;

  const container = document.getElementById('preview-container');
  if (container) {
    container.style.aspectRatio = `${currentRatio}`;
  }

  updateInfoPanel();
};

/* updatePreviewLayout removed - handled by CSS */

const updateInfoPanel = () => {
  if (!originalImage) return;

  const w = originalImage.width;
  const h = originalImage.height;

  // Calculate Result dimensions based on Center Crop logic
  let resultW, resultH;
  const imgRatio = w / h;

  if (imgRatio > currentRatio) {
    // Image is wider than target -> Height fits, Width cropped
    resultH = h;
    resultW = h * currentRatio;
  } else {
    // Image is taller than target -> Width fits, Height cropped
    resultW = w;
    resultH = w / currentRatio;
  }

  document.getElementById('info-panel').style.display = 'block';
  document.getElementById('info-original-size').innerText = `${w}x${h} (${formatBytes(originalFile.size)})`;
  document.getElementById('info-result-size').innerText = `${Math.round(resultW)}x${Math.round(resultH)}`;
};

const download = () => {
  if (!originalImage) return;

  const w = originalImage.width;
  const h = originalImage.height;
  const imgRatio = w / h;

  let cw, ch, cx, cy;

  if (imgRatio > currentRatio) {
    // Crop width
    ch = h;
    cw = h * currentRatio;
    cy = 0;
    cx = (w - cw) / 2;
  } else {
    // Crop height
    cw = w;
    ch = w / currentRatio;
    cx = 0;
    cy = (h - ch) / 2;
  }

  const canvas = cropImage(originalImage, Math.round(cx), Math.round(cy), Math.round(cw), Math.round(ch));

  const link = document.createElement('a');
  link.download = `zen-cropped-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

// Handle window resize - No longer needed as CSS handles layout
// window.addEventListener('resize', () => {
//   if (originalImage) updatePreviewLayout();
// });

document.addEventListener('DOMContentLoaded', init);
