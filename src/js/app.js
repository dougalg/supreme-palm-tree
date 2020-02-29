import { LANGUAGES } from './constants/languages.js';
import { replaceEl, toggleVisible } from './dom.js';
import { raf } from './raf.js';
import { fetchPageByTitleAndLanguage } from './api.js';
import { cloneSelectBoxWithLanguageOptions } from './components/select.js';
import { renderToc } from './components/toc.js';


export class App {
	constructor() {}

	initForm(searchForm, initialSelectBox, articleTitleField) {
		const selectBox = cloneSelectBoxWithLanguageOptions(initialSelectBox, LANGUAGES);
		// Given the simplicity of the page, RAF isn't super necessary here
		raf(() => {
			replaceEl(initialSelectBox, selectBox);
		});

		selectBox.addEventListener('change', () => {
			const title = this.articleTitleField.value.replace(/\s/g, '');
			if (title.length > 0) {
				this.performTocFetch();
			}
		});
		searchForm.addEventListener('submit', (e) => {
			e.preventDefault();
			this.performTocFetch();
		});

		this.selectBox = selectBox;
		this.articleTitleField = articleTitleField;
	}

	setContainers(errorNotFound, errorMisc, toc, tocTitle) {
		this.tocTitle = tocTitle;
		this.toc = toc;
		this.errorNotFound = errorNotFound;
		this.errorMisc = errorMisc;
	}

	performTocFetch() {
		const langCode = this.selectBox.value;
		const isRtl = LANGUAGES[langCode].isRtl;
		const errorHidePromise = this.hideErrors();
		fetchPageByTitleAndLanguage(this.articleTitleField.value, this.selectBox.value)
			.then((resp) => resp.ok ? resp.json() : Promise.reject(resp))
			.then(({ toc }) => ({ toc, isRtl }))
			.then(renderToc)
			// Ensure that errors are already hidden before rendering new TOC, to avoid confusing the user
			.then((toc) => errorHidePromise.then(() => toc))
			.then((toc) => this.insertToc(toc))
			.catch((e) => this.renderError(e));
	}

	insertToc(newToc) {
		return raf(() => {
			replaceEl(this.toc, newToc);
			this.toc = newToc;
		});
	}

	hideErrors() {
		return raf(() => {
			toggleVisible(this.errorNotFound, false);
			toggleVisible(this.errorMisc, false);
		});
	}

	renderError(resp) {
		return raf(() => {
			toggleVisible(this.toc, false);
			if (resp.status === 404) {
				toggleVisible(this.errorNotFound, true);
			}
			else {
				toggleVisible(this.errorMisc, true);
			}
			console.log(resp);
		});
	}
}
