import { cropImage, formatBytes } from '../utils/image-utils.js';

let originalImage = null;
let originalFile = null;
let cropData = { x: 0, y: 0, width: 0, height: 0, aspect: null };

// Crop Interaction State
let isDragging = false;
let dragType = null;
let dragStart = { x: 0, y: 0 };
let cropStart = { x: 0, y: 0, w: 0, h: 0 };

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
    if (e.target.closest('.crop-box')) return;
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

  // Window Resize to update crop UI
  window.addEventListener('resize', updateCropUI);

  // Crop Drag Events
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);
  window.addEventListener('touchmove', onDragMove, { passive: false });
  window.addEventListener('touchend', onDragEnd);

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
  document.getElementById('preview-container').style.display = 'flex';
  const previewImg = document.getElementById('preview-img');
  previewImg.src = img.src;

  updateInfoPanel(img.width, img.height, file.size);
  document.getElementById('btn-download').disabled = false;

  initCropLayer();
  setCropRatio('16:9'); // Default to 16:9 crop

  document.getElementById('btn-reset').style.display = 'inline-flex';
};

const updateInfoPanel = (w, h, size) => {
  document.getElementById('info-panel').style.display = 'block';
  document.getElementById('info-original-size').innerText = `${w}x${h} (${formatBytes(size)})`;
};

const initCropLayer = () => {
  const container = document.getElementById('preview-container');
  let layer = document.getElementById('crop-layer');
  if (layer) layer.remove();

  layer = document.createElement('div');
  layer.id = 'crop-layer';
  layer.style.position = 'absolute';

  // Create Crop Box
  const box = document.createElement('div');
  box.className = 'crop-box';
  box.onmousedown = (e) => startDrag(e, 'move');
  box.ontouchstart = (e) => startDrag(e, 'move');

  // Handles
  ['nw', 'ne', 'sw', 'se'].forEach(pos => {
    const handle = document.createElement('div');
    handle.className = `crop-handle ${pos}`;
    handle.onmousedown = (e) => { e.stopPropagation(); startDrag(e, pos); };
    handle.ontouchstart = (e) => { e.stopPropagation(); startDrag(e, pos); };
    box.appendChild(handle);
  });

  layer.appendChild(box);
  container.appendChild(layer);

  // Default crop
  cropData = { x: 0.1, y: 0.1, width: 0.8, height: 0.8, aspect: null };
  updateCropUI();
};

const updateCropUI = () => {
  if (!originalImage) return;
  const layer = document.getElementById('crop-layer');
  if (!layer) return;

  const container = document.getElementById('preview-container');
  const cRect = container.getBoundingClientRect();

  const imgRatio = originalImage.width / originalImage.height;
  const containerRatio = cRect.width / cRect.height;

  let renderW, renderH, renderX, renderY;

  if (containerRatio > imgRatio) {
    renderH = cRect.height;
    renderW = renderH * imgRatio;
    renderY = 0;
    renderX = (cRect.width - renderW) / 2;
  } else {
    renderW = cRect.width;
    renderH = renderW / imgRatio;
    renderX = 0;
    renderY = (cRect.height - renderH) / 2;
  }

  layer.style.left = `${renderX}px`;
  layer.style.top = `${renderY}px`;
  layer.style.width = `${renderW}px`;
  layer.style.height = `${renderH}px`;

  const box = layer.querySelector('.crop-box');
  box.style.left = `${cropData.x * 100}%`;
  box.style.top = `${cropData.y * 100}%`;
  box.style.width = `${cropData.width * 100}%`;
  box.style.height = `${cropData.height * 100}%`;

  // Update Size Info
  const realW = Math.round(cropData.width * originalImage.width);
  const realH = Math.round(cropData.height * originalImage.height);
  document.getElementById('info-result-size').innerText = `${realW}x${realH}`;
};

