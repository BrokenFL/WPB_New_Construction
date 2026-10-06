function escape(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

// Word-packet links retain their text. Only site-local destinations become links.
export function renderMarketNoteBody(body: string) {
  return body.split(/\n{2,}/).map(paragraph => {
    const html = escape(paragraph).replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const local = href.replace(/^https:\/\/www\.wpbnewconstruction\.com/, '');
      return /^\/(?!\/)[^\s]*$/.test(local) ? `<a href="${local}">${label}</a>` : label;
    });
    return paragraph.trim() ? `<p>${html}</p>` : '';
  }).join('');
}
