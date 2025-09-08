// Window management
let activeWindow = null;
let isDragging = false;
let isResizing = false;
let startX, startY, startLeft, startTop, startWidth, startHeight;
let zIndexCounter = 100;
let minimizedWindows = new Set();

// Icon click handlers
document.querySelectorAll(".desktop-icon").forEach((icon) => {
  icon.addEventListener("click", function () {
    // Remove selection from other icons
    document
      .querySelectorAll(".desktop-icon")
      .forEach((i) => i.classList.remove("selected"));
    this.classList.add("selected");
  });

  // Double-click to open
  icon.addEventListener("dblclick", function () {
    const windowId = this.dataset.window;
    const action = this.dataset.action;

    if (windowId) {
      openWindow(windowId);
    } else if (action === "linkedin") {
      window.open(
        "https://www.linkedin.com/in/shafin-rezwan-b0415a203/",
        "_blank"
      );
    } else if (action === "github") {
      window.open("https://github.com/ShafinRezwan", "_blank");
    }
  });
});

// Single click on desktop to deselect icons
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("desktop") || e.target.tagName === "BODY") {
    document
      .querySelectorAll(".desktop-icon")
      .forEach((i) => i.classList.remove("selected"));
  }
});

function openWindow(windowId) {
  const win = document.getElementById(windowId + "-window");
  if (!win) return;

  // restore if minimized
  if (minimizedWindows.has(windowId)) {
    restoreWindow(windowId);
    return;
  }

  // show and bring to front
  win.style.display = "block";
  win.style.zIndex = ++zIndexCounter;

  // if no position set yet, choose a sensible one
  const isMobile = window.innerWidth <= 768;
  if (!win.style.left || !win.style.top) {
    if (isMobile) {
      // mobile: make it fit and center
      win.style.width = "95vw";
      win.style.height = "calc(85vh - 40px)";
      centerWindow(win);
    } else {
      // desktop: random-ish then clamp
      win.style.left = Math.random() * 200 + 100 + "px";
      win.style.top = Math.random() * 100 + 50 + "px";
      clampWindowToViewport(win);
    }
  } else {
    // ensure previous positions are still visible in current viewport
    clampWindowToViewport(win);
  }

  setActiveWindow(win);
  addToTaskbar(windowId);
}

const TASKBAR_HEIGHT = 40;

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function clampWindowToViewport(win) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const rect = win.getBoundingClientRect();

  const maxLeft = Math.max(0, vw - rect.width);
  const maxTop = Math.max(0, vh - rect.height - TASKBAR_HEIGHT);

  const left = clamp(
    parseInt(win.style.left || rect.left, 10) || 0,
    0,
    maxLeft
  );
  const top = clamp(parseInt(win.style.top || rect.top, 10) || 0, 0, maxTop);

  win.style.left = left + "px";
  win.style.top = top + "px";
}

function centerWindow(win) {
  win.style.display = "block"; // must be visible to measure
  // give the browser a tick to layout (safer on iOS)
  const rect = win.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const left = clamp(
    Math.round((vw - rect.width) / 2),
    0,
    Math.max(0, vw - rect.width)
  );
  const top = clamp(
    Math.round((vh - rect.height) / 3),
    0,
    Math.max(0, vh - rect.height - TASKBAR_HEIGHT)
  );
  win.style.left = left + "px";
  win.style.top = top + "px";
}

function addToTaskbar(windowId) {
  // Don't add if already exists
  if (document.querySelector(`.taskbar-item[data-window="${windowId}"]`)) {
    return;
  }

  const taskbar = document.querySelector(".taskbar");
  const spacer = document.querySelector(".taskbar-spacer");
  const taskbarItem = document.createElement("div");
  taskbarItem.className = "taskbar-item";
  taskbarItem.dataset.window = windowId;
  taskbarItem.textContent = getWindowTitle(windowId);

  taskbarItem.addEventListener("click", function () {
    if (minimizedWindows.has(windowId)) {
      restoreWindow(windowId);
    } else {
      const window = document.getElementById(windowId + "-window");
      if (window.style.display === "block") {
        minimizeWindow(windowId);
      } else {
        openWindow(windowId);
      }
    }
  });

  taskbar.insertBefore(taskbarItem, spacer);
}

function removeFromTaskbar(windowId) {
  const taskbarItem = document.querySelector(
    `.taskbar-item[data-window="${windowId}"]`
  );
  if (taskbarItem) {
    taskbarItem.remove();
  }
}

