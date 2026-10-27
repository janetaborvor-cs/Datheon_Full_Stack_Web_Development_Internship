
/* =========================================
   DATHEON TASK 1 — PORTFOLIO INTERACTIONS
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  // 1. DARK / LIGHT THEME TOGGLE
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  function applyTheme(theme) {
    const isLight = theme === "light";

    body.classList.toggle("light-theme", isLight);

    if (themeToggle) {
      themeToggle.textContent = isLight ? "🌙" : "☀️";
      themeToggle.setAttribute(
        "aria-label",
        isLight ? "Switch to dark theme" : "Switch to light theme"
      );
      themeToggle.setAttribute("aria-pressed", String(isLight));
    }

    document.documentElement.style.colorScheme = theme;
  }

  let savedTheme = "dark";

  try {
    savedTheme = localStorage.getItem("portfolio-theme") || "dark";
  } catch (error) {
    console.warn("Theme preference could not be loaded.");
  }

  applyTheme(savedTheme === "light" ? "light" : "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = body.classList.contains("light-theme")
        ? "dark"
        : "light";

      applyTheme(nextTheme);

      try {
        localStorage.setItem("portfolio-theme", nextTheme);
      } catch (error) {
        console.warn("Theme preference could not be saved.");
      }
    });
  }

  // 2. RESPONSIVE MOBILE NAVIGATION
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const navigationLinks = navLinks
    ? navLinks.querySelectorAll("a")
    : [];

  function closeMenu() {
    if (!menuToggle || !navLinks) return;

    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
    });

    navigationLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) {
        closeMenu();
      }
    });
  }

  // 3. PROJECT DETAILS MODAL
  const projectModal = document.getElementById("project-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDescription = document.getElementById("modal-description");
  const modalTech = document.getElementById("modal-tech");
  const modalClose = document.getElementById("modal-close");
  const modalDone = document.getElementById("modal-done");

  const projectButtons = document.querySelectorAll(".project-details");

  function closeProjectModal() {
    if (projectModal && projectModal.open) {
      projectModal.close();
    }
  }

  projectButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (
        !projectModal ||
        !modalTitle ||
        !modalDescription ||
        !modalTech
      ) {
        return;
      }

      modalTitle.textContent = button.dataset.title || "Project Details";
      modalDescription.textContent =
        button.dataset.description || "Project information coming soon.";
      modalTech.textContent =
        "Technologies: " + (button.dataset.tech || "Not specified");

      if (typeof projectModal.showModal === "function") {
        projectModal.showModal();
      } else {
        window.alert(
          modalTitle.textContent + "\n\n" + modalDescription.textContent
        );
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener("click", closeProjectModal);
  }

  if (modalDone) {
    modalDone.addEventListener("click", closeProjectModal);
  }

  if (projectModal) {
    projectModal.addEventListener("click", (event) => {
      if (event.target === projectModal) {
        closeProjectModal();
      }
    });
  }

  // 4. AUTOMATIC COPYRIGHT YEAR
  const currentYear = document.getElementById("current-year");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // 5. SCROLL REVEAL ANIMATIONS
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const revealElements = document.querySelectorAll(
    ".section-heading, .about-card, .skill-card, " +
    ".project-card, .timeline-item, .contact-panel"
  );

  if (!reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-reveal");

    revealElements.forEach((element) => {
      element.classList.add("reveal");
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  }

  // 6. ACTIVE NAVIGATION LINK
  const sections = document.querySelectorAll(
    "main section[id]"
  );

  if ("IntersectionObserver" in window && sections.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navigationLinks.forEach((link) => {
            const isActive =
              link.getAttribute("href") === "#" + entry.target.id;

            if (isActive) {
              link.classList.add("active");
              link.setAttribute("aria-current", "location");
            } else {
              link.classList.remove("active");
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px"
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  console.log("Portfolio initialized successfully.");
});
