/**
 * Default landing page content (fallback only).
 * Edit live content from Dashboard → Website → Save Changes.
 */
export type LibraryInfo = {
  name: string;
  tagline: string;
  ownerName: string;
  phone: string;
  phoneRaw: string;
  email: string;
  address: string;
  location?: string;
  mapUrl: string;
  whatsappMessage: string;
};

export type ContactCardInfo = {
  title: string;
  phone: string;
  phoneRaw: string;
  email: string;
  address: string;
  mapUrl: string;
  whatsappMessage: string;
};

export type PageText = {
  navHome: string;
  navAbout: string;
  navStats: string;
  navContact: string;
  navLogin: string;
  heroVisitButton: string;
  heroContactButton: string;
  galleryTitle: string;
  gallerySubtitle: string;
  facultyTitle: string;
  facultySubtitle: string;
  teacherTitle: string;
  teacherSubtitle: string;
  contactTitle: string;
  contactSubtitle: string;
  contactPhoneLabel: string;
  contactEmailLabel: string;
  contactAddressLabel: string;
  contactSecondTitle: string;
  contactSecondPhoneLabel: string;
  contactSecondEmailLabel: string;
  contactSecondAddressLabel: string;
  whatsappButton: string;
  footerQuickLinksTitle: string;
  footerGetStartedTitle: string;
  footerGetStartedText: string;
  footerLoginButton: string;
  footerCopyright: string;
  statsTitle: string;
  statsSubtitle: string;
  statsAdmissionsLabel: string;
  statsVisitorsLabel: string;
  statsAvailableSeatsLabel: string;
  statsOccupiedSeatsLabel: string;
  statsStudyShiftsLabel: string;
  statsOccupancyLabel: string;
  statsFootnote: string;
};

export type HeroSlide = {
  id: number;
  image: string;
  title: string;
  subtitle: string;
};

export type AboutHighlight = {
  label: string;
  value: string;
};

export type AboutContent = {
  title: string;
  paragraphs: string[];
  highlights: AboutHighlight[];
};

export type GalleryImage = {
  id: number;
  src: string;
  title: string;
  alt: string;
};

export type ComputerCourse = {
  id: string;
  title: string;
  fullName: string;
  duration: string;
  fee: string;
  color: string;
  image?: string;
};

export type FacultyMember = {
  id: number;
  photo: string;
  name: string;
  role: string;
  detail: string;
};

export type NavMenuItem = {
  id: number;
  label: string;
  /** Must match a section id on the index page: home, about, stats, gallery, faculty, contact */
  sectionId: string;
};

export const NAV_SECTION_OPTIONS: { id: string; label: string }[] = [
  { id: 'home', label: 'Home (top)' },
  { id: 'about', label: 'About' },
  { id: 'stats', label: 'Stats' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'faculty', label: 'Faculty Library' },
  { id: 'contact', label: 'Contact' },
];

export type Announcement = {
  title: string;
  text: string;
  link: string;
  endDate: string;
  show: boolean;
  upcomingText: string;
};

export type SiteContent = {
  announcement?: Announcement;
  libraryInfo: LibraryInfo;
  admissionContact: ContactCardInfo;
  pageText: PageText;
  navMenuItems: NavMenuItem[];
  heroSlides: HeroSlide[];
  aboutContent: AboutContent;
  galleryImages: GalleryImage[];
  facultyMembers: FacultyMember[];
  computerCenterTeachers: FacultyMember[];
  computerCourses?: ComputerCourse[];
  updatedAt?: string;
};

export const DEFAULT_NAV_MENU_ITEMS: NavMenuItem[] = [
  { id: 1, label: 'Home', sectionId: 'home' },
  { id: 2, label: 'About', sectionId: 'about' },
  { id: 3, label: 'Stats', sectionId: 'stats' },
  { id: 4, label: 'Gallery', sectionId: 'gallery' },
  { id: 5, label: 'Contact Us', sectionId: 'contact' },
  { id: 6, label: 'Computer Classes', sectionId: '/computercenter' },
];

export const DEFAULT_GALLERY_IMAGE_URL =
  'https://images.unsplash.com/photo-1456513080920-9a0d7562240b?w=800&q=80';

