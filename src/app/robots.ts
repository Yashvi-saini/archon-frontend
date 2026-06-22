import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://archon-frontend-iota.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/verify-otp",
        "/reset-password",
        "/forgot-password",
        "/dashboard/", // Protect
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
