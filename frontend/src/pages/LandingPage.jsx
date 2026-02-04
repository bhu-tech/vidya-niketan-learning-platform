import { useNavigate } from 'react-router-dom';
import '../styles/LandingPageNew.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const testimonials = [
    {
      name: 'Rahul Kumar',
      exam: 'JEE Advanced 2024 - AIR 15',
      text: 'Vidya Niketan provided me with comprehensive study material and live classes that helped me secure AIR 15. The teachers are exceptional!',
      achievement: 'IIT JEE'
    },
    {
      name: 'Priya Sharma',
      exam: 'NEET 2024 - AIR 342',
      text: 'The online platform is very user-friendly. I could study at my own pace and still get live doubt-clearing sessions whenever needed.',
      achievement: 'NEET'
    },
    {
      name: 'Aditya Singh',
      exam: 'UPSC CSE 2023 - AIR 89',
      text: 'Quality content combined with affordable pricing. Vidya Niketan made premium education accessible to everyone.',
      achievement: 'UPSC'
    }
  ];

  const features = [
    { icon: '🎥', title: 'Live Interactive Classes', desc: 'Daily live sessions with experienced teachers' },
    { icon: '📚', title: 'Study Materials', desc: '10M+ tests, sample papers & notes' },
    { icon: '❓', title: '24x7 Doubt Sessions', desc: 'Clear your doubts anytime, anywhere' },
    { icon: '🎯', title: 'Progress Tracking', desc: 'Smart dashboard to monitor your growth' },
    { icon: '💻', title: 'Offline Centers', desc: '100+ offline centers across India' },
    { icon: '🏆', title: 'Proven Results', desc: 'Thousands of successful students' }
  ];

  const exams = [
    'IIT JEE', 'NEET', 'GATE', 'UPSC', 'CAT', 'SSC', 'Banking', 'Defence', 'Board Exams'
  ];

  return (
    <div className="landing-page">
      {/* Banner Carousel Section */}
      <section className="banner-carousel-section">
        <div className="banner-carousel">
          <div className="banner-track">
            <div className="banner-slide">
              <img src="/images/hero-3.jpg" alt="Banner 1" />
            </div>
            <div className="banner-slide">
              <img src="/images/hero-4.jpg" alt="Banner 2" />
            </div>
          </div>
          <div className="banner-dots">
            <span className="dot active" style={{animation: 'dotAnimation 8s linear infinite'}}></span>
            <span className="dot" style={{animation: 'dotAnimation 8s linear infinite 4s'}}></span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-content">
            <h1 className="hero-title">Vidya Niketan - Hapur Best Coaching Institute for IX to XII</h1>
            <h2 className="hero-subtitle">CBSE, JEE & NEET Coaching in Hapur with Expert Teachers</h2>
            <p className="hero-subtitle">
              Learn with love and grow with guidance. Access live classes, study materials, and expert guidance.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                Get Started Today
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/login')}>
                Already a Member? Login
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <h3>15M+</h3>
                <p>Students</p>
              </div>
              <div className="stat">
                <h3>100+</h3>
                <p>Courses</p>
              </div>
              <div className="stat">
                <h3>130+</h3>
                <p>YouTube Channels</p>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-collage">
              <div className="collage-item collage-frame frame-1">
                <img src="/images/hero-3.jpg" alt="Collage 1" />
              </div>
              <div className="collage-item collage-frame frame-2">
                <img src="/images/hero-4.jpg" alt="Collage 2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="results-section">
        <div className="container">
          <h2 className="section-title">Academic Excellence: Results</h2>
          <p className="section-subtitle">Thousands of students achieving their dreams</p>
          
          <div className="results-grid">
            <div className="result-card">
              <div className="result-badge">AIR 1</div>
              <div className="result-exam">JEE Advanced 2024</div>
              <div className="result-count">15,234 qualified</div>
            </div>
            <div className="result-card">
              <div className="result-badge">AIR 1</div>
              <div className="result-exam">NEET 2024</div>
              <div className="result-count">42,156 qualified</div>
            </div>
            <div className="result-card">
              <div className="result-badge">TOP 100</div>
              <div className="result-exam">UPSC CSE 2023</div>
              <div className="result-count">28 students</div>
            </div>
            <div className="result-card">
              <div className="result-badge">GATE</div>
              <div className="result-exam">All Branches 2024</div>
              <div className="result-count">9,856 qualified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Vidya Niketan?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Preparation Section */}
      <section className="exams-section">
        <div className="container">
          <h2 className="section-title">Prepare for Multiple Exams</h2>
          <div className="exams-grid">
            {exams.map((exam, index) => (
              <div key={index} className="exam-tag">{exam}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">Students ❤️ Vidya Niketan</h2>
          <p className="section-subtitle">Hear from our successful students</p>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="quote-icon">"</div>
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.exam}</p>
                    <span className="achievement-badge">{testimonial.achievement}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="app-section">
        <div className="container">
          <div className="app-content">
            <div className="app-info">
              <h2>Download Our App</h2>
              <p>Learn on the go! Access all features, take live classes, and track progress on your mobile.</p>
              <div className="app-buttons">
                <button className="app-btn">
                  <span className="icon">🍎</span> App Store
                </button>
                <button className="app-btn">
                  <span className="icon">🤖</span> Google Play
                </button>
              </div>
              <p className="app-stats">Join 15M+ students already learning on our app</p>
            </div>
            <div className="app-image">
              <div className="phone-mockup">📱</div>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube Channels Section */}
      <section className="youtube-section">
        <div className="container">
          <h2 className="section-title">Join The Vidya Niketan Family</h2>
          <p className="section-subtitle">Explore our YouTube channels and subscribe for free content</p>
          
          <div className="youtube-grid">
            <div className="youtube-card">
              <div className="yt-icon">▶️</div>
              <h3>Main Channel</h3>
              <p>15.2M Subscribers</p>
            </div>
            <div className="youtube-card">
              <div className="yt-icon">▶️</div>
              <h3>JEE Preparation</h3>
              <p>8.5M Subscribers</p>
            </div>
            <div className="youtube-card">
              <div className="yt-icon">▶️</div>
              <h3>NEET Preparation</h3>
              <p>12.3M Subscribers</p>
            </div>
            <div className="youtube-card">
              <div className="yt-icon">▶️</div>
              <h3>Foundation Course</h3>
              <p>5.7M Subscribers</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Learning?</h2>
          <p>Join millions of students preparing for their dreams on Vidya Niketan</p>
          <button className="btn btn-primary btn-large" onClick={() => navigate('/signup')}>
            Start Your Journey Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h4>Vidya Niketan</h4>
              <p>Best coaching institute in Hapur for CBSE Class IX-XII, JEE & NEET preparation.</p>
              <div className="social-links">
                <a href="#facebook">f</a>
                <a href="#instagram">📷</a>
                <a href="#youtube">▶️</a>
                <a href="#twitter">𝕏</a>
              </div>
            </div>

            <div className="footer-column">
              <h4>Contact Info</h4>
              <ul>
                <li>📍 Vidya Niketan, Old NH 24, Babugarh Cantt, Hapur, Uttar Pradesh</li>
                <li>📞 <a href="tel:+916376333741">+91 6376333741</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#courses">Our Courses</a></li>
                <li><a href="#results">Results</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Support</h4>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Use</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#help">Help Center</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 Vidya Niketan. All rights reserved. | Built with ❤️ for education</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
