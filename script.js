/* ============================================================
   Hiệu ứng hiện ra mượt khi cuộn (dùng cho cả 2 trang)
   ============================================================ */
const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 })
  : null;

function observeReveals(root = document) {
  root.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add("visible");
  });
}

observeReveals();

/* ============================================================
   Chuyển Home <-> Projects bằng hash (không reload → nhạc liền)
   ============================================================ */
const VIEW_TITLES = {
  home: "Lại Đức Thanh Tùng · Developer",
  projects: "Projects · Lại Đức Thanh Tùng"
};

function currentView() {
  return location.hash === "#projects" ? "projects" : "home";
}

function applyView(animate = true) {
  const view = currentView();
  const root = document.documentElement;

  root.classList.toggle("view-projects", view === "projects");
  document.title = VIEW_TITLES[view];

  document.querySelectorAll('.site-nav a[href="#about"], .site-nav a[href="#projects"]')
    .forEach((link) => {
      link.classList.toggle("active",
        link.getAttribute("href") === (view === "projects" ? "#projects" : "#about"));
    });

  const section = document.querySelector(view === "projects" ? ".projects-page" : ".hero");
  if (section && animate) {
    section.classList.remove("view-fade");
    void section.offsetWidth; // để animation chạy lại mỗi lần đổi view
    section.classList.add("view-fade");
  }

  // Về đầu trang ngay, không để scroll-behavior:smooth kéo dài
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previousBehavior;

  if (section) observeReveals(section);
}

window.addEventListener("hashchange", () => applyView(true));

// Bấm vào link đang active: hashchange không chạy, nên gọi thủ công
document.querySelectorAll('a[href="#about"], a[href="#projects"]').forEach((link) => {
  link.addEventListener("click", () => {
    if (link.getAttribute("href") === location.hash) applyView(true);
  });
});

applyView(false);

/* ============================================================
   Nhạc nền — bật/tắt bằng Space (giữ luôn khi F5 / chuyển view)
   ============================================================ */
const bgMusic = document.getElementById("bgMusic");
const MUSIC_KEY = "portfolio-music-state";

if (bgMusic) {
  function saveMusicState() {
    try {
      sessionStorage.setItem(MUSIC_KEY, JSON.stringify({
        time: bgMusic.currentTime || 0,
        playing: !bgMusic.paused
      }));
    } catch (e) { /* storage có thể bị chặn – bỏ qua */ }
  }

  function restoreMusicState() {
    let saved = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(MUSIC_KEY) || "null");
    } catch (e) { /* bỏ qua */ }
    if (!saved) return;

    const apply = async () => {
      try {
        if (typeof saved.time === "number" && isFinite(saved.time)) {
          bgMusic.currentTime = saved.time;
        }
        if (saved.playing) {
          await bgMusic.play();
          document.body.classList.add("music-on");
        }
      } catch (e) {
        // Trình duyệt có thể chặn autoplay sau khi chuyển trang.
        // Nhạc sẽ đứng ở đúng đoạn đã lưu; nhấn Space để tiếp tục.
      }
    };

    if (bgMusic.readyState >= 1) apply();
    else bgMusic.addEventListener("loadedmetadata", apply, { once: true });
  }

  async function toggleMusic() {
    try {
      if (bgMusic.paused) {
        await bgMusic.play();
        document.body.classList.add("music-on");
      } else {
        bgMusic.pause();
        document.body.classList.remove("music-on");
      }
      saveMusicState();
    } catch (err) {
      console.warn("Không thể phát nhạc:", err);
    }
  }

  document.addEventListener("keydown", (e) => {
    if (e.code !== "Space" && e.key !== " ") return;
    if (document.querySelector(".modal.open")) return;
    if (e.target?.closest?.("a, button, input, textarea, select, [contenteditable]")) return;
    e.preventDefault();
    toggleMusic();
  });

  bgMusic.addEventListener("ended", () => document.body.classList.remove("music-on"));
  window.addEventListener("pagehide", saveMusicState);
  window.addEventListener("beforeunload", saveMusicState);
  restoreMusicState();
}

/* ============================================================
   Popup liên hệ (Facebook / Instagram / TikTok)
   ============================================================ */
