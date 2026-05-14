document.addEventListener("DOMContentLoaded", () => {
	SYCommon.initSharedUI();
	initHeaderVisibility();
	initStyleFilterSticky();
	initWorkflowBackgroundReveal();
	initWorkflowStepState();
	initViewportSections();
	initHomeMotion();
	initWorkflowMobileMotion();
	initAwardTabs();
});

function initHeaderVisibility() {
	let prevPos = 0;
	const header = document.querySelector("header");
	if (!header) return;

	let throttleTimeout;
	const getDocHeight = () => document.documentElement.scrollHeight;
	const getWinHeight = () => window.innerHeight;

	window.addEventListener("scroll", () => {
		if (throttleTimeout) return;

		throttleTimeout = setTimeout(() => {
			const currPos = Math.max(0, window.pageYOffset);
			const isAtBottom = currPos + getWinHeight() >= getDocHeight() - 10;

			if (isAtBottom) {
				header.classList.remove("invisible");
			} else {
				const isScrollingDown = currPos > prevPos && currPos > header.offsetHeight;
				header.classList[isScrollingDown ? "add" : "remove"]("invisible");
			}

			prevPos = currPos;
			throttleTimeout = null;
		}, 100);
	});
}

function initStyleFilterSticky() {
	const styleFilter = document.querySelector(".style-filter");
	const targetSection = document.querySelector("#design-project");
	if (!styleFilter || !targetSection) return;

	const headerHeight = styleFilter.getBoundingClientRect().height;
	const exitThreshold = 150;
	let prevScrollY = window.scrollY;
	let isSticky = false;
	let isScrolledUp = false;
	let isWithinStickyRange = false;
	let lastToggleTime = 0;
	let lastKnownScrollY = window.scrollY;
	let ticking = false;
	let debounceTimeout;

	const updateStickyState = () => {
		const currentTime = Date.now();
		if (currentTime - lastToggleTime < 100) {
			ticking = false;
			return;
		}

		const scrollY = lastKnownScrollY;
		const targetTop = targetSection.offsetTop;
		const targetBottom = targetTop + targetSection.offsetHeight;
		const nextWithinStickyRange =
			scrollY >= targetTop && scrollY < targetBottom - headerHeight - exitThreshold;

		if (nextWithinStickyRange !== isWithinStickyRange) {
			isWithinStickyRange = nextWithinStickyRange;
			if (!isWithinStickyRange) {
				styleFilter.classList.remove("sticky", "scrolled-up");
				isSticky = false;
				isScrolledUp = false;
			}
		}

		if (isWithinStickyRange && !isSticky) {
			isSticky = true;
			styleFilter.classList.add("sticky");
		} else if (!isWithinStickyRange && isSticky) {
			isSticky = false;
		}

		if (isWithinStickyRange) {
			const isScrollingUp = scrollY < prevScrollY;
			if (isScrollingUp !== isScrolledUp) {
				isScrolledUp = isScrollingUp;
				styleFilter.classList.toggle("scrolled-up", isScrolledUp);
			}
		}

		prevScrollY = scrollY;
		lastToggleTime = currentTime;
		ticking = false;
	};

	window.addEventListener("scroll", () => {
		lastKnownScrollY = window.scrollY;

		if (!ticking) {
			clearTimeout(debounceTimeout);
			debounceTimeout = setTimeout(() => {
				ticking = true;
				requestAnimationFrame(updateStickyState);
			}, 50);
		}
	});
}

