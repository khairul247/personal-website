import FaceTracker from "@/components/FaceTracker";
import Navigation from "@/components/Navigation";
import ScatterSection from "@/components/ScatterSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import content from "@/data/content";

export default function Home() {
  return (
    <main
      className="w-full bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url(/background.webp)" }}
    >
      {/* Navigation Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-8 pb-4">
        <Navigation items={content.nav} />
      </div>

      {/* Hero Section */}
      <section id="home" className="flex justify-center items-center mt-20">
        <div className="w-63.25 h-63.25 rounded-full bg-white [box-shadow:#00000033_0px_7px_3px] shrink-0 flex items-center justify-center">
          <div className="w-50 h-50">
            <FaceTracker basePath="/faces/" debug={false} />
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio">
        <ScatterSection
          title={content.portfolio.title}
          items={content.portfolio.items}
        />
      </section>

      {/* About Section */}
      <AboutSection {...content.about} />

      {/* Contact Section */}
      <ContactSection {...content.contact} />
    </main>
  );
}
