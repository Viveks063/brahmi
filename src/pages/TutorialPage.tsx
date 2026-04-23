import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BrahmiTutorial from "@/components/BrahmiTutorial";

const TutorialPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <BrahmiTutorial />
      <Footer />
    </div>
  );
};

export default TutorialPage;