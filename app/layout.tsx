import { auth } from '@/lib/auth';
import ClientProviders from '@/lib/providers';
import PageTransition from '@/components/PageTransition';
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Juby - Construyendo tu identidad financiera",
  description: "Verifica tu humanidad una sola vez para crear tu historial de ahorro transparente.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${manrope.variable} antialiased`}
      >
        <ClientProviders session={session}>
          <PageTransition>{children}</PageTransition>
        </ClientProviders>
      </body>
    </html>
  );
}
