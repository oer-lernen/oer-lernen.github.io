/**
 * Deutsch-LernOS - Desktop & Startmenü Logik
 * Steuerung der Icons, Menüs, Uhrzeit und Systemfenster
 */

const APPS_CONFIG = [
  {
    id: 'wortarten-labor',
    title: 'Wortarten-Labor',
    windowTitle: 'Das Wortarten-Labor',
    icon: '🧪',
    type: 'iframe',
    src: 'Programme/Das-Wortarten-Labor.html',
    desc: 'Wortarten untersuchen, bestimmen und einordnen',
    width: 980,
    height: 640
  },
  {
    id: 'wortwurfbude',
    title: 'Wortwurfbude',
    windowTitle: 'Die Wortwurfbude',
    icon: '🎪',
    type: 'iframe',
    src: 'Programme/Die-Wortwurfbude.html',
    desc: 'Treffsicher Wortarten und grammatische Formen bestimmen',
    width: 980,
    height: 640
  },
  {
    id: 'kasus-teich',
    title: 'Kasus-Teich',
    windowTitle: 'Der Kasus-Teich',
    icon: '🐟',
    type: 'iframe',
    src: 'Programme/Der-Kasus-Teich.html',
    desc: 'Die 4 Fälle (Nominativ, Genitiv, Dativ, Akkusativ) bestimmen',
    width: 980,
    height: 640
  },
  {
    id: 'zeitfaden',
    title: 'Zeitfaden',
    windowTitle: 'Der Zeitfaden',
    icon: '⏳',
    type: 'iframe',
    src: 'Programme/Der-Zeitfaden.html',
    desc: 'Die Tempusformen auf dem Zeitstrahl ordnen und festigen',
    width: 980,
    height: 640
  }
];

