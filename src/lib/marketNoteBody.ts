function escape(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

// Word-packet links retain their text. Only site-local destinations become links.
export function renderMarketNoteBody(body: string) {
  return body.split(/\n{2,}/).map(paragraph => {
    const html = escape(paragraph).replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const local = href.replace(/^https:\/\/www\.wpbnewconstruction\.com/, '');
      if (!/^\/(?!\/)[^\s]*$/.test(local)) return label;
      const imageLink = /^\/assets\/editorial\/[^?#]+\.(?:jpg|jpeg|png|webp|svg)(?:[?#]|$)/i.test(local);
      return `<a href="${local}"${imageLink ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
    });
    return paragraph.trim() ? `<p>${html}</p>` : '';
  }).join('');
}
