import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import ChatBot from '../components/ChatBot';
import { SEOMeta } from '../components/SEOMeta';
import { DEFAULT_SITE_CONTENT } from '../data/landingContent';

export default function About() {
  const navigate = useNavigate();
  const { libraryInfo, pageText, navMenuItems } = DEFAULT_SITE_CONTENT;

  const scrollTo = (sectionId: string) => {
    if (sectionId.startsWith('/')) {
      navigate(sectionId);
      return;
    }
    if (sectionId === 'about') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/', { state: { scrollToSection: sectionId } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040814] text-slate-800 dark:text-slate-300 font-sans selection:bg-blue-500/30 transition-colors duration-300 flex flex-col">
      <SEOMeta
        title="About Demo Library - Best Educational Institute in Tehta | Galaxy Education"
        description="Learn about Demo Library, the leading educational institute in Tehta. Discover our mission, vision, expert faculty, modern infrastructure, and comprehensive education programs."
        keywords="demo library, about demo library, educational institute tehta, galaxy education, quality education, student support, admission process, learning center"
        ogUrl="https://galaxyhub.in/about"
        canonical="https://galaxyhub.in/about"
        schema={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": "Demo Library",
          "url": "https://galaxyhub.in",
          "logo": "https://galaxyhub.in/logo.png",
          "description": "Demo Library is the leading educational institute in Tehta providing quality education, admissions, and comprehensive fee management services.",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Tehta",
            "addressCountry": "IN"
          },
          "sameAs": [
            "https://maps.app.goo.gl/NzwYiUAujqzYiKKL6",
            "https://maps.app.goo.gl/ZwQaWJYWwbDfauP56",
            "https://demo-library.example.com"
          ],
          "areaServed": {
            "@type": "City",
            "name": "Tehta"
          },
          "potentialAction": {
            "@type": "EnrollAction"
          }
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
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]">Demo Library</span>
          </h1>
          <p className="text-xl text-[#cbd5e1] max-w-3xl mx-auto">
            Discover our mission, vision, and the journey of excellence in education
          </p>
        </div>
      </div>

      {/* Main H1 - Critical for SEO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight text-[#1e293b]">
            Welcome to Demo Library - Top Educational Institute in {libraryInfo?.location || 'Tehta'}
          </h2>
          <p className="text-lg text-[#64748b] max-w-3xl mx-auto leading-relaxed">
            Your Gateway to Quality Education & Galaxy Education Hub - We are committed to fostering academic excellence and personal growth for every student.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              title: 'Galaxy Education Programs',
              description: 'Comprehensive educational courses tailored for student success',
              icon: '📚'
            },
            {
              title: 'Expert Faculty',
              description: 'Highly qualified educators committed to student excellence',
              icon: '👨‍🏫'
            },
            {
              title: 'Modern Infrastructure',
              description: 'State-of-the-art facilities and learning resources',
              icon: '🏢'
            },
            {
              title: 'Proven Excellence',
              description: 'Years of proven track record in educational services',
              icon: '⭐'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] border border-[#cbd5e1] rounded-lg p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-[#1e293b]">{item.title}</h3>
              <p className="text-[#64748b] text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Why Choose Us */}
        <div className="bg-gradient-to-r from-[#f0f9ff] to-[#f0fdf4] border border-[#bfdbfe] rounded-xl p-8 sm:p-12 mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-[#1e293b]">
            Why Choose Demo Library?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Expert Faculty',
                content: 'Highly qualified educators committed to student excellence and continuous learning'
              },
              {
                title: 'Modern Infrastructure',
                content: 'State-of-the-art facilities and cutting-edge learning resources'
              },
              {
                title: 'Proven Track Record',
                content: 'Years of excellence in educational services delivery and student success'
              },
              {
                title: 'Comprehensive Support',
                content: 'Complete admission to completion student support services'
              },
              {
                title: 'Transparent Operations',
                content: 'Clear communication and transparent fee management'
              },
              {
                title: 'Student-Centric Approach',
                content: 'Focused on individual student growth and personal development'
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <h3 className="text-xl font-semibold mb-3 text-[#3b82f6]">{item.title}</h3>
                <p className="text-[#64748b]">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Services */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#1e293b]">Our Comprehensive Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'New Student Admissions',
                description: 'Streamlined admission process with expert guidance and complete support for new students',
                link: '/services'
              },
              {
                title: 'Fee Collection & Management',
                description: 'Transparent digital fee collection system with secure transactions and clear records',
                link: '/services'
              },
              {
                title: 'Student Records Management',
                description: 'Complete digital record management, tracking, and academic progress monitoring',
                link: '/services'
              },
              {
                title: 'Comprehensive Dashboard',
                description: 'Advanced portal for tracking admissions, fees, and student academic information',
                link: '/services'
              }
            ].map((service, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-[#e2e8f0] rounded-lg p-6 hover:border-[#3b82f6] transition-all duration-300 hover:shadow-lg"
              >
                <h3 className="text-2xl font-bold mb-3 text-[#1e293b]">{service.title}</h3>
                <p className="text-[#64748b] mb-4">{service.description}</p>
                <button
                  onClick={() => navigate(service.link)}
                  className="text-[#3b82f6] hover:text-[#2563eb] font-semibold transition-colors"
                >
                  Learn More →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Location Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-[#dbeafe] to-[#e0e7ff] border border-[#bfdbfe] rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4 text-[#1e293b]">Located in {libraryInfo?.location || 'Tehta'}</h3>
            <p className="text-[#64748b] mb-4">
              Demo Library is proud to serve the {libraryInfo?.location || 'Tehta'} community and surrounding areas with quality educational programs and services.
            </p>
            <p className="text-[#64748b]">
              Available for students seeking quality education, admissions guidance, and comprehensive educational support in the region.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#fef3c7] to-[#fef08a] border border-[#fcd34d] rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4 text-[#1e293b]">Our Core Values</h3>
            <ul className="space-y-2 text-[#64748b]">
              <li className="flex items-start">
                <span className="text-[#3b82f6] mr-2">✓</span>
                <span>Excellence in Education</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#3b82f6] mr-2">✓</span>
                <span>Student-First Approach</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#3b82f6] mr-2">✓</span>
                <span>Transparency & Integrity</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#3b82f6] mr-2">✓</span>
                <span>Continuous Innovation</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#3b82f6] mr-2">✓</span>
                <span>Community Engagement</span>
              </li>
            </ul>
          </div>
        </div>

        {/* SEO Content Section */}
        <article className="prose prose-sm max-w-none mb-12">
          <h2 className="text-3xl font-bold mb-6 text-[#1e293b]">About Demo Library - Educational Excellence in {libraryInfo?.location || 'Tehta'}</h2>
          
          <p className="text-[#64748b] leading-relaxed mb-4">
            <strong>Demo Library</strong> stands as the premier educational institute in {libraryInfo?.location || 'Tehta'}, dedicated to providing comprehensive education and student services. As part of the Galaxy Education family, we are committed to fostering academic excellence and personal growth for every student who walks through our doors.
          </p>

          <h3 className="text-2xl font-bold mt-8 mb-4 text-[#1e293b]">Galaxy Education Programs</h3>
          <p className="text-[#64748b] leading-relaxed mb-4">
            Our galaxy education programs are designed to meet the diverse needs of students at various educational levels. From primary to advanced education, Demo Library offers structured pathways for academic success. Our comprehensive curriculum focuses on both theoretical knowledge and practical application, ensuring students are well-prepared for future challenges.
          </p>

          <h3 className="text-2xl font-bold mt-8 mb-4 text-[#1e293b]">Admissions at Demo Library</h3>
          <p className="text-[#64748b] leading-relaxed mb-4">
            Seeking admission to a quality educational institute? Demo Library provides streamlined admission processes with expert guidance at every step. Our admission portal and dedicated team ensure a smooth enrollment experience for all applicants. We evaluate each student individually and provide personalized guidance for their educational journey.
          </p>

          <h3 className="text-2xl font-bold mt-8 mb-4 text-[#1e293b]">Complete Fee Management System</h3>
          <p className="text-[#64748b] leading-relaxed mb-4">
            We offer transparent and efficient fee collection services. Our digital fee management system ensures secure transactions and clear financial records for students and parents. Every transaction is documented and easily accessible through our comprehensive dashboard.
          </p>

          <h3 className="text-2xl font-bold mt-8 mb-4 text-[#1e293b]">Student Records & Digital Management</h3>
          <p className="text-[#64748b] leading-relaxed mb-4">
            Complete student record management with our advanced digital system. Track academic progress, attendance, and achievements - all in one secure platform. Our system ensures data security while providing instant access to important information.
          </p>

          <h3 className="text-2xl font-bold mt-8 mb-4 text-[#1e293b]">Why Choose Demo Library in {libraryInfo?.location || 'Tehta'}?</h3>
          <ul className="list-disc list-inside space-y-2 text-[#64748b] mb-4">
            <li>Experienced faculty committed to student success</li>
            <li>Modern educational infrastructure and technology</li>
            <li>Transparent operations and clear communication</li>
            <li>Comprehensive student support services</li>
            <li>Digital admission and fee management</li>
            <li>Proven track record in educational excellence</li>
            <li>Student-centric approach to learning</li>
            <li>Continuous innovation and improvement</li>
          </ul>

          <p className="text-[#64748b] leading-relaxed mt-6 mb-4">
            Whether you're searching for "demo library", "demo library in tehta", "galaxy education", or looking for the best educational institute in {libraryInfo?.location || 'Tehta'}, Demo Library is your destination for quality education and comprehensive student services. Join thousands of satisfied students and experience the Demo Library difference.
          </p>
        </article>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-xl p-8 sm:p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Educational Journey?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of students at Demo Library and experience the difference quality education can make
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-[#3b82f6] hover:bg-[#f0f9ff] font-bold py-3 px-8 rounded-lg transition-colors inline-block"
          >
            Start New Admission
          </button>
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
