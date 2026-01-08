export const resizeImage = (
  file,
  maxWidth = 200,
  maxHeight = 200,
  quality = 0.8,
) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        },
        file.type,
        quality,
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

export const cropToSquare = (file, size = 200, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      const minDimension = Math.min(width, height);

      const startX = (width - minDimension) / 2;
      const startY = (height - minDimension) / 2;

      canvas.width = size;
      canvas.height = size;

      ctx.drawImage(
        img,
        startX,
        startY,
        minDimension,
        minDimension,
        0,
        0,
        size,
        size,
      );

      canvas.toBlob(
        (blob) => {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        },
        file.type,
        quality,
      );
    };

    img.src = URL.createObjectURL(file);
  });
};
