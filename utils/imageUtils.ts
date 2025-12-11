/**
 * Compresses an image file to a maximum dimension and quality.
 * @param file The original image file.
 * @param maxWidth The maximum width or height of the output image (default 1024px).
 * @param quality The compression quality from 0 to 1 (default 0.6).
 * @returns A Promise resolving to the compressed File object.
 */
export const compressImage = async (file: File, maxWidth = 1024, quality = 0.6): Promise<File> => {
    // If not an image, return original
    if (!file.type.startsWith('image/')) {
        return file;
    }

    try {
        // Advanced method: createImageBitmap (Very fast, low memory)
        if (typeof createImageBitmap !== 'undefined') {
            const bitmap = await createImageBitmap(file);
            const elem = document.createElement('canvas');

            let width = bitmap.width;
            let height = bitmap.height;

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
            if (ctx) {
                ctx.drawImage(bitmap, 0, 0, width, height);
                bitmap.close(); // Important: Release memory immediately

                return new Promise((resolve) => {
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
                });
            }
        }
    } catch (e) {
        console.warn("createImageBitmap failed, falling back to legacy method", e);
    }

    // Legacy Fallback (Slower, higher memory usage but compatible)
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const elem = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

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
                resolve(file);
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

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
            // If even this fails, return original file
            resolve(file);
        };

        img.src = objectUrl;
    });
};
