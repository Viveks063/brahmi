import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageCircle, Users, Send } from "lucide-react";
import { toast } from "sonner";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get in touch with our team",
      detail: ""
    },
    {
      icon: MessageCircle,
      title: "Research Collaboration",
      description: "Academic partnerships",
      detail: ""
    },
    {
      icon: Users,
      title: "Community",
      description: "Join our community",
      detail: ""
    }
  ];

  return (
    <section id="contact" className="py-20 px-4 bg-card/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-manuscript text-4xl md:text-5xl font-bold text-primary mb-6">
            Get in Touch
          </h2>
          <p className="font-modern text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about Brahmi script or need assistance with our translator? 
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          
         

          {/* Contact Info & Partnership Section */}
          <div className="flex flex-col gap-8"> {/* <-- THIS IS THE CHANGED LINE */}
            <Card className="p-8 translation-card">
              <h3 className="font-manuscript text-2xl font-bold text-primary mb-6">
                Connect With Us
              </h3>
              <p className="font-modern text-muted-foreground mb-8 leading-relaxed">
                Whether you're a researcher, student, or simply curious about ancient scripts,
                we're here to support your journey of discovery.
              </p>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-modern font-semibold text-foreground mb-1">
                        {info.title}
                      </h4>
                      <p className="font-modern text-sm text-muted-foreground mb-1">
                        {info.description}
                      </p>
                      <p className="font-modern text-sm text-primary font-medium">
                        {info.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <h4 className="font-manuscript text-xl font-bold text-primary mb-4">
                Academic Partnerships
              </h4>
              <p className="font-modern text-muted-foreground mb-6 leading-relaxed">
                We collaborate with universities and research institutions worldwide
                to advance the study of ancient scripts and cultural heritage preservation.
              </p>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Learn About Partnerships
              </Button>
            </Card>
             </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;