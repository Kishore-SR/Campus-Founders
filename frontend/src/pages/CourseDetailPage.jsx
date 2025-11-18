import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Lock, CheckCircle2, BookOpen, Clock } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

  const courses = {
    "founders-guide": {
      title: "Founder's Guide to Success",
      description: "Complete guide for aspiring entrepreneurs to build and scale their startups",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop",
      category: "For Founders",
      lessons: [
        {
          id: 1,
          title: "Introduction to Entrepreneurship",
          content: `Welcome to the Founder's Guide to Success! This comprehensive course will take you through the essential steps of building and scaling a successful startup.

**What You'll Learn:**
- Understanding the entrepreneurial mindset
- Identifying market opportunities
- Building a strong foundation for your startup
- Essential skills every founder needs

**Key Concepts:**
Entrepreneurship is not just about having a great idea—it's about execution, resilience, and continuous learning. Successful founders understand that building a startup is a journey filled with challenges and opportunities.

**Getting Started:**
Before diving into the technical aspects, it's crucial to develop the right mindset. Entrepreneurs need to be adaptable, resourceful, and willing to learn from failures. Remember, every successful company started with a founder who took the first step.

**Action Items:**
1. Reflect on your motivation for starting a business
2. Identify your core strengths and areas for growth
3. Start building your network of mentors and advisors
4. Begin researching your target market

This is just the beginning of your entrepreneurial journey. Stay committed, stay curious, and most importantly, stay resilient.`,
          duration: "15 min",
        },
        {
          id: 2,
          title: "Market Research and Validation",
          content: `Market research is the foundation of any successful startup. Learn how to validate your idea and understand your target market.

**Understanding Your Market:**
- Conducting primary and secondary research
- Identifying customer pain points
- Analyzing competitors
- Finding your unique value proposition

**Validation Techniques:**
Before investing significant time and resources, validate your idea through customer interviews, surveys, and minimum viable products (MVPs).`,
          duration: "20 min",
        },
        {
          id: 3,
          title: "Building Your MVP",
          content: `Learn how to build a Minimum Viable Product that allows you to test your assumptions with real users.

**MVP Principles:**
- Focus on core features
- Rapid iteration
- User feedback integration
- Cost-effective development

**Best Practices:**
Build the simplest version that solves your customer's core problem, then iterate based on feedback.`,
          duration: "25 min",
        },
        {
          id: 4,
          title: "Go-to-Market Strategy",
          content: `Develop a comprehensive go-to-market strategy to launch your product successfully.

**Key Components:**
- Target customer segments
- Pricing strategy
- Distribution channels
- Marketing and promotion tactics

**Launch Planning:**
A well-executed launch can make the difference between success and failure. Plan every detail carefully.`,
          duration: "30 min",
        },
        {
          id: 5,
          title: "Scaling Your Startup",
          content: `Once you've found product-market fit, learn how to scale your startup effectively.

**Scaling Strategies:**
- Team building and hiring
- Process optimization
- Technology infrastructure
- International expansion

**Common Pitfalls:**
Avoid scaling too fast or too slow. Find the right balance for sustainable growth.`,
          duration: "35 min",
        },
      ],
    },
    "investor-mastery": {
      title: "Investor Mastery Course",
      description: "Learn how to identify, evaluate, and invest in promising startups",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      category: "For Investors",
      lessons: [
        {
          id: 1,
          title: "Introduction to Startup Investing",
          content: `Welcome to the Investor Mastery Course! This course will teach you everything you need to know about investing in startups.

**What You'll Learn:**
- Understanding the startup investment landscape
- Types of investments and funding rounds
- Risk assessment and portfolio management
- Building relationships with founders

**Investment Fundamentals:**
Startup investing requires a different mindset than traditional investing. You're not just buying shares—you're betting on a team, a vision, and a market opportunity.

**Getting Started:**
Before making your first investment, understand your risk tolerance, investment thesis, and the time horizon for returns.`,
          duration: "15 min",
        },
        {
          id: 2,
          title: "Evaluating Startup Opportunities",
          content: `Learn how to evaluate startups systematically and identify promising investment opportunities.

**Evaluation Framework:**
- Team assessment
- Market size and opportunity
- Product and technology
- Business model viability
- Competitive landscape

**Due Diligence:**
Thorough evaluation is crucial. Look beyond the pitch deck and understand the real potential.`,
          duration: "20 min",
        },
        {
          id: 3,
          title: "Financial Analysis for Startups",
          content: `Understand how to analyze startup financials and projections.

**Key Metrics:**
- Revenue growth
- Unit economics
- Burn rate and runway
- Valuation methods
- Exit potential

**Financial Modeling:**
Learn to build and interpret financial models for early-stage companies.`,
          duration: "25 min",
        },
        {
          id: 4,
          title: "Portfolio Management",
          content: `Build and manage a diversified startup investment portfolio.

**Portfolio Strategy:**
- Diversification across sectors
- Stage allocation
- Risk management
- Follow-on investments

**Best Practices:**
A well-managed portfolio balances risk and reward across multiple investments.`,
          duration: "30 min",
        },
        {
          id: 5,
          title: "Exit Strategies and Returns",
          content: `Understand exit strategies and how to maximize returns on your investments.

**Exit Options:**
- IPOs
- Acquisitions
- Secondary markets
- Buybacks

**Maximizing Returns:**
Timing and strategy are crucial for successful exits. Learn when and how to exit.`,
          duration: "35 min",
        },
      ],
    },
    "fundraising-essentials": {
      title: "Fundraising Essentials",
      description: "Master the art of raising capital from seed to Series A and beyond",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop",
      category: "For Founders",
      lessons: [
        {
          id: 1,
          title: "Fundraising Fundamentals",
          content: `Learn the basics of fundraising and when to start raising capital for your startup.

**Key Topics:**
- When to raise funding
- Types of funding rounds
- Understanding dilution
- Preparing for fundraising

**Getting Started:**
Fundraising is a process, not an event. Start preparing early and build relationships with potential investors.`,
          duration: "15 min",
        },
        {
          id: 2,
          title: "Creating a Compelling Pitch Deck",
          content: `Master the art of creating a pitch deck that captures investor attention.

**Essential Slides:**
- Problem and solution
- Market opportunity
- Business model
- Traction and metrics
- Team
- Financial projections
- Ask

**Design Principles:**
Keep it simple, visual, and focused on the key points that matter to investors.`,
          duration: "20 min",
        },
        {
          id: 3,
          title: "Pitching to Investors",
          content: `Learn how to deliver a compelling pitch that gets investors excited about your startup.

**Pitching Techniques:**
- Storytelling
- Handling objections
- Building rapport
- Following up effectively

**Practice Makes Perfect:**
The best pitches are well-rehearsed but feel natural and authentic.`,
          duration: "25 min",
        },
        {
          id: 4,
          title: "Term Sheets and Negotiations",
          content: `Understand term sheets and how to negotiate favorable terms for your startup.

**Key Terms:**
- Valuation
- Equity percentage
- Liquidation preferences
- Board seats
- Anti-dilution provisions

**Negotiation Strategy:**
Know what terms matter most and be prepared to negotiate effectively.`,
          duration: "30 min",
        },
        {
          id: 5,
          title: "Post-Fundraising Management",
          content: `Learn how to manage investor relationships and prepare for future rounds.

**Investor Relations:**
- Regular updates
- Board meetings
- Strategic guidance
- Future fundraising

**Best Practices:**
Maintain strong relationships with your investors—they can be valuable partners beyond just capital.`,
          duration: "35 min",
        },
      ],
    },
    "startup-valuation": {
      title: "Startup Valuation Masterclass",
      description: "Understand how to value startups and make informed investment decisions",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      category: "For Investors",
      lessons: [
        {
          id: 1,
          title: "Valuation Basics",
          content: `Introduction to startup valuation and why it matters for investors.

**Key Concepts:**
- Pre-money vs post-money valuation
- Valuation methods
- Market comparables
- Risk factors

**Understanding Valuation:**
Startup valuation is both art and science. Learn the fundamentals before diving deeper.`,
          duration: "15 min",
        },
        {
          id: 2,
          title: "Valuation Methods",
          content: `Explore different methods for valuing early-stage startups.

**Methods Covered:**
- Comparable company analysis
- Discounted cash flow (DCF)
- Venture capital method
- Scorecard method
- Risk-adjusted return method

**Choosing the Right Method:**
Different methods work better for different stages and types of startups.`,
          duration: "20 min",
        },
        {
          id: 3,
          title: "Market and Sector Analysis",
          content: `Learn how market conditions and sector trends affect startup valuations.

**Market Factors:**
- Market size and growth
- Competitive landscape
- Sector trends
- Economic conditions

**Sector-Specific Considerations:**
Different sectors have different valuation dynamics. Understand your sector.`,
          duration: "25 min",
        },
        {
          id: 4,
          title: "Advanced Valuation Techniques",
          content: `Master advanced techniques for valuing growth-stage startups.

**Advanced Topics:**
- Option pool impact
- Liquidation preferences
- Convertible notes
- SAFE agreements

**Complex Scenarios:**
Handle complex cap tables and multiple funding rounds.`,
          duration: "30 min",
        },
        {
          id: 5,
          title: "Negotiating Valuation",
          content: `Learn how to negotiate valuation effectively as an investor.

**Negotiation Strategies:**
- Setting anchor points
- Justifying your valuation
- Finding common ground
- Structuring deals

**Best Practices:**
Successful negotiations balance fair valuation with relationship building.`,
          duration: "35 min",
        },
      ],
    },
    "business-model-design": {
      title: "Business Model Design",
      description: "Create sustainable and scalable business models for your startup",
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop",
      category: "For Founders",
      lessons: [
        {
          id: 1,
          title: "Business Model Fundamentals",
          content: `Introduction to business models and why they're crucial for startup success.

**Key Concepts:**
- What is a business model?
- Business model canvas
- Value proposition
- Revenue streams

**Getting Started:**
A well-designed business model is the foundation of a sustainable startup.`,
          duration: "15 min",
        },
        {
          id: 2,
          title: "Revenue Models",
          content: `Explore different revenue models and choose the right one for your startup.

**Revenue Models:**
- Subscription
- Transaction-based
- Freemium
- Marketplace
- Licensing

**Choosing Your Model:**
The right revenue model depends on your product, market, and customer behavior.`,
          duration: "20 min",
        },
        {
          id: 3,
          title: "Unit Economics",
          content: `Master unit economics to build a profitable and scalable business.

**Key Metrics:**
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Gross margin
- Payback period

**Optimization:**
Understanding unit economics helps you make better strategic decisions.`,
          duration: "25 min",
        },
        {
          id: 4,
          title: "Scaling Your Business Model",
          content: `Learn how to scale your business model as your startup grows.

**Scaling Strategies:**
- Network effects
- Platform models
- Automation
- Partnerships

**Challenges:**
Scaling requires careful planning and execution to maintain profitability.`,
          duration: "30 min",
        },
        {
          id: 5,
          title: "Innovation and Adaptation",
          content: `Keep your business model innovative and adaptable to market changes.

**Innovation Techniques:**
- Pivoting
- Experimentation
- Customer feedback
- Market evolution

**Staying Relevant:**
Successful startups continuously evolve their business models.`,
          duration: "35 min",
        },
      ],
    },
    "due-diligence-guide": {
      title: "Due Diligence Guide",
      description: "Comprehensive guide to conducting thorough due diligence on startups",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
      category: "For Investors",
      lessons: [
        {
          id: 1,
          title: "Due Diligence Overview",
          content: `Introduction to due diligence and why it's essential for investors.

**Key Topics:**
- What is due diligence?
- Types of due diligence
- Due diligence process
- Common pitfalls

**Getting Started:**
Thorough due diligence protects your investment and helps you make informed decisions.`,
          duration: "15 min",
        },
        {
          id: 2,
          title: "Financial Due Diligence",
          content: `Learn how to conduct financial due diligence on startups.

**Financial Review:**
- Financial statements
- Revenue recognition
- Cash flow analysis
- Financial projections
- Accounting practices

**Red Flags:**
Know what to look for and what questions to ask.`,
          duration: "20 min",
        },
        {
          id: 3,
          title: "Legal and Compliance",
          content: `Understand legal and compliance aspects of due diligence.

**Legal Review:**
- Corporate structure
- Intellectual property
- Contracts and agreements
- Regulatory compliance
- Litigation history

**Protecting Your Investment:**
Legal issues can derail even the most promising startups.`,
          duration: "25 min",
        },
        {
          id: 4,
          title: "Team and Culture Assessment",
          content: `Evaluate the team and company culture during due diligence.

**Team Evaluation:**
- Founder backgrounds
- Team composition
- Key employee retention
- Culture fit
- Advisory board

**Team Matters:**
The team is often the most important factor in startup success.`,
          duration: "30 min",
        },
        {
          id: 5,
          title: "Market and Competitive Analysis",
          content: `Conduct thorough market and competitive analysis.

**Market Analysis:**
- Market size and growth
- Customer validation
- Competitive landscape
- Market trends
- Barriers to entry

**Making the Decision:**
Synthesize all due diligence findings to make your investment decision.`,
          duration: "35 min",
        },
      ],
    },
  };

  const course = courses[courseId];

  if (!course) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
          <button onClick={() => navigate("/resources")} className="btn btn-primary">
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  const isPremium = authUser?.isPremium;

  return (
    <div className="min-h-screen bg-base-100">
      <Helmet>
        <title>{course.title} | Campus Founders</title>
        <meta name="description" content={course.description} />
      </Helmet>

      {/* Header with Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <button
            onClick={() => navigate("/resources")}
            className="btn btn-ghost btn-sm mb-4"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Resources
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
          <p className="text-base-content/70">{course.description}</p>
          <span className="badge badge-primary mt-2">{course.category}</span>
        </div>
      </div>

      {/* Lessons List */}
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Course Lessons</h2>
          <div className="space-y-4">
            {course.lessons.map((lesson, index) => {
              const isLocked = lesson.id > 1 && !isPremium;
              const isCompleted = false; // You can add completion tracking later

              return (
                <div
                  key={lesson.id}
                  className={`bg-base-200 rounded-xl p-6 border-2 transition-all ${isLocked
                    ? "border-base-300 opacity-75"
                    : "border-base-300 hover:border-primary cursor-pointer"
                    }`}
                  onClick={() => {
                    if (!isLocked) {
                      navigate(`/resources/${courseId}/lesson/${lesson.id}`);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isLocked
                          ? "bg-base-300"
                          : isCompleted
                            ? "bg-success text-success-content"
                            : "bg-primary text-primary-content"
                          }`}
                      >
                        {isLocked ? (
                          <Lock className="size-6" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="size-6" />
                        ) : (
                          <BookOpen className="size-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">
                            Lesson {lesson.id}: {lesson.title}
                          </h3>
                          {isCompleted && (
                            <span className="badge badge-success badge-sm">Completed</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-base-content/60">
                          <div className="flex items-center gap-1">
                            <Clock className="size-4" />
                            <span>{lesson.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {isLocked && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/premium");
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        Unlock Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Premium CTA */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-8 border-2 border-primary text-center">
            <h3 className="text-2xl font-bold mb-2">Unlock All Lessons</h3>
            <p className="text-base-content/70 mb-6">
              Get premium access to unlock all {course.lessons.length} lessons in this course and all other courses.
            </p>
            <button
              onClick={() => navigate("/premium")}
              className="btn btn-primary py-2"
            >
              Upgrade to Premium
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;

