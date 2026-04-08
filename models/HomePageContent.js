import mongoose from 'mongoose';

const homePageContentSchema = new mongoose.Schema({
  // HOME PAGE
  // HOME PAGE - HERO SLIDER
  heroBanners: [{
    imageUrl: { type: String, default: "" },
    badge: { type: String, default: "Verified B2B Medical Hub" },
    title1: { type: String, default: "Premium Medicine" },
    title2: { type: String, default: "Sourcing for Doctors" },
    description: { type: String, default: "Accelerate your clinic's supply chain with direct access to top-tier pharmaceuticals, transparent volume schemes, and lightning-fast logistics." },
    btn1Text: { type: String, default: "Start Ordering" },
    btn1Link: { type: String, default: "/products" },
    btn2Text: { type: String, default: "Quick Order Mode" },
    btn2Link: { type: String, default: "/quick-order" }
  }],

  // Hero Info Cards
  card1Title: { type: String, default: "Professional Savings" },
  card1Desc: { type: String, default: "Save up to 25% on bulk cardiac orders." },
  card2Title: { type: String, default: "Instant Schemes" },
  card2Desc: { type: String, default: "10+2 and 15% OFF applied in real-time." },

  schemesTitle: { type: String, default: "Top Schemes Today" },
  schemesSubtitle: { type: String, default: "Specially curated high-margin offers for your practice." },

  categoryTitle: { type: String, default: "Explore by Category" },
  categorySubtitle: { type: String, default: "We stock over 5000+ medicines across all major therapeutic segments." },
  categoryDescriptionTemplate: { type: String, default: "Our {category} segment features verified products with consistent multi-strip schemes and reliable supply chains for clinics." },

  trustTitle: { type: String, default: "The Trusted Hub for Healthcare Procurement" },
  trustSubtitle: { type: String, default: "We provide a secure, professional-grade platform for hospitals and independent clinics to source authentic pharmaceuticals at scale." },
  
  trustItem1Title: { type: String, default: "Quality Assured" },
  trustItem1Desc: { type: String, default: "Every batch verified for authenticity and storage standards." },
  trustItem1Img: { type: String, default: "" },
  trustItem2Title: { type: String, default: "Express Delivery" },
  trustItem2Desc: { type: String, default: "Priority shipping for clinics within 24-48 hours nationwide." },
  trustItem2Img: { type: String, default: "" },
  trustItem3Title: { type: String, default: "B2B Compliance" },
  trustItem3Desc: { type: String, default: "Optimized for VAT/GST invoices and professional record-keeping." },
  trustItem3Img: { type: String, default: "" },

  // ABOUT PAGE
  aboutMissionTitle: { type: String, default: "Empowering Health Through Excellence" },
  aboutMissionDesc: { type: String, default: "Wedome is a premium healthcare platform dedicated to providing authentic medicines, wellness products, and expert medical consultancies." },
  aboutValue1Title: { type: String, default: "100% Authentic" },
  aboutValue1Desc: { type: String, default: "Every product is verified by licensed pharmacists." },
  aboutValue2Title: { type: String, default: "Expert Care" },
  aboutValue2Desc: { type: String, default: "Access to verified doctors for real-time consultancy." },
  aboutValue3Title: { type: String, default: "Quality First" },
  aboutValue3Desc: { type: String, default: "Only the highest grade medical supplies for you." },
  aboutValue4Title: { type: String, default: "User Centric" },
  aboutValue4Desc: { type: String, default: "Your health and happiness are our top priorities." },

  // CONTACT INFO
  contactEmail: { type: String, default: "support@wedome.com" },
  contactPhone: { type: String, default: "+91 99999 88888" },
  contactAddress: { type: String, default: "Ahmedabad, Gujarat, India" },
  contactHours: { type: String, default: "Mon-Sat: 10:00 AM - 08:00 PM" },

  // GLOBAL SETTINGS
  siteLogoUrl: { type: String, default: "" },
  instagramLink: { type: String, default: "" },
  whatsappLink: { type: String, default: "" },

  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const HomePageContent = mongoose.model('HomePageContent', homePageContentSchema);
export default HomePageContent;
