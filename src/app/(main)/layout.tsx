import type { ReactNode } from "react";
import Banner from "@/components/layout/banner";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { NavigationTabs } from "@/components/layout/navigation-tabs";

export default function MainLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Header />
      <Banner />
      <main
        id="main-content"
        className="container mx-auto flex flex-1 flex-col gap-8 px-4 py-8"
      >
        <NavigationTabs />
        {children}
      </main>
      <Footer />
    </>
  );
}
