import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export default function PageContainer({
  children,
}: PageContainerProps) {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 py-8">
      {children}
    </main>
  );
}