const setCropRatio = (ratioType) => {
  document.querySelectorAll('.btn-ratio').forEach(b => b.classList.remove('active'));
  document.querySelector(`.btn-ratio[data-ratio="${ratioType}"]`).classList.add('active');

  let targetRatio = null;
  if (ratioType === '16:9') targetRatio = 16 / 9;
  if (ratioType === '4:3') targetRatio = 4 / 3;
  if (ratioType === '1:1') targetRatio = 1;
  if (ratioType === 'original') targetRatio = originalImage.width / originalImage.height;

  cropData.aspect = targetRatio;

  if (targetRatio) {
    const imgRatio = originalImage.width / originalImage.height;
    if (imgRatio > targetRatio) {
      cropData.height = 1;
      cropData.width = (originalImage.height * targetRatio) / originalImage.width;
    } else {
      cropData.width = 1;
      cropData.height = (originalImage.width / targetRatio) / originalImage.height;
    }
    cropData.x = (1 - cropData.width) / 2;
    cropData.y = (1 - cropData.height) / 2;
  }

  updateCropUI();
};

const startDrag = (e, type) => {
  isDragging = true;
  dragType = type;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  dragStart = { x: clientX, y: clientY };
  cropStart = { ...cropData };
};

const onDragMove = (e) => {
  if (!isDragging) return;
  e.preventDefault();

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const layer = document.getElementById('crop-layer');
  const rect = layer.getBoundingClientRect();

  const dx = (clientX - dragStart.x) / rect.width;
  const dy = (clientY - dragStart.y) / rect.height;

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  if (dragType === 'move') {
    let nx = cropStart.x + dx;
    let ny = cropStart.y + dy;

    nx = clamp(nx, 0, 1 - cropStart.width);
    ny = clamp(ny, 0, 1 - cropStart.height);

    cropData.x = nx;
    cropData.y = ny;
  } else {
    let startW = cropStart.width;
    let startH = cropStart.height;
    let startX = cropStart.x;
    let startY = cropStart.y;

    let newW = startW;
    let newH = startH;
    let newX = startX;
    let newY = startY;

    if (dragType.includes('e')) newW = startW + dx;
    if (dragType.includes('w')) { newW = startW - dx; newX = startX + dx; }
    if (dragType.includes('s')) newH = startH + dy;
    if (dragType.includes('n')) { newH = startH - dy; newY = startY + dy; }

    if (cropData.aspect) {
      const imgRatio = originalImage.width / originalImage.height;
      const aspectFactor = imgRatio / cropData.aspect;
      let proposedH = newW * aspectFactor;

      if (dragType.includes('n')) {
        newY = startY + (startH - proposedH);
      }
      newH = proposedH;
    }

    if (newW < 0.05) {
      newW = 0.05;
      if (cropData.aspect) newH = newW * (originalImage.width / originalImage.height) / cropData.aspect;
      if (dragType.includes('w')) newX = startX + (startW - newW);
      if (dragType.includes('n')) newY = startY + (startH - newH);
    }

    if (newX < 0) { const diff = -newX; newX = 0; newW -= diff; if (cropData.aspect) { newH = newW * (originalImage.width / originalImage.height) / cropData.aspect; if (dragType.includes('n')) newY = startY + (startH - newH); } }
    if (newY < 0) { const diff = -newY; newY = 0; newH -= diff; if (cropData.aspect) { newW = newH / ((originalImage.width / originalImage.height) / cropData.aspect); if (dragType.includes('w')) newX = startX + (startW - newW); } }
    if (newX + newW > 1) { newW = 1 - newX; if (cropData.aspect) { newH = newW * (originalImage.width / originalImage.height) / cropData.aspect; if (dragType.includes('n')) newY = startY + (startH - newH); } }
    if (newY + newH > 1) { newH = 1 - newY; if (cropData.aspect) { newW = newH / ((originalImage.width / originalImage.height) / cropData.aspect); if (dragType.includes('w')) newX = startX + (startW - newW); } }

    cropData.x = newX;
    cropData.y = newY;
    cropData.width = newW;
    cropData.height = newH;
  }

  updateCropUI();
};

const onDragEnd = () => {
  isDragging = false;
};

const download = () => {
  const cx = Math.round(cropData.x * originalImage.width);
  const cy = Math.round(cropData.y * originalImage.height);
  const cw = Math.round(cropData.width * originalImage.width);
  const ch = Math.round(cropData.height * originalImage.height);

  const canvas = cropImage(originalImage, cx, cy, cw, ch);

  const link = document.createElement('a');
  link.download = `zen-cropped-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

document.addEventListener('DOMContentLoaded', init);
