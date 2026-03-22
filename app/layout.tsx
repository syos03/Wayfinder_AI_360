import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { BottomNavWrapper } from "@/components/common/bottom-nav-wrapper";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { WebVitals } from "@/components/monitoring/web-vitals";
import { Toaster } from "sonner";
import { BackToTop } from "@/components/ui/back-to-top";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-sans",
});

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Wayfinder AI - Smart Travel Planner",
  description:
    "Khám phá Việt Nam thông minh với Wayfinder AI. Tìm kiếm điểm đến, đọc đánh giá và lên kế hoạch du lịch hoàn hảo.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wayfinder AI",
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} ${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AnalyticsProvider>
            <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
            <WebVitals />
            <OfflineIndicator />
            <Toaster position="top-right" richColors closeButton />
            <BackToTop />
            <BottomNavWrapper />
            <div className="relative flex min-h-screen flex-col pb-16 md:pb-0">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
