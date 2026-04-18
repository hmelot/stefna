/**
 * Menu OCR pipeline using Claude Vision.
 *
 * Takes a base64-encoded image, returns structured menu items with prices.
 * Uses tool use with strict schema enforcement for reliable JSON output.
 */

export type ExtractedMenuItem = {
  name: string
  price_clp: number | null
  description: string | null
  category: string | null
  confidence: 'high' | 'medium' | 'low'
}

export type OcrResult = {
  currency: string
  items: ExtractedMenuItem[]
  unreadable_regions: string[]
}

const SYSTEM_PROMPT = `You transcribe restaurant and deli menus from photos into structured data.
You are working with Chilean SMB menus. Follow these rules strictly:

<rules>
1. Extract ONLY what is visibly printed. Never invent items, prices, or descriptions.
2. Chilean peso prices use period as thousands separator: $12.900 = 12900, $5.500 = 5500.
3. If multiple prices appear (e.g. half / whole portion), create separate items with descriptive names.
4. Preserve original Spanish spelling and accents exactly as written.
5. Mark confidence="low" for any item that is blurry, handwritten-and-unclear, or partially cropped.
6. If the image is not a menu, return an empty items array and note it in unreadable_regions.
</rules>

<examples>
Input text "Tabla Charcutería Nacional $18.900" → {"name": "Tabla Charcutería Nacional", "price_clp": 18900, ...}
Input text "Copa vino / Botella  $4.500 / $22.000" → two items: "Copa vino" (4500) and "Botella vino" (22000)
</examples>`

const EXTRACTION_TOOL = {
  name: 'save_menu',
  description: 'Save the extracted menu items',
  input_schema: {
    type: 'object',
    properties: {
      currency: { type: 'string', enum: ['CLP', 'USD', 'UNKNOWN'] },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price_clp: { type: ['integer', 'null'], description: 'Price in whole Chilean pesos. $12.900 → 12900. null if not visible.' },
            description: { type: ['string', 'null'] },
            category: { type: ['string', 'null'], description: 'e.g. Entradas, Tablas, Bebidas, Postres' },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          },
          required: ['name', 'price_clp', 'description', 'category', 'confidence'],
        },
      },
      unreadable_regions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Describe sections you could not read',
      },
    },
    required: ['currency', 'items', 'unreadable_regions'],
  },
}

/** Run a single OCR pass on a menu image via Claude Sonnet. */
export async function extractMenu(
  imageBase64: string,
  mediaType: string,
  apiKey: string
): Promise<OcrResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      temperature: 0,
      system: SYSTEM_PROMPT,
      tools: [EXTRACTION_TOOL],
      tool_choice: { type: 'tool', name: 'save_menu' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Extract all menu items using the save_menu tool. Use confidence="low" for anything uncertain.',
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Claude API error ${response.status}: ${errorText.slice(0, 200)}`)
  }

  const data: any = await response.json()
  const toolUse = data.content?.find((c: any) => c.type === 'tool_use' && c.name === 'save_menu')

  if (!toolUse) {
    throw new Error('No tool_use found in Claude response')
  }

  return toolUse.input as OcrResult
}

/**
 * Double-pass extraction: run twice at temp=0 and merge.
 * If results agree on item count and all prices match, high confidence.
 * If they disagree, mark items for human review.
 */
export async function extractMenuDoublePass(
  imageBase64: string,
  mediaType: string,
  apiKey: string
): Promise<{ result: OcrResult; needsReview: boolean; reason?: string }> {
  const [pass1, pass2] = await Promise.all([
    extractMenu(imageBase64, mediaType, apiKey),
    extractMenu(imageBase64, mediaType, apiKey),
  ])

  // If item counts differ by >1, mismatch
  if (Math.abs(pass1.items.length - pass2.items.length) > 1) {
    return {
      result: pass1,
      needsReview: true,
      reason: `Item count mismatch: pass1=${pass1.items.length}, pass2=${pass2.items.length}`,
    }
  }

  // Check if any item has low confidence
  const hasLowConfidence = pass1.items.some(i => i.confidence === 'low')
  if (hasLowConfidence) {
    return { result: pass1, needsReview: true, reason: 'Some items have low confidence' }
  }

  // Check unreadable regions
  if (pass1.unreadable_regions.length > 0) {
    return { result: pass1, needsReview: true, reason: 'Unreadable regions present' }
  }

  // Check price mismatches between passes (match by name)
  const pass2ByName = new Map(pass2.items.map(i => [i.name.toLowerCase().trim(), i.price_clp]))
  let priceMismatches = 0
  for (const item of pass1.items) {
    const otherPrice = pass2ByName.get(item.name.toLowerCase().trim())
    if (otherPrice !== undefined && otherPrice !== item.price_clp) priceMismatches++
  }

  if (priceMismatches > 0) {
    return { result: pass1, needsReview: true, reason: `${priceMismatches} price mismatches between passes` }
  }

  return { result: pass1, needsReview: false }
}