function filterPortfolios(category) {
	const portfolios = document.querySelectorAll(".portfolio-size");
	const buttons = document.querySelectorAll(".style-filter .btn");
	const visibleItems = [];

	portfolios.forEach((portfolio) => {
		const portfolioCategory = portfolio.getAttribute("data-category");
		const shouldShow = category === "all" || portfolioCategory === category;

		portfolio.style.display = shouldShow ? "block" : "none";
		portfolio.classList.toggle("aos-animate", shouldShow);
		if (shouldShow) visibleItems.push(portfolio);
	});

	buttons.forEach((button) => button.classList.remove("btn-selected"));
	const selectedButton = document.querySelector(
		`.style-filter .btn[onclick="filterPortfolios('${category}')"]`
	);
	if (selectedButton) selectedButton.classList.add("btn-selected");

	SYCommon.animateVisibleItems(visibleItems);
}

function initWorkflowBackgroundReveal() {
	const background = document.querySelector(".workflow__bg");
	const targetSection = document.querySelector(".workflow-section");
	if (!background || !targetSection) return;

	SYCommon.withScrollTrigger((gsap, ScrollTrigger) => {
		ScrollTrigger.create({
			trigger: targetSection,
			start: "top 72%",
			end: "bottom 28%",
			onEnter: () => background.classList.add("animate"),
			onEnterBack: () => background.classList.add("animate"),
			onLeave: () => background.classList.remove("animate"),
			onLeaveBack: () => background.classList.remove("animate"),
		});
	});
}

function initWorkflowStepState() {
	const workflow = document.querySelector(".workflow-item");
	if (!workflow) return;

	const steps = Array.from(
		workflow.querySelectorAll(
			".workflow-item1, .workflow-item2, .workflow-item3, .workflow-item4, .workflow-item5, .workflow-item6, .workflow-item7, .workflow-item8"
		)
	);
	const contents = Array.from(document.querySelectorAll(".workflow-item-content"));
	if (!steps.length || !contents.length) return;

	const workflowSection = workflow.closest(".workflow-section");
	const detailPanel = document.createElement("div");
	detailPanel.className = "workflow-detail-panel";
	detailPanel.setAttribute("aria-live", "polite");

	contents.forEach((content) => {
		detailPanel.appendChild(content);
	});

	document.querySelectorAll(".workflow-content").forEach((wrapper) => wrapper.remove());
	if (workflowSection) workflowSection.after(detailPanel);

	const setActiveStep = (index) => {
		steps.forEach((step, stepIndex) => {
			step.classList.toggle("is-active", stepIndex === index);
		});
		contents.forEach((content, contentIndex) => {
			content.classList.toggle("is-active", contentIndex === index);
		});

		const activeContent = contents[index];
		SYCommon.withGSAP((gsap) => {
			gsap.fromTo(
				activeContent,
				{ autoAlpha: 0, y: 12 },
				{
					autoAlpha: 1,
					y: 0,
					duration: 0.36,
					ease: "power3.out",
					overwrite: true,
				}
			);
		});
	};

	steps.forEach((step, index) => {
		step.addEventListener("mouseenter", () => setActiveStep(index));
		step.addEventListener("click", () => setActiveStep(index));
		step.addEventListener("focusin", () => setActiveStep(index));
	});

	setActiveStep(0);
}

const WORKFLOW_LINE_TOP_EPS = 2;

/**
 * SplitText 風格：依排版視覺斷行（適合中文），不需 Club 的 SplitText 外掛。
 * 參考概念：https://demos.gsap.com/demo/responsive-line-splits-on-scroll/
 */