function minimizeWindow(windowId) {
  const window = document.getElementById(windowId + "-window");
  const taskbarItem = document.querySelector(
    `.taskbar-item[data-window="${windowId}"]`
  );

  if (window) {
    window.style.display = "none";
    minimizedWindows.add(windowId);

    if (taskbarItem) {
      taskbarItem.classList.remove("active");
    }

    // Set next window as active
    const visibleWindows = document.querySelectorAll(
      '.window[style*="display: block"]'
    );
    if (visibleWindows.length > 0) {
      setActiveWindow(visibleWindows[visibleWindows.length - 1]);
    } else {
      activeWindow = null;
    }
  }
}

function restoreWindow(windowId) {
  const window = document.getElementById(windowId + "-window");
  const taskbarItem = document.querySelector(
    `.taskbar-item[data-window="${windowId}"]`
  );

  if (window) {
    window.style.display = "block";
    window.style.zIndex = ++zIndexCounter;
    minimizedWindows.delete(windowId);
    setActiveWindow(window);

    if (taskbarItem) {
      taskbarItem.classList.add("active");
    }
  }
}

function getWindowTitle(windowId) {
  const titles = {
    about: "About Me",
    resume: "Resume",
    contact: "Contact",
    projects: "Projects",
    design: "Design Projects",
  };
  return titles[windowId] || windowId;
}

function setActiveWindow(window) {
  // Remove active class from all windows and taskbar items
  document
    .querySelectorAll(".window")
    .forEach((w) => w.classList.remove("active"));
  document
    .querySelectorAll(".taskbar-item")
    .forEach((t) => t.classList.remove("active"));

  window.classList.add("active");
  activeWindow = window;

  // Update taskbar item
  const windowId = window.id.replace("-window", "");
  const taskbarItem = document.querySelector(
    `.taskbar-item[data-window="${windowId}"]`
  );
  if (taskbarItem) {
    taskbarItem.classList.add("active");
  }
}

