import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Denial Prompt Generator",
  description: "Dashboard for Data Review team to generate denial reasons for agent submissions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-storesight-background dark:bg-storesight-dark-bg antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var e = localStorage.getItem('theme');
                  var m = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var d = e === 'dark' || (!e && m);
                  var html = document.documentElement;
                  html.classList.toggle('dark', d);
                  html.style.colorScheme = d ? 'dark' : 'light';
                } catch (err) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
