import { formatBytes, downloadCanvasImage } from '../utils/image-utils.js';

let fileQueue = [];
let selectedFormat = 'auto';
let selectedQuality = 0.9;

const init = () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const formatButtons = document.querySelectorAll('.btn-format');
  const qualityInput = document.getElementById('input-quality');
  const qualityVal = document.getElementById('quality-val');
  const btnProcessAll = document.getElementById('btn-process-all');
  const btnDownloadAll = document.getElementById('btn-download-all');
  const btnClear = document.getElementById('btn-clear');

  if (!dropZone) return;

  // 파일 업로드 핸들러
  dropZone.onclick = () => fileInput.click();
  fileInput.onchange = (e) => handleFiles(Array.from(e.target.files));

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
    handleFiles(Array.from(e.dataTransfer.files));
  };

  // 포맷 설정 핸들러
  formatButtons.forEach(btn => {
    btn.onclick = () => {
      formatButtons.forEach(b => b.classList.remove('active', 'border-accent', 'text-accent'));
      btn.classList.add('active', 'border-accent', 'text-accent');
      selectedFormat = btn.dataset.format;

      const qualityControl = document.getElementById('quality-control');
      if (selectedFormat === 'auto' || selectedFormat === 'image/jpeg' || selectedFormat === 'image/webp' || selectedFormat === 'image/png') {
        qualityControl.classList.remove('hidden');
      } else {
        qualityControl.classList.add('hidden');
      }
    };
  });

  qualityInput.oninput = (e) => {
    selectedQuality = parseFloat(e.target.value);
    qualityVal.textContent = selectedQuality;
  };

  // 액션 버튼 핸들러
  btnProcessAll.onclick = () => processAll();
  btnDownloadAll.onclick = () => downloadAll();
  btnClear.onclick = () => clearQueue();
};

const handleFiles = (files) => {
  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  if (imageFiles.length === 0) return;

  imageFiles.forEach(file => {
    const fileId = Date.now() + Math.random().toString(36).substr(2, 9);
    fileQueue.push({
      id: fileId,
      file: file,
      status: 'pending',
      resultBlob: null,
      resultCanvas: null,
      resultSize: 0
    });
  });

  updateUI();
};

const updateUI = () => {
  const container = document.getElementById('file-list-container');
  const body = document.getElementById('file-list-body');
  const countSpan = document.getElementById('file-count');
  const btnProcessAll = document.getElementById('btn-process-all');
  const btnDownloadAll = document.getElementById('btn-download-all');

  if (fileQueue.length === 0) {
    container.classList.add('hidden');
    btnProcessAll.disabled = true;
    btnDownloadAll.disabled = true;
    return;
  }

  container.classList.remove('hidden');
  countSpan.textContent = fileQueue.length;
  btnProcessAll.disabled = !fileQueue.some(item => item.status === 'pending');
  btnDownloadAll.disabled = !fileQueue.some(item => item.status === 'completed');

  body.innerHTML = fileQueue.map(item => `
    <tr class="file-list-item border-b border-border/30 hover:bg-surface/30 transition-colors">
      <td class="px-6 py-4 font-medium text-text-primary max-w-[200px] truncate" title="${item.file.name}">
        ${item.file.name}
      </td>
      <td class="px-6 py-4 text-center text-text-secondary">
        ${formatBytes(item.file.size)}
      </td>
      <td class="px-6 py-4 text-center">
        ${item.status === 'completed' ? `<span class="text-accent font-bold">${formatBytes(item.resultSize)}</span>` : '<span class="opacity-30">---</span>'}
      </td>
      <td class="px-6 py-4 text-center">
        ${getStatusBadge(item.status)}
      </td>
      <td class="px-6 py-4 text-right flex justify-end gap-2">
        ${item.status === 'completed' ? `
          <button onclick="window.downloadSingleFile('${item.id}')" class="text-accent hover:text-accent-hover transition-colors p-2" title="이 파일만 다운로드">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
        ` : ''}
        <button onclick="window.removeFile('${item.id}')" class="text-text-secondary hover:text-red-500 transition-colors p-2" title="제거">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </td>
    </tr>
  `).join('');
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'pending': return '<span class="px-2 py-0.5 bg-bg/50 text-text-secondary text-[10px] rounded border border-border/50 uppercase font-bold tracking-wider">대기중</span>';
    case 'processing': return '<span class="px-2 py-0.5 bg-accent/10 text-accent text-[10px] rounded border border-accent/20 uppercase font-bold tracking-wider animate-pulse">처리중</span>';
    case 'completed': return '<span class="px-2 py-0.5 bg-accent text-bg text-[10px] rounded uppercase font-bold tracking-wider">완료</span>';
    case 'error': return '<span class="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] rounded border border-red-500/20 uppercase font-bold tracking-wider">오류</span>';
    default: return '';
  }
};

const processAll = async () => {
  const pendingItems = fileQueue.filter(item => item.status === 'pending');

  for (const item of pendingItems) {
    item.status = 'processing';
    updateUI();

    try {
      const result = await optimizeImage(item.file);
      item.status = 'completed';
      item.resultCanvas = result.canvas;
      item.resultSize = result.blob.size;
    } catch (err) {
      console.error(err);
      item.status = 'error';
    }
  }
  updateUI();
};

const optimizeImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        const currentFormat = selectedFormat === 'auto' ? file.type : selectedFormat;

        // JPG 변환 시 배경 채우기 로직은 downloadCanvasImage 내부에 있지만 
        // 용량 계산을 위해 여기서도 수행 (최적화)
        let finalCanvas = canvas;
        if (currentFormat === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);

        // PNG 손실 압축 지원 (UPNG.js 사용)
        if (currentFormat === 'image/png' && selectedQuality < 1.0) {
          import('../utils/image-utils.js').then(({ compressPNGWithUPNG }) => {
            compressPNGWithUPNG(canvas, selectedQuality).then(blob => {
              resolve({ canvas, blob });
            });
          });
          return;
        }

        canvas.toBlob((blob) => {
          resolve({ canvas, blob });
        }, currentFormat, selectedQuality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const downloadAll = () => {
  const completedItems = fileQueue.filter(item => item.status === 'completed');
  completedItems.forEach((item, index) => {
    // 다운로드 간격 조정을 위해 약간의 딜레이 (브라우저 정책 우회)
    setTimeout(() => {
      const originalName = item.file.name.split('.')[0];
      const targetFormat = selectedFormat === 'auto' ? item.file.type : selectedFormat;
      const ext = targetFormat.split('/')[1].replace('jpeg', 'jpg');
      const fileName = `${originalName}_zen.${ext}`;
      downloadCanvasImage(item.resultCanvas, fileName, targetFormat, selectedQuality);
    }, index * 200);
  });
};

const clearQueue = () => {
  fileQueue = [];
  updateUI();
};

// Global scope for inline onclick
window.removeFile = (id) => {
  fileQueue = fileQueue.filter(item => item.id !== id);
  updateUI();
};

window.downloadSingleFile = (id) => {
  const item = fileQueue.find(it => it.id === id);
  if (!item || !item.resultCanvas) return;

  const originalName = item.file.name.split('.')[0];
  const targetFormat = selectedFormat === 'auto' ? item.file.type : selectedFormat;
  const ext = targetFormat.split('/')[1].replace('jpeg', 'jpg');
  const fileName = `${originalName}_zen.${ext}`;
  downloadCanvasImage(item.resultCanvas, fileName, targetFormat, selectedQuality);
};

document.addEventListener('DOMContentLoaded', init);
