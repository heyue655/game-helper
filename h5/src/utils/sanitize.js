import xss from 'xss'

export function sanitizeHtml(html) {
  if (!html) return ''
  return xss(html, {
    whiteList: {
      p: ['style', 'class'],
      br: [],
      span: ['style', 'class'],
      div: ['style', 'class'],
      strong: [],
      b: [],
      em: [],
      i: [],
      u: [],
      a: ['href', 'title', 'target'],
      img: ['src', 'alt', 'title', 'width', 'height', 'style'],
      ul: [],
      ol: [],
      li: [],
      h1: ['style', 'class'],
      h2: ['style', 'class'],
      h3: ['style', 'class'],
      h4: ['style', 'class'],
      h5: ['style', 'class'],
      h6: ['style', 'class'],
      blockquote: [],
      code: [],
      pre: [],
      table: ['border', 'cellpadding', 'cellspacing'],
      tr: [],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  })
}
