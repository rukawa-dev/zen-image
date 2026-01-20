import { formatBytes } from '../utils/image-utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const formatButtons = document.querySelectorAll('.btn-format');
  const qualityControl = document.getElementById('quality-control');
  const inputQuality = document.getElementById('input-quality');
  const qualityVal = document.getElementById('quality-val');
  const btnConvert = document.getElementById('btn-convert');
  const btnDownload = document.getElementById('btn-download');
  const previewArea = document.getElementById('preview-area');
  const origPreview = document.getElementById('orig-preview');
  const resPreview = document.getElementById('res-preview');
  const origInfo = document.getElementById('orig-info');
  const resInfo = document.getElementById('res-info');
  const resInfoMsg = document.getElementById('res-info-msg');
  const infoLog = document.getElementById('info-log');

  let originalImage = null;
  let originalFile = null;
  let selectedFormat = 'image/png';
  let convertedBlob = null;

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
      updateQualityUI();
    };
  });

  // 품질 조절 UI 토글 (JPG, WEBP일 때만 노출)
  const updateQualityUI = () => {
    if (selectedFormat === 'image/jpeg' || selectedFormat === 'image/webp') {
      qualityControl.classList.remove('hidden');
    } else {
      qualityControl.classList.add('hidden');
    }
  };

  inputQuality.oninput = () => {
    qualityVal.textContent = inputQuality.value;
  };

  // 파일 업로드 처리
  dropZone.onclick = () => fileInput.click();

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.classList.add('border-accent', 'bg-accent/5');
  };

  dropZone.ondragleave = () => {
    dropZone.classList.remove('border-accent', 'bg-accent/5');
  };

  dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-accent', 'bg-accent/5');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const handleFile = (file) => {
    originalFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        origPreview.src = e.target.result;
        origInfo.textContent = `(${img.width}x${img.height}, ${formatBytes(file.size)})`;

        // 포맷 뱃지 업데이트
        const origFormatBadge = document.getElementById('orig-format');
        const ext = file.type.split('/')[1].replace('jpeg', 'jpg').toUpperCase();
        origFormatBadge.textContent = ext;
        origFormatBadge.classList.remove('hidden');

        document.getElementById('upload-prompt').classList.add('opacity-40');
        previewArea.classList.remove('hidden');
        btnConvert.disabled = false;
        btnDownload.disabled = true;
        resPreview.src = '';
        resInfo.textContent = '';
        document.getElementById('res-format').classList.add('hidden');
        infoLog.classList.add('hidden');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // 포맷 변환 실행
  btnConvert.onclick = () => {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    canvas.width = originalImage.naturalWidth;
    canvas.height = originalImage.naturalHeight;
    const ctx = canvas.getContext('2d');

    // JPG 전환 시 흰색 배경
    if (selectedFormat === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(originalImage, 0, 0);

    const quality = parseFloat(inputQuality.value);

    canvas.toBlob((blob) => {
      convertedBlob = blob;
      const url = URL.createObjectURL(blob);
      resPreview.src = url;
      resInfo.textContent = `(${canvas.width}x${canvas.height}, ${formatBytes(blob.size)})`;

      // 결과 포맷 뱃지 업데이트
      const resFormatBadge = document.getElementById('res-format');
      const resExt = selectedFormat.split('/')[1].replace('jpeg', 'jpg').toUpperCase();
      resFormatBadge.textContent = resExt;
      resFormatBadge.classList.remove('hidden');

      const extDisplay = selectedFormat.split('/')[1].toUpperCase();
      resInfoMsg.textContent = `${extDisplay} 포맷으로 변환이 완료되었습니다. (${formatBytes(blob.size)})`;
      infoLog.classList.remove('hidden');

      btnDownload.disabled = false;
    }, selectedFormat, quality);
  };

  // 결과 다운로드
  btnDownload.onclick = () => {
    if (!convertedBlob) return;

    const ext = selectedFormat.split('/')[1].replace('jpeg', 'jpg');
    const originalName = originalFile.name.split('.')[0];
    const fileName = `${originalName}_converted.${ext}`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(convertedBlob);
    link.download = fileName;
    link.click();
  };
});
