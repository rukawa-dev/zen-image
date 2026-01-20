import { resizeImage, calculateAspectRatio, formatBytes } from '../utils/image-utils.js';

let originalImage = null;
let originalFile = null;
let lockAspect = true;

const init = () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const widthInput = document.getElementById('input-width');
  const heightInput = document.getElementById('input-height');
  const lockCheck = document.getElementById('check-lock');
  const downloadBtn = document.getElementById('btn-download');

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
  const defaultWidth = 1920;
  const defaultHeight = 1080;
  const dimensions = calculateAspectRatio(img.width, img.height, defaultWidth, defaultHeight, lockAspect);
  document.getElementById('input-width').value = dimensions.width;
  document.getElementById('input-height').value = dimensions.height;

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
  const canvas = resizeImage(originalImage, width, height);

  const link = document.createElement('a');
  link.download = `zen-resized-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

document.addEventListener('DOMContentLoaded', init);
