//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-C2bE4llQ.js
var manifest = {
	"2eb58ee73d23dd510d1c709fb24c76dbacdd68d7303a090f1cff8199f5346242": {
		functionName: "createSampleWorkspace_createServerFn_handler",
		importer: () => import("./_ssr/sample.functions-CMOpQHC9.mjs")
	},
	"2fe7c19dc876185529e27913260c646aab101873199c455e47fcd780bea350e5": {
		functionName: "proposeStudySessions_createServerFn_handler",
		importer: () => import("./_ssr/partners.functions-BBSjfN6h.mjs")
	},
	"7c6328d4e7394546f68853cc682d21bce05ec5f1dc7315896bc31ff1a54279e2": {
		functionName: "draftTaskPlan_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-KhUCJhpF.mjs")
	},
	"8f823bc2a0137c9407f6044254ac79b4d5442b8ceca8fedf544aebf93cc342dd": {
		functionName: "suggestStudyPartners_createServerFn_handler",
		importer: () => import("./_ssr/partners.functions-BBSjfN6h.mjs")
	},
	"968e2343a83e603c634c8bff31ce533102ddc08547bbf788dc6622316aee2a42": {
		functionName: "removeSampleWorkspace_createServerFn_handler",
		importer: () => import("./_ssr/sample.functions-CMOpQHC9.mjs")
	},
	"dbb05214657ab236ecd62c9578dbfe910a0442a8bf667c72610a3fefb77d0a95": {
		functionName: "breakdownTask_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-KhUCJhpF.mjs")
	},
	"fba7fc8273d3524db1f0de50e7dc7d2f67375b11e725b8407b9e6a48b7d22e77": {
		functionName: "suggestTeammates_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-KhUCJhpF.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ??= await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
