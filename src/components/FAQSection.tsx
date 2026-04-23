import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

const FAQSection = () => {
  const faqs = [
    {
      question: "What is Brahmi script?",
      answer: "Brahmi is an ancient writing system that originated in India around the 3rd century BCE. It's the ancestor of most modern scripts used in South and Southeast Asia, including Devanagari, Bengali, Tamil, and many others."
    },
    {
      question: "How accurate is the translation?",
      answer: "Our AI model has been trained on thousands of historical inscriptions and manuscripts, achieving over 99% accuracy on clear, well-preserved text. Accuracy may vary depending on the condition and clarity of the source image."
    },
    {
      question: "What image formats are supported?",
      answer: "We support common image formats including JPG, PNG, WEBP, and TIFF. For best results, use high-resolution images with good contrast between the text and background."
    },
    {
      question: "Can I upload handwritten Brahmi text?",
      answer: "Yes, our system can process both inscribed and handwritten Brahmi text. However, stone inscriptions and well-preserved manuscripts typically yield better results than heavily stylized handwriting."
    },
    {
      question: "Is there a limit to image size?",
      answer: "Images must be under 10MB in size. For optimal processing speed and accuracy, we recommend images between 1-5MB with a resolution of at least 300 DPI."
    },
    {
      question: "How long does translation take?",
      answer: "Most translations complete within 2-5 seconds, depending on the complexity and size of the text in your image. Larger inscriptions with multiple lines may take slightly longer."
    },
    {
      question: "Can I save or export the translation results?",
      answer: "Yes! You can copy the translations to your clipboard or download them as PDF, TXT, or image files. All translation data is also temporarily stored for easy access during your session."
    },
    {
      question: "Is my uploaded data secure?",
      answer: "We take privacy seriously. Images are processed securely and automatically deleted from our servers after 24 hours. We do not store or share any personal data or translation content."
    }
  ];

  return (
    <section id="faq" className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="font-manuscript text-4xl md:text-5xl font-bold text-primary mb-6">
            Frequently Asked Questions
          </h2>
          <p className="font-modern text-xl text-muted-foreground">
            Common questions about Brahmi script translation and our platform
          </p>
        </div>

        <Card className="p-8 translation-card">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-border last:border-b-0"
              >
                <AccordionTrigger className="font-modern text-left text-lg font-medium text-foreground hover:text-primary hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-modern text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        <div className="mt-12 text-center">
          <Card className="p-8 bg-gradient-to-r from-secondary/10 to-accent/10 border-secondary/20">
            <h3 className="font-manuscript text-2xl font-bold text-primary mb-4">
              Still have questions?
            </h3>
            <p className="font-modern text-muted-foreground mb-6">
              We're here to help you explore the fascinating world of ancient scripts.
            </p>
            <a 
              href="#contact"
              className="btn-secondary inline-flex items-center hover:scale-105 transition-transform duration-300"
            >
              Contact Our Experts
            </a>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;