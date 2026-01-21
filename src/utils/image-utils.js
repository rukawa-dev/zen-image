export const resizeImage = (image, width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 고품질 리사이징을 위한 설정
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
};

export const calculateAspectRatio = (originalWidth, originalHeight, targetWidth, targetHeight, lockAspect) => {
  if (!lockAspect) return { width: targetWidth, height: targetHeight };

  const ratio = originalWidth / originalHeight;
  if (targetWidth !== originalWidth) {
    return { width: targetWidth, height: Math.round(targetWidth / ratio) };
  } else {
    return { width: Math.round(targetHeight * ratio), height: targetHeight };
  }
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const cropImage = (image, cropX, cropY, cropWidth, cropHeight) => {
  const canvas = document.createElement('canvas');
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const ctx = canvas.getContext('2d');

  // 고품질 설정을 유지
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return canvas;
};

/**
 * 이미지 배경을 자동으로 감지하여 객체 영역만 잘라냄
 * @param {HTMLImageElement|HTMLCanvasElement} source 
 * @param {number} tolerance 배경 감지 오차 범위 (0~255)
 * @returns {Object} { canvas: HTMLCanvasElement, info: { minX, minY, maxX, maxY, width, height } }
 */
export function trimImage(source, tolerance = 30) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const srcWidth = source.width || source.naturalWidth;
  const srcHeight = source.height || source.naturalHeight;

  canvas.width = srcWidth;
  canvas.height = srcHeight;
  ctx.drawImage(source, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // 좌상단(0,0) 픽셀을 배경색으로 감지
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];
  const bgA = data[3];

  let minX = width, minY = height, maxX = 0, maxY = 0;
  let found = false;

  // 1차 스캔: 경계 탐색
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      const diff = Math.sqrt(
        Math.pow(r - bgR, 2) +
        Math.pow(g - bgG, 2) +
        Math.pow(b - bgB, 2) +
        Math.pow(a - bgA, 2)
      );

      if (diff > tolerance && a > 10) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        found = true;
      }
    }
  }

  if (!found) {
    return {
      canvas,
      info: { minX: 0, minY: 0, maxX: width - 1, maxY: height - 1, width, height }
    };
  }

  const trimWidth = (maxX - minX) + 1;
  const trimHeight = (maxY - minY) + 1;

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = trimWidth;
  resultCanvas.height = trimHeight;
  const resultCtx = resultCanvas.getContext('2d');

  // 잘라낸 영역 그리기 (효율적인 drawImage 사용)
  resultCtx.drawImage(
    canvas,
    minX, minY, trimWidth, trimHeight,
    0, 0, trimWidth, trimHeight
  );

  return {
    canvas: resultCanvas,
    info: { minX, minY, maxX, maxY, width: trimWidth, height: trimHeight }
  };
}

/**
 * 캔버스를 특정 포맷과 품질로 다운로드
 * @param {HTMLCanvasElement} canvas 
 * @param {string} fileName 
 * @param {string} format 'image/png', 'image/jpeg', 'image/webp'
 * @param {number} quality 0.0 ~ 1.0 (PNG의 경우 색상 수 결정에 사용)
 */
export const downloadCanvasImage = async (canvas, fileName, format = 'image/png', quality = 0.92) => {
  let blob;

  if (format === 'image/png' && quality < 1.0) {
    // UPNG.js를 사용한 손실 압축
    blob = await compressPNGWithUPNG(canvas, quality);
  } else if (format === 'image/jpeg') {
    // JPG 전환 시 투명도 처리 (흰색 배경)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0);
    blob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/jpeg', quality));
  } else {
    // 기본 브라우저 API (WEBP, Lossless PNG 등)
    blob = await new Promise(resolve => canvas.toBlob(resolve, format, quality));
  }

  if (!blob) return;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 100);
};

/**
 * UPNG.js를 사용하여 PNG 이미지를 손실 압축
 * @param {HTMLCanvasElement} canvas 
 * @param {number} quality 0.0 ~ 1.0
 * @returns {Promise<Blob>}
 */
export const compressPNGWithUPNG = (canvas, quality) => {
  return new Promise((resolve) => {
    if (typeof UPNG === 'undefined') {
      console.warn('UPNG.js is not loaded. Falling back to default PNG.');
      canvas.toBlob(resolve, 'image/png');
      return;
    }

    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // quality에 따라 색상 수 결정 (0.0~1.0 -> 2~256 colors)
    // 0.9 -> 약 230색, 0.5 -> 약 128색 등으로 매핑
    const colors = Math.max(2, Math.round(256 * quality));
    
    const output = UPNG.encode([imgData.data.buffer], canvas.width, canvas.height, colors);
    const blob = new Blob([output], { type: 'image/png' });
    resolve(blob);
  });
};
