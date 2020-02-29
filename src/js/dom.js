export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

export const replaceEl = (oldEl, newEl) => oldEl.parentElement.replaceChild(newEl, oldEl);

export const toggleVisible = (el, isVisible) => el.style.display = isVisible ? '' : 'none';
