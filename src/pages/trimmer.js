import { ICON_SPECS } from '../utils/icon-specs.js';
import { resizeImage } from '../utils/image-utils.js';

let originalImage = null;
let isProcessing = false;

const init = () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const exportBtn = document.getElementById('btn-export');

  if (!dropZone) return;

  dropZone.onclick = () => fileInput.click();
  fileInput.onchange = (e) => handleFile(e.target.files[0]);
  exportBtn.onclick = () => exportIcons();

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
};

const handleFile = (file) => {
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      originalImage = img;
      showPreview(img);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const showPreview = (img) => {
  document.getElementById('upload-prompt').style.display = 'none';
  document.getElementById('preview-container').style.display = 'flex';
  document.getElementById('preview-img').src = img.src;
  document.getElementById('btn-export').disabled = false;
  document.getElementById('status-panel').style.display = 'block';
};

const exportIcons = async () => {
  if (isProcessing || !originalImage) return;

  isProcessing = true;
  const exportBtn = document.getElementById('btn-export');
  const statusText = document.getElementById('status-text');

  exportBtn.disabled = true;
  statusText.innerText = '아이콘 생성 중...';

  const zip = new JSZip();
  const exportIos = document.getElementById('check-ios').checked;
  const exportAndroid = document.getElementById('check-android').checked;

  try {
    if (exportIos) {
      const iosFolder = zip.folder("ios");
      for (const spec of ICON_SPECS.ios) {
        const canvas = resizeImage(originalImage, spec.size, spec.size);
        const blob = await canvasToBlob(canvas);
        iosFolder.file(spec.name, blob);
      }
    }

    if (exportAndroid) {
      const androidFolder = zip.folder("android");
      for (const spec of ICON_SPECS.android) {
        const canvas = resizeImage(originalImage, spec.size, spec.size);
        const blob = await canvasToBlob(canvas);
        androidFolder.file(spec.name, blob);
      }
    }

    statusText.innerText = 'ZIP 파일 압축 중...';
    const content = await zip.generateAsync({ type: "blob" });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `zen-icons-${Date.now()}.zip`;
    link.click();

    statusText.innerText = '다운로드 완료!';
  } catch (error) {
    console.error(error);
    statusText.innerText = '오류가 발생했습니다.';
  } finally {
    isProcessing = false;
    exportBtn.disabled = false;
  }
};

const canvasToBlob = (canvas) => {
  return new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png');
  });
};

document.addEventListener('DOMContentLoaded', init);