function splitWorkflowParagraphIntoLines(paragraph) {
	const source =
		paragraph.dataset.lineSplitOriginal != null
			? paragraph.dataset.lineSplitOriginal
			: paragraph.textContent;
	if (!source.trim()) return;

	paragraph.dataset.lineSplitOriginal = source;
	paragraph.replaceChildren();

	const frag = document.createDocumentFragment();
	for (const ch of Array.from(source)) {
		const span = document.createElement("span");
		span.className = "workflow-line-split-measure";
		span.textContent = ch;
		frag.appendChild(span);
	}
	paragraph.appendChild(frag);
	void paragraph.offsetHeight;

	const spans = Array.from(
		paragraph.querySelectorAll(".workflow-line-split-measure")
	);
	const lineGroups = [];
	let row = [];
	let lastTop = null;
	for (const span of spans) {
		const top = span.offsetTop;
		if (lastTop !== null && top > lastTop + WORKFLOW_LINE_TOP_EPS) {
			lineGroups.push(row);
			row = [];
		}
		row.push(span);
		lastTop = top;
	}
	if (row.length) lineGroups.push(row);

	paragraph.replaceChildren();
	for (const group of lineGroups) {
		const line = document.createElement("span");
		line.className = "workflow-line-split-line";
		const inner = document.createElement("span");
		inner.className = "workflow-line-split-line__inner";
		for (const span of group) {
			span.classList.remove("workflow-line-split-measure");
			inner.appendChild(span);
		}
		line.appendChild(inner);
		paragraph.appendChild(line);
	}
}

function applyWorkflowMobileLineSplits(section) {
	section.querySelectorAll(".timeline-body p").forEach(splitWorkflowParagraphIntoLines);
}

function restoreWorkflowMobileLineSplits(section) {
	section.querySelectorAll(".timeline-body p").forEach((p) => {
		if (p.dataset.lineSplitOriginal == null) return;
		p.textContent = p.dataset.lineSplitOriginal;
		delete p.dataset.lineSplitOriginal;
	});
}

function initWorkflowMobileMotion() {
	const section = document.querySelector(".workflow-section2");
	if (!section) return;

	SYCommon.withScrollTrigger((gsap, ScrollTrigger) => {
		const mm = gsap.matchMedia();

		mm.add("(max-width: 1199px)", () => {
			applyWorkflowMobileLineSplits(section);

			let resizeTimer;
			const onResize = () => {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 120);
			};
			window.addEventListener("resize", onResize);

			const ctx = gsap.context(() => {
				const items = section.querySelectorAll(".timeline > li");
				if (!items.length) return;

				const heading = section.querySelector(".section-heading");
				if (heading) {
					gsap.from(heading, {
						y: 22,
						autoAlpha: 0,
						duration: 0.68,
						ease: "power3.out",
						scrollTrigger: {
							trigger: section,
							start: "top 82%",
							once: true,
						},
					});
				}

				items.forEach((li) => {
					const imageWrap = li.querySelector(".timeline-image");
					const panel = li.querySelector(".timeline-panel");
					const titleEl = li.querySelector(".timeline-heading h4");
					const lineInners = li.querySelectorAll(".workflow-line-split-line__inner");
					if (!imageWrap || !panel) return;

					gsap.set(lineInners, { yPercent: 108 });

					const tl = gsap.timeline({
						scrollTrigger: {
							trigger: li,
							start: "top 88%",
							once: true,
						},
					});

					tl.from(imageWrap, {
						autoAlpha: 0,
						scale: 0.82,
						y: 20,
						duration: 0.54,
						ease: "back.out(1.35)",
					});

					if (titleEl) {
						tl.from(
							titleEl,
							{
								autoAlpha: 0,
								y: 14,
								duration: 0.42,
								ease: "power3.out",
							},
							"-=0.32"
						);
					}

					if (lineInners.length) {
						tl.to(
							lineInners,
							{
								yPercent: 0,
								duration: 0.52,
								ease: "power4.out",
								stagger: { each: 0.055, from: "start" },
							},
							titleEl ? "-=0.22" : "-=0.28"
						);
					}
				});
			}, section);

			return () => {
				window.removeEventListener("resize", onResize);
				clearTimeout(resizeTimer);
				ctx.revert();
				restoreWorkflowMobileLineSplits(section);
			};
		});
	});
}

function initViewportSections() {
	document
		.querySelectorAll(".about-sy, .award-section, .design-project, #workflow, .qrcode")
		.forEach((section) => section.classList.add("viewport-section"));
}

