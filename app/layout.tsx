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
  openGraph: {
    title: "END ROLL MAKER",
    description: "あなたの人生のエンドロールをつくろう",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
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
      </head>
      <body className={`${notoSerifJP.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
