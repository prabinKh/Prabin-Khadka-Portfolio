document.addEventListener("DOMContentLoaded", () => {
  // === GSAP Plugins ===
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // Theme Switch Functionality
  const themeSwitch = document.getElementById("theme-switch");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "light" || (!savedTheme && !prefersDark)) {
    body.classList.add("light-mode");
  }

  themeSwitch?.addEventListener("click", () => {
    body.classList.toggle("light-mode");
    const currentTheme = body.classList.contains("light-mode") ? "light" : "dark";
    localStorage.setItem("theme", currentTheme);
  });

  // Mobile Menu Toggle
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector("nav ul");

  menuToggle?.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close Mobile Menu on Nav Link Click
  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (menuToggle?.classList.contains("active")) {
        menuToggle.classList.remove("active");
        navMenu.classList.remove("active");
      }
    });
  });

  // GSAP Animations
  gsap.from(".title", {
    y: 100,
    opacity: 0,
    duration: 1,
    ease: "power3.out"
  });

  gsap.from(".description p", {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    delay: 0.3,
    ease: "power3.out"
  });

  gsap.from(".cta", {
    y: 30,
    opacity: 0,
    duration: 0.8,
    delay: 0.7,
    ease: "power3.out"
  });

  gsap.to(".profile-image", {
    opacity: 1,
    duration: 1,
    delay: 0.5,
    ease: "power2.out"
  });

  gsap.to(".badge", {
    opacity: 1,
    duration: 0.8,
    stagger: 0.15,
    delay: 0.8,
    ease: "back.out(1.7)",
    y: 0
  });

  // Badge Scroll and Bounce Animation
  const badges = document.querySelectorAll(".badge");
  badges.forEach((badge) => {
    gsap.to(badge, {
      y: -30,
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(badge, {
      y: "+=10",
      rotation: "+=2",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  });

  // Section Animations
  const sections = document.querySelectorAll("section:not(.hero)");

  sections.forEach((section) => {
    gsap.from(section.querySelector(".section-header"), {
      y: 50,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });

    const contentElements = section.querySelectorAll(
      ".work-item, .blog-post, .about-content > *, .contact-content > *"
    );

    gsap.from(contentElements, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        toggleActions: "play none none none"
      }
    });
  });

  // Smooth Scroll for Anchor Links
  const smoothScroll = () => {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        const navHeight = document.querySelector("header").offsetHeight;
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          navHeight;

        gsap.to(window, {
          duration: 1,
          scrollTo: targetPosition,
          ease: "power3.inOut"
        });
      });
    });
  };
  smoothScroll();

  // Contact Form Submission and CSV Download
  const contactForm = document.getElementById("contactForm");

  function downloadCSV() {
    const csv = localStorage.getItem("inquiriesCSV");
    if (csv) {
      const blob = new Blob(["Name,Email,Subject,Message,Timestamp\n" + csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "inquiries.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert("No inquiries to download yet!");
    }
  }

  if (contactForm) {
    // Add Download Button (initially hidden)
    const downloadButton = document.createElement("button");
    downloadButton.textContent = "";
    downloadButton.style.marginTop = "10px";
    downloadButton.style.display = "none"; // Initially hidden
    downloadButton.addEventListener("click", downloadCSV);
    contactForm.appendChild(downloadButton);

    // Check if there are existing inquiries and show button if so
    const existingInquiries = JSON.parse(localStorage.getItem("inquiries") || "[]");
    if (existingInquiries.length > 0) {
      downloadButton.style.display = "block"; // Show if inquiries exist
    }

    // Form Submission Handler
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const submitButton = contactForm.querySelector(".submit-button");
      const originalText = submitButton.textContent;

      // Show success message
      submitButton.textContent = "Success";
      submitButton.disabled = true;

      // Collect form data
      const formData = new FormData(contactForm);
      const inquiry = {
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
        timestamp: new Date().toISOString()
      };

      // Store inquiry in localStorage
      let inquiries = JSON.parse(localStorage.getItem("inquiries") || "[]");
      inquiries.push(inquiry);
      localStorage.setItem("inquiries", JSON.stringify(inquiries));

      // Convert to CSV and store
      const csvContent = inquiries.map(entry =>
        `"${entry.name}","${entry.email}","${entry.subject}","${entry.message.replace(/"/g, '""')}","${entry.timestamp}"`
      ).join("\n");
      localStorage.setItem("inquiriesCSV", csvContent);

      // Show the download button after submission
      downloadButton.style.display = "block";

      // Reload page after showing success
      setTimeout(() => {
        window.location.reload();
      }, 1000); // 1-second delay
    });
  }
});