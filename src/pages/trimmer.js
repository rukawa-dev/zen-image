import { trimImage } from '../utils/image-utils.js';

let originalImage = null;
let trimmedCanvas = null;

const init = () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const trimBtn = document.getElementById('btn-trim');
  const downloadBtn = document.getElementById('btn-download');
  const toleranceInput = document.getElementById('input-tolerance');

  if (!dropZone) return;

  dropZone.onclick = () => fileInput.click();
  fileInput.onchange = (e) => handleFile(e.target.files[0]);

  // 버튼 클릭 시 트리밍 실행
  trimBtn.onclick = () => updateTrim();
  downloadBtn.onclick = () => downloadImage();

  // 트리밍 파라미터 변경 시 실시간 반영 (선택 사항이나 실시간이 더 좋으므로 유지)
  toleranceInput.oninput = (e) => {
    document.getElementById('tolerance-val').innerText = e.target.value;
    updateTrim();
  };

  dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.classList.add('border-accent');
  };

  dropZone.ondragleave = () => {
    dropZone.classList.remove('border-accent');
  };

  dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-accent');
    handleFile(e.dataTransfer.files[0]);
  };
};

const handleFile = (file) => {
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      originalImage = img;
      updateTrim();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const updateTrim = () => {
  if (!originalImage) return;

  const tolerance = parseInt(document.getElementById('input-tolerance').value);

  // 배경 감지 및 트리밍 실행 (정보와 함께 반환)
  const result = trimImage(originalImage, tolerance);
  trimmedCanvas = result.canvas;

  showPreview(originalImage, result);
};

const showPreview = (origImg, result) => {
  const origPreview = document.getElementById('orig-preview');
  const resPreview = document.getElementById('res-preview');
  const uploadPrompt = document.getElementById('upload-prompt');
  const previewArea = document.getElementById('preview-area');
  const downloadBtn = document.getElementById('btn-download');
  const infoLog = document.getElementById('info-log');

  const { canvas, info } = result;

  // UI 상태 전환
  uploadPrompt.classList.add('opacity-40');
  previewArea.classList.remove('hidden');
  infoLog.classList.remove('hidden');
  downloadBtn.disabled = false;

  // 원본 프리뷰 & 정보
  origPreview.src = origImg.src;
  document.getElementById('orig-res').innerText = `(${origImg.naturalWidth} × ${origImg.naturalHeight} px)`;

  // 결과 프리뷰 & 정보
  resPreview.src = canvas.toDataURL('image/png');
  document.getElementById('res-res').innerText = `(${info.width} × ${info.height} px)`;

  // 트리밍 정보 로그
  document.getElementById('trim-coords').innerText = `(${info.minX}, ${info.minY}) ~ (${info.maxX}, ${info.maxY})`;
};

const downloadImage = () => {
  if (!trimmedCanvas) return;

  const link = document.createElement('a');
  link.href = trimmedCanvas.toDataURL('image/png');
  link.download = `zen-trim-${Date.now()}.png`;
  link.click();
};

document.addEventListener('DOMContentLoaded', init);
