"use strict";

const lm = {

	lexicon: {
		feed: document.querySelector(".feed"),
		feedPages: document.querySelectorAll(".feed-page"),
		feedControls: document.querySelectorAll(".feed-control"),
		feedCounter: document.querySelector(".feed-counter"),
		entry: document.querySelector(".entry"),
		entryTitle: document.querySelector(".entry-header > h1"),
		entryNav: document.querySelector(".entry-header > nav"),
		entrySections: document.querySelectorAll(".entry-section"),
		directlyZoomable: document.querySelectorAll('[data-zoomable="direct"'),
	},

	initAllScripts: function() {
		lm.js.initJsScripts();
		lm.text.initTextScripts();
		lm.feed.initFeedScripts();
		lm.entry.initEntryScripts();
		lm.zoomables.initZoomablesScripts();
	},

	js: {
		initJsScripts: function() {
			lm.js.activateJs();
		},
		activateJs: function() {
			document.documentElement.classList.remove("noJs");
		},
	},

	text: {
		initTextScripts: function() {
			lm.text.enableDirAuto();
		},
		enableDirAuto: function() {
			let paragraphs = document.querySelectorAll("p");
			Array.from(paragraphs).forEach((paragraph) => {
				paragraph.setAttribute("dir", "auto");
			});
		},
	},

	feed: {
		initFeedScripts: function() {
			if (!lm.lexicon.feed) { return; }
			if (!lm.lexicon.feedControls || !lm.lexicon.feedCounter) { return; }
			lm.feed.resizeArticles();
			lm.feed.observeIntersections();
			lm.feed.enableArrows();
			lm.feed.enableFeedCounter();
		},
		currentIntersection: null,
		resizeArticles: function() {
			Array.from(lm.lexicon.feedPages).forEach((page) => {
				let articles = page.querySelectorAll(":scope > article");
				articles.forEach((article) => {
					let image = article.querySelector(":scope > div img");
					image.addEventListener("load", () => {
						let articleWidth = article.querySelector(":scope > div").getBoundingClientRect().width;
						let imageWidth = image.getBoundingClientRect().width;
						let ratio = imageWidth / articleWidth * 100;
						let header = article.querySelector(":scope > header");
						if (!header) { return; }
						header.style.setProperty("width", `${ratio}%`);
					});
				});
			});
		},
		observeIntersections: function() {
			let observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						lm.feed.currentIntersection = entry.target;
						lm.feed.updateFeedCounter(entry.target.getAttribute("data-index"));
						entry.target.setAttribute("aria-current", "location");
					} else {
						entry.target.removeAttribute("aria-current");
					}
				});
			}, {
				root: lm.lexicon.feed,
				rootMargin: "0px -50% 0px -50%"
			});
			lm.lexicon.feedPages.forEach((page) => {
				observer.observe(page);
			});
		},
		enableArrows: function() {
			lm.lexicon.feedControls.forEach((control) => {
				let arrow = control.children[0];
				let direction = parseInt(arrow.getAttribute("data-direction"));
				arrow.addEventListener("click", () => {
					lm.feed.seek(direction);
				});
			});
		},
		updateFeedCounter: function(index) {
			Array.from(lm.lexicon.feedCounter.children).forEach((counter) => {
				if (counter.getAttribute("data-index") == index) {
					counter.setAttribute("aria-current", "location");
					lm.lexicon.feedCounter.scrollLeft = counter.offsetLeft - (16 * 0.15) - (lm.lexicon.feedCounter.getBoundingClientRect().width / 2); /* half width of strip */
				} else {
					counter.removeAttribute("aria-current");
				}
			});
		},
		enableFeedCounter: function() {
			Array.from(lm.lexicon.feedCounter.children).forEach((counter) => {
				counter.addEventListener("click", (event) => {
					lm.feed.seekTo(parseInt(event.target.getAttribute("data-index")));
				});
			});
		},
		seek: function(direction) {
			if (direction === -1 && lm.feed.currentIntersection == lm.lexicon.feedPages[0]) {
				lm.lexicon.feed.scrollLeft = lm.lexicon.feed.scrollWidth - lm.lexicon.feed.getBoundingClientRect().width;
				return;
			}
			if (direction === 1 && lm.feed.currentIntersection == lm.lexicon.feedPages[lm.lexicon.feedPages.length - 1]) {
				lm.lexicon.feed.scrollLeft = 0;
				return;
			}
			if (direction === -1) {
				lm.lexicon.feed.scrollLeft = lm.feed.currentIntersection.previousElementSibling.offsetLeft;
			} else if (direction === 1) {
				lm.lexicon.feed.scrollLeft = lm.feed.currentIntersection.nextElementSibling.offsetLeft;
			}
		},
		seekTo: function(index) {
			lm.lexicon.feed.scrollLeft = lm.lexicon.feed.children[index - 1].offsetLeft;
		},
	},

	entry: {
		initEntryScripts: function() {
			if (!lm.lexicon.entry) { return; }
			lm.entry.enableEntryTitle();
			lm.entry.enableEntryNav();
		},
		enableEntryTitle: function() {
			let titleAnchor = lm.lexicon.entryTitle.getElementsByTagName("a")[0];
			titleAnchor.addEventListener("click", (event) => {
				event.preventDefault();
				lm.entry.navigateToEntrySection(event.target.getAttribute("data-target"));
			}, { passive: false });
		},
		enableEntryNav: function() {
			if (!lm.lexicon.entryNav) { return; }
			let navAnchors = lm.lexicon.entryNav.getElementsByTagName("a");
			Array.from(navAnchors).forEach((anchor) => {
				if (anchor.hasAttribute("data-target")) {
					anchor.addEventListener("click", (event) => {
						event.preventDefault();
						lm.entry.highlightEntrySection(event.target);
						lm.entry.navigateToEntrySection(event.target.getAttribute("data-target"));
					}, { passive: false });
				}
			});
		},
		highlightEntrySection: function(target) {
			let navAnchors = lm.lexicon.entryNav.getElementsByTagName("a");
			Array.from(navAnchors).forEach((anchor) => {
				if (anchor === target) {
					anchor.setAttribute("aria-current", "location");
				} else {
					anchor.removeAttribute("aria-current");
				}
			});
		},
		navigateToEntrySection: function(target) {
			if (target === "0") {
				Array.from(lm.lexicon.entrySections).forEach((section) => {
					if (section.getAttribute("data-main-section") === "true") {
						section.setAttribute("aria-current", "location");
					} else {
						section.removeAttribute("aria-current");
					}
				});
			} else {
				Array.from(lm.lexicon.entrySections).forEach((section) => {
					if (section.getAttribute("id") === target) {
						section.setAttribute("aria-current", "location");
					} else {
						section.removeAttribute("aria-current");
					}
				});
			}
		},
	},
	
	zoomables: {
		initZoomablesScripts: function() {
			if (!lm.lexicon.directlyZoomable) { return; }
			lm.zoomables.enableZoomables();
		},
		enableZoomables: function() {
			Array.from(lm.lexicon.directlyZoomable).forEach((zoomable) => {
				zoomable.addEventListener("click", (event) => {
					event.preventDefault();
					lm.zoomables.requestLightbox(event.target);
				}, { passive: false });
			});
		},
		requestLightbox: function(target) {
			if (window.matchMedia("(max-width: 1024px)").matches) {
				lm.zoomables.createCaption(target);
				return;
			}
			let lightbox = document.querySelector(".lightbox");
			if (!lightbox) {
				lm.zoomables.createLightbox(target);
				return;
			}
			lm.zoomables.removeLightbox();
			lm.zoomables.createLightbox(target);
		},
		createCaption: function(target) {
			let imageContainer = target.closest(".entry-section .image") || target.closest(".page-content .image") || target.closest(".feed-page > article");
			let figCaption = target.closest("figure")?.querySelector("figcaption")?.innerHTML;
			let existingTempCaption = imageContainer.querySelector(".tempCaption");
			if (!imageContainer || !figCaption) { return; }
			if (existingTempCaption) {
				existingTempCaption.remove();
				return;
			}
			let newWrapper = document.createElement("div");
			newWrapper.classList.add("tempCaption");
			newWrapper.innerHTML = figCaption;
			imageContainer.appendChild(newWrapper);
		},
		createLightbox: function(target) {
			let lightbox = document.createElement("div");
			let closeLightbox = document.createElement("div");
			let previousLightbox = document.createElement("div");
			let nextLightbox = document.createElement("div");
			let closeButton = document.querySelector("template").content.querySelector(".close-button").cloneNode(true);
			let leftArrow = document.querySelector("template").content.querySelector(".left-arrow").cloneNode(true);
			let rightArrow = document.querySelector("template").content.querySelector(".right-arrow").cloneNode(true);
			let figure = target.closest("figure").cloneNode(true);
			let anchor = figure.querySelector(":scope > a");
			let image = figure.querySelector("img");
			if (anchor && !anchor.getAttribute("data-zoomable") && image.getAttribute("data-zoomable")) {
				let linkToProject = document.createElement("a");
				linkToProject.setAttribute("href", anchor.getAttribute("href"));
				linkToProject.innerHTML = "See More";
				figure.appendChild(linkToProject);
			}
			closeLightbox.classList.add("close-lightbox");
			closeLightbox.setAttribute("title", "Close");
			previousLightbox.classList.add("previous-lightbox");
			previousLightbox.setAttribute("title", "Previous");
			nextLightbox.classList.add("next-lightbox");
			nextLightbox.setAttribute("title", "Next");
			closeLightbox.addEventListener("click", () => {
				lm.zoomables.removeLightbox();
			}, { once: true });
			previousLightbox.addEventListener("click", () => {
				lm.zoomables.seekLightbox(-1, target)
			}, { once: true });
			nextLightbox.addEventListener("click", () => {
				lm.zoomables.seekLightbox(1, target);
			}, { once: true });
			lightbox.classList.add("lightbox");
			lightbox.setAttribute("aria-hidden", "true");
			figure.removeAttribute("style");
			image.removeAttribute("data-zoomable");
			image.removeAttribute("title");
			image.removeAttribute("alt");
			if (anchor) {
				anchor.replaceWith(...anchor.childNodes);
			}
			lightbox.appendChild(figure);
			lightbox.appendChild(closeLightbox);
			lightbox.appendChild(previousLightbox);
			lightbox.appendChild(nextLightbox);
			closeLightbox.appendChild(closeButton);
			previousLightbox.appendChild(leftArrow);
			nextLightbox.appendChild(rightArrow);
			document.body.appendChild(lightbox);
			document.body.style.setProperty("overflow", "hidden");
		},
		removeLightbox: function() {
			let lightbox = document.querySelector(".lightbox");
			lightbox.remove();
			document.body.style.removeProperty("overflow");
		},
		seekLightbox: function(direction, target) {
			var container;
			var possibleTargets;
			var parent;
			var index;
			if (lm.lexicon.feed) {
				container = target.closest(".feed");
				possibleTargets = container.querySelectorAll("article");
				parent = target.closest("article");
			} else {
				container = target.closest(".entry-section") || target.closest(".page-content");
				possibleTargets = container.querySelectorAll(".image");
				parent = target.closest(".image");
			}
			index = Array.from(possibleTargets).indexOf(parent);
			if (index == 0 && direction == -1) {
				lm.zoomables.requestLightbox(possibleTargets[possibleTargets.length - 1].querySelector("img[data-zoomable]"));
				return;
			}
			if (direction === 1 && !possibleTargets[index + 1]) {
				lm.zoomables.requestLightbox(possibleTargets[0].querySelector("img[data-zoomable]"));
				return;
			}
			lm.zoomables.requestLightbox(possibleTargets[index + direction].querySelector("img[data-zoomable]"));
		},
	},
}

lm.initAllScripts();