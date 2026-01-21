import { trimImage, downloadCanvasImage } from '../utils/image-utils.js';

let originalImage = null;
let originalFile = null;
let trimmedCanvas = null;
let selectedFormat = 'image/png';

const init = () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const trimBtn = document.getElementById('btn-trim');
  const downloadBtn = document.getElementById('btn-download');
  const toleranceInput = document.getElementById('input-tolerance');
  const formatButtons = document.querySelectorAll('.btn-format');
  const qualityInput = document.getElementById('input-quality');
  const qualityVal = document.getElementById('quality-val');

  if (!dropZone) return;

  dropZone.onclick = () => fileInput.click();
  fileInput.onchange = (e) => handleFile(e.target.files[0]);

  // 버튼 클릭 시 트리밍 실행
  trimBtn.onclick = () => updateTrim();
  downloadBtn.onclick = () => downloadImage();

  // 트리밍 파라미터 변경 시 실시간 반영
  toleranceInput.oninput = (e) => {
    document.getElementById('tolerance-val').innerText = e.target.value;
    updateTrim();
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
      originalFile = file;

      // 파일 타입에 맞춰 기본 포맷 설정 (자동 감지)
      const mimeType = file.type;
      const formatBtn = document.querySelector(`.btn-format[data-format="${mimeType}"]`);
      if (formatBtn) formatBtn.click();

      updateTrim();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const updateTrim = () => {
  if (!originalImage) return;

  const tolerance = parseInt(document.getElementById('input-tolerance').value);

  // 배경 감지 및 트리밍 실행
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

  const quality = parseFloat(document.getElementById('input-quality').value);
  const ext = selectedFormat.split('/')[1].replace('jpeg', 'jpg');
  const fileName = `zen-trim-${Date.now()}.${ext}`;

  downloadCanvasImage(trimmedCanvas, fileName, selectedFormat, quality);
};

document.addEventListener('DOMContentLoaded', init);
