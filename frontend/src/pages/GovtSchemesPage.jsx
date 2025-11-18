import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { SearchIcon, ExternalLink, Building2, DollarSign, Calendar, Users, Award, FileText } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

// Curated list of Indian Government Schemes for Startups
const GOVERNMENT_SCHEMES = [
  {
    id: 1,
    name: "Startup India Initiative",
    description: "A flagship initiative of the Government of India, intended to build a strong ecosystem for nurturing innovation and startups in the country.",
    category: "Funding & Support",
    ministry: "Ministry of Commerce & Industry",
    benefits: [
      "Tax benefits for 3 years",
      "80% reduction in patent filing fees",
      "Fast-track patent examination",
      "Self-certification compliance",
      "Startup India Hub for support"
    ],
    eligibility: "Startups registered with DPIIT (Department for Promotion of Industry and Internal Trade)",
    website: "https://www.startupindia.gov.in/",
    icon: "🚀"
  },
  {
    id: 2,
    name: "MUDRA Yojana",
    description: "Micro Units Development & Refinance Agency Ltd. provides loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises.",
    category: "Funding",
    ministry: "Ministry of Finance",
    benefits: [
      "Loans up to ₹10 lakh",
      "No collateral required",
      "Low interest rates",
      "Quick processing"
    ],
    eligibility: "Non-corporate, non-farm small/micro enterprises",
    website: "https://www.mudra.org.in/",
    icon: "💰"
  },
  {
    id: 3,
    name: "Stand-Up India",
    description: "Facilitates bank loans between ₹10 lakh and ₹1 crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and at least one woman borrower per bank branch.",
    category: "Funding",
    ministry: "Ministry of Finance",
    benefits: [
      "Loans from ₹10 lakh to ₹1 crore",
      "Composite loan for working capital",
      "Interest rate as per RBI guidelines"
    ],
    eligibility: "SC/ST and/or Women entrepreneurs",
    website: "https://www.standupmitra.in/",
    icon: "👥"
  },
  {
    id: 4,
    name: "Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)",
    description: "Provides collateral-free credit to micro and small enterprises for loans up to ₹2 crore without third-party guarantee.",
    category: "Funding",
    ministry: "Ministry of MSME",
    benefits: [
      "Collateral-free loans up to ₹2 crore",
      "Credit guarantee coverage",
      "Reduced financial burden"
    ],
    eligibility: "Micro and Small Enterprises",
    website: "https://www.cgtmse.in/",
    icon: "🛡️"
  },
  {
    id: 5,
    name: "Pradhan Mantri Mudra Yojana (PMMY)",
    description: "Provides loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises to promote entrepreneurship.",
    category: "Funding",
    ministry: "Ministry of Finance",
    benefits: [
      "Three categories: Shishu, Kishore, Tarun",
      "Loans from ₹50,000 to ₹10 lakh",
      "No collateral required"
    ],
    eligibility: "Non-corporate, non-farm small/micro enterprises",
    website: "https://www.mudra.org.in/",
    icon: "💼"
  },
  {
    id: 6,
    name: "Atal Innovation Mission (AIM)",
    description: "Promotes innovation and entrepreneurship across India by establishing Atal Tinkering Labs, Atal Incubation Centers, and supporting startups.",
    category: "Innovation & Incubation",
    ministry: "NITI Aayog",
    benefits: [
      "Atal Incubation Centers (AICs)",
      "Atal Tinkering Labs (ATLs)",
      "Mentorship and funding support",
      "Innovation challenges"
    ],
    eligibility: "Startups, students, and innovators",
    website: "https://aim.gov.in/",
    icon: "💡"
  },
  {
    id: 7,
    name: "Digital India Startup Hub",
    description: "A platform to connect startups with government departments, investors, and mentors for digital innovation.",
    category: "Digital Innovation",
    ministry: "Ministry of Electronics & IT",
    benefits: [
      "Digital infrastructure support",
      "Connect with government departments",
      "Access to digital resources"
    ],
    eligibility: "Digital startups and innovators",
    website: "https://www.digitalindia.gov.in/",
    icon: "💻"
  },
  {
    id: 8,
    name: "SIDBI Startup Fund",
    description: "Small Industries Development Bank of India provides venture capital and funding support to startups and MSMEs.",
    category: "Funding",
    ministry: "Ministry of Finance",
    benefits: [
      "Venture capital funding",
      "Equity support",
      "Debt financing options"
    ],
    eligibility: "Startups and MSMEs",
    website: "https://www.sidbi.in/",
    icon: "🏦"
  },
  {
    id: 9,
    name: "Technology Development Board (TDB)",
    description: "Provides financial assistance to Indian companies for development and commercialization of indigenous technology.",
    category: "Technology & R&D",
    ministry: "Department of Science & Technology",
    benefits: [
      "Financial assistance for R&D",
      "Technology commercialization support",
      "Equity participation"
    ],
    eligibility: "Companies developing indigenous technology",
    website: "https://www.tdb.gov.in/",
    icon: "🔬"
  },
  {
    id: 10,
    name: "BIRAC (Biotechnology Industry Research Assistance Council)",
    description: "Supports biotech startups and entrepreneurs through funding, mentorship, and infrastructure support.",
    category: "Biotechnology",
    ministry: "Department of Biotechnology",
    benefits: [
      "Grant funding for biotech startups",
      "Incubation support",
      "Mentorship programs"
    ],
    eligibility: "Biotechnology startups and researchers",
    website: "https://www.birac.nic.in/",
    icon: "🧬"
  },
  {
    id: 11,
    name: "MeitY Startup Hub",
    description: "A platform by Ministry of Electronics & IT to support tech startups with funding, mentorship, and market access.",
    category: "Technology",
    ministry: "Ministry of Electronics & IT",
    benefits: [
      "Funding support",
      "Mentorship programs",
      "Market access",
      "Technology support"
    ],
    eligibility: "Technology startups",
    website: "https://meitystartuphub.in/",
    icon: "📱"
  },
  {
    id: 12,
    name: "National Small Industries Corporation (NSIC)",
    description: "Provides support to MSMEs and startups through various schemes including marketing, technology, and finance support.",
    category: "MSME Support",
    ministry: "Ministry of MSME",
    benefits: [
      "Marketing support",
      "Technology support",
      "Raw material assistance",
      "Export promotion"
    ],
    eligibility: "MSMEs and startups",
    website: "https://www.nsic.co.in/",
    icon: "🏭"
  }
];

