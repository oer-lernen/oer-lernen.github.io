/**
 * Deutsch-LernOS - Retro Window Manager
 * Verwaltet Fenster, Drag & Drop, Resize, Z-Index, Maximieren, Minimieren
 */

class WindowManager {
  constructor() {
    this.windows = new Map();
    this.topZIndex = 100;
    this.container = null;
    this.taskbarContainer = null;
    this.windowCascadeOffset = 0;
  }

  init() {
    this.container = document.getElementById('window-container');
    this.taskbarContainer = document.getElementById('taskbar-windows');
  }

  /**
   * Fenster öffnen oder in den Vordergrund holen
   */
  openWindow(config) {
    const { id, title, icon, type, src, contentHtml, width = 840, height = 560 } = config;

    // Wenn Fenster bereits existiert:
    if (this.windows.has(id)) {
      const winData = this.windows.get(id);
      if (winData.element.classList.contains('minimized')) {
        this.restoreWindow(id);
      }
      this.bringToFront(id);
      return;
    }

    if (window.retroSound) {
      window.retroSound.playWinOpen();
    }

    // Fenster-Element erzeugen
    const winEl = document.createElement('div');
    winEl.className = 'retro-window';
    winEl.id = `win-${id}`;

    // Kaskadierende Startposition auf dem Desktop
    const deskW = window.innerWidth;
    const deskH = window.innerHeight - 42;
    const finalW = Math.min(width, deskW - 40);
    const finalH = Math.min(height, deskH - 40);

    const startX = Math.max(20, Math.min(60 + (this.windowCascadeOffset * 28), deskW - finalW - 20));
    const startY = Math.max(20, Math.min(40 + (this.windowCascadeOffset * 28), deskH - finalH - 20));
    this.windowCascadeOffset = (this.windowCascadeOffset + 1) % 6;

    winEl.style.width = `${finalW}px`;
    winEl.style.height = `${finalH}px`;
    winEl.style.left = `${startX}px`;
    winEl.style.top = `${startY}px`;
    winEl.style.zIndex = ++this.topZIndex;

    // Fenster HTML aufbauen (exakt nach WissOS / Screenshots)
    winEl.innerHTML = `
      <div class="window-titlebar" data-win-id="${id}">
        <div class="titlebar-left">
          <span class="titlebar-icon">${icon}</span>
          <span class="titlebar-title">${title}</span>
        </div>
        <div class="titlebar-controls">
          ${src ? `<button class="win-btn popout" title="In neuem Tab öffnen" data-action="popout">↗</button>` : ''}
          <button class="win-btn minimize" title="Minimieren" data-action="minimize">_</button>
          <button class="win-btn maximize" title="Maximieren" data-action="maximize">🗖</button>
          <button class="win-btn close" title="Schließen" data-action="close">✕</button>
        </div>
      </div>
      <div class="window-content" id="content-${id}">
        ${type === 'iframe' 
          ? `<iframe class="app-iframe" src="${src}" title="${title}"></iframe>` 
          : `<div class="legal-content">${contentHtml}</div>`}
      </div>
      <div class="win-resize-handle" data-win-id="${id}"></div>
    `;

    this.container.appendChild(winEl);

    // Taskbar Tab erzeugen
    const taskTab = document.createElement('div');
    taskTab.className = 'task-tab active';
    taskTab.id = `tab-${id}`;
    taskTab.innerHTML = `<span>${icon}</span><span>${title}</span>`;
    taskTab.addEventListener('click', () => {
      if (winEl.classList.contains('minimized')) {
        this.restoreWindow(id);
      } else if (winEl.classList.contains('active')) {
        this.minimizeWindow(id);
      } else {
        this.bringToFront(id);
      }
    });
    this.taskbarContainer.appendChild(taskTab);

    // Registrierung
    const winData = {
      id,
      element: winEl,
      tab: taskTab,
      isMaximized: false,
      prevRect: { left: startX, top: startY, width: finalW, height: finalH },
      src
    };
    this.windows.set(id, winData);

    // Event Listener für Buttons & Drag
    this.setupWindowEvents(winEl, id);

    requestAnimationFrame(() => {
      winEl.classList.add('visible');
      this.bringToFront(id);
    });
  }

  setupWindowEvents(winEl, id) {
    const titlebar = winEl.querySelector('.window-titlebar');
    const resizeHandle = winEl.querySelector('.win-resize-handle');

    winEl.addEventListener('pointerdown', () => {
      this.bringToFront(id);
    });

    // Button Actions
    titlebar.addEventListener('click', (e) => {
      const btn = e.target.closest('.win-btn');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'close') {
        this.closeWindow(id);
      } else if (action === 'minimize') {
        this.minimizeWindow(id);
      } else if (action === 'maximize') {
        this.toggleMaximize(id);
      } else if (action === 'popout') {
        const winData = this.windows.get(id);
        if (winData && winData.src) {
          window.open(winData.src, '_blank');
        }
      }
    });

    // Doppelklick auf Titelleiste maximiert
    titlebar.addEventListener('dblclick', (e) => {
      if (!e.target.closest('.win-btn')) {
        this.toggleMaximize(id);
      }
    });

    // Dragging Logik (Pointer Events für Touch & Maus)
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let initialWinX = 0, initialWinY = 0;

