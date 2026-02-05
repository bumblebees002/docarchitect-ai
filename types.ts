
export interface Message {
  role: 'user' | 'model';
  content: string;
  latex?: string;
  thought?: string;
  resumeData?: ResumeData;
}

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'none';

export interface UserState {
  credits: number;
  isPremium: boolean;
  subscriptionStatus: SubscriptionStatus;
  renewalDate?: string;
  planId?: string;
}

export interface ColorTheme {
  id: string;
  name: string;
  hex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  isPremium?: boolean;
}

export const THEMES: ColorTheme[] = [
  { id: 'slate', name: 'Classic Black', hex: '0f172a', bgClass: 'bg-slate-900', borderClass: 'border-slate-800', textClass: 'text-slate-900' },
  { id: 'indigo', name: 'Indigo', hex: '6366f1', bgClass: 'bg-indigo-600', borderClass: 'border-indigo-400', textClass: 'text-indigo-600' },
  { id: 'emerald', name: 'Emerald', hex: '10b981', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-400', textClass: 'text-emerald-600', isPremium: true },
  { id: 'rose', name: 'Rose', hex: 'f43f5e', bgClass: 'bg-rose-600', borderClass: 'border-rose-400', textClass: 'text-rose-600', isPremium: true },
  { id: 'amber', name: 'Amber', hex: 'f59e0b', bgClass: 'bg-amber-600', borderClass: 'border-amber-400', textClass: 'text-amber-600', isPremium: true },
];

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string; // SVG or emoji for preview
  isPremium?: boolean;
}

export const TEMPLATES: ResumeTemplate[] = [
  { 
    id: 'classic', 
    name: 'Classic Executive', 
    description: 'Centered header with elegant typography',
    thumbnail: ''
  },
  { 
    id: 'modern-header', 
    name: 'Modern Header', 
    description: 'Bold header bar with photo on left',
    thumbnail: ''
  },
  { 
    id: 'two-column', 
    name: 'Two Column', 
    description: 'Photo right, content left with header bar',
    thumbnail: ''
  },
  { 
    id: 'creative-sidebar', 
    name: 'Creative Sidebar', 
    description: 'Vibrant sidebar with pattern background',
    thumbnail: ''
  },
  { 
    id: 'elegant-sidebar', 
    name: 'Elegant Sidebar', 
    description: 'Light sidebar with circular photo',
    thumbnail: ''
  },
  { 
    id: 'professional-border', 
    name: 'Professional Border', 
    description: 'Clean design with accent border',
    thumbnail: ''
  },
  { 
    id: 'bold-accent', 
    name: 'Bold Accent', 
    description: 'Large typography with accent color',
    thumbnail: ''
  },
  { 
    id: 'cyan-stripe-sidebar', 
    name: 'Cyan Stripe Sidebar', 
    description: 'Sidebar with stripe pattern',
    thumbnail: ''
  },
  { 
    id: 'leaf-pattern', 
    name: 'Leaf Pattern', 
    description: 'Nature-inspired with centered photo',
    thumbnail: ''
  },
  { 
    id: 'dark-sidebar', 
    name: 'Dark Sidebar', 
    description: 'Dark sidebar with square photo',
    thumbnail: ''
  },
  { 
    id: 'light-blue-accent', 
    name: 'Light Blue Accent', 
    description: 'Light blue accent with underlines',
    thumbnail: ''
  },
];

export type DocumentType = 'resume' | 'cover-letter' | 'letterhead' | 'experience-letter';

export interface CustomSection {
  title: string;
  items: string[];
  type?: 'list' | 'table';
  tableData?: string[][];
}

export interface ResumeData {
  type?: DocumentType;
  metadata?: {
    date?: string;
    recipientName?: string;
    recipientTitle?: string;
    companyName?: string;
    subject?: string;
    subjectLabel?: string;
    referenceNumber?: string;
    referenceLabel?: string;
    toLabel?: string;
    signOffLabel?: string;
  };
  sectionTitles?: {
    summary?: string;
    skills?: string;
    experience?: string;
    projects?: string;
    education?: string;
    certifications?: string;
    languages?: string;
    awards?: string;
    volunteering?: string;
  };
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    summary?: string;
    website?: string;
    profilePicture?: string; // base64 string
  };
  skills: {
    hard: string[];
    soft: string[];
    tools?: string[];
  };
  experience: {
    company: string;
    role: string;
    location: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description: string[];
  }[];
  education: {
    school: string;
    degree: string;
    field: string;
    location: string;
    graduationDate: string;
  }[];
  projects?: {
    name: string;
    description: string;
    technologies?: string[];
  }[];
  certifications?: string[];
  languages?: string[];
  awards?: string[];
  volunteering?: {
    organization: string;
    role: string;
    description: string;
  }[];
  customSections?: CustomSection[];
  contentBody?: string; // For letters and letterheads
}