const LEGAL_CONFIG = {
  impressum: {
    id: 'impressum',
    title: 'Impressum',
    icon: '💮',
    type: 'html',
    width: 620,
    height: 520,
    contentHtml: `
      <div class="legal-header-meta">Erstellt mit Hilfe von Claude Opus 5.5 und Gemini 3.8 Flash</div>
      <hr class="legal-divider">
      <h2 class="legal-title">Impressum</h2>
      <hr class="legal-divider">
      <h3 class="legal-section-title">Angaben gemäß § 5 DDG</h3>
      <p class="legal-p">
        Name: Sebastian Wolf<br>
        Anschrift: Graf-Leopold-Ring 2, 94099 Ruhstorf a.d.Rott, Bayern, Deutschland<br>
        E-Mail: s.w.oer@outlook.de
      </p>
      <h3 class="legal-section-title">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</h3>
      <p class="legal-p">
        Sebastian Wolf, [Anschrift wie oben]
      </p>
      <h3 class="legal-section-title">Haftungsausschluss:</h3>
      <p class="legal-p">
        Trotz sorgfältiger inhaltlicher Kontrolle übernehme ich keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
      </p>
    `
  },
  datenschutz: {
    id: 'datenschutz',
    title: 'Datenschutz',
    icon: '🍪',
    type: 'html',
    width: 680,
    height: 520,
    contentHtml: `
      <div class="legal-icon-banner">🍪</div>
      <h2 class="legal-title" style="text-align: center;">Hinweis zum Datenschutz</h2>
      <hr class="legal-divider">
      <p class="legal-p">
        Diese Anwendung speichert ausschließlich technisch notwendige Daten lokal in Ihrem Browser (sog. Local Storage). Diese Daten dienen allein dazu, Ihren Lernfortschritt oder Ihre Einstellungen innerhalb dieser Anwendung zu sichern.
      </p>
      <p class="legal-p">
        Es werden keinerlei personenbezogene Daten erhoben, verarbeitet oder an Dritte übermittelt. Es kommen keine Tracking-Cookies, keine Analyse-Tools und keine externen Skripte zum Einsatz.
      </p>
      <p class="legal-p">
        Die lokal gespeicherten Daten verlassen Ihr Gerät nicht und sind ausschließlich für Sie in Ihrem Browser sichtbar. Sie können die gespeicherten Daten jederzeit löschen, indem Sie den Browser-Cache bzw. die Website-Daten in Ihren Browsereinstellungen leeren.
      </p>
      <p class="legal-p">
        <strong>Rechtsgrundlage:</strong> § 25 Abs. 2 Nr. 2 TDDDG (technisch notwendige Speicherung); Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Funktionsfähigkeit der Anwendung).
      </p>
    `
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.windowManager.init();

  // Desktop Icons rendern
  const desktopIconsContainer = document.getElementById('desktop-icons');

  // 1. Die vier Deutsch-Programme
  APPS_CONFIG.forEach((app) => {
    const iconEl = document.createElement('div');
    iconEl.className = 'desktop-icon';
    iconEl.setAttribute('role', 'button');
    iconEl.setAttribute('tabindex', '0');
    iconEl.setAttribute('aria-label', app.title);
    iconEl.innerHTML = `
      <div class="icon-img-box">${app.icon}</div>
      <span class="icon-title">${app.title}</span>
    `;

    // Öffnen bei Klick (Touch & Desktop optimiert)
    iconEl.addEventListener('click', () => {
      openApp(app.id);
    });
    iconEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openApp(app.id);
      }
    });

    desktopIconsContainer.appendChild(iconEl);
  });

  // Startmenü Toggle
  const startBtn = document.getElementById('start-btn');
  const startMenu = document.getElementById('start-menu');

  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = startMenu.classList.toggle('open');
    startBtn.classList.toggle('open', isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && e.target !== startBtn) {
      startMenu.classList.remove('open');
      startBtn.classList.remove('open');
    }
  });

  // Startmenü Klick-Handler
  startMenu.querySelectorAll('.menu-item').forEach((item) => {
    item.addEventListener('click', () => {
      const appId = item.dataset.app;
      const legalId = item.dataset.legal;
      startMenu.classList.remove('open');
      startBtn.classList.remove('open');

      if (appId) {
        openApp(appId);
      } else if (legalId) {
        openLegal(legalId);
      }
    });
  });

  // Sound Mute Toggle Button
  const muteBtn = document.getElementById('mute-btn');
  const muteIcon = document.getElementById('mute-icon');

  function updateMuteUi() {
    if (window.retroSound.isMuted) {
      muteIcon.textContent = '🔇';
      muteBtn.setAttribute('title', 'Ton aktivieren (Mono-Klick)');
    } else {
      muteIcon.textContent = '🔊';
      muteBtn.setAttribute('title', 'Ton stummschalten');
    }
  }
  updateMuteUi();

  muteBtn.addEventListener('click', () => {
    window.retroSound.toggleMute();
    updateMuteUi();
  });

  // Echtzeit-Uhr
  const clockEl = document.getElementById('clock-display');
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${h}:${m}`;
  }
  updateClock();
  setInterval(updateClock, 1000);
});

function openApp(appId) {
  const app = APPS_CONFIG.find((a) => a.id === appId);
  if (!app) return;

  // Auf kleinen Mobil-Bildschirmen automatisch größer öffnen
  const isMobile = window.innerWidth <= 768;
  const width = isMobile ? window.innerWidth : app.width;
  const height = isMobile ? (window.innerHeight - 42) : app.height;

  window.windowManager.openWindow({
    id: app.id,
    title: app.windowTitle,
    icon: app.icon,
    type: 'iframe',
    src: app.src,
    width,
    height
  });

  if (isMobile) {
    const winData = window.windowManager.windows.get(app.id);
    if (winData && !winData.isMaximized) {
      window.windowManager.toggleMaximize(app.id);
    }
  }
}

function openLegal(legalKey) {
  const cfg = LEGAL_CONFIG[legalKey];
  if (!cfg) return;

  window.windowManager.openWindow({
    id: cfg.id,
    title: cfg.title,
    icon: cfg.icon,
    type: 'html',
    contentHtml: cfg.contentHtml,
    width: cfg.width,
    height: cfg.height
  });
}
