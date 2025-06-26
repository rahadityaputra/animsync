// app/layout.tsx

import './globals.css'; 
import React from 'react';
import { UserProvider } from "@/app/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
