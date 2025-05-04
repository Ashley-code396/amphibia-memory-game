// app/layout.tsx


import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* You can add a global header or nav here if you want */}
        {children}
        {/* You can add a footer here if you want */}
      </body>
    </html>
  );
}
