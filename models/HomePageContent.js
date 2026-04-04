import mongoose from 'mongoose';

const homePageContentSchema = new mongoose.Schema({
  heroBadge: { type: String, default: "Verified B2B Medical Hub" },
  heroTitleLine1: { type: String, default: "Premium Medicine" },
  heroTitleLine2: { type: String, default: "Sourcing for Doctors" },
  heroDescription: { type: String, default: "Accelerate your clinic's supply chain with direct access to top-tier pharmaceuticals, transparent volume schemes, and lightning-fast logistics." },
  primaryButtonText: { type: String, default: "Start Ordering" },
  primaryButtonLink: { type: String, default: "/products" },
  secondaryButtonText: { type: String, default: "Quick Order Mode" },
  secondaryButtonLink: { type: String, default: "/quick-order" },

  schemesTitle: { type: String, default: "Top Schemes Today" },
  schemesSubtitle: { type: String, default: "Specially curated high-margin offers for your practice." },

  categoryTitle: { type: String, default: "Explore by Category" },
  categorySubtitle: { type: String, default: "We stock over 5000+ medicines across all major therapeutic segments." },
  categoryDescriptionTemplate: { type: String, default: "Our {category} segment features verified products with consistent multi-strip schemes and reliable supply chains for clinics." },

  trustTitle: { type: String, default: "The Trusted Hub for Healthcare Procurement" },
  trustSubtitle: { type: String, default: "We provide a secure, professional-grade platform for hospitals and independent clinics to source authentic pharmaceuticals at scale." },
  
  trustItem1Title: { type: String, default: "Quality Assured" },
  trustItem1Desc: { type: String, default: "Every batch verified for authenticity and storage standards." },
  trustItem2Title: { type: String, default: "Express Delivery" },
  trustItem2Desc: { type: String, default: "Priority shipping for clinics within 24-48 hours nationwide." },
  trustItem3Title: { type: String, default: "B2B Compliance" },
  trustItem3Desc: { type: String, default: "Optimized for VAT/GST invoices and professional record-keeping." },

  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const HomePageContent = mongoose.model('HomePageContent', homePageContentSchema);
export default HomePageContent;