export const DEFAULT_FACULTY_PHOTO_URL =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80';

export const DEFAULT_TEACHER_PHOTO_URL =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80';

export const DEFAULT_PAGE_TEXT: PageText = {
  navHome: 'Home',
  navAbout: 'About',
  navStats: 'Stats',
  navContact: 'Contact Us',
  navLogin: 'Login',
  heroVisitButton: 'Visit',
  heroContactButton: 'Contact',
  galleryTitle: 'Our Library Gallery',
  gallerySubtitle: 'Take a look at our study space, seating arrangement, and peaceful environment.',
  facultyTitle: 'Faculty Library',
  facultySubtitle: 'Meet the mentors and support team guiding students at Demo Library.',
  teacherTitle: 'Our Teacher',
  teacherSubtitle: 'Meet the expert educators guiding students at Galaxy Computer Center.',
  contactTitle: 'Contact Us',
  contactSubtitle: 'Reach out to the owner for admission, fees, or any query.',
  contactPhoneLabel: 'Phone',
  contactEmailLabel: 'Email',
  contactAddressLabel: 'Address',
  contactSecondTitle: 'Admission & Visit Help',
  contactSecondPhoneLabel: 'Support',
  contactSecondEmailLabel: 'Hours',
  contactSecondAddressLabel: 'Location',
  whatsappButton: 'Chat on WhatsApp',
  footerQuickLinksTitle: 'Quick Links',
  footerGetStartedTitle: 'Get Started',
  footerGetStartedText: 'Login to access the management dashboard.',
  footerLoginButton: 'Login',
  footerCopyright: 'All rights reserved.',
  statsTitle: 'Our Growth in Numbers',
  statsSubtitle: 'Trusted by hundreds of students — real counts from Demo Library.',
  statsAdmissionsLabel: 'Total Admissions',
  statsVisitorsLabel: 'Website Visitors',
  statsAvailableSeatsLabel: 'Seats Available',
  statsOccupiedSeatsLabel: 'Seats Occupied',
  statsStudyShiftsLabel: 'Flexible Study Shifts',
  statsOccupancyLabel: 'Seat Occupancy',
  statsFootnote: 'Active members in the system.',
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  announcement: {
    title: 'Special Discount Offer',
    text: 'Join today and get 10% off on your first month admission fee!',
    link: '#contact',
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    show: false,
    upcomingText: 'Stay tuned! An exciting new offer is coming soon. Check back here.',
  },
  libraryInfo: {
    name: 'Demo Library',
    tagline: 'Your Space to Focus, Learn & Grow',
    ownerName: 'Demo Library',
    phone: '+91 9229186355',
    phoneRaw: '919229186355',
    email: 'demo.library@gmail.com',
    address: 'DhiraBigha, Sugaon Road, Tehta, Jehanabad, Bihar 804427',
    mapUrl: '',
    whatsappMessage: 'Hello! I would like to know more about Demo Library.',
  },
  admissionContact: {
    title: 'Admission & Visit Help',
    phone: '+91 9229186355',
    phoneRaw: '919229186355',
    email: 'demo.library@gmail.com',
    address: 'DhiraBigha, Sugaon Road, Tehta, Jehanabad, Bihar 804427',
    mapUrl: '',
    whatsappMessage: 'Hello! I would like to know about admission and visit details.',
  },
  
  pageText: DEFAULT_PAGE_TEXT,
  computerCenterTeachers: [
    {
      id: 1,
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80',
      name: 'Prem Gupta',
      role: 'Lead Instructor',
      detail: 'Expert in programming and web development courses.',
    },
    {
      id: 2,
      photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80',
      name: 'Priya Sharma',
      role: 'IT Trainer',
      detail: 'Teaches fundamental computer courses and networking.',
    }
  ],
  navMenuItems: DEFAULT_NAV_MENU_ITEMS,
  heroSlides: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=80',
      title: 'Welcome to Demo Library',
      subtitle: 'A peaceful environment for serious study and exam preparation.',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&q=80',
      title: 'Comfortable Reading Space',
      subtitle: 'Individual seats, proper lighting, and a distraction-free atmosphere.',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1456513080920-9a0d7562240b?w=1600&q=80',
      title: 'Books & Resources',
      subtitle: 'Access study material and a calm place to prepare for your goals.',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=80',
      title: 'Join Demo Library Today',
      subtitle: 'Flexible shifts, affordable fees, and a supportive study community.',
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=80',
      title: 'Join Demo Library Today',
      subtitle: 'Separate seats for boys and girls.',
    },
  ],
  aboutContent: {
    title: 'About Demo Library',
    paragraphs: [
      'Demo Library is a dedicated study space designed for students preparing for competitive exams, board exams, and higher education. We provide a quiet, disciplined, and comfortable environment where you can focus without distractions.',
      'With assigned seats, flexible time shifts, and professional management, we help students maintain consistency in their preparation. Our mission is to create a space where every learner feels motivated and supported.',
    ],
    highlights: [
      { label: 'Individual Seats', value: 'Assigned' },
      { label: 'Study Shifts', value: '4h – 24h' },
      { label: 'Environment', value: 'Peaceful' },
      { label: 'Management', value: 'Professional' },
    ],
  },
  galleryImages: [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1456513080920-9a0d7562240b?w=800&q=80',
      title: 'Reading Hall',
      alt: 'Students reading in the library hall',
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
      title: 'Study Desks',
      alt: 'Individual study desks with books',
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1456513080920-9a0d7562240b?w=800&q=80',
      title: 'Focused Learning',
      alt: 'Student focused on study materials',
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1434030214721-08960469366f?w=800&q=80',
      title: 'Library Ambience',
      alt: 'Calm library ambience for preparation',
    },
  ],
  facultyMembers: [
    {
      id: 1,
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80',
      name: 'Rahul Kumar',
      role: 'Library Director',
      detail: 'Manages library operations, discipline, and student support.',
    },
    {
      id: 2,
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
      name: 'Priya Sharma',
      role: 'Academic Guide',
      detail: 'Helps students plan study routines and exam preparation goals.',
    },
    {
      id: 3,
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
      name: 'Amit Raj',
      role: 'Student Coordinator',
      detail: 'Coordinates seats, attendance, and student communication.',
    },
    {
      id: 4,
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80',
      name: 'Neha Singh',
      role: 'Counsellor',
      detail: 'Supports admissions, queries, and a focused learning environment.',
    },
  ],
  computerCourses: [
    { id: 'bcc', title: 'BCC', fullName: 'BASIC COMPUTER COURSE', duration: '2 Months', fee: '1,000.00', color: 'from-slate-900 to-[#0a192f]', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop' },
    { id: 'dca', title: 'DCA', fullName: 'DIPLOMA IN COMPUTER APPLICATION', duration: '6 Months', fee: '2,000.00', color: 'from-[#0a192f] to-slate-900', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop' },
    { id: 'adca', title: 'ADCA', fullName: 'ADVANCE DIPLOMA', duration: '6 Months', fee: '2,000.00', color: 'from-slate-950 to-slate-900', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop' },
    { id: 'dtp', title: 'DTP', fullName: 'DESKTOP PUBLISHING', duration: '3 Months', fee: '1,000.00', color: 'from-[#1e1e2f] to-black', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop' },
    { id: 'tally', title: 'Tally With Gst', fullName: 'MASTER ACCOUNTING', duration: '3 Months', fee: '1,000.00', color: 'from-slate-900 to-[#0f172a]', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop' },
    { id: 'network', title: 'Computer Networking', fullName: 'NETWORKING FUNDAMENTALS', duration: '2 Months', fee: '1,500.00', color: 'from-[#0b1b3d] to-slate-900', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop' },
    { id: 'c', title: 'C Programming', fullName: 'LEARN C PROGRAMMING', duration: '2 Months', fee: '1,000.00', color: 'from-slate-900 to-black', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop' },
    { id: 'css', title: 'CSS', fullName: 'CSS 3 STYLING', duration: '1 Months', fee: '500.00', color: 'from-[#0d2a52] to-slate-900', image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=800&auto=format&fit=crop' },
  ],
};

export const normalizePhoneRaw = (phone: string) => phone.replace(/\D/g, '');

export const nextItemId = (items: { id: number }[]) =>
  items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