const GovtSchemesPage = () => {
  const { theme: _theme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(GOVERNMENT_SCHEMES.map(scheme => scheme.category))];
    return ["All", ...cats];
  }, []);

  // Filter schemes based on search and category
  const filteredSchemes = useMemo(() => {
    return GOVERNMENT_SCHEMES.filter(scheme => {
      const matchesSearch =
        scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.ministry.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "All" || scheme.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleSchemeClick = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-base-100 min-h-screen">
      <Helmet>
        <title>Government Schemes | Campus Founders</title>
        <meta
          name="description"
          content="Explore Indian government schemes and initiatives for startups and entrepreneurs"
        />
      </Helmet>

      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="size-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Government Schemes</h1>
              <p className="text-sm opacity-70 mt-1">
                Discover funding opportunities and support programs for your startup
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-base-content/50" />
            <input
              type="text"
              placeholder="Search schemes by name, description, or ministry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pl-12 pr-4"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`btn btn-sm ${selectedCategory === category
                  ? "btn-primary"
                  : "btn-outline"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Schemes Grid */}
        {filteredSchemes.length === 0 ? (
          <div className="card bg-base-200 p-12 text-center">
            <SearchIcon className="size-16 mx-auto opacity-30 mb-4" />
            <h3 className="text-2xl font-bold mb-2">No schemes found</h3>
            <p className="opacity-70">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300 hover:border-primary/50"
              >
                <div className="card-body p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{scheme.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{scheme.name}</h3>
                        <div className="badge badge-primary badge-sm">
                          {scheme.category}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm opacity-80 mb-4 line-clamp-3">
                    {scheme.description}
                  </p>

                  {/* Ministry */}
                  <div className="flex items-center gap-2 text-xs opacity-70 mb-4">
                    <Building2 className="size-4" />
                    <span>{scheme.ministry}</span>
                  </div>

                  {/* Benefits */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="size-4 text-primary" />
                      <span className="font-semibold text-sm">Key Benefits:</span>
                    </div>
                    <ul className="list-disc list-inside text-xs opacity-80 space-y-1">
                      {scheme.benefits.slice(0, 3).map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                      {scheme.benefits.length > 3 && (
                        <li className="opacity-60">
                          +{scheme.benefits.length - 3} more benefits
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Eligibility */}
                  <div className="mb-4 p-3 bg-base-300 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="size-4 text-secondary" />
                      <span className="font-semibold text-xs">Eligibility:</span>
                    </div>
                    <p className="text-xs opacity-80">{scheme.eligibility}</p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleSchemeClick(scheme.website)}
                    className="btn btn-primary w-full mt-2"
                  >
                    <ExternalLink className="size-4 mr-2" />
                    Learn More & Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-8 card bg-primary/10 border border-primary/20">
          <div className="card-body p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/20 rounded-lg">
                <FileText className="size-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Important Information</h3>
                <p className="text-sm opacity-80 mb-2">
                  The information provided here is for reference purposes. Please verify all details, eligibility criteria, and application procedures on the official government websites before applying.
                </p>
                <p className="text-xs opacity-70">
                  Government schemes and policies are subject to change. Always refer to the latest official notifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovtSchemesPage;

