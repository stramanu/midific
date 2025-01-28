export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
	callback: T,
	delay: number
) {
	let timer: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		const p = new Promise<ReturnType<T> | Error>((resolve, reject) => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				try {
					let output = callback(...args);
					resolve(output);
				} catch (err) {
					if (err instanceof Error) {
						reject(err);
					}
					reject(new Error(`An error has occurred:${err}`));
				}
			}, delay);
		});
		return p;
	};
}

// synchronous function that returns a promise
export function syncRun<T extends (...args: Parameters<T>) => ReturnType<T>>(
	callback: T
) {
	let running = false;
	return async (...args: Parameters<T>) => {
		if (running) return;
		running = true;
		await callback(...args);
		running = false;
	}
}