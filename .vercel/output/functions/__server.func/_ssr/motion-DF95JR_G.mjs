//#region node_modules/.nitro/vite/services/ssr/assets/motion-DF95JR_G.js
var fadeUp = {
	hidden: {
		opacity: 0,
		y: 12
	},
	show: {
		opacity: 1,
		y: 0,
		transition: {
			duration: .25,
			ease: [
				.22,
				1,
				.36,
				1
			]
		}
	}
};
var stagger = {
	hidden: {},
	show: { transition: {
		staggerChildren: .05,
		delayChildren: .03
	} }
};
//#endregion
export { stagger as n, fadeUp as t };