    titlebar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.win-btn')) return;
      const winData = this.windows.get(id);
      if (winData.isMaximized) return; // Im Vollbild nicht draggen

      isDragging = true;
      titlebar.setPointerCapture(e.pointerId);
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      initialWinX = winEl.offsetLeft;
      initialWinY = winEl.offsetTop;
      this.bringToFront(id);
    });

    titlebar.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      const nextX = Math.max(-winEl.offsetWidth + 80, Math.min(window.innerWidth - 80, initialWinX + deltaX));
      const nextY = Math.max(0, Math.min(window.innerHeight - 42 - 40, initialWinY + deltaY));

      winEl.style.left = `${nextX}px`;
      winEl.style.top = `${nextY}px`;
    });

    const stopDrag = (e) => {
      if (isDragging) {
        isDragging = false;
        try {
          titlebar.releasePointerCapture(e.pointerId);
        } catch (err) {}
      }
    };
    titlebar.addEventListener('pointerup', stopDrag);
    titlebar.addEventListener('pointercancel', stopDrag);

    // Resizing Logik
    let isResizing = false;
    let resizeStartX = 0, resizeStartY = 0;
    let initialW = 0, initialH = 0;

    resizeHandle.addEventListener('pointerdown', (e) => {
      const winData = this.windows.get(id);
      if (winData.isMaximized) return;

      isResizing = true;
      resizeHandle.setPointerCapture(e.pointerId);
      resizeStartX = e.clientX;
      resizeStartY = e.clientY;
      initialW = winEl.offsetWidth;
      initialH = winEl.offsetHeight;
      e.stopPropagation();
    });

    resizeHandle.addEventListener('pointermove', (e) => {
      if (!isResizing) return;
      const deltaW = e.clientX - resizeStartX;
      const deltaH = e.clientY - resizeStartY;
      const newW = Math.max(320, initialW + deltaW);
      const newH = Math.max(220, initialH + deltaH);
      winEl.style.width = `${newW}px`;
      winEl.style.height = `${newH}px`;
    });

    const stopResize = (e) => {
      if (isResizing) {
        isResizing = false;
        try {
          resizeHandle.releasePointerCapture(e.pointerId);
        } catch (err) {}
      }
    };
    resizeHandle.addEventListener('pointerup', stopResize);
    resizeHandle.addEventListener('pointercancel', stopResize);
  }

  bringToFront(id) {
    const winData = this.windows.get(id);
    if (!winData) return;

    this.topZIndex++;
    winData.element.style.zIndex = this.topZIndex;

    // Aktiven Zustand aktualisieren
    this.windows.forEach((w) => {
      w.element.classList.remove('active');
      if (w.tab) w.tab.classList.remove('active');
    });

    winData.element.classList.add('active');
    if (winData.tab) winData.tab.classList.add('active');
  }

  minimizeWindow(id) {
    const winData = this.windows.get(id);
    if (!winData) return;

    winData.element.classList.add('minimized');
    winData.element.classList.remove('active');
    if (winData.tab) winData.tab.classList.remove('active');

    // Nächstes sichtbares Fenster aktivieren
    let nextTop = null;
    let maxZ = -1;
    this.windows.forEach((w, wId) => {
      if (wId !== id && !w.element.classList.contains('minimized')) {
        const z = parseInt(w.element.style.zIndex || 0, 10);
        if (z > maxZ) {
          maxZ = z;
          nextTop = wId;
        }
      }
    });
    if (nextTop) {
      this.bringToFront(nextTop);
    }
  }

  restoreWindow(id) {
    const winData = this.windows.get(id);
    if (!winData) return;

    winData.element.classList.remove('minimized');
    this.bringToFront(id);
  }

  toggleMaximize(id) {
    const winData = this.windows.get(id);
    if (!winData) return;

    const winEl = winData.element;
    const maxBtn = winEl.querySelector('[data-action="maximize"]');

    if (!winData.isMaximized) {
      // Vorherige Geometrie merken
      winData.prevRect = {
        left: winEl.offsetLeft,
        top: winEl.offsetTop,
        width: winEl.offsetWidth,
        height: winEl.offsetHeight
      };
      winEl.classList.add('maximized');
      winData.isMaximized = true;
      if (maxBtn) maxBtn.textContent = '❐';
    } else {
      winEl.classList.remove('maximized');
      winEl.style.left = `${winData.prevRect.left}px`;
      winEl.style.top = `${winData.prevRect.top}px`;
      winEl.style.width = `${winData.prevRect.width}px`;
      winEl.style.height = `${winData.prevRect.height}px`;
      winData.isMaximized = false;
      if (maxBtn) maxBtn.textContent = '🗖';
    }
    this.bringToFront(id);
  }

  closeWindow(id) {
    const winData = this.windows.get(id);
    if (!winData) return;

    if (window.retroSound) {
      window.retroSound.playWinClose();
    }

    winData.element.classList.remove('visible');
    setTimeout(() => {
      if (winData.element && winData.element.parentNode) {
        winData.element.parentNode.removeChild(winData.element);
      }
      if (winData.tab && winData.tab.parentNode) {
        winData.tab.parentNode.removeChild(winData.tab);
      }
      this.windows.delete(id);
    }, 120);
  }
}

window.windowManager = new WindowManager();
