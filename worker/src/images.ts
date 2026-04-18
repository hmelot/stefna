/**
 * Cloudflare Images helpers.
 *
 * We use "Direct Creator Upload" so the browser uploads directly to CF Images
 * without the image body passing through our Worker (saves bandwidth).
 *
 * Flow:
 * 1. Frontend requests signed upload URL via POST /portal/upload-url
 * 2. Worker calls CF Images direct_upload endpoint with auth token
 * 3. CF returns one-time upload URL + image ID
 * 4. Worker returns those to frontend
 * 5. Frontend POSTs file to that URL (multipart/form-data)
 * 6. On success, frontend calls POST /portal/upload-complete with image ID
 * 7. Worker saves to uploads table
 */

export type DirectUploadResponse = {
  uploadURL: string
  imageId: string
}

export async function createDirectUploadUrl(
  accountId: string,
  apiToken: string,
  metadata: Record<string, string> = {}
): Promise<DirectUploadResponse> {
  const formData = new FormData()
  // Add metadata as JSON string
  if (Object.keys(metadata).length > 0) {
    formData.append('metadata', JSON.stringify(metadata))
  }
  // Require signed URLs = false (public images — this is a public marketing site)
  formData.append('requireSignedURLs', 'false')

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}` },
      body: formData,
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`CF Images direct_upload failed ${response.status}: ${text.slice(0, 200)}`)
  }

  const data: any = await response.json()
  if (!data.success) {
    throw new Error(`CF Images error: ${JSON.stringify(data.errors)}`)
  }

  return {
    uploadURL: data.result.uploadURL,
    imageId: data.result.id,
  }
}

/** Build a public delivery URL for a CF Image. */
export function imageDeliveryUrl(accountHash: string, imageId: string, variant = 'public'): string {
  return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`
}

/**
 * Fetch an image from CF Images and return as base64 (for Claude Vision).
 * Works for menu OCR — we pull the image the client uploaded and pipe it to Claude.
 */
export async function fetchImageAsBase64(
  url: string
): Promise<{ base64: string; mediaType: string }> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`)
  const mediaType = response.headers.get('content-type') || 'image/jpeg'
  const buf = await response.arrayBuffer()
  // Convert ArrayBuffer to base64 (Workers-compatible)
  const bytes = new Uint8Array(buf)
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return { base64: btoa(binary), mediaType }
}
