// parseBook.js - handles PDF, TXT, and EPUB parsing
const WORDS_PER_PAGE = 220

function chunkText(text) {
  const words = text.trim().split(/\s+/).filter(Boolean)
    const pages = []
      for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
          pages.push({
                pageNumber: pages.length + 1,
                      text: words.slice(i, i + WORDS_PER_PAGE).join(' '),
                          })
                            }
                              return pages.length > 0 ? pages : [{ pageNumber: 1, text: text }]
                              }

                              async function parseTXT(text) {
                                return chunkText(text)
                                }

                                async function parsePDF(arrayBuffer) {
                                  // Dynamically import pdfjs-dist to avoid SSR issues
                                    const pdfjsLib = await import('pdfjs-dist')

                                        // Use CDN worker to avoid bundling issues
                                          pdfjsLib.GlobalWorkerOptions.workerSrc =
                                              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

                                                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
                                                  let fullText = ''
                                                    for (let i = 1; i <= pdf.numPages; i++) {
                                                        const page = await pdf.getPage(i)
                                                            const content = await page.getTextContent()
                                                                fullText += content.items.map((s) => s.str).join(' ') + '\n'
                                                                  }
                                                                    return chunkText(fullText)
                                                                    }

                                                                    async function parseEPUB(arrayBuffer) {
                                                                      // Basic EPUB parser - EPUB is a ZIP file containing HTML files
                                                                        // For a simple demo, we'll treat the content as text
                                                                          try {
                                                                              const text = new TextDecoder().decode(arrayBuffer)
                                                                                  // Strip HTML tags for basic text extraction
                                                                                      const stripped = text.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ')
                                                                                          return chunkText(stripped)
                                                                                            } catch {
                                                                                                return [{ pageNumber: 1, text: 'Could not parse EPUB file.' }]
                                                                                                  }
                                                                                                  }

                                                                                                  export async function parseFile(file) {
                                                                                                    const name = file.name.toLowerCase()
                                                                                                      const ab = await file.arrayBuffer()
                                                                                                      
                                                                                                        if (name.endsWith('.pdf')) {
                                                                                                            return parsePDF(ab)
                                                                                                              } else if (name.endsWith('.epub')) {
                                                                                                                  return parseEPUB(ab)
                                                                                                                    } else {
                                                                                                                        // TXT or any other text format
                                                                                                                            const text = await file.text()
                                                                                                                                return parseTXT(text)
                                                                                                                                  }
                                                                                                                                  }
