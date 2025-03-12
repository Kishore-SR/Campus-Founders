import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../server/supabaseClient';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Discover.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Discover = () => {
  const [activeTab, setActiveTab] = useState('startups');
  const [startups, setStartups] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableCategories, setAvailableCategories] = useState(['All']);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch startups
        const { data: startupsData, error: startupsError } = await supabase
          .from('startups')
          .select('*, upvotes(count)');
        
        if (startupsError) throw startupsError;
        
        // Fetch investors
        const { data: investorsData, error: investorsError } = await supabase
          .from('investors')
          .select('*');
        
        if (investorsError) throw investorsError;

        // Process startup data to include upvote count
        const processedStartups = startupsData.map(startup => ({
          ...startup,
          upvote_count: startup.upvotes?.[0]?.count || 0
        }));

        // Extract unique categories from startups
        const categories = ['All', ...new Set(processedStartups.map(startup => startup.category))];
        
        setStartups(processedStartups);
        setFilteredStartups(processedStartups);
        setInvestors(investorsData);
        setAvailableCategories(categories);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use sample data if fetch fails
        const sampleStartups = generateSampleStartups();
        const categories = ['All', ...new Set(sampleStartups.map(startup => startup.category))];
        
        setStartups(sampleStartups);
        setFilteredStartups(sampleStartups);
        setInvestors(generateSampleInvestors());
        setAvailableCategories(categories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter startups based on category and search query
    let filtered = [...startups];
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(startup => 
        startup.category === selectedCategory
      );
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(startup => 
        startup.name.toLowerCase().includes(query) || 
        startup.description.toLowerCase().includes(query) || 
        (startup.problem_statement && startup.problem_statement.toLowerCase().includes(query))
      );
    }
    
    setFilteredStartups(filtered);
  }, [selectedCategory, searchQuery, startups]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStartupClick = (startup) => {
    setSelectedStartup(startup);
    setIsModalOpen(true);
  };

  const handleUpvote = async (e, startupId) => {
    e.stopPropagation();

    try {
      // Find the startup in our state
      const startupToUpdate = startups.find(s => s.id === startupId);
      if (!startupToUpdate) return;

      // Optimistically update UI
      const updatedStartups = startups.map(startup => 
        startup.id === startupId 
          ? { ...startup, upvote_count: (startup.upvote_count || 0) + 1, has_upvoted: true } 
          : startup
      );
      
      setStartups(updatedStartups);
      
      // Update in database
      const { error } = await supabase
        .from('upvotes')
        .insert([
          { startup_id: startupId, count: 1 }
        ]);
      
      if (error) {
        console.error('Error upvoting:', error);
        // Revert the optimistic update if there's an error
        setStartups(startups);
      }
    } catch (error) {
      console.error('Error handling upvote:', error);
    }
  };

  // Sample data generators
  const generateSampleStartups = () => {
    return [
      {
        id: 1,
        name: "EcoTech Solutions",
        category: "Sustainability",
        description: "Developing sustainable tech solutions for urban waste management",
        problem_statement: "Cities struggle with inefficient waste management systems",
        solution: "IoT-powered waste bins that optimize collection routes and reduce costs",
        vision: "Create smarter, cleaner, and more sustainable cities through technology",
        logo_url: "https://github.com/user-attachments/assets/cf0bdf10-6293-4691-aa1e-725f905f4ace",
        funding_status: "seeking",
        upvote_count: 84,
        contact_email: "info@ecotechsolutions.io",
        website: "https://ecotechsolutions.io",
        user_count: 12500,
        revenue: 125000,
        growth_rate: 15,
        patents: [
          {
            id: "PCT2023/0125",
            title: "Smart Waste Collection System",
            date: "2023-05-15",
            description: "A system for optimizing waste collection routes using IoT sensors"
          }
        ],
        team_members: [
          { name: "Sarah Chen", role: "CEO", avatar: "https://github.com/user-attachments/assets/cf0bdf10-6293-4691-aa1e-725f905f4ace" },
          { name: "David Rodriguez", role: "CTO", avatar: "https://github.com/user-attachments/assets/cf0bdf10-6293-4691-aa1e-725f905f4ace" },
          { name: "Priya Sharma", role: "Head of Product", avatar: "https://github.com/user-attachments/assets/cf0bdf10-6293-4691-aa1e-725f905f4ace" }
        ],
        funding_rounds: [
          { name: "Pre-seed", amount: 250000, date: "2022-10" },
          { name: "Seed", amount: 1500000, date: "2023-06" }
        ],
        user_growth_data: [
          { month: "Jan", count: 5200 },
          { month: "Feb", count: 6100 },
          { month: "Mar", count: 7400 },
          { month: "Apr", count: 8900 },
          { month: "May", count: 10200 },
          { month: "Jun", count: 12500 }
        ],
        revenue_data: [
          { quarter: "Q1 2023", amount: 45000 },
          { quarter: "Q2 2023", amount: 68000 },
          { quarter: "Q3 2023", amount: 92000 },
          { quarter: "Q4 2023", amount: 125000 }
        ]
      },
      {
        id: 2,
        name: "MediMind",
        category: "MedTech",
        description: "AI-powered diagnostic assistant for healthcare professionals",
        problem_statement: "Medical diagnosis errors cost lives and resources",
        solution: "ML algorithm that analyzes patient data to suggest potential diagnoses",
        vision: "Improve diagnostic accuracy and patient outcomes worldwide",
        logo_url: null,
        funding_status: "funded",
        upvote_count: 126,
        contact_email: "contact@medimind.health",
        website: "https://medimind.health",
        user_count: 3200,
        revenue: 350000,
        growth_rate: 28,
        patents: [
          {
            id: "US2023/78921",
            title: "Neural Network for Medical Diagnosis",
            date: "2023-02-10",
            description: "A specialized neural network architecture for medical diagnostic assistance"
          },
          {
            id: "US2023/79045",
            title: "Medical Data Preprocessing System",
            date: "2023-03-22",
            description: "System for cleaning and normalizing medical data for machine learning"
          }
        ],
        team_members: [
          { name: "Dr. James Wilson", role: "CEO", avatar: null },
          { name: "Maria Garcia", role: "CTO", avatar: null },
          { name: "Dr. Ahmed Hassan", role: "Medical Director", avatar: null },
          { name: "Lisa Chen", role: "Head of ML", avatar: null }
        ],
        funding_rounds: [
          { name: "Seed", amount: 2000000, date: "2022-04" },
          { name: "Series A", amount: 8000000, date: "2023-08" }
        ],
        user_growth_data: [
          { month: "Jan", count: 1800 },
          { month: "Feb", count: 2100 },
          { month: "Mar", count: 2400 },
          { month: "Apr", count: 2700 },
          { month: "May", count: 3000 },
          { month: "Jun", count: 3200 }
        ],
        revenue_data: [
          { quarter: "Q1 2023", amount: 180000 },
          { quarter: "Q2 2023", amount: 240000 },
          { quarter: "Q3 2023", amount: 290000 },
          { quarter: "Q4 2023", amount: 350000 }
        ]
      },
      {
        id: 3,
        name: "LearnLoop",
        category: "EdTech",
        description: "Adaptive learning platform that personalizes education",
        problem_statement: "One-size-fits-all education fails many students",
        solution: "AI-powered platform that adapts to individual learning styles and pace",
        vision: "Make quality education accessible and effective for every student",
        logo_url: null,
        funding_status: "seeking",
        upvote_count: 67,
        contact_email: "hello@learnloop.edu",
        website: "https://learnloop.edu",
        user_count: 45000,
        revenue: 220000,
        growth_rate: 22,
        patents: [],
        team_members: [
          { name: "Maya Johnson", role: "CEO & Founder", avatar: null },
          { name: "Raj Patel", role: "CTO", avatar: null },
          { name: "Emma Lewis", role: "Head of Content", avatar: null }
        ],
        funding_rounds: [
          { name: "Pre-seed", amount: 300000, date: "2022-09" }
        ],
        user_growth_data: [
          { month: "Jan", count: 28000 },
          { month: "Feb", count: 32000 },
          { month: "Mar", count: 36000 },
          { month: "Apr", count: 39000 },
          { month: "May", count: 42000 },
          { month: "Jun", count: 45000 }
        ],
        revenue_data: [
          { quarter: "Q1 2023", amount: 120000 },
          { quarter: "Q2 2023", amount: 150000 },
          { quarter: "Q3 2023", amount: 180000 },
          { quarter: "Q4 2023", amount: 220000 }
        ]
      },
      {
        id: 4,
        name: "FinTrack",
        category: "FinTech",
        description: "Personal finance management tool for students",
        problem_statement: "Students struggle with financial literacy and budgeting",
        solution: "App that simplifies budgeting, savings goals, and financial education",
        vision: "Empower the next generation to achieve financial independence",
        logo_url: null,
        funding_status: "seeking",
        upvote_count: 42,
        contact_email: "support@fintrack.app",
        website: "https://fintrack.app",
        user_count: 18500,
        revenue: 85000,
        growth_rate: 18,
        patents: [],
        team_members: [
          { name: "Tyler Brown", role: "CEO", avatar: null },
          { name: "Sophia Kim", role: "CTO", avatar: null }
        ],
        funding_rounds: [],
        user_growth_data: [
          { month: "Jan", count: 12000 },
          { month: "Feb", count: 13500 },
          { month: "Mar", count: 15000 },
          { month: "Apr", count: 16200 },
          { month: "May", count: 17500 },
          { month: "Jun", count: 18500 }
        ],
        revenue_data: [
          { quarter: "Q1 2023", amount: 45000 },
          { quarter: "Q2 2023", amount: 58000 },
          { quarter: "Q3 2023", amount: 72000 },
          { quarter: "Q4 2023", amount: 85000 }
        ]
      },
      {
        id: 5,
        name: "NeuralCode",
        category: "AI",
        description: "Automated code generation platform for developers",
        problem_statement: "Repetitive coding tasks waste developer time and resources",
        solution: "AI assistant that generates production-ready code from natural language",
        vision: "Revolutionize software development through intelligent automation",
        logo_url: null,
        funding_status: "funded",
        upvote_count: 154,
        contact_email: "info@neuralcode.dev",
        website: "https://neuralcode.dev",
        user_count: 8700,
        revenue: 670000,
        growth_rate: 35,
        patents: [
          {
            id: "US2023/12345",
            title: "Natural Language to Code Translation System",
            date: "2023-01-18",
            description: "System for translating natural language descriptions into executable code"
          }
        ],
        team_members: [
          { name: "Alex Morgan", role: "CEO", avatar: null },
          { name: "Zoe Winters", role: "CTO", avatar: null },
          { name: "Carlos Mendez", role: "ML Lead", avatar: null },
          { name: "Nina Kapoor", role: "Product Manager", avatar: null }
        ],
        funding_rounds: [
          { name: "Seed", amount: 1800000, date: "2022-07" },
          { name: "Series A", amount: 7500000, date: "2023-04" }
        ],
        user_growth_data: [
          { month: "Jan", count: 5200 },
          { month: "Feb", count: 5800 },
          { month: "Mar", count: 6500 },
          { month: "Apr", count: 7200 },
          { month: "May", count: 8000 },
          { month: "Jun", count: 8700 }
        ],
        revenue_data: [
          { quarter: "Q1 2023", amount: 380000 },
          { quarter: "Q2 2023", amount: 480000 },
          { quarter: "Q3 2023", amount: 580000 },
          { quarter: "Q4 2023", amount: 670000 }
        ]
      }
    ];
  };

  const generateSampleInvestors = () => {
    return [
      {
        id: 1,
        name: "Alex Thompson",
        title: "Partner at Innovate VC",
        bio: "Passionate about early-stage tech startups with a focus on sustainability and AI",
        avatar_url: null,
        focus_areas: ["AI", "Sustainability", "EdTech"]
      },
      {
        id: 2,
        name: "Jennifer Wu",
        title: "Angel Investor",
        bio: "Serial entrepreneur turned investor. Looking for passionate founders in healthcare and education",
        avatar_url: null,
        focus_areas: ["MedTech", "EdTech", "FinTech"]
      },
      {
        id: 3,
        name: "Marcus Daniels",
        title: "Managing Director, TechFuture Fund",
        bio: "Helping visionary founders build the next generation of tech unicorns",
        avatar_url: null,
        focus_areas: ["SaaS", "AI", "FinTech", "E-commerce"]
      },
      {
        id: 4,
        name: "Sophia Chen",
        title: "Principal, Green Ventures",
        bio: "Impact investor focused on climate tech and sustainable solutions",
        avatar_url: null,
        focus_areas: ["Sustainability", "Hardware", "Biotech"]
      }
    ];
  };

  return (
    <div className="discover-container">
      <div className="discover-hero">
        <h1>Discover the Next Big Thing</h1>
        <p>Connect with innovative student-led startups and visionary investors shaping the future</p>
        
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, idea, or problem statement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-button">
              <span className="material-icons">search</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="discover-tabs">
        <button 
          className={`tab-button ${activeTab === 'startups' ? 'active' : ''}`}
          onClick={() => setActiveTab('startups')}
        >
          Startups
        </button>
        <button 
          className={`tab-button ${activeTab === 'investors' ? 'active' : ''}`}
          onClick={() => setActiveTab('investors')}
        >
          Investors
        </button>
      </div>
      
      {activeTab === 'startups' && (
        <>
          <div className="filter-categories">
            {availableCategories.map(category => (
              <button 
                key={category} 
                className={`category-tag ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading startups...</p>
            </div>
          ) : (
            <div className="startups-grid">
              {filteredStartups.length > 0 ? (
                filteredStartups.map(startup => (
                  <div 
                    key={startup.id} 
                    className="startup-card" 
                    onClick={() => handleStartupClick(startup)}
                  >
                    <div className="startup-logo">
                      {startup.logo_url ? (
                        <img src={startup.logo_url} alt={`${startup.name} logo`} />
                      ) : (
                        <div className="placeholder-logo">
                          {startup.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="startup-info">
                      <h3>{startup.name}</h3>
                      <span className="startup-category">{startup.category}</span>
                      <p className="startup-description">{startup.description}</p>
                      <div className="startup-metrics">
                        <span className="funding-status">
                          {startup.funding_status === 'funded' ? (
                            <span className="funded">💰 Funded</span>
                          ) : (
                            <span className="seeking">🔍 Seeking Funding</span>
                          )}
                        </span>
                        <button
                          className={`upvote-button ${startup.has_upvoted ? 'upvoted' : ''}`}
                          onClick={(e) => handleUpvote(e, startup.id)}
                        >
                          <span className="material-icons">
                            {startup.has_upvoted ? '⭐' : '⭐'}
                          </span>
                          <span className="upvote-count">{startup.upvote_count || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <h3>No startups found</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {activeTab === 'investors' && (
        <div className="investors-grid">
          {investors.length > 0 ? (
            investors.map(investor => (
              <div key={investor.id} className="investor-card">
                <div className="investor-avatar">
                  {investor.avatar_url ? (
                    <img src={investor.avatar_url} alt={`${investor.name} avatar`} />
                  ) : (
                    <div className="placeholder-avatar">
                      {investor.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="investor-info">
                  <h3>{investor.name}</h3>
                  <p className="investor-title">{investor.title}</p>
                  <p className="investor-bio">{investor.bio}</p>
                  <div className="investor-focus">
                    <h4>Investment Focus</h4>
                    <div className="focus-tags">
                      {investor.focus_areas && investor.focus_areas.map((area, index) => (
                        <span key={index} className="focus-tag">{area}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <h3>No investors found</h3>
              <p>Check back later as our investor network grows</p>
            </div>
          )}
        </div>
      )}
      
      {/* Startup Detail Modal */}
      {isModalOpen && selectedStartup && (
        <div className="modal-overlay">
          <div className="startup-detail-modal" ref={modalRef}>
            <button className="close-modal" onClick={() => setIsModalOpen(false)}>×</button>
            
            <div className="modal-header">
              <div className="modal-logo">
                {selectedStartup.logo_url ? (
                  <img src={selectedStartup.logo_url} alt={`${selectedStartup.name} logo`} />
                ) : (
                  <div className="placeholder-modal-logo">
                    {selectedStartup.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="modal-title">
                <h2>{selectedStartup.name}</h2>
                <span className="modal-category">{selectedStartup.category}</span>
              </div>
              <button
                className={`upvote-button ${selectedStartup.has_upvoted ? 'upvoted' : ''}`}
                onClick={(e) => handleUpvote(e, selectedStartup.id)}
              >
                <span className="material-icons">
                  {selectedStartup.has_upvoted ? '⭐' : '⭐'}
                </span>
                <span className="upvote-count">{selectedStartup.upvote_count || 0}</span>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-section">
                <h3>Vision</h3>
                <p>{selectedStartup.vision}</p>
              </div>
              
              <div className="modal-section">
                <h3>Problem Statement</h3>
                <p>{selectedStartup.problem_statement}</p>
              </div>
              
              <div className="modal-section">
                <h3>Solution</h3>
                <p>{selectedStartup.solution}</p>
              </div>
              
              <div className="modal-section modal-metrics">
                <h3>Metrics</h3>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <h4>Users</h4>
                    <p className="metric-value">{selectedStartup.user_count?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="metric-card">
                    <h4>Revenue</h4>
                    <p className="metric-value">${selectedStartup.revenue?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="metric-card">
                    <h4>Growth Rate</h4>
                    <p className="metric-value">{selectedStartup.growth_rate || '0'}%</p>
                  </div>
                  <div className="metric-card">
                    <h4>Patents</h4>
                    <p className="metric-value">{selectedStartup.patents?.length || '0'}</p>
                  </div>
                </div>
              </div>
              
              {selectedStartup.team_members && selectedStartup.team_members.length > 0 && (
                <div className="modal-section">
                  <h3>Team</h3>
                  <div className="team-grid">
                    {selectedStartup.team_members.map((member, index) => (
                      <div key={index} className="team-member">
                        <div className="member-avatar">
                          {member.avatar ? (
                            <img src={member.avatar} alt={`${member.name} avatar`} />
                          ) : (
                            <div className="placeholder-avatar">
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h4>{member.name}</h4>
                        <p>{member.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedStartup.funding_rounds && selectedStartup.funding_rounds.length > 0 && (
                <div className="modal-section">
                  <h3>Funding History</h3>
                  <div className="funding-history">
                    {selectedStartup.funding_rounds.map((round, index) => (
                      <div key={index} className="funding-round">
                        <h4>{round.name}</h4>
                        <p className="funding-amount">${round.amount.toLocaleString()}</p>
                        <p className="funding-date">{round.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="modal-section charts-section">
                <h3>Analytics</h3>
                <div className="charts-grid">
                  <div className="chart-container">
                    <h4>User Growth</h4>
                    {selectedStartup.user_growth_data && (
                      <Line
                        data={{
                          labels: selectedStartup.user_growth_data.map(d => d.month),
                          datasets: [
                            {
                              label: 'Users',
                              data: selectedStartup.user_growth_data.map(d => d.count),
                              borderColor: '#3b82f6',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              tension: 0.4
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          scales: {
                            y: {
                              beginAtZero: true
                            }
                          }
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="chart-container">
                    <h4>Revenue by Quarter</h4>
                    {selectedStartup.revenue_data && (
                      <Bar
                        data={{
                          labels: selectedStartup.revenue_data.map(d => d.quarter),
                          datasets: [
                            {
                              label: 'Revenue ($)',
                              data: selectedStartup.revenue_data.map(d => d.amount),
                              backgroundColor: 'rgba(34, 197, 94, 0.6)'
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          scales: {
                            y: {
                              beginAtZero: true
                            }
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              
              {selectedStartup.patents && selectedStartup.patents.length > 0 && (
                <div className="modal-section">
                  <h3>Patents</h3>
                  <div className="patents-list">
                    {selectedStartup.patents.map((patent, index) => (
                      <div key={index} className="patent-item">
                        <h4>{patent.title}</h4>
                        <p className="patent-id">Patent ID: {patent.id}</p>
                        <p className="patent-date">Filed: {patent.date}</p>
                        <p className="patent-description">{patent.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="modal-section contact-section">
                <h3>Contact</h3>
                <div className="contact-info">
                  <p><strong>Email:</strong> {selectedStartup.contact_email}</p>
                  {selectedStartup.website && (
                    <p><strong>Website:</strong> <a href={selectedStartup.website} target="_blank" rel="noopener noreferrer">{selectedStartup.website}</a></p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discover;