import { i as __toESM } from "../_runtime.mjs";
import { G as isRedirect, S as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as TSS_SERVER_FUNCTION } from "./createServerFn-BhqelEmK.mjs";
import { o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-C2bE4llQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createSsrRpc-DdtAGDIv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
export { useServerFn as n, createSsrRpc as t };
