import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers";
import './globals.css';

export const metadata: Metadata = {
  title: 'SorteadorX',
  description: 'Crie listas de nomes e realize sorteios com regras personalizadas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@400;700&family=Source+Code+Pro:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen">
        <Providers attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
        </Providers>
      </body>
    </html>
  );
}
