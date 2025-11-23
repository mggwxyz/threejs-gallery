export function randomNumber(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number) {
	return Math.floor(randomNumber(min, max));
}



/**
 * Generates a random number in an exponential distribution.
 *
 * @param min The minimum value of the distribution
 * @param max The maximum value of the distribution
 * @param lambda The lambda parameter of the exponential distribution. A larger lambda will result in a more concentrated distribution around the mean.
 * @returns A random number in the exponential distribution.
 */
export function randomNumberInExponentialDistribution(min: number, max: number, lambda: number) {
	const number = -Math.log(1 - Math.random()) / lambda;
	return Math.min(number, 1) * (max - min) + min;
}
