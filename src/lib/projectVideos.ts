/**
 * Project video tours (YouTube).
 *
 * Brooke's 60-second building reels and Rigby's 3D flythrough renders get
 * registered here by project id. Both the prerendered static HTML (SEO +
 * VideoObject schema) and the client-side project views read this file, so a
 * new entry appears everywhere at once.
 *
 * To add a video: append { youtubeId, title, duration, uploadDate } to the
 * project's array. youtubeId is the 11-character id in the watch URL.
 * duration is ISO 8601 (e.g. "PT1M" for a 60-second reel).
 */

export interface ProjectVideo {
  youtubeId: string;
  title: string;
  /** ISO 8601 duration, e.g. "PT1M". */
  duration?: string;
  /** Upload date YYYY-MM-DD. Required for Google video rich results. */
  uploadDate?: string;
}

export const projectVideos: Record<string, ProjectVideo[]> = {
  // Example:
  // olara: [
  //   { youtubeId: "dQw4w9WgXcQ", title: "Olara West Palm Beach — 60-second building intro", duration: "PT1M", uploadDate: "2026-10-05" },
  // ],
};

export function videosForProject(projectId: string): ProjectVideo[] {
  return projectVideos[projectId] ?? [];
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Performance-safe facade: the YouTube thumbnail loads, the iframe only
 * swaps in when the visitor clicks. A delegated click handler (see
 * initProjectVideoFacades in main.ts) performs the swap; without JS the
 * thumbnail links straight to the YouTube watch page.
 */
export function renderProjectVideoSection(projectId: string, projectName: string): string {
  const videos = videosForProject(projectId);
  if (!videos.length) return "";
  const cards = videos
    .map(
      (video) => `
        <article class="project-video-card">
          <button type="button" class="project-video-facade" data-youtube-facade="${esc(video.youtubeId)}" data-youtube-title="${esc(video.title)}" aria-label="Play video: ${esc(video.title)}">
            <img src="https://i.ytimg.com/vi/${esc(video.youtubeId)}/hqdefault.jpg" alt="${esc(video.title)} video thumbnail" loading="lazy" decoding="async" width="480" height="360" />
            <span class="project-video-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="44" height="44"><circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.55)"/><path d="M10 8.5v7l6-3.5z" fill="#fff"/></svg></span>
          </button>
          <p class="project-video-title">${esc(video.title)}</p>
          <noscript><p><a href="https://www.youtube.com/watch?v=${esc(video.youtubeId)}" target="_blank" rel="noopener">Watch on YouTube</a></p></noscript>
        </article>`,
    )
    .join("");
  return `
    <section class="project-video-section" data-project-section="videos" aria-label="Video tours for ${esc(projectName)}">
      <h2>Video tours</h2>
      <p>Building intros and 3D walkthroughs for ${esc(projectName)}. Videos stream from YouTube and do not slow down this page.</p>
      <div class="project-video-grid">${cards}</div>
    </section>`;
}

/** VideoObject schema entries for the JSON-LD graph (only when uploadDate is set). */
export function projectVideoSchemas(projectId: string): Array<Record<string, unknown>> {
  return videosForProject(projectId)
    .filter((video) => video.uploadDate)
    .map((video) => ({
      "@type": "VideoObject",
      name: video.title,
      description: `${video.title} — West Palm Beach new construction video tour.`,
      thumbnailUrl: `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`,
      uploadDate: video.uploadDate,
      ...(video.duration ? { duration: video.duration } : {}),
      embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
      contentUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
    }));
}
