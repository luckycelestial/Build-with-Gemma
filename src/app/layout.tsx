import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { BusinessDataProvider } from "@/context/BusinessDataContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { ExecutiveContextProvider } from "@/context/ExecutiveContextProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Revenue Intelligence Agent (FinCent)",
  description: "AI-Powered Financial Copilot for Manufacturing MSMEs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans text-[#0f172a] dark:text-[#f8fafc]" suppressHydrationWarning>
        <ThemeProvider>
          <OnboardingProvider>
            <BusinessDataProvider>
              <ExecutiveContextProvider>
                {children}
              </ExecutiveContextProvider>
            </BusinessDataProvider>
          </OnboardingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
