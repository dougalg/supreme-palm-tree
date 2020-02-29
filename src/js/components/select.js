function appendLanguageSelectOption(parent, language) {
	const child = document.createElement('option');
	child.value = language.code;
	child.innerText = language.name;
	parent.appendChild(child);
}

export function cloneSelectBoxWithLanguageOptions(oldSelectBox, languages) {
	const newSelectBox = oldSelectBox.cloneNode(false);

	Object.values(languages)
		.sort((a, b) => a.code - b.code)
		.forEach((lang) => {
			appendLanguageSelectOption(newSelectBox, lang);
		});

	return newSelectBox;
}
