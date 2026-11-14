import { l as createServerFn } from "./createServerFn-BhqelEmK.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-CVhGCUbY.mjs";
import { t as createSsrRpc } from "./createSsrRpc-DdtAGDIv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sample.functions-syRnQCGo.js
var createSampleWorkspace = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("2eb58ee73d23dd510d1c709fb24c76dbacdd68d7303a090f1cff8199f5346242"));
var removeSampleWorkspace = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("968e2343a83e603c634c8bff31ce533102ddc08547bbf788dc6622316aee2a42"));
//#endregion
export { removeSampleWorkspace as n, createSampleWorkspace as t };
