import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except:
  // - /api, /_next, /_vercel
  // - static files (have a "." like /favicon.ico, /image.png)
  // - /tracabilite-cdc (FR-only technical doc)
  matcher: ["/((?!api|_next|_vercel|tracabilite-cdc|.*\\..*).*)"],
};
