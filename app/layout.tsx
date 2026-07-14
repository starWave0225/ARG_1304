import type { Metadata } from "next";
import "./globals.css";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://starwave0225.github.io/ARG_1304/");
const title = "1304：不存在的住户";
const description = "登录澄江物业中台，处理一张来自空房的工单。你看到的住户，未必还活着。";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    images: [{ url: new URL("og.png", siteUrl).toString(), width: 1672, height: 941, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [new URL("og.png", siteUrl).toString()],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
