// This way it is easy to wait on a requestAnimationFrame, and wait for the dom update to be completed before we proceed
export function raf(cb) {
	return new Promise((res) => {
		window.requestAnimationFrame(() => {
			cb();
			res();
		});
	});
}
