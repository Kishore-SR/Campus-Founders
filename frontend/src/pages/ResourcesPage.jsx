import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router";
import { BookOpen, TrendingUp, Rocket, DollarSign, Target, Lightbulb, ArrowRight, Crown, CheckCircle2 } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const ResourcesPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

  const courses = [
    {
      id: "founders-guide",
      title: "Founder's Guide to Success",
      description: "Complete guide for aspiring entrepreneurs to build and scale their startups",
      icon: Rocket,
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop",
      category: "For Founders",
      lessons: 5,
    },
    {
      id: "investor-mastery",
      title: "Investor Mastery Course",
      description: "Learn how to identify, evaluate, and invest in promising startups",
      icon: TrendingUp,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      category: "For Investors",
      lessons: 5,
    },
    {
      id: "fundraising-essentials",
      title: "Fundraising Essentials",
      description: "Master the art of raising capital from seed to Series A and beyond",
      icon: DollarSign,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop",
      category: "For Founders",
      lessons: 5,
    },
    {
      id: "startup-valuation",
      title: "Startup Valuation Masterclass",
      description: "Understand how to value startups and make informed investment decisions",
      icon: Target,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      category: "For Investors",
      lessons: 5,
    },
    {
      id: "business-model-design",
      title: "Business Model Design",
      description: "Create sustainable and scalable business models for your startup",
      icon: Lightbulb,
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop",
      category: "For Founders",
      lessons: 5,
    },
    {
      id: "due-diligence-guide",
      title: "Due Diligence Guide",
      description: "Comprehensive guide to conducting thorough due diligence on startups",
      icon: BookOpen,
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
      category: "For Investors",
      lessons: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
      <Helmet>
        <title>Resources & Courses | Campus Founders</title>
        <meta
          name="description"
          content="Access high-quality courses and guidance for investors and founders to learn and grow."
        />
      </Helmet>

      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <BookOpen className="size-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Resources & Courses
          </h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            High-quality textual courses and guidance for investors and founders to learn, grow, and succeed
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <div
                key={course.id}
                onClick={() => navigate(`/resources/${course.id}`)}
                className="group bg-base-200 rounded-xl overflow-hidden border-2 border-base-300 hover:border-primary transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-primary/20"
              >
                {/* Course Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-base-200/90 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="badge badge-primary badge-lg">{course.category}</span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-base-200/90 backdrop-blur-sm rounded-lg p-2">
                      <Icon className="size-6 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-base-content/70 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-base-content/60">
                      <BookOpen className="size-4" />
                      <span>{course.lessons} Lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                      <span>View Course</span>
                      <ArrowRight className="size-5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 text-center">
          {authUser?.isPremium ? (
            <div className="bg-gradient-to-r from-warning/20 to-warning/5 rounded-xl p-8 border-2 border-warning">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="size-6 text-warning" fill="currentColor" />
                <h2 className="text-2xl font-bold">Premium Active</h2>
              </div>
              <p className="text-base-content/70 mb-4 max-w-2xl mx-auto">
                Get access to all lessons in every course. Premium members can unlock all content and learn at their own pace.
              </p>
              <div className="flex items-center justify-center gap-2 text-success">
                <CheckCircle2 className="size-5" />
                <span className="font-semibold">You have full access to all courses</span>
              </div>
            </div>
          ) : (
            <div className="bg-base-200 rounded-xl p-8 border border-base-300">
              <h2 className="text-2xl font-bold mb-4">Unlock Premium Courses</h2>
              <p className="text-base-content/70 mb-6 max-w-2xl mx-auto">
                Get access to all lessons in every course. Premium members can unlock all content and learn at their own pace.
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
    </div>
  );
};

export default ResourcesPage;

