import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import OcrUploader from "@/components/OcrUploader";

const TranslatorPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <OcrUploader />
      </div>
      <Footer />
    </div>
  );
};

export default TranslatorPage;
