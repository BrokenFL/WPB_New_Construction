export function renderHomepageScopedStyles() {
  return `
    <style id="homepage-scoped-styles">
      .home-future-module {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
        min-height: 332px;
        color: #fffaf1;
        background: var(--editorial-navy);
        overflow: hidden;
      }

      .home-future-module img {
        width: 100%;
        height: 100%;
        min-height: 388px;
        object-fit: cover;
      }

      .home-spotlight-content {
        display: grid;
        align-content: center;
        justify-items: start;
        gap: 14px;
        padding: clamp(24px, 4vw, 56px) clamp(22px, 3vw, 44px);
      }

      .home-spotlight-meta {
        display: grid;
        gap: 8px;
        width: 100%;
        margin: 0;
        align-self: start;
        justify-items: start;
      }

      .home-spotlight-copy {
        display: grid;
        gap: 10px;
      }

      .home-future-module h2 {
        max-width: 16ch;
        margin: 0;
        font-family: Iowan Old Style, Palatino Linotype, Georgia, serif;
        font-size: clamp(1.45rem, 2.05vw, 2.2rem);
        font-weight: 400;
        line-height: 0.98;
      }

      .home-future-module h2 span {
        display: block;
        white-space: nowrap;
      }

      .home-future-module p:not(.eyebrow) {
        max-width: 26ch;
        margin: 0;
        color: rgba(255, 250, 241, 0.72);
        font-size: 0.92rem;
        line-height: 1.65;
      }

      .home-future-module a:last-child {
        margin-top: 2px;
        border: 1px solid rgba(211, 184, 139, 0.5);
        padding: 10px 12px;
        color: #d3b88b;
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-decoration: none;
        text-transform: uppercase;
      }

      .home-advisory-resources {
        display: grid;
        grid-template-columns: minmax(280px, 0.78fr) minmax(520px, 1.22fr);
        gap: 18px;
        padding: clamp(44px, 6vw, 78px) clamp(18px, 5vw, 84px);
        background: #fffaf1;
      }

      .home-brooke-panel {
        display: grid;
        align-content: start;
        padding: clamp(24px, 3vw, 38px);
        color: #fffaf1;
        background:
          linear-gradient(145deg, rgba(16, 45, 67, 0.98), rgba(22, 71, 104, 0.94)),
          var(--editorial-navy);
      }

      .home-brooke-partner-logos {
        display: grid;
        justify-items: start;
        margin-bottom: 14px;
        padding: 12px 12px 10px;
        border: 1px solid rgba(255, 250, 241, 0.1);
        border-radius: 12px;
        background: rgba(255, 250, 241, 0.025);
      }

      .home-brooke-partner-logo {
        display: block;
        width: min(100%, 350px);
        height: auto;
        object-fit: contain;
        filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.08));
      }

      .home-brooke-panel h2 {
        max-width: 16ch;
        margin: 4px 0 0;
        font-family: Iowan Old Style, Palatino Linotype, Georgia, serif;
        font-size: clamp(1.32rem, 1.95vw, 2.6rem);
        font-weight: 400;
        line-height: 0.94;
        white-space: nowrap;
      }

      .home-brooke-panel p:not(.eyebrow) {
        margin: 14px 0 0;
        color: rgba(255, 250, 241, 0.76);
        font-size: 0.9rem;
        line-height: 1.58;
      }

      .home-brooke-panel ul {
        display: grid;
        gap: 8px;
        margin: 16px 0 0;
        padding: 0;
        color: rgba(255, 250, 241, 0.8);
        font-size: 0.78rem;
        list-style: none;
      }

      .home-brooke-panel li::before {
        margin-right: 8px;
        color: #d3b88b;
        content: "+";
      }

      .home-brooke-panel a,
      .home-resource-heading a,
      .home-resource-card em {
        color: #d3b88b;
        font-size: 0.68rem;
        font-style: normal;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-decoration: none;
        text-transform: uppercase;
      }

      .home-brooke-panel a {
        width: fit-content;
        margin-top: 22px;
        border: 1px solid rgba(211, 184, 139, 0.52);
        padding: 11px 13px;
      }

      .home-resource-panel {
        padding: 6px 0;
      }

      .home-resource-heading {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        align-items: center;
        margin-bottom: 12px;
      }

      .home-resource-card {
        display: grid;
        grid-template-rows: 132px auto auto 1fr auto;
        gap: 8px;
        min-width: 0;
        border: 1px solid rgba(154, 122, 79, 0.18);
        padding-bottom: 16px;
        color: inherit;
        background: #fffdf8;
        text-decoration: none;
      }

      .home-resource-card img {
        width: 100%;
        height: 132px;
        object-fit: cover;
      }

      .home-resource-card span,
      .home-resource-card strong,
      .home-resource-card p,
      .home-resource-card em {
        margin-right: 12px;
        margin-left: 12px;
      }

      .home-resource-card span {
        margin-top: 10px;
        color: var(--bronze);
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .home-resource-card strong {
        color: #18201f;
        font-family: Iowan Old Style, Palatino Linotype, Georgia, serif;
        font-size: 1.18rem;
        font-weight: 400;
        line-height: 1.04;
      }

      .home-resource-card p {
        margin-top: 0;
        margin-bottom: 0;
        color: rgba(37, 42, 45, 0.64);
        font-size: 0.75rem;
        line-height: 1.45;
      }

      .home-resource-card em {
        display: inline-flex;
        align-items: center;
        gap: 0.3em;
        color: #164768;
      }

      .home-resource-card em b {
        display: inline;
      }

      .home-compare-launcher {
        display: grid;
        grid-template-columns: minmax(260px, 0.48fr) minmax(560px, 1.52fr);
        gap: clamp(24px, 4vw, 68px);
        padding: clamp(46px, 6vw, 76px) clamp(18px, 5vw, 84px);
        color: #fffaf1;
        background: var(--editorial-navy);
      }

      .home-compare-launcher h2 {
        margin: 8px 0 0;
        font-family: Iowan Old Style, Palatino Linotype, Georgia, serif;
        font-size: clamp(2.3rem, 3.6vw, 4.2rem);
        font-weight: 400;
        line-height: 0.94;
      }

      .home-compare-launcher-copy > p:last-child {
        max-width: 410px;
        color: rgba(255, 250, 241, 0.72);
      }

      .home-compare-form,
      .home-compare-picker-grid,
      .home-compare-preview-grid {
        display: grid;
        gap: 12px;
      }

      .home-compare-picker-grid,
      .home-compare-preview-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .home-compare-picker-grid label {
        display: grid;
        gap: 7px;
        color: #d3b88b;
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .home-compare-picker-grid select {
        width: 100%;
        border: 1px solid rgba(211, 184, 139, 0.52);
        border-radius: 0;
        padding: 11px 12px;
        color: #fffaf1;
        background: rgba(255, 250, 241, 0.08);
      }

      .home-compare-preview {
        display: grid;
        grid-template-columns: 118px minmax(0, 1fr);
        overflow: hidden;
        border: 1px solid rgba(211, 184, 139, 0.32);
        background: rgba(255, 250, 241, 0.06);
      }

      .home-compare-preview img,
      .home-compare-preview .image-placeholder {
        width: 118px;
        height: 96px;
        object-fit: cover;
      }

      .home-compare-preview > div:last-child {
        display: grid;
        align-content: center;
        gap: 6px;
        padding: 10px 12px;
      }

      .home-compare-preview span,
      .home-compare-error {
        color: #d3b88b;
        font-size: 0.58rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .home-compare-preview strong {
        font-family: Iowan Old Style, Palatino Linotype, Georgia, serif;
        font-size: 1.12rem;
        font-weight: 400;
        line-height: 1.02;
      }

      .home-compare-form button {
        width: fit-content;
        border: 1px solid #d3b88b;
        padding: 12px 16px;
        color: var(--editorial-navy);
        background: #fffaf1;
        font-size: 0.66rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .home-compare-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 18px;
        align-items: center;
      }

      .home-compare-actions a {
        color: #d3b88b;
        font-size: 0.66rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-decoration: none;
        text-transform: uppercase;
      }

      @media (max-width: 980px) {
        .home-advisory-resources {
          grid-template-columns: 1fr;
        }

        .home-resource-panel {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .home-compare-launcher {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .home-resource-card {
          grid-template-columns: 112px minmax(0, 1fr);
          grid-template-rows: auto auto 1fr auto;
          gap: 6px 12px;
          padding: 0 12px 0 0;
        }

        .home-resource-card img {
          grid-row: 1 / -1;
          width: 112px;
          height: 100%;
          min-height: 148px;
        }

        .home-resource-card span,
        .home-resource-card strong,
        .home-resource-card p,
        .home-resource-card em {
          margin-right: 0;
          margin-left: 0;
        }

        .home-resource-card span {
          margin-top: 10px;
        }

        .home-resource-card em {
          margin-bottom: 10px;
        }
      }

      @media (max-width: 680px) {
        .home-future-module {
          grid-template-columns: 1fr;
        }

        .home-future-module img {
          min-height: 240px;
        }

        .home-spotlight-content {
          gap: 12px;
          padding: 22px 16px 28px;
        }

        .home-future-module h2 {
          max-width: 12ch;
        }

        .home-team-band {
          padding: 42px 16px;
        }

        .home-team-band figure {
          min-height: 360px;
        }
      }

      @media (max-width: 720px) {
        .home-resource-panel {
          grid-template-columns: 1fr;
        }

        .home-resource-feature {
          display: flex;
          flex-direction: column;
        }

        .home-resource-heading {
          order: 2;
          margin-top: 16px;
          margin-bottom: 0;
        }

        .home-resource-card-featured {
          order: 1;
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: 144px auto auto auto auto;
        }

        .home-resource-card-featured figure {
          grid-row: 1;
          width: 100%;
          height: 144px;
          min-height: 144px;
          padding: 0;
          background: #d8d1c5;
          box-sizing: border-box;
        }

        .home-resource-card-featured figure img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .home-compare-picker-grid,
        .home-compare-preview-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
}
