import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "InviteAI - Arabic Invitation Generator",
  description: "Generate beautiful Arabic invitations with AI."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-950 text-slate-50">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-sm font-semibold">
                  IA
                </span>
                <div>
                  <div className="font-semibold">InviteAI</div>
                  <div className="text-xs text-slate-400">
                    مولّد دعوات ذكي بالعربية
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}

