import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function MainLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    // One flex column so gap-12 spaces header → body and body → footer.
    // Avoids pt-* on main (push-down via gap) while keeping the sticky header
    // in normal flow.
    <div className="flex flex-1 flex-col gap-12">
      <Header />
      <main className="container mx-auto flex flex-1 flex-col gap-12 px-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}
