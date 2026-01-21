import { cropImage, formatBytes, downloadCanvasImage } from '../utils/image-utils.js';

let originalImage = null;
let originalFile = null;
let currentRatio = 16 / 9;
let selectedFormat = 'image/png';

const init = () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const downloadBtn = document.getElementById('btn-download');
  const formatButtons = document.querySelectorAll('.btn-format');
  const qualityInput = document.getElementById('input-quality');
  const qualityVal = document.getElementById('quality-val');

  // Crop Ratios
  document.querySelectorAll('.btn-ratio').forEach(btn => {
    btn.onclick = () => setCropRatio(btn.dataset.ratio);
  });

  if (!dropZone) return;

  dropZone.onclick = (e) => {
    if (originalImage) return;
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

  // 포맷 선택 처리
  formatButtons.forEach(btn => {
    btn.onclick = () => {
      formatButtons.forEach(b => {
        b.classList.remove('active', 'border-accent', 'text-accent');
        b.classList.add('border-border', 'bg-surface');
      });
      btn.classList.add('active', 'border-accent', 'text-accent');
      btn.classList.remove('border-border', 'bg-surface');
      selectedFormat = btn.dataset.format;

      const qualityControl = document.getElementById('quality-control');
      if (selectedFormat === 'image/jpeg' || selectedFormat === 'image/webp') {
        qualityControl.classList.remove('hidden');
      } else {
        qualityControl.classList.add('hidden');
      }
    };
  });

  qualityInput.oninput = (e) => {
    qualityVal.textContent = e.target.value;
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

      // 파일 타입에 맞춰 기본 포맷 설정 (자동 감지)
      const mimeType = file.type;
      const formatBtn = document.querySelector(`.btn-format[data-format="${mimeType}"]`);
      if (formatBtn) formatBtn.click();

      showPreview(img, file);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const showPreview = (img, file) => {
  document.getElementById('upload-prompt').style.display = 'none';
  document.getElementById('drop-zone').style.border = 'none';
  document.getElementById('preview-container').style.display = 'block';

  const previewImg = document.getElementById('preview-img');
  previewImg.src = img.src;

  document.getElementById('btn-download').disabled = false;
  document.getElementById('btn-reset').style.display = 'inline-flex';

  setCropRatio('16:9'); // Default
};

const setCropRatio = (ratioType) => {
  const ratioBtn = document.querySelector(`.btn-ratio[data-ratio="${ratioType}"]`);
  if (!ratioBtn) return;

  document.querySelectorAll('.btn-ratio').forEach(b => b.classList.remove('active'));
  ratioBtn.classList.add('active');

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

const updateInfoPanel = () => {
  if (!originalImage) return;

  const w = originalImage.width;
  const h = originalImage.height;

  let resultW, resultH;
  const imgRatio = w / h;

  if (imgRatio > currentRatio) {
    resultH = h;
    resultW = h * currentRatio;
  } else {
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
    ch = h;
    cw = h * currentRatio;
    cy = 0;
    cx = (w - cw) / 2;
  } else {
    cw = w;
    ch = w / currentRatio;
    cx = 0;
    cy = (h - ch) / 2;
  }

  const canvas = cropImage(originalImage, Math.round(cx), Math.round(cy), Math.round(cw), Math.round(ch));
  const quality = parseFloat(document.getElementById('input-quality').value);
  const ext = selectedFormat.split('/')[1].replace('jpeg', 'jpg');
  const fileName = `zen-cropped-${Date.now()}.${ext}`;

  downloadCanvasImage(canvas, fileName, selectedFormat, quality);
};

document.addEventListener('DOMContentLoaded', init);
