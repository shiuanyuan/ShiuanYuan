// abbr
document.addEventListener("DOMContentLoaded", function () {
	const abbrElement = document.querySelector("abbr[data-title]");

	if (abbrElement) {
		abbrElement.addEventListener("click", function () {
			window.location.href = "index.html";
		});
	}
});

// style-filter 功能列
(function () {
	let prevPos = 0;
	const header = document.querySelector("header");
	const styleFilter = document.querySelector(".style-filter");
	if (!header || !styleFilter) return;
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

			if (isAtBottom) {
				styleFilter.classList.add("scrolled-bottom");
			} else {
				styleFilter.classList.remove("scrolled-bottom");
			}

			prevPos = currPos;
			throttleTimeout = null;
		}, 100);
	});
})();

// style-filter 功能列 避開header
const styleFilter = document.querySelector(".style-filter");

let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
	const currentScrollY = window.scrollY;

	if (currentScrollY < lastScrollY) {
		styleFilter.classList.add("scrolled-up");
	} else {
		styleFilter.classList.remove("scrolled-up");
	}

	lastScrollY = currentScrollY;
});

// style-filter btn 功能
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

	const displayedPortfolio = document.querySelector("[data-selected='true']");
	const displayedCategory = displayedPortfolio
		? displayedPortfolio.getAttribute("data-category")
		: null;

	portfolios.forEach((portfolio) => {
		const portfolioCategory = portfolio.getAttribute("data-category");

		const shouldHide =
			displayedCategory && portfolioCategory === displayedCategory;

		if ((category === "all" || portfolioCategory === category) && !shouldHide) {
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

function filterDisplayedPortfolios() {
	const displayedPortfolio = document.querySelector("[data-selected='true']");

	if (displayedPortfolio) {
		const bottomPortfolios = document.querySelectorAll(
			"#design-project .portfolio-size"
		);

		const displayedCategory = displayedPortfolio.getAttribute("data-category");

		bottomPortfolios.forEach((portfolio) => {
			if (portfolio.getAttribute("data-category") === displayedCategory) {
				portfolio.style.display = "none";
			}
		});
	}
}

document.addEventListener("DOMContentLoaded", () => {
	filterDisplayedPortfolios();

	const buttons = document.querySelectorAll(".style-filter .btn");
	buttons.forEach((button) => {
		const category = button.getAttribute("onclick").match(/'([^']+)'/)[1];
		button.onclick = () => filterPortfolios(category);
	});
});

// abbr
let abbr = document.querySelector("abbr");
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

// AOS
AOS.init({
	duration: 1500,
});

// Initialize Swiper
let swiperThumbs;
let swiperMain;

function openSwiper(index) {
	document.getElementById("swiperOverlay").style.display = "flex";

	if (swiperMain && swiperThumbs) {
		swiperMain.params.grabCursor = true;
		console.log(swiperMain.params);
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
	document.getElementById("swiperOverlay").style.display = "none";
	if (swiperMain) swiperMain.slideTo(0);
}
