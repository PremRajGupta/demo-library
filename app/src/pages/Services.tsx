import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import ChatBot from '../components/ChatBot';
import { SEOMeta } from '../components/SEOMeta';
import { DEFAULT_SITE_CONTENT } from '../data/landingContent';

export default function Services() {
  const navigate = useNavigate();
  const { libraryInfo, pageText, navMenuItems } = DEFAULT_SITE_CONTENT;

  const scrollTo = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/', { state: { scrollToSection: sectionId } });
    }
  };

  const services = [
    {
      title: 'New Student Admissions',
      description: 'Comprehensive admission support and guidance',
      details: 'Our streamlined admission process makes it easy for new students to join Demo Library. Our experienced admission team provides expert guidance through every step, from application to enrollment. We ensure transparent communication and personalized attention for each student.',
      features: [
        'Online admission portal',
        'Expert guidance counselors',
        'Flexible application process',
        'Quick verification',
        'Personalized admission support'
      ],
      icon: '📋'
    },
    {
      title: 'Fee Collection & Management',
      description: 'Transparent and secure financial management',
      details: 'We provide a transparent fee collection system with secure digital transactions. Every payment is recorded and can be tracked through your dashboard. Our financial management ensures clarity and accountability at all times.',
      features: [
        'Digital fee payment system',
        'Secure transactions',
        'Multiple payment options',
        'Fee receipt generation',
        'Transparent pricing'
      ],
      icon: '💳'
    },
    {
      title: 'Student Records Management',
      description: 'Complete digital record keeping and tracking',
      details: 'Our advanced student record system keeps all academic information in one secure place. Track attendance, grades, achievements, and progress all through our comprehensive digital platform. Parents and students have instant access to important information anytime, anywhere.',
      features: [
        'Digital student profiles',
        'Attendance tracking',
        'Grade management',
        'Progress reports',
        'Secure data storage'
      ],
      icon: '📚'
    },
    {
      title: 'Dashboard & Analytics',
      description: 'Complete visibility and control',
      details: 'Access a comprehensive dashboard that gives you complete visibility into admissions, fees, and student performance. Real-time analytics help you make informed decisions. Everything you need is just a few clicks away.',
      features: [
        'Real-time dashboard',
        'Performance analytics',
        'Custom reports',
        'Data visualization',
        'Quick insights'
      ],
      icon: '📊'
    },
    {
      title: 'Seat Allocation & Management',
      description: 'Fair and transparent seat distribution',
      details: 'Our intelligent seat allocation system ensures fair distribution based on merit and other criteria. The system is transparent, efficient, and saves time. All allocation decisions are tracked and can be reviewed anytime.',
      features: [
        'Automated seat allocation',
        'Fair distribution system',
        'Merit-based selection',
        'Transparent process',
        'Instant notifications'
      ],
      icon: '🎯'
    },
    {
      title: 'Academic Reports & Documentation',
      description: 'Professional academic documentation',
      details: 'Generate professional academic reports and documents with just a few clicks. From transcripts to certificates, our system handles all documentation needs efficiently and securely.',
      features: [
        'PDF report generation',
        'Academic transcripts',
        'Certificate generation',
        'Progress reports',
        'Custom documentation'
      ],
      icon: '📄'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOMeta
        title="Our Services - Demo Library | Admission, Fee Collection, Student Management"
        description="Explore Demo Library's comprehensive services including student admissions, transparent fee collection, digital student records management, and advanced dashboard for academic tracking."
        keywords="demo library services, admission services, fee collection, student records, educational services tehta, admission portal, fee management system"
        ogUrl="https://galaxyhub.in/services"
        canonical="https://galaxyhub.in/services"
        schema={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Demo Library",
          "url": "https://galaxyhub.in",
          "description": "Leading educational institute providing comprehensive services",
          "offers": [
            {
              "@type": "Service",
              "name": "Student Admissions",
              "description": "Comprehensive admission support and guidance for new students"
            },
            {
              "@type": "Service",
              "name": "Fee Collection",
              "description": "Transparent and secure digital fee management system"
            },
            {
              "@type": "Service",
              "name": "Student Records Management",
              "description": "Digital record keeping and academic tracking"
            },
            {
              "@type": "Service",
              "name": "Dashboard Portal",
              "description": "Advanced portal for tracking admissions and academic progress"
            }
          ]
        }}
      />
      <LandingNavbar
        libraryInfo={libraryInfo}
        pageText={pageText}
        navMenuItems={navMenuItems}
        onNavigate={scrollTo}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]">Services</span>
          </h1>
          <p className="text-xl text-[#cbd5e1] max-w-3xl mx-auto">
            Comprehensive educational services designed to support every stage of your academic journey
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[#1e293b]">
            Galaxy Education - Complete Service Solutions
          </h2>
          <p className="text-lg text-[#64748b] max-w-3xl mx-auto leading-relaxed">
            At Demo Library, we provide comprehensive educational services covering every aspect of student management and academic excellence. From admissions to records management, we handle it all with transparency and professionalism.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-white to-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg p-8 hover:border-[#3b82f6] hover:shadow-xl transition-all duration-300"
            >
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-2xl font-bold mb-2 text-[#1e293b]">{service.title}</h3>
              <p className="text-[#64748b] text-sm mb-4">{service.description}</p>
              <div className="pt-4 border-t border-[#e2e8f0]">
                <p className="text-[#64748b] text-sm leading-relaxed">{service.details}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Services */}
        <div className="space-y-12">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-[#f0f9ff] to-[#f0fdf4] border-l-4 border-[#3b82f6] rounded-lg p-8"
            >
              <div className="flex items-start gap-6">
                <div className="text-5xl flex-shrink-0">{service.icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-[#1e293b]">{service.title}</h3>
                  <p className="text-[#64748b] mb-4">{service.details}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {service.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start">
                        <span className="text-[#3b82f6] mr-2">✓</span>
                        <span className="text-[#64748b] text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why Our Services */}
        <div className="mt-16 bg-white border-2 border-[#e2e8f0] rounded-xl p-8 sm:p-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#1e293b]">
            Why Choose Our Services?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Transparent',
                description: 'Clear processes and open communication'
              },
              {
                title: 'Efficient',
                description: 'Fast processing and quick turnaround'
              },
              {
                title: 'Secure',
                description: 'Protected data and encrypted transactions'
              },
              {
                title: 'User-Friendly',
                description: 'Easy to use interfaces and clear instructions'
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl mb-3">✨</div>
                <h3 className="text-lg font-bold mb-2 text-[#1e293b]">{item.title}</h3>
                <p className="text-[#64748b] text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SEO Content */}
        <article className="mt-16 prose prose-sm max-w-none">
          <h2 className="text-3xl font-bold mb-6 text-[#1e293b]">
            Galaxy Education Services in {libraryInfo?.location || 'Tehta'}
          </h2>
          <p className="text-[#64748b] leading-relaxed mb-4">
            Demo Library in {libraryInfo?.location || 'Tehta'} provides comprehensive educational services designed to support students at every stage of their academic journey. From new admissions to complete fee management and student record maintenance, we handle all aspects with professionalism and transparency.
          </p>

          <h3 className="text-2xl font-bold mt-8 mb-4 text-[#1e293b]">Admission Services</h3>
          <p className="text-[#64748b] leading-relaxed mb-4">
            Our admission services are designed to make the process as smooth as possible. Whether you're seeking admission to Demo Library or looking for guidance on educational options, our team is here to help. We provide expert counseling, handle all paperwork, and ensure your admission is processed quickly and transparently.
          </p>

          <h3 className="text-2xl font-bold mt-8 mb-4 text-[#1e293b]">Fee Management System</h3>
          <p className="text-[#64748b] leading-relaxed mb-4">
            Our digital fee collection system offers transparency and security. Every transaction is recorded, receipts are generated automatically, and you can track all payments through your personalized dashboard. We support multiple payment methods for your convenience.
          </p>

          <h3 className="text-2xl font-bold mt-8 mb-4 text-[#1e293b]">Student Records & Management</h3>
          <p className="text-[#64748b] leading-relaxed mb-4">
            Complete student record management ensures all academic information is securely stored and easily accessible. Track attendance, grades, and progress all from one platform. Parents and students can access important information anytime, anywhere, with complete security and privacy.
          </p>
        </article>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-xl p-8 sm:p-12 text-white mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Our Services?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Start your journey with Demo Library today and experience quality education with comprehensive support
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="bg-white text-[#3b82f6] hover:bg-[#f0f9ff] font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Start Admission
            </button>
            <button
              onClick={() => navigate('/about')}
              className="border-2 border-white text-white hover:bg-white hover:text-[#3b82f6] font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Learn More About Us
            </button>
          </div>
        </div>
      </div>

      <LandingFooter
        libraryInfo={libraryInfo}
        pageText={pageText}
        navMenuItems={navMenuItems}
        onNavigate={scrollTo}
      />
      <ChatBot />
    </div>
  );
}
