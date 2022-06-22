const client = require("../sanityClient")

module.exports = async function () {
	const query = `
	*[_type == "entryType"] | order(orderRank) {
		_id,
		typeSingular,
		typePlural,
		typeSlug { current },
		typeKeywords,
		feedDisplayAspectRatio,
		feedDisplaySize,
		feedDisplayRows,
		"entries": *[_type == "entry" && entryType._ref == ^._id] | order(orderRank) {
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