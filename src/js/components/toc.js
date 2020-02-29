const createOl = (isRtl) => {
	const ol = document.createElement('ol');
	if (isRtl) {
		ol.classList.add('toc--is-rtl');
	}
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
	let ols = [];
	const ol = createOl(isRtl);
	ol.id = 'toc';

	let previousLevel = 1;
	ols.push(ol);
	toc.entries.forEach((entry) => {
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
