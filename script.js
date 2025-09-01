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
  const window = document.getElementById(windowId + "-window");
  if (window) {
    // Check if window is minimized, restore it
    if (minimizedWindows.has(windowId)) {
      restoreWindow(windowId);
      return;
    }

    window.style.display = "block";
    window.style.zIndex = ++zIndexCounter;

    // Position window randomly if not positioned
    if (!window.style.left) {
      window.style.left = Math.random() * 200 + 100 + "px";
      window.style.top = Math.random() * 100 + 50 + "px";
    }

    setActiveWindow(window);
    addToTaskbar(windowId);
  }
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
document.querySelectorAll(".window").forEach((window) => {
  const header = window.querySelector(".window-header");
  const closeBtn = window.querySelector(".close");
  const minimizeBtn = window.querySelector(".minimize");
  const resizeHandle = window.querySelector(".resize-handle");

  // Make window active on click
  window.addEventListener("mousedown", function () {
    setActiveWindow(this);
    this.style.zIndex = ++zIndexCounter;
  });

  // Close window
  closeBtn.addEventListener("click", function () {
    const windowId = window.id.replace("-window", "");
    window.style.display = "none";
    minimizedWindows.delete(windowId);
    removeFromTaskbar(windowId);

    // Set next window as active
    const visibleWindows = document.querySelectorAll(
      '.window[style*="display: block"]'
    );
    if (visibleWindows.length > 0) {
      setActiveWindow(visibleWindows[visibleWindows.length - 1]);
    } else {
      activeWindow = null;
    }
  });

  // Minimize window
  minimizeBtn.addEventListener("click", function () {
    const windowId = window.id.replace("-window", "");
    minimizeWindow(windowId);
  });

  // Dragging functionality
  header.addEventListener("mousedown", function (e) {
    if (e.target.classList.contains("window-button")) return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseInt(window.style.left) || 0;
    startTop = parseInt(window.style.top) || 0;

    setActiveWindow(window);
    window.style.zIndex = ++zIndexCounter;

    e.preventDefault();
  });

  // Resizing functionality
  resizeHandle.addEventListener("mousedown", function (e) {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(
      document.defaultView.getComputedStyle(window).width,
      10
    );
    startHeight = parseInt(
      document.defaultView.getComputedStyle(window).height,
      10
    );

    e.preventDefault();
    e.stopPropagation();
  });
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