function initHomeMotion() {
	SYCommon.withGSAP((gsap) => {
		gsap.fromTo(
			".mySwiper",
			{ autoAlpha: 0, scale: 1.02 },
			{ autoAlpha: 1, scale: 1, duration: 1.2, ease: "power2.out", delay: 0.1 }
		);
	});

	SYCommon.revealOnEnter(".about-sy", { y: 26, threshold: 0.15 });
	SYCommon.revealOnEnter(".award-section", { y: 34, threshold: 0.12 });
	SYCommon.revealOnEnter(".award-area", { y: 24, threshold: 0.18 });
	SYCommon.revealOnEnter(".portfolio-size", { y: 36, scale: 0.98, threshold: 0.12 });
	SYCommon.revealOnEnter(".qrcode", { y: 32, threshold: 0.12 });
	SYCommon.initPortfolioCardMotion();
	SYCommon.initTextMasking(".contant-info p", { threshold: 0.24, duration: 1 });
	SYCommon.initTextMasking(".about-content__title, .about-content p", {
		threshold: 0.18,
		duration: 1.05,
		staggerByIndex: 0.12,
	});
	initAwardImageMotion();
}

function initAwardTabs() {
	const radios = Array.from(document.querySelectorAll(".tabs__radio"));
	if (!radios.length) return;

	const animateActiveAwards = () => {
		const activeContent = document.querySelector(
			".tabs__radio:checked + .tabs__label + .tabs__content"
		);
		if (!activeContent) return;

		const awardItems = activeContent.querySelectorAll(".award-item-name p");
		SYCommon.scrambleText(awardItems, {
			duration: 0.9,
			stagger: 0.08,
		});
	};

	radios.forEach((radio) => {
		radio.addEventListener("change", () => {
			window.requestAnimationFrame(animateActiveAwards);
		});
	});

	SYCommon.withScrollTrigger((gsap, ScrollTrigger) => {
		ScrollTrigger.create({
			trigger: ".award-section",
			start: "top 78%",
			once: true,
			onEnter: animateActiveAwards,
		});
	});
}

function initAwardImageMotion() {
	const container = document.querySelector(".award-img");
	const images = container ? Array.from(container.querySelectorAll("img")) : [];
	if (!images.length) return;

	SYCommon.withScrollTrigger((gsap) => {
		gsap.fromTo(
			images,
			{
				y: (index) => 32 + (index % 5) * 3,
				scale: 0.88,
				rotation: (index) => (index % 2 === 0 ? -2.2 : 2.2),
			},
			{
				y: 0,
				scale: 1,
				rotation: 0,
				ease: "none",
				stagger: {
					each: 0.045,
					from: "start",
				},
				scrollTrigger: {
					trigger: container,
					start: "top 84%",
					end: "bottom 28%",
					scrub: 0.65,
				},
			}
		);
	});
}

var swiper = new Swiper(".mySwiper", {
	loop: true,
	effect: "fade",
	speed: 1500,
	autoplay: {
		delay: 5000,
		disableOnInteraction: false,
	},
	navigation: {
		nextEl: ".swiper-button-next",
		prevEl: ".swiper-button-prev",
	},
	on: {
		init: function () {
			this.autoplay.stop();
			const activeSlide = this.slides[this.activeIndex];
			const video = activeSlide.querySelector("video");
			if (video) {
				video.currentTime = 0;
				video.play();
				video.onended = () => {
					this.slideNext();
					this.autoplay.start();
				};
			}
		},
		slideChangeTransitionStart: function () {
			document.querySelectorAll(".mySwiper video").forEach((video) => {
				video.pause();
				video.currentTime = 0;
			});
		},
		slideChangeTransitionEnd: function () {
			const activeSlide = this.slides[this.activeIndex];
			const video = activeSlide.querySelector("video");
			if (video) {
				this.autoplay.stop();
				video.play();
				video.onended = () => {
					this.slideNext();
					this.autoplay.start();
				};
			}
		},
	},
});
