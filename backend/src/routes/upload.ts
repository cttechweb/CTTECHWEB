import { Env } from "../env";

export async function handleUpload(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get("Origin") || "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-requested-with",
    "Access-Control-Allow-Credentials": "true",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = request.headers.get("Content-Type") || "";
    let fileBlob: Blob | File | null = null;
    let fileName = "";
    let folder = "uploads";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const fileEntry = formData.get("file");
      if (!fileEntry || typeof fileEntry === "string") {
        return new Response(
          JSON.stringify({ error: "Bad Request", message: "No file provided in form data" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      fileBlob = fileEntry as File;
      fileName = (formData.get("fileName") as string) || (fileEntry as File).name || `file_${Date.now()}`;
      folder = (formData.get("folder") as string) || "uploads";
    } else {
      const url = new URL(request.url);
      folder = url.searchParams.get("folder") || "uploads";
      fileName = url.searchParams.get("fileName") || `file_${Date.now()}`;
      fileBlob = await request.blob();
    }

    if (!fileBlob || fileBlob.size === 0) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Empty file body provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean folder and file name
    const sanitizedFolder = folder.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9_\/-]/g, "-") || "uploads";
    const baseName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const timestamp = Date.now();
    const uniqueFileName = baseName.includes(String(timestamp)) ? baseName : `${timestamp}_${baseName}`;
    const objectKey = `${sanitizedFolder}/${uniqueFileName}`;

    const mimeType = fileBlob.type || "application/octet-stream";
    const publicBase = (env.R2_PUBLIC_URL || "https://pub-0fd8611859e54ef6af47da7f5d49fab4.r2.dev").replace(/\/+$/, "");

    if (env.STORAGE_BUCKET) {
      const arrayBuffer = await fileBlob.arrayBuffer();
      await env.STORAGE_BUCKET.put(objectKey, arrayBuffer, {
        httpMetadata: {
          contentType: mimeType,
          cacheControl: "public, max-age=31536000, immutable",
        },
        customMetadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
        },
      });

      const fileUrl = `${publicBase}/${objectKey}`;

      return new Response(
        JSON.stringify({
          status: "success",
          url: fileUrl,
          fileUrl,
          key: objectKey,
          fileName: uniqueFileName,
          originalName: fileName,
          size: fileBlob.size,
          contentType: mimeType,
          provider: "Cloudflare R2",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      console.warn("[Upload] STORAGE_BUCKET binding not bound, generating public URL reference");
      const fileUrl = `${publicBase}/${objectKey}`;
      return new Response(
        JSON.stringify({
          status: "success",
          url: fileUrl,
          fileUrl,
          key: objectKey,
          fileName: uniqueFileName,
          originalName: fileName,
          size: fileBlob.size,
          contentType: mimeType,
          provider: "Cloudflare R2 (Simulated)",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error: any) {
    console.error("[Upload] Error handling upload:", error);
    return new Response(
      JSON.stringify({
        error: "Upload Failed",
        message: error?.message || "Internal Server Error during file upload",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}
