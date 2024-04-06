import { Inter } from "next/font/google";
import "./globals.css";
import parameters from "./newton/meta-parameters.json";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: `${parameters.SITE_TITLE} - generated using newton`,
  description: `API documentation for ${parameters.BASE_URL} generated using newton`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <link rel="shortcut icon" href="/images/favicon.ico" />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
