import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Chrome({ children, current }: { children: React.ReactNode; current?: string }) {
  return (
    <>
      <Header current={current} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
