import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Lock, CheckCircle2, BookOpen, Clock } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

  const courses = {
    "founders-guide": {
      title: "Founder's Guide to Success",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop",
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
Before investing significant time and resources, validate your idea through customer interviews, surveys, and minimum viable products (MVPs). The goal is to confirm that there's a real demand for your solution.

**Primary Research:**
Start by talking directly to potential customers. Ask open-ended questions about their pain points, current solutions, and what they wish existed. This qualitative data is invaluable.

**Secondary Research:**
Analyze existing market reports, industry trends, and competitor offerings. This helps you understand the broader landscape and identify opportunities.

**Key Metrics to Track:**
- Market size (TAM, SAM, SOM)
- Growth rate
- Customer acquisition cost
- Lifetime value
- Competitive positioning

**Action Steps:**
1. Create a list of 20 potential customers to interview
2. Develop a survey to gather quantitative data
3. Analyze your top 5 competitors
4. Document your findings in a market research report`,
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
Build the simplest version that solves your customer's core problem, then iterate based on feedback. An MVP should take weeks, not months.

**Defining Your MVP:**
Start by identifying the single most important problem your product solves. Build only the features necessary to solve that problem. Everything else can wait.

**Development Approaches:**
- No-code/Low-code solutions
- Landing pages with waitlists
- Manual processes (Wizard of Oz)
- Prototypes and mockups

**Testing Your MVP:**
Once built, get it in front of real users as quickly as possible. Measure how they use it, what they struggle with, and what they love.

**Iteration Cycle:**
Build → Measure → Learn → Repeat. Each cycle should be short (1-2 weeks) and focused on one key assumption.`,
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
A well-executed launch can make the difference between success and failure. Plan every detail carefully.

**Customer Segmentation:**
Identify your ideal customer profile (ICP). Who are they? What do they need? Where do they spend time? How do they make decisions?

**Pricing Strategy:**
Consider value-based pricing, competitive pricing, or cost-plus pricing. Test different price points to find what works.

**Distribution Channels:**
- Direct sales
- Online platforms
- Partnerships
- Retail (if applicable)

**Marketing Tactics:**
- Content marketing
- Social media
- Paid advertising
- PR and media
- Community building

**Launch Checklist:**
1. Define your launch goals
2. Prepare marketing materials
3. Build anticipation (pre-launch)
4. Execute launch day activities
5. Monitor and respond to feedback`,
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
Avoid scaling too fast or too slow. Find the right balance for sustainable growth.

**Team Building:**
As you scale, you'll need to hire strategically. Focus on culture fit, skills gaps, and roles that will drive growth.

**Process Optimization:**
Document processes, automate repetitive tasks, and create systems that allow you to scale without constant oversight.

**Technology Infrastructure:**
Ensure your technology can handle growth. This includes servers, databases, security, and scalability of your platform.

**International Expansion:**
When ready, expand carefully. Consider market differences, regulations, and localization needs.

**Key Metrics for Scaling:**
- Revenue growth rate
- Customer acquisition cost
- Churn rate
- Team productivity
- Unit economics

**Scaling Checklist:**
1. Validate product-market fit
2. Establish strong unit economics
3. Build scalable processes
4. Hire strategically
5. Secure necessary funding`,
          duration: "35 min",
        },
      ],
    },
    "investor-mastery": {
      title: "Investor Mastery Course",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
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
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop",
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
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
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
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop",
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
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
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
  const lessonNumber = parseInt(lessonId);
  const lesson = course?.lessons?.find((l) => l.id === lessonNumber);
  const isPremium = authUser?.isPremium;
  const isLocked = lessonNumber > 1 && !isPremium;

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Lesson Not Found</h1>
          <button onClick={() => navigate("/resources")} className="btn btn-primary">
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  const formatContent = (content) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <h3 key={index} className="text-xl font-bold mt-6 mb-3">
            {line.replace(/\*\*/g, "")}
          </h3>
        );
      }
      if (line.trim().startsWith("-")) {
        return (
          <li key={index} className="ml-6 mb-2">
            {line.replace(/^-\s*/, "")}
          </li>
        );
      }
      if (/^\d+\./.test(line.trim())) {
        return (
          <li key={index} className="ml-6 mb-2 list-decimal">
            {line.replace(/^\d+\.\s*/, "")}
          </li>
        );
      }
      if (line.trim() === "") {
        return <br key={index} />;
      }
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-base-100">
      <Helmet>
        <title>
          {lesson.title} - {course.title} | Campus Founders
        </title>
      </Helmet>

      {/* Header */}
      <div className="bg-base-200 border-b border-base-300 sticky top-0 z-10">
        <div className="container mx-auto max-w-4xl p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/resources/${courseId}`)}
              className="btn btn-ghost btn-sm"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Course
            </button>
            <div className="flex items-center gap-2 text-sm text-base-content/60">
              <Clock className="size-4" />
              <span>{lesson.duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        {isLocked ? (
          <div className="bg-base-200 rounded-xl p-12 text-center border-2 border-base-300">
            <Lock className="size-16 text-base-content/40 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Lesson Locked</h2>
            <p className="text-base-content/70 mb-6">
              This lesson is available for premium members only. Upgrade to unlock all lessons and
              access exclusive content.
            </p>
            <button onClick={() => navigate("/premium")} className="btn btn-primary btn-lg">
              Unlock Now
            </button>
          </div>
        ) : (
          <div className="bg-base-200 rounded-xl p-6 md:p-8 lg:p-10 border border-base-300">
            <div className="mb-6">
              <span className="badge badge-primary mb-3">Lesson {lesson.id}</span>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{lesson.title}</h1>
            </div>
            <div className="prose prose-lg max-w-none text-base-content">
              <div className="whitespace-pre-line">{formatContent(lesson.content)}</div>
            </div>

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t border-base-300 flex items-center justify-between">
              {lessonNumber > 1 ? (
                <button
                  onClick={() => navigate(`/resources/${courseId}/lesson/${lessonNumber - 1}`)}
                  className="btn btn-outline"
                >
                  <ArrowLeft className="size-4 mr-2" />
                  Previous Lesson
                </button>
              ) : (
                <div></div>
              )}
              {lessonNumber < course.lessons.length ? (
                <button
                  onClick={() => {
                    const nextLesson = lessonNumber + 1;
                    if (nextLesson > 1 && !isPremium) {
                      navigate("/premium");
                    } else {
                      navigate(`/resources/${courseId}/lesson/${nextLesson}`);
                    }
                  }}
                  className="btn btn-primary ml-auto"
                >
                  Next Lesson
                  <ArrowLeft className="size-4 ml-2 rotate-180" />
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/resources/${courseId}`)}
                  className="btn btn-primary ml-auto"
                >
                  Back to Course
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPage;

