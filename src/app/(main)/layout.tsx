import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function MainLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Header />
      {/*
       * The gap is what separates the last section from the footer. The header
       * stays outside it: it is sticky and sits flush against the content.
       */}
      <div className="flex flex-1 flex-col gap-12">
        <main
          id="main-content"
          className="container mx-auto flex flex-1 flex-col gap-12 px-4"
        >
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
