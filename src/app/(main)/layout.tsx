import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function MainLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Header />
      <main
        id="main-content"
        className="container mx-auto flex flex-1 flex-col gap-12 px-4 pb-12"
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
