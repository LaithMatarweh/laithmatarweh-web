const client = require("../sanityClient")

module.exports = async function () {
	const query = `
	*[_type == "siteInformation"] {
		siteTitle,
		siteDescription,
		siteAuthor,
		siteInstagramLink,
		siteFooterInformation,
		siteLogo {
			...,
			"url": asset -> url,
		},
		siteKeywords,
		siteUrl,
		siteBaseUrl,
		siteAnalyticsSnippet
	}[0]
	`
	const params = {}
	return await client.fetch(query, params)
}