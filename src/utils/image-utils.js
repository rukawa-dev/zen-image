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
