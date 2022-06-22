const client = require("../sanityClient")

module.exports = async function () {
	const query = `
	*[_type == "entry"] | order(orderRank) {
		entryTitle,
		"entryTypeSlug": entryType -> typeSlug { current },
		entrySlug { current },
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
		entryMainDescription[] {
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
		"entryKeywords": entryKeywords + entryType -> typeKeywords,
		entryMetadata,
		entryContent[] {
			...,
			_type == "mainSection" || _type == "genericSection" => {
				...,
				sectionContent[] {
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
										entrySlug { current },
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
			},
			_type == "fileSection" => {
				...,
				sectionFile {
					...,
					"metadata": {
						"url": asset -> url,
					},
				},
			},
		},
	}
	`
	const params = {}
	return await client.fetch(query, params)
}