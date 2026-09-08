import { storage, ref, uploadBytesResumable, getDownloadURL } from "../lib/firebase";
import { getGeneralSettings } from "./generalSettingsService";

/**
 * Upload a product image file to Cloudflare R2 / Firebase Cloud Storage.
 * Supports direct Cloudflare R2 Worker endpoint or Firebase Cloud Storage,
 * with automatic fallback to high-resolution Base64 data URL.
 */
export async function uploadProductImage(
  file: File,
  folder = "products",
  onProgress?: (progress: number) => void
): Promise<{ url: string; isCloud: boolean; provider: string }> {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid file type. Please upload an image (JPG, PNG, WebP, SVG).");
  }

  const settings = getGeneralSettings();
  const provider = settings.storageProvider || "cloudflare";
  const endpoint = settings.cloudflareUploadEndpoint || "https://cooltech-api-worker.ctauhweb.workers.dev/api/upload";
  const publicDomain = (settings.cloudflarePublicDomain || "https://pub-0fd8611859e54ef6af47da7f5d49fab4.r2.dev").replace(/\/+$/, "");
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${timestamp}_${sanitizedName}`;

  // 1. Check for Cloudflare Upload Endpoint (Worker or Presigned URL)
  if (provider === "cloudflare" && endpoint) {
    try {
      if (onProgress) onProgress(20);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("fileName", fileName);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (onProgress) onProgress(100);
        const fileUrl = data.url || data.fileUrl || `${publicDomain}/${folder}/${fileName}`;
        return { url: fileUrl, isCloud: true, provider: "Cloudflare R2" };
      }
    } catch (cloudflareErr) {
      console.warn("[CloudflareStorage] Worker upload failed, testing fallback:", cloudflareErr);
    }
  }

  // 2. Try Firebase Cloud Storage Upload
  try {
    const storagePath = `${folder}/${fileName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });

    return await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          console.warn("[Storage] Cloud upload encountered error, falling back to local Base64:", error);
          readAsBase64(file)
            .then((dataUrl) => resolve({ url: dataUrl, isCloud: false, provider: "Local Base64" }))
            .catch(reject);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve({ url: downloadUrl, isCloud: true, provider: "Cloud Storage" });
          } catch (err) {
            console.warn("[Storage] Error retrieving download URL, using Base64 fallback:", err);
            const dataUrl = await readAsBase64(file);
            resolve({ url: dataUrl, isCloud: false, provider: "Local Base64" });
          }
        }
      );
    });
  } catch (err) {
    console.warn("[Storage] Cloud upload exception, using Base64 fallback:", err);
    const dataUrl = await readAsBase64(file);
    return { url: dataUrl, isCloud: false, provider: "Local Base64" };
  }
}

/**
 * Upload a document or resume file (PDF, DOC, DOCX, TXT, etc.)
 */
export async function uploadDocumentFile(
  file: File,
  folder = "resumes",
  onProgress?: (progress: number) => void
): Promise<{ url: string; isCloud: boolean; provider: string; fileName: string }> {
  const settings = getGeneralSettings();
  const provider = settings.storageProvider || "cloudflare";
  const endpoint = settings.cloudflareUploadEndpoint || "https://cooltech-api-worker.ctauhweb.workers.dev/api/upload";
  const publicDomain = (settings.cloudflarePublicDomain || "https://pub-0fd8611859e54ef6af47da7f5d49fab4.r2.dev").replace(/\/+$/, "");
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${timestamp}_${sanitizedName}`;

  if (onProgress) onProgress(20);

  // 1. Check for Cloudflare Upload Endpoint with 6s Timeout
  if (provider === "cloudflare" && endpoint) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("fileName", fileName);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (onProgress) onProgress(100);
        const fileUrl = data.url || data.fileUrl || `${publicDomain}/${folder}/${fileName}`;
        return { url: fileUrl, isCloud: true, provider: "Cloudflare R2", fileName: file.name };
      }
    } catch (cloudflareErr) {
      console.warn("[CloudflareStorage] Document upload failed/timed out, falling back:", cloudflareErr);
    }
  }

  // 2. Try Firebase Cloud Storage Upload with 2.5s Timeout Fallback
  try {
    const storagePath = `${folder}/${fileName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type || "application/octet-stream",
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });

    return await new Promise((resolve) => {
      let isResolved = false;

      // 2.5s safety timeout -> fallback to Base64
      const timeoutTimer = setTimeout(async () => {
        if (!isResolved) {
          isResolved = true;
          try {
            if (onProgress) onProgress(80);
            const dataUrl = await readAsBase64(file);
            if (onProgress) onProgress(100);
            resolve({ url: dataUrl, isCloud: false, provider: "Local Base64", fileName: file.name });
          } catch {
            resolve({ url: "", isCloud: false, provider: "None", fileName: file.name });
          }
        }
      }, 2500);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress && !isResolved) onProgress(Math.round(progress));
        },
        async (error) => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeoutTimer);
            console.warn("[Storage] Document cloud upload error, fallback to Base64:", error);
            const dataUrl = await readAsBase64(file);
            if (onProgress) onProgress(100);
            resolve({ url: dataUrl, isCloud: false, provider: "Local Base64", fileName: file.name });
          }
        },
        async () => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeoutTimer);
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              if (onProgress) onProgress(100);
              resolve({ url: downloadUrl, isCloud: true, provider: "Cloud Storage", fileName: file.name });
            } catch (err) {
              console.warn("[Storage] Document URL retrieval error, fallback to Base64:", err);
              const dataUrl = await readAsBase64(file);
              if (onProgress) onProgress(100);
              resolve({ url: dataUrl, isCloud: false, provider: "Local Base64", fileName: file.name });
            }
          }
        }
      );
    });
  } catch (err) {
    console.warn("[Storage] Document upload exception, using Base64 fallback:", err);
    const dataUrl = await readAsBase64(file);
    if (onProgress) onProgress(100);
    return { url: dataUrl, isCloud: false, provider: "Local Base64", fileName: file.name };
  }
}

/**
 * Utility helper to convert a File into a Data URL
 */
export function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

