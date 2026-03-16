import type { Metadata } from "next";
import { Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "END ROLL MAKER",
  description: "あなたの人生のエンドロールをつくろう",
  metadataBase: new URL("https://end-roll-maker-three.vercel.app"),
  openGraph: {
    title: "END ROLL MAKER",
    description: "あなたの人生のエンドロールをつくろう",
    images: ["https://og-api-self.vercel.app/api/og?title=END%20ROLL%20MAKER&category=Tools%20%26%20Utility"],
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@1&family=Playfair+Display&family=Noto+Serif+JP:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${notoSerifJP.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
