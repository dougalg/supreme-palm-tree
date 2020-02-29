import { LANGUAGES } from './constants/languages.js';
import { replaceEl, toggleVisible } from './dom.js';
import { raf } from './raf.js';
import { fetchPageByTitleAndLanguage } from './api.js';
import { cloneSelectBoxWithLanguageOptions } from './components/select.js';
import { renderToc } from './components/toc.js';


const STATUS = {
	LOADING: Symbol(),
	LOADED: Symbol(),
	NOT_FOUND_ERROR: Symbol(),
	MISC_ERROR: Symbol(),
};

const sanitizeTitle = (title) => title.replace(' ', '_');

export class App {
	constructor() {}

	initForm(searchForm, initialSelectBox, articleTitleField) {
		const selectBox = cloneSelectBoxWithLanguageOptions(initialSelectBox, LANGUAGES);
		// Given the simplicity of the page, RAF isn't super necessary here
		raf(() => {
			replaceEl(initialSelectBox, selectBox);
		});

		/**
		 * Changing the page content based on a select box value change is unexpected behaviour, and not
		 * recommended as it can cause a variety of issues for users with accessibility needs.
		 *
		 * If this were a real project, I would recommend against this pattern, but have implemented
		 * it for now, as it was requested.
		 */
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

	setContainers(errorNotFound, errorMisc, toc, statusContainer) {
		this.statusContainer = statusContainer;
		this.toc = toc;
		this.errorNotFound = errorNotFound;
		this.errorMisc = errorMisc;
	}

	performTocFetch() {
		const langCode = this.selectBox.value;
		const isRtl = LANGUAGES[langCode].isRtl;
		const errorHidePromise = this.setStatus(STATUS.LOADING);
		const articleTitle = sanitizeTitle(this.articleTitleField.value);
		fetchPageByTitleAndLanguage(articleTitle, this.selectBox.value)
			.then((resp) => resp.ok ? resp.json() : Promise.reject(resp))
			.then(({ toc }) => ({ toc, isRtl, langCode, articleTitle }))
			.then(renderToc)
			// Ensure that errors are already hidden before rendering new TOC, to avoid confusing the user
			.then((toc) => errorHidePromise.then(() => toc))
			.then((toc) => this.insertToc(toc))
			.then(() => this.setStatus(STATUS.LOADED))
			.catch((e) => this.handleError(e));
	}

	insertToc(newToc) {
		return raf(() => {
			replaceEl(this.toc, newToc);
			this.toc = newToc;
		});
	}


	setStatus(status) {
		return raf(() => {
			this.statusContainer.innerHTML = this.getStatusText(status);
		});
	}

	getStatusText(status) {
		switch (status) {
		case STATUS.LOADED:
			return 'Content loaded.';
		case STATUS.LOADING:
			return 'Fetching content.';
		case STATUS.NOT_FOUND_ERROR:
			return this.errorNotFound.cloneNode(true).innerHTML;
		case STATUS.MISC_ERROR:
		default:
			return this.errorMisc.cloneNode(true).innerHTML;
		}
	}

	handleError(resp) {
		return raf(() => {
			toggleVisible(this.toc, false);
			if (resp.status === 404) {
				this.setStatus(STATUS.NOT_FOUND_ERROR);
			}
			else {
				this.setStatus(STATUS.MISC_ERROR);
			}
			console.log(resp);
		});
	}
}
