const sanitizeTitle = (title) => title.replace(' ', '_');

const getFetchUrl = (title, language) => `https://${language}.wikipedia.org/api/rest_v1/page/metadata/${sanitizeTitle(title)}`;

export function fetchPageByTitleAndLanguage(title, language) {
	const options = {
		redirect: 'follow',
		headers: {
			'Content-Type': 'application/json',
		},
	};
	return window.fetch(getFetchUrl(title, language), options);
}
