// Centralized content data — replace with CMS fetch when ready

export interface PortfolioItem {
  src?: string;
  alt: string;
  caption: string;
}

export interface ContactLink {
  label: string;
  href: string;
  icon: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface AboutContent {
  title: string;
  paragraphs: string[];
}

export interface ContactContent {
  title: string;
  subtitle: string;
  links: ContactLink[];
}

export interface SiteContent {
  nav: NavItem[];
  portfolio: {
    title: string;
    items: PortfolioItem[];
  };
  about: AboutContent;
  contact: ContactContent;
}

const content: SiteContent = {
  nav: [
    { label: "Home", href: "#home" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],

  portfolio: {
    title: "Portfolio",
    items: [
      { src: "/portfolio1.webp", alt: "Rembayung", caption: "rembayung, web design, 29.01.2026" },
      { alt: "New project", caption: "secret project, coming soon" },
      { alt: "New project", caption: "secret project, coming soon" },
      { alt: "New project", caption: "secret project, coming soon" },
      { alt: "New project", caption: "secret project, coming soon" },
    ],
  },

  about: {
    title: "About Me",
    paragraphs: [
      "Hello! I'm a creative developer passionate about building interactive and playful web experiences.",
      "I love combining design with code to create things that are both beautiful and fun to use. This little face that follows your cursor? That's just a taste of what I enjoy making.",
      "When I'm not coding, you'll find me exploring new design trends, experimenting with animations, or drinking too much coffee.",
    ],
  },

  contact: {
    title: "Get in Touch",
    subtitle: "Want to work together or just say hi? Feel free to reach out!",
    links: [
      { label: "Email", href: "mailto:hello@example.com", icon: "✉️" },
      { label: "GitHub", href: "https://github.com", icon: "💻" },
      { label: "Twitter", href: "https://twitter.com", icon: "🐦" },
      { label: "WhatsApp", href: "https://wa.me/", icon: "💬" },
    ],
  },
};

export default content;
