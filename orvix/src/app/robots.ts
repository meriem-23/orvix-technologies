import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/espace", "/auth", "/connexion", "/inscription"] },
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