const contactTrigger = document.getElementById("contactTrigger");
const contactModal = document.getElementById("contactModal");

if (contactTrigger && contactModal) {
  const contactClose = contactModal.querySelector(".modal-close");

  function openContact(e) {
    e.preventDefault();
    contactModal.classList.add("open");
    contactModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    contactClose.focus();
  }
  function closeContact() {
    contactModal.classList.remove("open");
    contactModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  contactTrigger.addEventListener("click", openContact);
  contactClose.addEventListener("click", closeContact);
  contactModal.addEventListener("click", (e) => {
    if (e.target === contactModal) closeContact();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeContact();
  });
}

/* ============================================================
   Dự án — chỉ chạy khi trang có #projectGrid
   ============================================================ */
const grid = document.getElementById("projectGrid");

if (grid) {
  // Dữ liệu dự án mẫu — sửa nội dung ở đây khi bạn có dự án thật
  const projects = [
    {
      title: "Portfolio cá nhân",
      meta: "Website · 2026 · Cá nhân",
      short: "Trang giới thiệu bản thân tối giản, có ảnh nền và popup dự án.",
      desc: "Xây dựng trang portfolio tĩnh với HTML/CSS/JS thuần, giao diện căn giữa, ảnh nền có lớp phủ mờ, thanh liên hệ cố định và popup hiển thị chi tiết từng dự án.",
      tags: ["HTML", "CSS", "JavaScript", "Responsive"],
      demo: "#",
      source: "#"
    },
    {
      title: "Task Manager App",
      meta: "Web app · 2025 · Frontend",
      short: "Ứng dụng quản lý công việc với kéo thả và lưu local.",
      desc: "Cho phép tạo, sửa, xoá và sắp xếp công việc theo trạng thái. Dùng localStorage để lưu dữ liệu giữa các phiên, hỗ trợ tìm kiếm và lọc theo độ ưu tiên.",
      tags: ["React", "TypeScript", "LocalStorage"],
      demo: "#",
      source: "#"
    },
    {
      title: "Landing Page cho Startup",
      meta: "Website · 2025 · Freelance",
      short: "Trang giới thiệu sản phẩm với tốc độ tải cao.",
      desc: "Thiết kế và triển khai landing page một trang cho startup công nghệ, tối ưu Core Web Vitals, thêm form đăng ký và tích hợp analytics cơ bản.",
      tags: ["Next.js", "Tailwind CSS", "SEO"],
      demo: "#",
      source: "#"
    },
    {
      title: "Dashboard bán hàng",
      meta: "Web app · 2024 · Nhóm",
      short: "Báo cáo doanh thu, đơn hàng và biểu đồ trực quan.",
      desc: "Xây dựng bảng điều khiển hiển thị KPI theo thời gian thực, biểu đồ doanh thu, top sản phẩm và bộ lọc theo khung thời gian. Làm việc nhóm 3 người trong 6 tuần.",
      tags: ["Vue", "Chart.js", "REST API"],
      demo: "#",
      source: "#"
    }
  ];

  const modal = document.getElementById("projectModal");
  const modalContent = document.getElementById("modalContent");
  const modalClose = document.getElementById("modalClose");

  // Render card, mỗi card hiện cách nhau 70ms
  grid.innerHTML = projects.map((p, i) => `
    <button class="project-card reveal" style="transition-delay: ${i * 70}ms" data-index="${i}">
      <span class="num">${String(i + 1).padStart(2, "0")}</span>
      <h3>${p.title}</h3>
      <p>${p.short}</p>
      <span class="more">Xem chi tiết →</span>
    </button>
  `).join("");

  observeReveals(grid);

  function openModal(index) {
    const p = projects[index];
    modalContent.innerHTML = `
      <h3 id="modalTitle">${p.title}</h3>
      <p class="meta">${p.meta}</p>
      <p class="desc">${p.desc}</p>
      <div class="tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
      <div class="modal-links">
        <a class="btn btn-primary" href="${p.demo}" target="_blank" rel="noopener">Demo ↗</a>
        <a class="btn btn-outline" href="${p.source}" target="_blank" rel="noopener">Source ↗</a>
      </div>
    `;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".project-card");
    if (card) openModal(card.dataset.index);
  });

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}
