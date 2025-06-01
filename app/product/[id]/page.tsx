import { Header } from "@/components/Header";
import { ConfigurationStepper } from "@/components/ConfigurationStepper";
import { ConfigurationProvider } from "@/contexts/ConfigurationContext";

interface ProductConfigProps {
  params: Promise<{
    id: string;
  }>;
}

const ProductConfig = async ({ params }: ProductConfigProps) => {
  const { id } = await params;

  return (
    <ConfigurationProvider productId={id}>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="pt-16">
          <ConfigurationStepper />
        </div>
      </div>
    </ConfigurationProvider>
  );
};

export default ProductConfig;