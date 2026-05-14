(function () {
	const motionSafe = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	let gsapPromise;
	let scrollTriggerPromise;

	function loadGSAP() {
		if (window.gsap) return Promise.resolve(window.gsap);
		if (gsapPromise) return gsapPromise;

		gsapPromise = new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";
			script.onload = () => resolve(window.gsap);
			script.onerror = reject;
			document.head.appendChild(script);
		});

		return gsapPromise;
	}

	function withGSAP(callback) {
		if (!motionSafe) return;
		loadGSAP()
			.then((gsap) => callback(gsap))
			.catch(() => {});
	}

	function loadScrollTrigger() {
		if (window.ScrollTrigger) return Promise.resolve(window.ScrollTrigger);
		if (scrollTriggerPromise) return scrollTriggerPromise;

		scrollTriggerPromise = loadGSAP().then(
			() =>
				new Promise((resolve, reject) => {
					const script = document.createElement("script");
					script.src =
						"https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js";
					script.onload = () => {
						if (window.gsap && window.ScrollTrigger) {
							gsap.registerPlugin(ScrollTrigger);
						}
						resolve(window.ScrollTrigger);
					};
					script.onerror = reject;
					document.head.appendChild(script);
				})
		);

		return scrollTriggerPromise;
	}

	function withScrollTrigger(callback) {
		if (!motionSafe) return;
		Promise.all([loadGSAP(), loadScrollTrigger()])
			.then(([gsap, ScrollTrigger]) => callback(gsap, ScrollTrigger))
			.catch(() => {});
	}

	function initAbbrHomeLink() {
		const abbrElement = document.querySelector("abbr[data-title]");
		if (!abbrElement) return;

		abbrElement.addEventListener("click", () => {
			window.location.href = "index.html";
		});
	}

	function initAbbrLetters() {
		const abbr = document.querySelector("abbr");
		if (!abbr || !abbr.dataset.title) return;

		abbr.textContent = "";
		const words = abbr.dataset.title.split(" ");

		words.forEach((word) => {
			const [initial, ...restLetters] = word.split("");
			const initialSpan = document.createElement("span");
			initialSpan.textContent = initial;
			initialSpan.className = "initial";
			abbr.append(initialSpan);

			restLetters.forEach((letter) => {
				const hiddenSpan = document.createElement("span");
				hiddenSpan.textContent = letter;
				hiddenSpan.className = "hidden";
				abbr.append(hiddenSpan);
			});
		});
	}

	function initNav() {
		const hamburgerMenu = document.querySelector(".hamburger-menu");
		const navbar = document.querySelector(".navbar");
		if (!hamburgerMenu || !navbar) return;

		hamburgerMenu.addEventListener("click", () => {
			navbar.classList.toggle("active");
			hamburgerMenu.classList.toggle("active");
		});

		document.querySelectorAll(".nav-text").forEach((item) => {
			item.addEventListener("click", () => {
				const targetElement = document.querySelector(item.getAttribute("data-target"));
				if (targetElement) {
					targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
				}

				navbar.classList.remove("active");
				hamburgerMenu.classList.remove("active");
			});
		});
	}

	function initRippleButtons() {
		document.querySelectorAll(".btn").forEach((button) => {
			button.addEventListener("click", (event) => {
				const circle = document.createElement("span");
				const diameter = Math.max(button.clientWidth, button.clientHeight);
				const radius = diameter / 2;

				circle.style.width = circle.style.height = `${diameter}px`;
				circle.style.left = `${event.offsetX - radius}px`;
				circle.style.top = `${event.offsetY - radius}px`;
				circle.classList.add("ripple");

				const ripple = button.querySelector(".ripple");
				if (ripple) ripple.remove();

				button.appendChild(circle);
			});
		});
	}

	function revealOnEnter(selector, options = {}) {
		withScrollTrigger((gsap, ScrollTrigger) => {
			const items = Array.from(document.querySelectorAll(selector));
			if (!items.length) return;

			gsap.set(items, {
				autoAlpha: 0,
				y: options.y ?? 34,
				scale: options.scale ?? 1,
			});

			ScrollTrigger.batch(items, {
				start: options.start ?? "top 86%",
				once: options.once ?? true,
				onEnter: (batch) => {
					gsap.to(batch, {
						autoAlpha: 1,
						y: 0,
						scale: 1,
						duration: options.duration ?? 0.75,
						ease: options.ease ?? "power3.out",
						stagger: options.stagger ?? 0.08,
						overwrite: true,
					});
				},
			});
		});
	}

	function animateVisibleItems(items) {
		withGSAP((gsap) => {
			gsap.fromTo(
				items,
				{ autoAlpha: 0, y: 28, scale: 0.98 },
				{
					autoAlpha: 1,
					y: 0,
					scale: 1,
					duration: 0.65,
					ease: "power3.out",
					stagger: 0.05,
					overwrite: true,
				}
			);
		});
	}

	function initHeaderIntro(target = "header") {
		withGSAP((gsap) => {
			gsap.fromTo(
				target,
				{ y: -28, autoAlpha: 0 },
				{ y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" }
			);
		});
	}

	function initPortfolioCardMotion(selector = ".portfolio-size") {
		withGSAP((gsap) => {
			document.querySelectorAll(selector).forEach((card) => {
				const image = card.querySelector(".latest-work-portfolio");
				const labelItems = card.querySelectorAll(".portfolio-name p");

				card.addEventListener("mouseenter", () => {
					gsap.to(card, {
						y: -8,
						duration: 0.45,
						ease: "power3.out",
						overwrite: true,
					});
					gsap.fromTo(
						labelItems,
						{ y: 12, autoAlpha: 0 },
						{
							y: 0,
							autoAlpha: 1,
							duration: 0.45,
							ease: "power3.out",
							stagger: 0.08,
							overwrite: true,
						}
					);
					if (image) {
						gsap.to(image, {
							scale: 1.06,
							duration: 0.8,
							ease: "power3.out",
							overwrite: true,
						});
					}
				});

				card.addEventListener("mouseleave", () => {
					gsap.to(card, {
						y: 0,
						duration: 0.5,
						ease: "power3.out",
						overwrite: true,
					});
					if (image) {
						gsap.to(image, {
							scale: 1,
							duration: 0.8,
							ease: "power3.out",
							overwrite: true,
						});
					}
				});
			});
		});
	}

	function initImageHover(selector) {
		withGSAP((gsap) => {
			document.querySelectorAll(selector).forEach((image) => {
				image.addEventListener("mouseenter", () => {
					gsap.to(image, {
						scale: 1.035,
						duration: 0.75,
						ease: "power3.out",
						overwrite: true,
					});
				});
				image.addEventListener("mouseleave", () => {
					gsap.to(image, {
						scale: 1,
						duration: 0.75,
						ease: "power3.out",
						overwrite: true,
					});
				});
			});
		});
	}

	function initTextMasking(selector, options = {}) {
		withScrollTrigger((gsap, ScrollTrigger) => {
			const items = Array.from(document.querySelectorAll(selector)).filter(
				(item) => !item.dataset.textMasked && item.textContent.trim().length
			);
			if (!items.length) return;

			items.forEach((item) => {
				const inner = document.createElement("span");
				inner.className = "text-mask__inner";

				while (item.firstChild) {
					inner.appendChild(item.firstChild);
				}

				item.appendChild(inner);
				item.classList.add("text-mask");
				item.dataset.textMasked = "true";
			});

			const inners = items.map((item) => item.querySelector(".text-mask__inner"));
			gsap.set(inners, {
				yPercent: options.yPercent ?? 112,
				autoAlpha: 0,
				rotateX: options.rotateX ?? 8,
				transformOrigin: "0% 100%",
			});

			items.forEach((item, itemIndex) => {
				const inner = item.querySelector(".text-mask__inner");

				ScrollTrigger.create({
					trigger: item,
					start: options.start ?? "top 88%",
					once: options.once ?? true,
					onEnter: () => {
						gsap.to(inner, {
							yPercent: 0,
							autoAlpha: 1,
							rotateX: 0,
							duration: options.duration ?? 0.95,
							ease: options.ease ?? "power4.out",
							delay:
								(options.delay ?? 0) +
								(options.staggerByIndex ? itemIndex * options.staggerByIndex : 0),
							overwrite: true,
						});
					},
				});
			});
		});
	}

	function scrambleText(selectorOrItems, options = {}) {
		withGSAP((gsap) => {
			const items =
				typeof selectorOrItems === "string"
					? Array.from(document.querySelectorAll(selectorOrItems))
					: Array.from(selectorOrItems || []);
			if (!items.length) return;

			const chars =
				options.chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			items.forEach((item, index) => {
				const original = item.dataset.scrambleText || item.textContent.trim();
				if (!original) return;

				item.dataset.scrambleText = original;
				gsap.killTweensOf(item);

				const state = { progress: 0 };
				gsap.to(state, {
					progress: 1,
					duration: options.duration ?? 0.85,
					delay: (options.delay ?? 0) + index * (options.stagger ?? 0.06),
					ease: options.ease ?? "power2.out",
					onUpdate: () => {
						const revealCount = Math.floor(original.length * state.progress);
						let output = original.slice(0, revealCount);

						for (let charIndex = revealCount; charIndex < original.length; charIndex++) {
							const currentChar = original[charIndex];
							output += currentChar === " " ? " " : chars[Math.floor(Math.random() * chars.length)];
						}

						item.textContent = output;
					},
					onComplete: () => {
						item.textContent = original;
					},
				});
			});
		});
	}

	function animateOverlayOpen(overlay, contentSelector) {
		withGSAP((gsap) => {
			gsap.fromTo(
				overlay,
				{ autoAlpha: 0 },
				{ autoAlpha: 1, duration: 0.35, ease: "power2.out" }
			);
			gsap.fromTo(
				contentSelector,
				{ autoAlpha: 0, y: 24, scale: 0.96 },
				{
					autoAlpha: 1,
					y: 0,
					scale: 1,
					duration: 0.65,
					ease: "power3.out",
					delay: 0.08,
				}
			);
		});
	}

	function animateOverlayClose(overlay, onComplete) {
		if (motionSafe && window.gsap) {
			window.gsap.to(overlay, {
				autoAlpha: 0,
				duration: 0.25,
				ease: "power2.in",
				onComplete,
			});
			return;
		}

		onComplete();
	}

	function initSharedUI() {
		initAbbrHomeLink();
		initAbbrLetters();
		initNav();
		initRippleButtons();
		initHeaderIntro();
		initFooterBounce();
	}

	function initFooterBounce() {
		const footer = document.querySelector(".contant-info");
		const curve = document.querySelector(".footer-bounce__curve");
		if (!footer || !curve) return;

		withScrollTrigger((gsap, ScrollTrigger) => {
			const updateCurve = (amount = 0) => {
				const y = 46 + amount;
				curve.setAttribute("d", `M0,46 C240,${y} 720,${y} 1200,46 L1200,120 L0,120 Z`);
			};

			gsap.set(footer, { transformOrigin: "50% 100%" });
			updateCurve(0);

			ScrollTrigger.create({
				trigger: footer,
				start: "top bottom",
				end: "bottom bottom",
				onUpdate: (self) => {
					const velocity = Math.max(-34, Math.min(34, self.getVelocity() / 42));

					gsap.killTweensOf(curve);
					updateCurve(velocity);
					gsap.to(curve, {
						duration: 1.2,
						ease: "elastic.out(1, 0.35)",
						attr: {
							d: "M0,46 C240,46 720,46 1200,46 L1200,120 L0,120 Z",
						},
					});

					gsap.to(footer, {
						y: Math.abs(velocity) * -0.18,
						duration: 0.45,
						ease: "power2.out",
						overwrite: true,
					});
					gsap.to(footer, {
						y: 0,
						duration: 0.9,
						ease: "elastic.out(1, 0.45)",
						delay: 0.08,
						overwrite: false,
					});
				},
			});
		});
	}

	window.SYCommon = {
		motionSafe,
		loadGSAP,
		loadScrollTrigger,
		withGSAP,
		withScrollTrigger,
		revealOnEnter,
		animateVisibleItems,
		initHeaderIntro,
		initPortfolioCardMotion,
		initImageHover,
		initTextMasking,
		scrambleText,
		animateOverlayOpen,
		animateOverlayClose,
		initSharedUI,
	};
})();
