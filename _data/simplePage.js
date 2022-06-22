const client = require("../sanityClient")

module.exports = async function () {
	const query = `
	*[_type == "page"] | order(orderRank) {
		pageTitle,
		pageSlug { current },
		pageKeywords,
		pageMainEmbeddedMedia,
		pageMainImage {
			...,
			"metadata": {
				"lqip": asset -> metadata.lqip,
				"dimensions": asset -> metadata.dimensions {
					aspectRatio,
					height,
					width,
				},
			},
			caption[] {
				...,
				markDefs[] {
					...,
					_type == "internalLink" => {
						"reference": @.reference -> {
							entryTitle,
							entrySlug { current },
							"entryTypeSlug": entryType -> typeSlug { current },
							pageTitle,
							pageSlug { current },
						},
					},
				},
			},
		},
		pageMainDescription[] {
			...,
			markDefs[] {
				...,
				_type == "internalLink" => {
					"reference": @.reference -> {
						entryTitle,
						entrySlug { current },
						"entryTypeSlug": entryType -> typeSlug { current },
						pageTitle,
						pageSlug { current },
					},
				},
			},
		},
		pageContent[] {
			...,
			_type == "portableTextObject" => {
				...,
				portableText[] {
					...,
					markDefs[] {
						...,
						_type == "internalLink" => {
							"reference": @.reference -> {
								entryTitle,
								entrySlug{ current },
								"entryTypeSlug": entryType -> typeSlug { current },
								pageTitle,
								pageSlug { current },
							},
						},
					},
				},
			},
			_type == "imageObject" => {
				...,
				image {
					...,
					"metadata": {
						"lqip": asset -> metadata.lqip,
						"dimensions": asset -> metadata.dimensions {
							aspectRatio,
							height,
							width,
						},
					},
				},
				caption[] {
					...,
					markDefs[] {
						...,
						_type == "internalLink" => {
							"reference": @.reference -> {
								entryTitle,
								entrySlug { current },
								"entryTypeSlug": entryType -> typeSlug { current },
								pageTitle,
								pageSlug { current },
							},
						},
					},
				},
			},
		},
		homepageFeed[] -> {
			entryTitle,
			entrySlug { current },
			"entryTypeSlug": entryType -> typeSlug { current },
			entryMainImage {
				...,
				"metadata": {
					"lqip": asset -> metadata.lqip,
					"dimensions": asset -> metadata.dimensions {
						aspectRatio,
						height,
						width,
					},
					"url": asset -> url,
				},
				caption[] {
					...,
					markDefs[] {
						...,
						_type == "internalLink" => {
							"reference": @.reference -> {
								entryTitle,
								entrySlug { current },
								"entryTypeSlug": entryType -> typeSlug { current },
								pageTitle,
								pageSlug { current },
							},
						},
					},
				},
			},
		},
	}
	`
	const params = {}
	return await client.fetch(query, params)
}