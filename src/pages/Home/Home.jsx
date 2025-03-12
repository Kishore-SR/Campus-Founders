import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import heroImage from "../../assets/startup-hero.webp";

const Home = () => {
  const navigate = useNavigate();

  const handleSubmitStartup = () => {
    navigate("/mystartup");
  };

  const trendingStartups = [
    {
      id: 1,
      name: "LearnyHive",
      funding: "₹45 Lakhs",
      tags: ["#Ed tech", "#Innovation"],
      founder: "Bhanush Gowda",
      college: "EPCET Bangalore, 3rd Year",
      color: "#FF5733",
      link: "https://www.learnyhive.com/",
    },
    {
      id: 2,
      name: "The Waiter Company",
      funding: "₹32 Lakhs",
      tags: ["#FoodTech", "#Logistics"],
      founder: "Ishan Purohit",
      college: "RV University, 4th Year",
      color: "#4A90E2",
      link: "https://www.thewaitercompany.in/",
    },
    {
      id: 3,
      name: "Saathi App",
      funding: "₹20 Lakhs",
      tags: ["#Innovative", "#Social"],
      founder: "Abhay Gupta",
      college: "RV College ,Bangalore, 3rd Year",
      color: "#50C878",
      link: "https://www.saathiapp.in/",
    },
  ];

  const featuredStartup = {
    name: "Kampus",
    description:
      "A comprehensive platform connecting students with campus events, resources, and communities.",
    achievement:
      "Launched across multiple universities with over 10K+ active users.",
    funding: "₹50 Lakhs",
    tags: ["#EdTech", "#StudentCommunity", "#CampusLife"],
    founder: "Hemanth Gowda",
    college: "Reva University, Final Year",
    website: "https://www.kampus.social/",
    image:
      "https://github.com/user-attachments/assets/a0f9d8c1-aaeb-45c2-9c9f-91ee240a19a2",
  };

  // Dummy testimonials
  const testimonials = [
    {
      quote:
        "Campus Founders helped me connect with angel investors who believed in my vision. My startup secured funding within 3 months of joining the platform.",
      name: "Ankit Kumar",
      position: "Founder, TechNova",
      college: "NITK Surathkal",
    },
    {
      quote:
        "The exposure we got through Campus Founders was incredible. Our monthly active users increased by 300% after being featured as Startup of the Week.",
      name: "Meera Joshi",
      position: "Co-founder, StudyBuddy",
      college: "BITS Pilani",
    },
    {
      quote:
        "As an investor, Campus Founders has been an excellent platform to discover innovative student startups. I've invested in 5 companies I found here.",
      name: "Vikram Mehta",
      position: "Angel Investor",
      company: "Bengaluru Angels",
    },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Empowering Student-led Startups in Bengaluru</h1>
            <p className="hero-subtitle">
              Connect, showcase and grow your startup in India's tech capital
            </p>
            <p className="hero-description">
              Campus Founders bridges the gap between student innovators and the
              resources they need. Get visibility, secure funding and find
              inspiration to fuel your entrepreneurial journey.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">150+</span>
                <span className="stat-label">Student Startups</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">₹2.5Cr+</span>
                <span className="stat-label">Funding Secured</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">30+</span>
                <span className="stat-label">Active Investors</span>
              </div>
            </div>
            <button className="submit-button" onClick={handleSubmitStartup}>
              Submit Your Startup
              <i className="ri-arrow-right-up-line"></i>
            </button>
          </div>
          <div className="hero-image">
            <img
              src={heroImage}
              alt="Student entrepreneurs building startups"
            />
            <div className="floating-card card-1">
              <div className="card-icon">💡</div>
              <div className="card-text">Visibility</div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">💰</div>
              <div className="card-text">Funding</div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">🚀</div>
              <div className="card-text">Inspiration</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Startups Section */}
      <section className="trending-startups">
        <div className="section-container">
          <div className="section-header">
            <h2>
              Trending Startups <i className="ri-fire-fill"></i>
            </h2>
            <p>Discover the most popular student-led startups in Bengaluru</p>
          </div>
          <div className="trending-cards">
            {trendingStartups.map((startup, index) => (
              <a
                href={startup.link}
                className="trending-card"
                key={startup.id}
                target="_blank"
              >
                <div
                  className="trending-rank"
                  style={{ backgroundColor: startup.color }}
                >
                  #{index + 1}
                </div>
                <div className="trending-content">
                  <h3>{startup.name}</h3>
                  <p className="funding-amount">
                    <i className="ri-money-dollar-circle-line"></i> Secured{" "}
                    {startup.funding}
                  </p>
                  <div className="tags">
                    {startup.tags.map((tag, i) => (
                      <span key={i} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="founder-info">
                    <i className="ri-user-star-line"></i>
                    <div>
                      <p className="founder-name">{startup.founder}</p>
                      <p className="founder-college">{startup.college}</p>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <div className="view-more">
            <button onClick={() => navigate("/discover")}>
              View All Startups
              <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Startup of the Week */}
      <section className="featured-startup">
        <div className="section-container">
          <div className="section-header">
            <h2>
              Featured Startup of the Week <i className="ri-trophy-fill"></i>
            </h2>
            <p>Meet the game-changer that's making waves</p>
          </div>
          <div className="featured-card">
            <div className="featured-content">
              <div className="featured-header">
                <div className="featured-badge">
                  <i className="ri-award-fill"></i> Featured
                </div>
                <h3>{featuredStartup.name}</h3>
              </div>
              <p className="featured-description">
                {featuredStartup.description}
              </p>
              <div className="achievement">
                <i className="ri-medal-line"></i>
                <span>{featuredStartup.achievement}</span>
              </div>
              <p className="funding-amount">
                <i className="ri-money-dollar-circle-line"></i> Secured{" "}
                {featuredStartup.funding}
              </p>
              <div className="tags">
                {featuredStartup.tags.map((tag, i) => (
                  <span key={i} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="founder-info">
                <i className="ri-user-star-line"></i>
                <div>
                  <p className="founder-name">{featuredStartup.founder}</p>
                  <p className="founder-college">{featuredStartup.college}</p>
                </div>
              </div>
              <button
                className="connect-button"
                onClick={() => window.open(featuredStartup.website, "_blank")}
              >
                View Website
                <i className="ri-link"></i>
              </button>
            </div>
            <div className="featured-image">
              <div className="image-container">
                <img src={featuredStartup.image} alt={featuredStartup.name} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <h2>
              What Our Community Says <i className="ri-chat-quote-line"></i>
            </h2>
            <p>Success stories from founders and investors</p>
          </div>
          <div className="testimonials-container">
            {testimonials.map((testimonial, index) => (
              <div className="testimonial-card" key={index}>
                <div className="quote-icon">❝</div>
                <p className="testimonial-quote">{testimonial.quote}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="author-info">
                    <p className="author-name">{testimonial.name}</p>
                    <p className="author-position">{testimonial.position}</p>
                    <p className="author-college">
                      {testimonial.college || testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-links">
            <div className="footer-column">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/discover">Discover</a>
                </li>
                <li>
                  <a href="/mystartup">My Startup</a>
                </li>
                <li>
                  <a href="/profile">Profile</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <ul>
                <li>
                  <a href="/">About Us</a>
                </li>
                <li>
                  <a href="/">Investor Connect</a>
                </li>
                <li>
                  <a href="/">Success Stories</a>
                </li>
                <li>
                  <a href="/">FAQs</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Contact</h4>
              <ul>
                <li>
                  <a href="mailto:info@campusfounders.in">
                    info@campusfounders.in
                  </a>
                </li>
                <li>
                  <a href="tel:+919876543210">+91 9876543210</a>
                </li>
                <li>Bengaluru, Karnataka</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              Built with <span className="heart">❤️</span> by COSMIC at Build
              For Bengaluru Hackathon
            </p>
            <div className="social-icons">
              <a href="/" className="social-icon">
                <i className="ri-twitter-fill"></i>
              </a>
              <a href="/" className="social-icon">
                <i className="ri-linkedin-box-fill"></i>
              </a>
              <a href="/" className="social-icon">
                <i className="ri-instagram-fill"></i>
              </a>
              <a href="/" className="social-icon">
                <i className="ri-github-fill"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
