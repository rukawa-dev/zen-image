import { resizeImage, calculateAspectRatio, formatBytes, downloadCanvasImage } from '../utils/image-utils.js';

let originalImage = null;
let originalFile = null;
let lockAspect = true;
let selectedFormat = 'image/png';

const init = () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const widthInput = document.getElementById('input-width');
  const heightInput = document.getElementById('input-height');
  const lockCheck = document.getElementById('check-lock');
  const downloadBtn = document.getElementById('btn-download');
  const formatButtons = document.querySelectorAll('.btn-format');
  const qualityInput = document.getElementById('input-quality');
  const qualityVal = document.getElementById('quality-val');

  if (!dropZone) return;

  dropZone.onclick = () => fileInput.click();

  fileInput.onchange = (e) => handleFile(e.target.files[0]);

  dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--accent-color)';
  };

  dropZone.ondragleave = () => {
    dropZone.style.borderColor = 'var(--border-color)';
  };

  dropZone.ondrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  widthInput.oninput = (e) => updateDimensions('width', parseInt(e.target.value));
  heightInput.oninput = (e) => updateDimensions('height', parseInt(e.target.value));
  lockCheck.onchange = (e) => lockAspect = e.target.checked;

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
  document.getElementById('preview-container').style.display = 'flex';
  const previewImg = document.getElementById('preview-img');
  previewImg.src = img.src;

  // Initialize Resize Defaults
  const defaultWidth = img.width;
  const defaultHeight = img.height;
  document.getElementById('input-width').value = defaultWidth;
  document.getElementById('input-height').value = defaultHeight;

  updateInfoPanel(img.width, img.height, file.size);
  document.getElementById('btn-download').disabled = false;
};

const updateInfoPanel = (w, h, size) => {
  document.getElementById('info-panel').style.display = 'block';
  document.getElementById('info-original-size').innerText = `${w}x${h} (${formatBytes(size)})`;
  updateDimensions('width', parseInt(document.getElementById('input-width').value));
};

const updateDimensions = (type, value) => {
  if (!originalImage || !value) return;

  const dimensions = calculateAspectRatio(
    originalImage.width,
    originalImage.height,
    type === 'width' ? value : parseInt(document.getElementById('input-width').value),
    type === 'height' ? value : parseInt(document.getElementById('input-height').value),
    lockAspect
  );

  document.getElementById('input-width').value = dimensions.width;
  document.getElementById('input-height').value = dimensions.height;

  // Update estimate
  const ratio = (dimensions.width * dimensions.height) / (originalImage.width * originalImage.height);
  document.getElementById('info-expected-size').innerText = `~${formatBytes(originalFile.size * ratio)}`;
};

const download = () => {
  const width = parseInt(document.getElementById('input-width').value);
  const height = parseInt(document.getElementById('input-height').value);
  const quality = parseFloat(document.getElementById('input-quality').value);

  const canvas = resizeImage(originalImage, width, height);
  const ext = selectedFormat.split('/')[1].replace('jpeg', 'jpg');
  const fileName = `zen-resized-${Date.now()}.${ext}`;

  downloadCanvasImage(canvas, fileName, selectedFormat, quality);
};

document.addEventListener('DOMContentLoaded', init);
