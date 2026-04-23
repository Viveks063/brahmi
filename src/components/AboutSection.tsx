import { Card } from "@/components/ui/card";
import { BookOpen, Globe, Zap } from "lucide-react";
import translationImage from "@/assets/translation-process.jpg";

const AboutSection = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Ancient Wisdom",
      description: "Brahmi script is one of the oldest writing systems, dating back to the 3rd century BCE, used across ancient India."
    },
    {
      icon: Zap,
      title: "AI-Powered Recognition",
      description: "Advanced OCR technology specifically trained on historical manuscripts and inscriptions for accurate character recognition."
    },
    {
      icon: Globe,
      title: "Cultural Preservation",
      description: "Helping scholars, historians, and enthusiasts decode ancient texts and preserve cultural heritage for future generations."
    }
  ];

  return (
    <section id="about" className="py-20 px-4 bg-card/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-manuscript text-4xl md:text-5xl font-bold text-primary mb-6">
            About Ancient Script
          </h2>
          <p className="font-modern text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover the fascinating world of ancient Indian writing systems and how modern 
            technology is helping us unlock their secrets.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="animate-fade-in">
            <h3 className="font-manuscript text-3xl font-bold text-primary mb-6">
              The Historical Significance
            </h3>
            <div className="space-y-4 font-modern text-muted-foreground leading-relaxed">
              <p>
                Brahmi script is the ancestor of most modern scripts used in South and Southeast Asia. 
                It was first deciphered in 1837 by James Prinsep, revealing a treasure trove of 
                historical information about ancient Indian civilization.
              </p>
              <p>
                Found on Emperor Ashoka's edicts, ancient coins, and stone inscriptions, Brahmi script 
                provides invaluable insights into ancient languages, religious texts, and historical 
                events spanning over two millennia.
              </p>
              <p>
                Our AI-powered translator makes these ancient texts accessible to researchers, students, 
                and anyone interested in exploring India's rich literary and cultural heritage.
              </p>
            </div>
          </div>
          
          <div className="relative animate-slide-up">
            <div className="manuscript-border">
              <img
                src={translationImage}
                alt="Translation process visualization"
                className="relative z-10 w-full rounded-xl shadow-elegant"
              />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="translation-card group hover:scale-105 transform transition-all duration-300"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-manuscript text-xl font-bold text-primary mb-4">
                  {feature.title}
                </h4>
                <p className="font-modern text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Timeline */}
        <div className="mt-20">
          <h3 className="font-manuscript text-3xl font-bold text-primary text-center mb-12">
            Historical Timeline
          </h3>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-secondary to-accent"></div>
            
            <div className="space-y-12">
              {[
                { date: "3rd Century BCE", event: "Brahmi script emerges in Mauryan period" },
                { date: "260 BCE", event: "Ashoka's edicts spread Brahmi across the empire" },
                { date: "1st Century CE", event: "Brahmi evolves into regional variants" },
                { date: "1837 CE", event: "James Prinsep deciphers Brahmi script" },
                { date: "2024 CE", event: "AI technology makes translation accessible" }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} animate-fade-in`}
                  style={{ animationDelay: `${index * 0.3}s` }}
                >
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <Card className="p-6 translation-card">
                      <h4 className="font-manuscript text-lg font-bold text-secondary mb-2">
                        {item.date}
                      </h4>
                      <p className="font-modern text-muted-foreground">
                        {item.event}
                      </p>
                    </Card>
                  </div>
                  <div className="w-2/12 flex justify-center">
                    <div className="w-4 h-4 bg-secondary rounded-full border-4 border-background shadow-lg"></div>
                  </div>
                  <div className="w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;