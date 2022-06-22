const toHTML = require("@portabletext/to-html").toHTML
const uriLooksSafe = require("@portabletext/to-html").uriLooksSafe
const sanityClient = require("./sanityClient")
const sanityImage = require("eleventy-plugin-sanity-image")
const util = require("util")
const eleventyImage = require("@11ty/eleventy-img")
const svgContents = require("eleventy-plugin-svg-contents")

async function getSiteLogo(src, alt) {
	let metadata = await eleventyImage(src, {
		widths: [null],
		formats: ["svg"],
		urlPath: "/assets/media/",
		outputDir: "./_site/assets/media/",
		filenameFormat: function() {
			return "logo.svg"
		}
	})
	let attributes = {
		alt,
		decoding: "async",
	}
	return eleventyImage.generateHTML(metadata, attributes)
}

module.exports = function(eleventyConfig) {

	eleventyConfig.addPlugin(svgContents)

	eleventyConfig.addNunjucksAsyncShortcode("siteLogo", getSiteLogo)

	eleventyConfig.addFilter("getAttributeFromString", function(value, attribute) {
		const regex = new RegExp(`${attribute}=\"?\'?([A-Za-z0-9 _]*)\"?\'?`)
		return value.replace(/\s/g, "").match(regex)[1]
	})

	eleventyConfig.addPassthroughCopy({
		"_assets": "assets"
	})

	eleventyConfig.addFilter("console", function(value) {
		return util.inspect(value)
	})

	eleventyConfig.addFilter("strip", function(value) {
		return value.replace(/\s+/g, " ").trim()
	})

	eleventyConfig.addPlugin(sanityImage, {
		client: sanityClient
	})

	eleventyConfig.addFilter("truncate", function(value, limit) {
		if (value.length > limit) {
			return value.substring(0, limit) + "..."
		}
		return value
	})

	eleventyConfig.addFilter("portableTextToHtml", function(value) {
		return toHTML(value, {
			components: {
				/* optional object of custom components to use */
				types: {
					readMore: ({value}) => {
						return `<label for="\$\{replaceMe\}" tabindex="0" title="Read more"></label>`
					},
				},
				marks: {
					internalLink: ({children, value}) => {
						const pageTitle = value?.reference?.pageTitle
						const pageSlug = value?.reference?.pageSlug?.current
						const entryTitle = value?.reference?.entryTitle
						const entrySlug = value?.reference?.entrySlug?.current
						const entryTypeSlug = value?.reference?.entryTypeSlug?.current
						const title = pageTitle ? `${pageTitle}` : `${entryTitle}`
						const href = pageSlug ? `/${pageSlug}/` : `/${entryTypeSlug}/${entrySlug}/`
						return `<a href="${href.replace("///", "/")}" title="${title}">${children}</a>`
					},
					externalLink: ({children, value}) => {
						const href = value.url || ""
						if (uriLooksSafe(href)) {
							const rel = href.startsWith("/") ? undefined : "noopener"
							return `<a href="${href}" rel="${rel}">${children}</a>`
						}
						return children
					},
				},
			},
		})
	})

	eleventyConfig.addFilter("portableTextToPlainText", function(value) {
		if (value) {
			return value
				// loop through each block
				.map(block => {
					// if it's not a text block with children, 
					// return nothing
					if (block._type !== "block" || !block.children) {
						return ""
					}
					// loop through the children spans, and join the
					// text strings
					return block.children.map(child => child.text).join("")
				})
				// join the paragraphs leaving split by two linebreaks
				.join("\n\n")
		}
	})

	return {
		dir: {
			input: ".",
			includes: "_includes",
			layouts: "_layouts",
			data: "_data",
			output: "_site",
		}
	}

}