// Window controls
document.querySelectorAll(".window").forEach((win) => {
  const header = win.querySelector(".window-header");
  const closeBtn = win.querySelector(".close");
  const minimizeBtn = win.querySelector(".minimize");
  const resizeHandle = win.querySelector(".resize-handle");
  const maximizeBtn = win.querySelector(".maximize");

  // Bring to front on mousedown/touch
  win.addEventListener("pointerdown", function () {
    setActiveWindow(this);
    this.style.zIndex = ++zIndexCounter;
  });

  // Close
  closeBtn.addEventListener("click", function () {
    const windowId = win.id.replace("-window", "");
    win.style.display = "none";
    minimizedWindows.delete(windowId);
    removeFromTaskbar(windowId);
    const visible = document.querySelectorAll(
      '.window[style*="display: block"]'
    );
    if (visible.length > 0) setActiveWindow(visible[visible.length - 1]);
    else activeWindow = null;
  });

  // Minimize
  minimizeBtn.addEventListener("click", function () {
    const windowId = win.id.replace("-window", "");
    minimizeWindow(windowId);
  });

  // (Optional) Maximize toggle
  if (maximizeBtn) {
    maximizeBtn.addEventListener("click", function () {
      const isMax = win.classList.toggle("maximized");
      if (isMax) {
        win.dataset.prevLeft = win.style.left;
        win.dataset.prevTop = win.style.top;
        win.dataset.prevWidth = getComputedStyle(win).width;
        win.dataset.prevHeight = getComputedStyle(win).height;
        win.style.left = "0px";
        win.style.top = "0px";
        win.style.width = "100vw";
        win.style.height = "calc(100vh - 40px)";
      } else {
        win.style.left = win.dataset.prevLeft || "100px";
        win.style.top = win.dataset.prevTop || "60px";
        win.style.width = win.dataset.prevWidth || "600px";
        win.style.height = win.dataset.prevHeight || "400px";
        clampWindowToViewport(win);
      }
    });
  }

  // ---- DRAGGING (pointer events) ----
  header.addEventListener("pointerdown", function (e) {
    if (e.target.classList.contains("window-button")) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseInt(win.style.left) || 0;
    startTop = parseInt(win.style.top) || 0;

    setActiveWindow(win);
    win.style.zIndex = ++zIndexCounter;

    // capture pointer to keep receiving move events
    header.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  header.addEventListener(
    "pointermove",
    function (e) {
      if (!isDragging) return;
      const newLeft = startLeft + (e.clientX - startX);
      const newTop = startTop + (e.clientY - startY);

      // clamp within viewport
      const rect = win.getBoundingClientRect();
      const maxLeft = Math.max(0, window.innerWidth - rect.width);
      const maxTop = Math.max(
        0,
        window.innerHeight - rect.height - TASKBAR_HEIGHT
      );

      win.style.left = clamp(newLeft, 0, maxLeft) + "px";
      win.style.top = clamp(newTop, 0, maxTop) + "px";

      e.preventDefault(); // prevent page from scrolling while dragging
    },
    { passive: false }
  );

  header.addEventListener("pointerup", function (e) {
    isDragging = false;
    header.releasePointerCapture(e.pointerId);
  });

  // ---- RESIZING (pointer events) ----
  if (resizeHandle) {
    resizeHandle.addEventListener("pointerdown", function (e) {
      // skip resize on small screens (we disabled the handle in CSS too)
      if (window.innerWidth <= 768) return;

      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(getComputedStyle(win).width, 10);
      startHeight = parseInt(getComputedStyle(win).height, 10);

      resizeHandle.setPointerCapture(e.pointerId);
      e.preventDefault();
      e.stopPropagation();
    });

    resizeHandle.addEventListener(
      "pointermove",
      function (e) {
        if (!isResizing) return;
        const newWidth = startWidth + (e.clientX - startX);
        const newHeight = startHeight + (e.clientY - startY);
        win.style.width = Math.max(300, newWidth) + "px";
        win.style.height = Math.max(200, newHeight) + "px";
        clampWindowToViewport(win);
        e.preventDefault();
      },
      { passive: false }
    );

    resizeHandle.addEventListener("pointerup", function (e) {
      isResizing = false;
      resizeHandle.releasePointerCapture(e.pointerId);
    });
  }
});

window.addEventListener("resize", () => {
  document.querySelectorAll(".window").forEach(clampWindowToViewport);
});

// Mouse move handlers
document.addEventListener("mousemove", function (e) {
  if (isDragging && activeWindow) {
    const newLeft = startLeft + e.clientX - startX;
    const newTop = startTop + e.clientY - startY;

    // Allow windows to be dragged anywhere, including partially off-screen
    // Only prevent dragging completely above the viewport (keep at least 20px of header visible)
    activeWindow.style.left = newLeft + "px";
    activeWindow.style.top =
      Math.max(-parseInt(activeWindow.offsetHeight) + 40, newTop) + "px";
  }

  if (isResizing && activeWindow) {
    const newWidth = startWidth + e.clientX - startX;
    const newHeight = startHeight + e.clientY - startY;

    activeWindow.style.width = Math.max(300, newWidth) + "px";
    activeWindow.style.height = Math.max(200, newHeight) + "px";
  }
});

document.addEventListener("mouseup", function () {
  isDragging = false;
  isResizing = false;
});

// Contact form handler
function handleSubmit(e) {
  e.preventDefault();
  alert("Thank you for your message! This is a demo form.");
}

// Resume download handler
function downloadResume() {
  // Create a simple resume download
  window.print(); // This will allow users to save as PDF
}

// Update time
function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  document.querySelector(".time").textContent = timeString;
}

// Start button functionality
document.querySelector(".start-button").addEventListener("click", function () {
  const startMenu = document.getElementById("start-menu");
  startMenu.classList.toggle("active");
});

// Close start menu when clicking outside
document.addEventListener("click", function (e) {
  const startButton = document.querySelector(".start-button");
  const startMenu = document.getElementById("start-menu");

  if (!startButton.contains(e.target) && !startMenu.contains(e.target)) {
    startMenu.classList.remove("active");
  }
});

// Update time every minute
updateTime();
setInterval(updateTime, 60000);

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  if (e.altKey && e.key === "F4" && activeWindow) {
    activeWindow.style.display = "none";
  }
});

// Prevent context menu on desktop
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

// Window stacking management
document.addEventListener("click", function (e) {
  const clickedWindow = e.target.closest(".window");
  if (clickedWindow && clickedWindow !== activeWindow) {
    setActiveWindow(clickedWindow);
    clickedWindow.style.zIndex = ++zIndexCounter;
  }
});

// Auto-open About Me when the site finishes loading
window.addEventListener("load", () => {
  openWindow("about");
});
