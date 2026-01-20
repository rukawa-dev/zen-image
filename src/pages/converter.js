import { formatBytes } from '../utils/image-utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const selectFormat = document.getElementById('select-format');
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

  let originalImage = null;
  let convertedBlob = null;
  let originalFile = null;

  // 품질 조절 UI 토글 (JPG, WEBP일 때만 노출)
  const updateQualityUI = () => {
    const format = selectFormat.value;
    if (format === 'image/jpeg' || format === 'image/webp') {
      qualityControl.classList.remove('hidden');
    } else {
      qualityControl.classList.add('hidden');
    }
  };

  selectFormat.onchange = updateQualityUI;
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
        previewArea.classList.remove('hidden');
        btnConvert.disabled = false;
        btnDownload.disabled = true;
        resPreview.src = '';
        resInfo.textContent = '';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // 포맷 변환 실행
  btnConvert.onclick = () => {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext('2d');

    // 배경 채우기 (JPG 변환 시 투명 영역은 검은색 또는 흰색으로 채워짐 - 기본은 투명 유지 또는 채우기)
    // JPG의 경우 투명도가 없으므로 흰색 배경을 먼저 깔아주면 결과가 깔끔함
    if (selectFormat.value === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(originalImage, 0, 0);

    const quality = parseFloat(inputQuality.value);
    const format = selectFormat.value;

    canvas.toBlob((blob) => {
      convertedBlob = blob;
      const url = URL.createObjectURL(blob);
      resPreview.src = url;
      resInfo.textContent = `(${canvas.width}x${canvas.height}, ${formatBytes(blob.size)})`;
      btnDownload.disabled = false;
    }, format, quality);
  };

  // 결과 다운로드
  btnDownload.onclick = () => {
    if (!convertedBlob) return;

    const ext = selectFormat.value.split('/')[1].replace('jpeg', 'jpg');
    const originalName = originalFile.name.split('.')[0];
    const fileName = `${originalName}_converted.${ext}`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(convertedBlob);
    link.download = fileName;
    link.click();
  };
});
