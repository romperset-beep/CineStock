
/**
 * Compresses an image file to a maximum dimension and quality.
 * @param file The original image file.
 * @param maxWidth The maximum width or height of the output image (default 1280px).
 * @param quality The compression quality from 0 to 1 (default 0.7).
 * @returns A Promise resolving to the compressed File object.
 */
export const compressImage = async (file: File, maxWidth = 1280, quality = 0.7): Promise<File> => {
    // If not an image, return original
    if (!file.type.startsWith('image/')) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        // Use createObjectURL instead of FileReader to avoid reading the whole file into memory string
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            // Clean up memory
            URL.revokeObjectURL(objectUrl);

            const elem = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxWidth) {
                    width *= maxWidth / height;
                    height = maxWidth;
                }
            }

            elem.width = width;
            elem.height = height;

            const ctx = elem.getContext('2d');
            if (!ctx) {
                resolve(file); // Fallback
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Convert to Blob and then File
            ctx.canvas.toBlob((blob) => {
                if (!blob) {
                    resolve(file);
                    return;
                }
                const newFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                resolve(newFile);
            }, 'image/jpeg', quality);
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(objectUrl);
            reject(err);
        };

        img.src = objectUrl;
    });
};
