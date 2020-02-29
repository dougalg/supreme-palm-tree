const createOl = (isRtl) => {
	const ol = document.createElement('ol');
	/**
	 * Because the standard counters are hidden, we need to set aria-role to list
	 * if we want screen readers to read it as a list. There is some debate about
	 * how necessary this is, but I feel it is a better experience in this use case.
	 */
	ol.setAttribute('aria-role', 'list');
	ol.classList.add('toc__list');
	return ol;
};

const createSpan = (html, classes) => {
	const span = document.createElement('span');
	span.innerHTML = html;
	span.classList.add(classes);
	return span;
};

const createAnchor = (html, counter) => {
	const a = document.createElement('a');
	a.appendChild(counter);
	a.appendChild(html);
	return a;
};

const createLi = ({ html, number }) => {
	const li = document.createElement('li');
	// See above comment for OL regarding aria roles
	li.setAttribute('aria-role', 'listitem');
	const counter = createSpan(number, 'toc__counter');
	const text = createSpan(html, [ 'toc__text' ]);
	const anchor = createAnchor(text, counter);
	li.appendChild(anchor);
	return li;
};

const truncateOls = (uls, level) => uls.slice(0, level);

const addNewOl = (uls) => {
	const parentUl = uls[uls.length - 1];
	const newUl = createOl();
	parentUl.appendChild(newUl);
	uls.push(newUl);
	return uls;
};

export function renderToc({ toc, isRtl }) {
	return createNav(toc.title, isRtl, renderTocOl(toc.entries));
}

function createTitle(title) {
	const h2 = document.createElement('h2');
	h2.innerHTML = title;
	return h2;
}

const TOC_TITLE_ID = 'toc__toc';
function createNav(titleText, isRtl, toc) {
	const title = createTitle(titleText);
	title.id = TOC_TITLE_ID;

	const nav = document.createElement('nav');
	nav.setAttribute('aria-describedby', TOC_TITLE_ID);
	nav.appendChild(title);
	nav.appendChild(toc);
	nav.classList.add('toc');
	if (isRtl) {
		nav.classList.add('toc--is-rtl');
	}
	return nav;

}

function renderTocOl(entries) {
	let ols = [];
	const ol = createOl();

	let previousLevel = 1;
	ols.push(ol);
	entries.forEach((entry) => {
		if (previousLevel < entry.level) {
			ols = addNewOl(ols);
		}
		else if (previousLevel > entry.level) {
			ols = truncateOls(ols, entry.level);
		}
		const currentUl = ols[ols.length - 1];
		const li = createLi(entry);
		currentUl.appendChild(li);
		previousLevel = entry.level;
	});
	return ol;
}
