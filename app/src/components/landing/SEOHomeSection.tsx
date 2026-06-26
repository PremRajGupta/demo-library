
interface SEOHomeSectionProps {
  libraryInfo?: {
    name?: string;
    location?: string;
    city?: string;
  };
}

export default function SEOHomeSection({ libraryInfo }: SEOHomeSectionProps) {
  const schoolName = libraryInfo?.name || 'Demo Library';
  const location = libraryInfo?.location || 'Tehta';
  const city = libraryInfo?.city || 'Jehanabad';

  return (
    <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main H1 - Critical for SEO */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]">Demo Library</span>
          </h1>
          <p className="text-xl sm:text-2xl text-[#cbd5e1] mb-6 max-w-3xl mx-auto">
            Top Educational Institute in {location} - Your Gateway to Quality Education & Galaxy Education Hub
          </p>
          <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
            Discover excellence in education at {schoolName}, the leading educational institute providing comprehensive programs, 
            admissions support, and complete academic services for students.
          </p>
        </div>

        {/* Key Services - SEO Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              title: 'Galaxy Education Programs',
              description: 'Comprehensive educational courses tailored for student success',
              icon: '📚'
            },
            {
              title: 'Admission Guidance',
              description: 'Expert admission support and guidance for all educational levels',
              icon: '✓'
            },
            {
              title: 'Fee Management',
              description: 'Transparent fee collection and financial management services',
              icon: '💳'
            },
            {
              title: 'Student Records',
              description: 'Complete digital record management and tracking system',
              icon: '📋'
            }
          ].map((service, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:border-[#3b82f6]/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="text-3xl mb-3">{service.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-white">{service.title}</h3>
              <p className="text-[#cbd5e1] text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 sm:p-12 mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
            Why Choose {schoolName}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Expert Faculty',
                content: 'Highly qualified educators committed to student excellence'
              },
              {
                title: 'Modern Infrastructure',
                content: 'State-of-the-art facilities and learning resources'
              },
              {
                title: 'Proven Track Record',
                content: 'Years of excellence in educational services delivery'
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
                content: 'Focused on individual student growth and success'
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <h3 className="text-xl font-semibold mb-3 text-[#60a5fa]">{item.title}</h3>
                <p className="text-[#cbd5e1]">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Location & Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Located in {location}</h3>
            <p className="text-[#cbd5e1] mb-4">
              Demo Library is proud to serve the {location} community and surrounding areas with quality 
              educational programs and services.
            </p>
            <p className="text-[#94a3b8]">
              Available for students seeking quality education, admissions guidance, and comprehensive educational support in {city}.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Our Services Include:</h3>
            <ul className="space-y-2 text-[#cbd5e1]">
              <li>✓ New Student Admissions</li>
              <li>✓ Fee Collection & Management</li>
              <li>✓ Student Records Management</li>
              <li>✓ Academic Reports</li>
              <li>✓ Seat Allocation & Management</li>
              <li>✓ Comprehensive Dashboard</li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-6">Ready to Begin Your Educational Journey?</h2>
          <p className="text-xl text-[#cbd5e1] mb-8 max-w-2xl mx-auto">
            Join thousands of students at {schoolName}, the trusted educational hub in {location}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              Start New Admission
            </button>
            <button className="border-2 border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* SEO Text Content Section */}
        <article className="mt-16 prose prose-invert max-w-none text-[#cbd5e1]">
          <h2 className="text-3xl font-bold mb-6 text-white">About Demo Library - Educational Excellence in {location}</h2>
          
          <p className="leading-relaxed mb-4">
            <strong>Demo Library</strong> stands as the premier educational institute in {location}, {city}, dedicated to 
            providing comprehensive education and student services. As part of the Galaxy Education family, we are committed 
            to fostering academic excellence and personal growth.
          </p>

          <h3 className="text-2xl font-bold mt-8 mb-4 text-white">Galaxy Education Programs</h3>
          <p className="leading-relaxed mb-4">
            Our galaxy education programs are designed to meet the diverse needs of students at various educational levels. 
            From primary to advanced education, Demo Library offers structured pathways for academic success. Our comprehensive 
            curriculum focuses on both theoretical knowledge and practical application.
          </p>

          <h3 className="text-2xl font-bold mt-8 mb-4 text-white">Admissions at Demo Library</h3>
          <p className="leading-relaxed mb-4">
            Seeking admission to a quality educational institute? Demo Library provides streamlined admission processes with 
            expert guidance at every step. Our admission portal and team ensure a smooth enrollment experience for all applicants.
          </p>

          <h3 className="text-2xl font-bold mt-8 mb-4 text-white">Complete Fee Management System</h3>
          <p className="leading-relaxed mb-4">
            We offer transparent and efficient fee collection services. Our digital fee management system ensures secure 
            transactions and clear financial records for students and parents.
          </p>

          <h3 className="text-2xl font-bold mt-8 mb-4 text-white">Student Records & Digital Management</h3>
          <p className="leading-relaxed mb-4">
            Complete student record management with our advanced digital system. Track academic progress, attendance, 
            and achievements - all in one secure platform.
          </p>

          <h3 className="text-2xl font-bold mt-8 mb-4 text-white">Why Choose Demo Library in {location}?</h3>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Experienced faculty committed to student success</li>
            <li>Modern educational infrastructure and technology</li>
            <li>Transparent operations and communication</li>
            <li>Comprehensive student support services</li>
            <li>Digital admission and fee management</li>
            <li>Proven track record in educational excellence</li>
          </ul>

          <p className="leading-relaxed mt-6">
            Whether you're searching for "demo library", "demo library in tehta", "galaxy education" or looking for 
            the best educational institute in {location}, Demo Library is your destination for quality education and 
            comprehensive student services.
          </p>
        </article>
      </div>
    </div>
  );
}
