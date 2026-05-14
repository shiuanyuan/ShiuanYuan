document.addEventListener("DOMContentLoaded", () => {
	SYCommon.initSharedUI();
	initHeaderAndFilterScroll();
	filterDisplayedPortfolios();
	initPortfolioFilters();
	initPortfolioPageMotion();
});

function initHeaderAndFilterScroll() {
	let prevPos = 0;
	const header = document.querySelector("header");
	const styleFilter = document.querySelector(".style-filter");
	if (!header || !styleFilter) return;

	let throttleTimeout;
	const getDocHeight = () => document.documentElement.scrollHeight;
	const getWinHeight = () => window.innerHeight;

	window.addEventListener("scroll", () => {
		if (throttleTimeout) return;

		throttleTimeout = setTimeout(() => {
			const currPos = Math.max(0, window.pageYOffset);
			const isAtBottom = currPos + getWinHeight() >= getDocHeight() - 10;
			const isScrollingDown = currPos > prevPos && currPos > header.offsetHeight;

			header.classList[!isAtBottom && isScrollingDown ? "add" : "remove"](
				"invisible"
			);
			styleFilter.classList.toggle("scrolled-bottom", isAtBottom);

			prevPos = currPos;
			throttleTimeout = null;
		}, 100);
	});

	let lastScrollY = window.scrollY;
	window.addEventListener("scroll", () => {
		const currentScrollY = window.scrollY;
		styleFilter.classList.toggle("scrolled-up", currentScrollY < lastScrollY);
		lastScrollY = currentScrollY;
	});
}

function filterPortfolios(category) {
	const portfolios = document.querySelectorAll(".portfolio-size");
	const buttons = document.querySelectorAll(".style-filter .btn");
	const visibleItems = [];
	const displayedProject = document.querySelector(".project[data-selected='true']");
	const displayedCategory = displayedProject?.getAttribute("data-category");

	portfolios.forEach((portfolio) => {
		const portfolioCategory = portfolio.getAttribute("data-category");
		const categoryArray = portfolioCategory.split(",");
		const isExactSame = portfolioCategory === displayedCategory;
		const shouldShow =
			(category === "all" || categoryArray.includes(category)) && !isExactSame;

		portfolio.style.display = shouldShow ? "block" : "none";
		portfolio.classList.toggle("aos-animate", shouldShow);
		if (shouldShow) visibleItems.push(portfolio);
	});

	buttons.forEach((btn) => btn.classList.remove("btn-selected"));
	const selectedBtn = [...buttons].find(
		(btn) => btn.getAttribute("data-category") === category
	);
	if (selectedBtn) selectedBtn.classList.add("btn-selected");

	SYCommon.animateVisibleItems(visibleItems);
}

function filterDisplayedPortfolios() {
	const displayedProject = document.querySelector(".project[data-selected='true']");
	const displayedCategory = displayedProject?.getAttribute("data-category");
	if (!displayedCategory) return;

	document.querySelectorAll(".portfolio-size").forEach((portfolio) => {
		if (portfolio.getAttribute("data-category") === displayedCategory) {
			portfolio.style.display = "none";
		}
	});
}

function initPortfolioFilters() {
	document.querySelectorAll(".style-filter .btn").forEach((button) => {
		const category = button.getAttribute("data-category");
		if (category) button.addEventListener("click", () => filterPortfolios(category));
	});
}

function initPortfolioPageMotion() {
	SYCommon.withGSAP((gsap) => {
		gsap.fromTo(
			[".project-name", ".project-type", ".project .image-container:first-of-type"],
			{ autoAlpha: 0, y: 30 },
			{
				autoAlpha: 1,
				y: 0,
				duration: 0.8,
				ease: "power3.out",
				stagger: 0.12,
			}
		);
	});

	SYCommon.revealOnEnter(".project-content, .project .image-container:not(:first-of-type)", {
		y: 34,
		scale: 0.985,
		threshold: 0.12,
	});
	SYCommon.revealOnEnter(".portfolio-size", { y: 36, scale: 0.98, threshold: 0.12 });
	SYCommon.initImageHover(".image-container img");
	SYCommon.initPortfolioCardMotion();
	SYCommon.initTextMasking(
		".project-content, .portfolio-name p, .contant-info p",
		{ threshold: 0.24, duration: 1 }
	);
}

let swiperThumbs;
let swiperMain;

function openSwiper(index) {
	const overlay = document.getElementById("swiperOverlay");
	overlay.style.display = "flex";
	SYCommon.animateOverlayOpen(overlay, ".swiper-overlay .mySwiper2");

	if (swiperMain && swiperThumbs) {
		swiperMain.params.grabCursor = true;
		swiperMain.slideToLoop(index);
		return;
	}

	swiperThumbs = new Swiper(".mySwiper", {
		spaceBetween: 10,
		slidesPerView: 4,
		freeMode: true,
		watchSlidesProgress: true,
	});

	swiperMain = new Swiper(".mySwiper2", {
		effect: "cube",
		spaceBetween: 10,
		loop: true,
		initialSlide: index,
		simulateTouch: true,
		allowTouchMove: true,
		grabCursor: true,
		autoplay: {
			delay: 4000,
			disableOnInteraction: false,
		},
		speed: 1500,
		cubeEffect: {
			shadow: true,
			slideShadows: true,
			shadowOffset: 20,
			shadowScale: 0.94,
		},
		pagination: {
			el: ".swiper-pagination",
			type: "progressbar",
		},
		thumbs: {
			swiper: swiperThumbs,
		},
	});
}

function closeSwiper() {
	const overlay = document.getElementById("swiperOverlay");
	SYCommon.animateOverlayClose(overlay, () => {
		overlay.style.display = "none";
	});

	if (swiperMain) swiperMain.slideTo(0);
}
