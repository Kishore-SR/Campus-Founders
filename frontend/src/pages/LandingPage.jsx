import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import {
  Rocket,
  TrendingUp,
  Users,
  MessageSquare,
  Video,
  Shield,
  Sparkles,
  FileText,
  Zap,
  Target,
  Globe,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import LandingNavbar from "../components/LandingNavbar";
import Footer from "../components/Footer";

const LandingPage = () => {
  const { theme } = useThemeStore();

  const features = [
    {
      icon: Rocket,
      title: "Startup Discovery",
      description: "Explore innovative student startups and discover the next big idea.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: TrendingUp,
      title: "Investor Network",
      description: "Connect with verified investors actively looking to fund startups.",
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      icon: Users,
      title: "Founder Community",
      description: "Join a vibrant community of student founders and entrepreneurs.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: MessageSquare,
      title: "Real-time Chat",
      description: "Communicate seamlessly with investors and founders via instant messaging.",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: Video,
      title: "Video Calls",
      description: "Schedule and conduct video calls directly through the platform.",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      icon: Sparkles,
      title: "AI Recommendations",
      description: "Get personalized startup recommendations powered by AI matching.",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: FileText,
      title: "Government Schemes",
      description: "Access curated information about funding schemes and support programs.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security measures.",
      color: "text-error",
      bgColor: "bg-error/10",
    },
  ];

  const benefits = [
    "Free to join for students and founders",
    "Verified investor network",
    "AI-powered matching system",
    "Government scheme information",
    "Real-time communication tools",
    "Secure and private platform",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-base-100" data-theme={theme}>
      <Helmet>
        <title>Campus Founders - Connect Founders with Investors</title>
        <meta
          name="description"
          content="Join Campus Founders - the premier platform connecting student founders with investors. Discover startups, get funded, and build the next generation of innovative companies."
        />
      </Helmet>

      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 lg:pb-16">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-base-100 to-secondary/30" />

        {/* Animated Background Glows */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Text Content */}
            <div className="text-center mb-12 sm:mb-16 lg:mb-20">
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight text-base-content">
                Where Startups{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  Find Investors
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl opacity-90 mb-8 max-w-3xl mx-auto text-base-content">
                Elevate your startup's visibility effortlessly with Campus Founders, where you can connect with investors, discover opportunities, and monitor your business growth.
              </p>

              {/* CTA Button */}
              <div className="flex justify-center mb-8">
                <Link
                  to="/signup"
                  className="btn btn-primary !h-12 sm:!h-14 !px-8 sm:!px-10 !text-base sm:!text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 min-h-0"
                >
                  Start for free
                  <ArrowRight className="size-5 ml-2" />
                </Link>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative max-w-6xl mx-auto">
              <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-base-300/50 bg-base-200/30 backdrop-blur-sm">
                {/* Browser Frame Effect */}
                <div className="bg-base-300/50 px-4 py-3 flex items-center gap-2 border-b border-base-300/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-error/50" />
                    <div className="w-3 h-3 rounded-full bg-warning/50" />
                    <div className="w-3 h-3 rounded-full bg-success/50" />
                  </div>
                  <div className="flex-1 bg-base-100 rounded-lg px-4 py-1.5 mx-auto max-w-md">
                    <div className="text-xs opacity-60 text-center">campusfounders.com/dashboard</div>
                  </div>
                </div>

                {/* Dashboard Image */}
                <div className="relative bg-base-100">
                  <img
                    src="https://i.ibb.co/B5Bbc74V/image.png"
                    alt="Campus Founders Dashboard Preview"
                    className="w-full h-auto object-cover"
                    loading="eager"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-base-100/80 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl px-4">
                <div className="bg-base-100/95 backdrop-blur-md rounded-xl p-4 sm:p-5 shadow-xl border border-base-300">
                  <div className="text-xs sm:text-sm opacity-70 mb-1">Active Startups</div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">100+</div>
                  <div className="text-xs opacity-60 mt-1">Student-led ventures</div>
                </div>
                <div className="bg-base-100/95 backdrop-blur-md rounded-xl p-4 sm:p-5 shadow-xl border border-base-300">
                  <div className="text-xs sm:text-sm opacity-70 mb-1">Investors</div>
                  <div className="text-2xl sm:text-3xl font-bold text-secondary">50+</div>
                  <div className="text-xs opacity-60 mt-1">Ready to invest</div>
                </div>
                <div className="bg-base-100/95 backdrop-blur-md rounded-xl p-4 sm:p-5 shadow-xl border border-base-300">
                  <div className="text-xs sm:text-sm opacity-70 mb-1">Connections</div>
                  <div className="text-2xl sm:text-3xl font-bold text-accent">500+</div>
                  <div className="text-xs opacity-60 mt-1">Successful matches</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-base-200/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Succeed
              </span>
            </h2>
            <p className="text-lg opacity-70 max-w-2xl mx-auto">
              Powerful features designed to help founders connect with investors and grow their startups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300 hover:border-primary/50 group"
                >
                  <div className="card-body p-6">
                    <div className={`w-14 h-14 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`size-7 ${feature.color}`} />
                    </div>
                    <h3 className="card-title text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm opacity-70">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-32 bg-base-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
              How It{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Works
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl opacity-80 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                description: "Sign up and create a comprehensive profile showcasing your startup or investment interests.",
                icon: Target,
              },
              {
                step: "02",
                title: "Discover & Connect",
                description: "Browse startups or investors, use AI-powered recommendations, and send connection requests.",
                icon: Zap,
              },
              {
                step: "03",
                title: "Start Building",
                description: "Chat, schedule video calls, and collaborate to turn innovative ideas into successful startups.",
                icon: Globe,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="relative text-center group"
                >
                  {/* Card Background */}
                  <div className="bg-base-200/50 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border border-base-300 hover:border-primary/50 transition-all duration-300 hover:shadow-xl h-full flex flex-col items-center">
                    {/* Step Number Badge */}
                    <div className="absolute -top-4 -right-4 bg-gradient-to-br from-primary to-secondary rounded-full w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center text-white font-bold text-base lg:text-lg shadow-lg">
                      {item.step}
                    </div>

                    {/* Icon Circle */}
                    <div className="w-24 h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                        <Icon className="size-10 lg:size-12 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl lg:text-2xl font-bold mb-4 text-base-content">
                      {item.title}
                    </h3>
                    <p className="text-base lg:text-lg opacity-80 leading-relaxed flex-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-32 bg-base-200/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Why Choose{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  Campus Founders
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="size-6 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-lg opacity-80">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/signup"
                className="btn btn-primary !h-12 !px-8 !text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 min-h-0"
              >
                Join Campus Founders Today
                <ArrowRight className="size-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Built for Student Entrepreneurs
            </h2>
            <p className="text-lg opacity-80 leading-relaxed mb-8">
              Campus Founders is dedicated to empowering the next generation of entrepreneurs.
              We understand the unique challenges student founders face and provide the tools,
              connections, and resources needed to turn innovative ideas into successful startups.
            </p>
            <p className="text-lg opacity-80 leading-relaxed">
              Whether you're a founder looking for funding or an investor seeking the next big opportunity,
              Campus Founders is your gateway to the future of innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg opacity-80 mb-8">
              Join thousands of student founders and investors who are already building the future on Campus Founders.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="btn btn-primary !h-12 !px-8 !text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto min-h-0"
              >
                Create Free Account
                <ArrowRight className="size-5 ml-2" />
              </Link>
              <Link
                to="/login"
                className="btn btn-outline !h-12 !px-8 !text-base font-semibold rounded-xl !border-2 hover:scale-105 transition-all duration-300 w-full sm:w-auto min-h-0"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;