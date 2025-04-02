// 返回首頁
document.addEventListener("DOMContentLoaded", function () {
	const abbrElement = document.querySelector("abbr[data-title]");

	if (abbrElement) {
		abbrElement.addEventListener("click", function () {
			window.location.href = "index.html";
		});
	}
});

// 隱藏header並在滾動至底部時顯示
(function () {
	let prevPos = 0;
	const header = document.querySelector("header");

	let throttleTimeout;

	const getDocHeight = () => document.documentElement.scrollHeight;
	const getWinHeight = () => window.innerHeight;

	window.addEventListener("scroll", function () {
		if (throttleTimeout) return;

		throttleTimeout = setTimeout(() => {
			const currPos = Math.max(0, window.pageYOffset);

			const isAtBottom = currPos + getWinHeight() >= getDocHeight() - 10;

			if (isAtBottom) {
				header.classList.remove("invisible");
			} else {
				const status = currPos > prevPos && currPos > header.offsetHeight;
				header.classList[status ? "add" : "remove"]("invisible");
			}

			prevPos = currPos;
			throttleTimeout = null;
		}, 100);
	});
})();

// #design-project 功能列 style-filter
document.addEventListener("DOMContentLoaded", () => {
	const header = document.querySelector(".style-filter");
	const targetSection = document.querySelector("#design-project");

	if (header && targetSection) {
		const styleFilterTop = header.offsetTop;
		const headerHeight = header.getBoundingClientRect().height;

		const enterThreshold = 10;
		const exitThreshold = 150;

		let prevScrollY = window.scrollY;
		let isSticky = false;
		let isScrolledUp = false;
		let isWithinStickyRange = false;

		let lastToggleTime = 0;
		const minToggleInterval = 100;

		let lastKnownScrollY = window.scrollY;
		let ticking = false;

		let debounceTimeout;

		const updateStickyState = () => {
			const currentTime = Date.now();
			if (currentTime - lastToggleTime < minToggleInterval) {
				ticking = false;
				return;
			}

			const scrollY = lastKnownScrollY;

			const targetSectionBottom =
				targetSection.offsetTop + targetSection.offsetHeight;

			const isNowWithinStickyRange =
				scrollY > styleFilterTop - enterThreshold &&
				scrollY < targetSectionBottom - headerHeight - exitThreshold;

			if (isNowWithinStickyRange !== isWithinStickyRange) {
				isWithinStickyRange = isNowWithinStickyRange;
				if (!isWithinStickyRange) {
					header.classList.remove("sticky", "scrolled-up");
					isSticky = false;
					isScrolledUp = false;
				}
			}

			if (isWithinStickyRange && !isSticky) {
				isSticky = true;
				header.classList.add("sticky");
			} else if (!isWithinStickyRange && isSticky) {
				isSticky = false;
			}

			if (isWithinStickyRange) {
				const isScrollingUp = scrollY < prevScrollY;
				if (isScrollingUp !== isScrolledUp) {
					isScrolledUp = isScrollingUp;
					header.classList.toggle("scrolled-up", isScrolledUp);
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
});

// style-filter btn漣漪效果邏輯
window.onload = () => {
	const buttons = document.querySelectorAll(".btn");
	buttons.forEach((button) => {
		button.addEventListener("click", (event) => {
			const circle = document.createElement("span");
			const diameter = Math.max(button.clientWidth, button.clientHeight);
			const radius = diameter / 2;

			circle.style.width = circle.style.height = `${diameter}px`;
			circle.style.left = `${event.offsetX - radius}px`;
			circle.style.top = `${event.offsetY - radius}px`;
			circle.classList.add("ripple");

			const ripple = button.querySelector(".ripple");
			if (ripple) {
				ripple.remove();
			}

			button.appendChild(circle);
		});
	});
};

function filterPortfolios(category) {
	const portfolios = document.querySelectorAll(".portfolio-size");
	const buttons = document.querySelectorAll(".style-filter .btn");

	portfolios.forEach((portfolio) => {
		const portfolioCategory = portfolio.getAttribute("data-category");

		if (category === "all" || portfolioCategory === category) {
			portfolio.style.display = "block";
			portfolio.classList.add("aos-animate");
		} else {
			portfolio.style.display = "none";
			portfolio.classList.remove("aos-animate");
		}
	});

	buttons.forEach((button) => {
		button.classList.remove("btn-selected");
	});

	const selectedButton = document.querySelector(
		`.style-filter .btn[onclick="filterPortfolios('${category}')"]`
	);
	if (selectedButton) {
		selectedButton.classList.add("btn-selected");
	}

	AOS.refresh();
}

// workflow 背景圖片顯示動畫
document.addEventListener("DOMContentLoaded", () => {
	const background = document.querySelector(".workflow__bg");
	const targetSection = document.querySelector(".workflow-section");

	if (!background || !targetSection) {
		console.error("未找到 .workflow__bg 或 .workflow-section，請檢查 HTML");
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					background.classList.add("animate");
				} else {
					background.classList.remove("animate");
				}
			});
		},
		{
			root: null,
			threshold: 0.5,
		}
	);

	observer.observe(targetSection);
});

// abbr
document.addEventListener("DOMContentLoaded", () => {
	let abbr = document.querySelector("abbr");

	if (!abbr) {
		console.error("未找到 <abbr>，請檢查 HTML");
		return;
	}

	abbr.textContent = "";
	let title = abbr.dataset.title;
	let words = title.split(" ");

	words.forEach((word) => {
		let [initial, ...restLetters] = word.split("");
		let initialSpan = document.createElement("span");
		initialSpan.textContent = initial;
		initialSpan.className = "initial";
		abbr.append(initialSpan);

		restLetters.forEach((letter) => {
			let hiddenSpan = document.createElement("span");
			hiddenSpan.textContent = letter;
			hiddenSpan.className = "hidden";
			abbr.append(hiddenSpan);
		});
	});
});

// nav
document.addEventListener("DOMContentLoaded", () => {
	const hamburgerMenu = document.querySelector(".hamburger-menu");
	const navbar = document.querySelector(".navbar");

	hamburgerMenu.addEventListener("click", () => {
		navbar.classList.toggle("active");
		hamburgerMenu.classList.toggle("active");
	});

	document.querySelectorAll(".nav-text").forEach((div) => {
		div.addEventListener("click", () => {
			const targetId = div.getAttribute("data-target");
			const targetElement = document.querySelector(targetId);

			if (targetElement) {
				targetElement.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}

			if (navbar.classList.contains("active")) {
				navbar.classList.remove("active");
				hamburgerMenu.classList.remove("active");
			}
		});
	});
});

// Initialize Swiper
var swiper = new Swiper(".mySwiper", {
	spaceBetween: 30,
	effect: "fade",
	loop: true,
	autoplay: {
		delay: 5000,
		disableOnInteraction: false,
	},
	navigation: {
		nextEl: ".swiper-button-next",
		prevEl: ".swiper-button-prev",
	},
	pagination: {
		el: ".swiper-pagination",
		clickable: true,
	},
	fadeEffect: {
		crossFade: true,
	},
	speed: 1500,
});

// AOS
AOS.init({
	duration: 1500,
});
