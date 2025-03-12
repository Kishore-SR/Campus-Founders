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
                    <p className="metric-value"> Rs.{selectedStartup.revenue?.toLocaleString() || '0'}</p>
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
                        <p className="funding-amount"> Rs. {round.amount.toLocaleString()}</p>
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