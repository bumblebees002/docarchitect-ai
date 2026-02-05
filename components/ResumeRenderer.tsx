
import React, { useRef, useCallback, memo, useState } from 'react';
import { ResumeData, ColorTheme } from '../types.ts';
import { 
  Trash2, 
  Edit2, 
  Briefcase, 
  GraduationCap, 
  Target,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  ChevronRight,
  List,
  Zap,
  Plus,
  MinusCircle,
  Camera,
  Upload,
  X,
  User as UserIcon,
  PlusCircle,
  FileText,
  Calendar,
  Building,
  AtSign,
  Award,
  Globe,
  CheckCircle2,
  Heart
} from 'lucide-react';

interface Props {
  data: ResumeData;
  theme: ColorTheme;
  isMini?: boolean;
  onUpdate?: (newData: ResumeData) => void;
}

const Editable = memo(({ text, path, className, element: Element = 'span', placeholder = "...", onBlur }: any) => {
  const ref = useRef<any>(null);

  const handleClick = () => {
    if (ref.current) {
      ref.current.focus();
    }
  };

  return (
    <div className="relative group/edit inline-block min-w-[20px]">
      <Element
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e: any) => onBlur(path, e.currentTarget.innerText)}
        className={`${className} outline-none hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-slate-200 rounded px-1 -mx-1 transition-all cursor-text`}
      >
        {text || placeholder}
      </Element>
      <button 
        onClick={handleClick}
        className="no-print w-2 h-2 absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/edit:opacity-40 text-slate-400 transition-opacity"
      >
        <Edit2 className="w-full h-full pointer-events-none" />
      </button>
    </div>
  );
});

const ResumeRenderer: React.FC<Props> = ({ data, theme, isMini = false, onUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const docType = data.type || 'resume';

  const handleBlur = useCallback((path: string, value: string) => {
    if (!onUpdate) return;
    try {
      const keys = path.split('.');
      const newData = JSON.parse(JSON.stringify(data));
      let target: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!target[keys[i]]) target[keys[i]] = {};
        target = target[keys[i]];
      }
      target[keys[keys.length - 1]] = value;
      onUpdate(newData);
    } catch (e) {
      console.error("Sync Error:", e);
    }
  }, [data, onUpdate]);

  const updateProfilePic = (base64: string | undefined) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    newData.personalInfo.profilePicture = base64;
    onUpdate(newData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateProfilePic(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCamera = async () => {
    setShowCameraModal(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError("Unable to access camera. Please check permissions.");
    }
  };

  const closeCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg');
    updateProfilePic(base64);
    closeCamera();
  };

  const addSkill = useCallback((type: 'hard' | 'soft' | 'tools') => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (!newData.skills) newData.skills = { hard: [], soft: [], tools: [] };
    if (!newData.skills[type]) newData.skills[type] = [];
    newData.skills[type].push("New Skill");
    onUpdate(newData);
  }, [data, onUpdate]);

  const removeSkill = useCallback((type: 'hard' | 'soft' | 'tools', index: number) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (newData.skills?.[type]) {
      newData.skills[type].splice(index, 1);
      onUpdate(newData);
    }
  }, [data, onUpdate]);

  const addExperience = () => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (!newData.experience) newData.experience = [];
    newData.experience.unshift({
      company: "New Company",
      role: "Position Title",
      location: "City, Country",
      startDate: "Jan 2024",
      endDate: "Present",
      current: true,
      description: ["Key achievement and impact..."]
    });
    onUpdate(newData);
  };

  const removeExperience = (idx: number) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    newData.experience.splice(idx, 1);
    onUpdate(newData);
  };

  const addExperienceBullet = (expIdx: number) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (!newData.experience[expIdx].description) newData.experience[expIdx].description = [];
    newData.experience[expIdx].description.push("New achievement bullet...");
    onUpdate(newData);
  };

  const removeExperienceBullet = (expIdx: number, bulletIdx: number) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    newData.experience[expIdx].description.splice(bulletIdx, 1);
    onUpdate(newData);
  };

  const addEducation = () => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (!newData.education) newData.education = [];
    newData.education.push({
      school: "University Name",
      degree: "Degree Level",
      field: "Study Field",
      location: "Location",
      graduationDate: "Graduation Year"
    });
    onUpdate(newData);
  };

  const removeEducation = (idx: number) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    newData.education.splice(idx, 1);
    onUpdate(newData);
  };

  const addProject = () => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (!newData.projects) newData.projects = [];
    newData.projects.push({
      name: "Project Title",
      description: "Brief overview of the project goal and your contribution.",
      technologies: ["Tech A", "Tech B"]
    });
    onUpdate(newData);
  };

  const removeProject = (idx: number) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    newData.projects.splice(idx, 1);
    onUpdate(newData);
  };

  const addItemToSection = (field: keyof ResumeData) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (!newData[field]) newData[field] = [];
    if (field === 'certifications' || field === 'languages' || field === 'awards') {
      (newData[field] as string[]).push("New Item");
    } else if (field === 'volunteering') {
      (newData[field] as any[]).push({
        organization: "Organization",
        role: "Volunteer Role",
        description: "Summary of contributions..."
      });
    }
    onUpdate(newData);
  };

  const removeItemFromSection = (field: keyof ResumeData, idx: number) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (Array.isArray(newData[field])) {
      (newData[field] as any[]).splice(idx, 1);
      onUpdate(newData);
    }
  };

  const addCustomSection = () => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (!newData.customSections) newData.customSections = [];
    newData.customSections.push({
      title: "New Section",
      items: ["Highlight 1", "Highlight 2"],
      type: 'list'
    });
    onUpdate(newData);
  };

  const addCustomSectionItem = (idx: number) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (!newData.customSections[idx].items) newData.customSections[idx].items = [];
    newData.customSections[idx].items.push("New item...");
    onUpdate(newData);
  };

  const removeCustomSectionItem = (secIdx: number, itemIdx: number) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    newData.customSections[secIdx].items.splice(itemIdx, 1);
    onUpdate(newData);
  };

  const addCustomSectionTableRow = (idx: number) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (!newData.customSections[idx].tableData) {
       newData.customSections[idx].type = 'table';
       newData.customSections[idx].tableData = [["Header 1", "Header 2"], ["Data 1", "Data 2"]];
    } else {
       const numCols = newData.customSections[idx].tableData[0].length;
       newData.customSections[idx].tableData.push(new Array(numCols).fill("..."));
    }
    onUpdate(newData);
  };

  const removeCustomSectionTableRow = (secIdx: number, rowIdx: number) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (newData.customSections[secIdx].tableData.length <= 1) return;
    newData.customSections[secIdx].tableData.splice(rowIdx, 1);
    onUpdate(newData);
  };

  const SectionHeader = useCallback(({ title, icon: Icon, onDelete, onAdd, path }: { title: string, icon: any, onDelete?: () => void, onAdd?: () => void, path?: string }) => (
    <div className="flex items-start gap-4 mt-12 mb-6 break-inside-avoid group relative">
      <div className="p-2 rounded-lg flex-shrink-0 mt-1" style={{ backgroundColor: `${theme.hex}15`, color: theme.hex }}>
        <Icon className="w-5 h-5" strokeWidth={2.5} />
      </div>
      <div className="flex-1 flex items-center gap-4 flex-wrap">
        <Editable 
          text={title} 
          path={path} 
          className="text-[13pt] font-bold uppercase tracking-[0.1em] font-['EB_Garamond',serif]" 
          onBlur={handleBlur} 
        />
        <div className="h-[1.5px] flex-1 min-w-[30px] opacity-10" style={{ backgroundColor: theme.hex }}></div>
      </div>
      <div className="flex items-center gap-1">
        {onAdd && (
          <button onClick={onAdd} className="no-print p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Add Entry">
            <Plus className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="no-print p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Delete Section">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  ), [theme.hex, handleBlur]);

  const p = data?.personalInfo || { fullName: 'NAME', email: 'email@example.com', jobTitle: 'POSITION' };
  const m = data?.metadata || { toLabel: 'To:', subjectLabel: 'Subject:', referenceLabel: 'Ref:', signOffLabel: 'Sincerely,' };
  const st = data?.sectionTitles || { summary: 'Professional Summary', skills: 'Expertise', experience: 'Professional Experience', projects: 'Signature Projects', education: 'Education', certifications: 'Certifications', languages: 'Languages', awards: 'Awards', volunteering: 'Volunteering' };

  if (docType === 'cover-letter' || docType === 'letterhead' || docType === 'experience-letter') {
    return (
      <div 
        ref={containerRef}
        id="resume-content-root"
        className={`bg-white text-slate-900 mx-auto relative transition-all duration-500 shadow-2xl print:shadow-none print:m-0 print:p-0
          ${isMini ? 'w-full p-4' : 'w-[210mm] min-h-[297mm] h-auto p-[20mm] md:p-[25mm]'}`}
        style={{ wordWrap: 'break-word', fontFamily: "'Inter', sans-serif" }}
      >
        <header className="mb-12 border-b-2 pb-8 flex justify-between items-start" style={{ borderColor: `${theme.hex}20` }}>
          <div>
            <h1 className="text-[32pt] font-bold leading-none mb-1 font-['EB_Garamond',serif]" style={{ color: theme.hex }}>
              <Editable text={p.fullName} path="personalInfo.fullName" onBlur={handleBlur} />
            </h1>
            <p className="text-[12pt] font-medium text-slate-500 uppercase tracking-widest font-['JetBrains_Mono',monospace]">
              <Editable text={p.jobTitle} path="personalInfo.jobTitle" onBlur={handleBlur} />
            </p>
          </div>
          <div className="text-right text-[9pt] text-slate-500 space-y-1 font-['JetBrains_Mono',monospace]">
            <p className="flex items-center justify-end gap-2"><Mail className="w-3 h-3" style={{ color: theme.hex }} /> <Editable text={p.email} path="personalInfo.email" onBlur={handleBlur} /></p>
            <p className="flex items-center justify-end gap-2"><Phone className="w-3 h-3" style={{ color: theme.hex }} /> <Editable text={p.phone} path="personalInfo.phone" onBlur={handleBlur} /></p>
            <p className="flex items-center justify-end gap-2"><MapPin className="w-3 h-3" style={{ color: theme.hex }} /> <Editable text={p.location} path="personalInfo.location" onBlur={handleBlur} /></p>
          </div>
        </header>

        <div className="flex flex-col gap-10">
          <div className="space-y-6">
            <div className="flex justify-between items-baseline">
              <div className="space-y-1">
                {(m.recipientName || m.toLabel) && (
                  <p className="text-[11pt] font-bold">
                    <Editable text={m.toLabel || 'To:'} path="metadata.toLabel" onBlur={handleBlur} /> <Editable text={m.recipientName || 'Recipient Name'} path="metadata.recipientName" onBlur={handleBlur} />
                  </p>
                )}
                <p className="text-[10pt] text-slate-600 italic"><Editable text={m.recipientTitle || 'Title'} path="metadata.recipientTitle" onBlur={handleBlur} /></p>
                <p className="text-[10pt] font-bold text-slate-800"><Editable text={m.companyName || 'Company'} path="metadata.companyName" onBlur={handleBlur} /></p>
              </div>
              <p className="text-[10pt] text-slate-500 font-bold uppercase tracking-widest font-['JetBrains_Mono',monospace]">
                <Editable text={m.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} path="metadata.date" onBlur={handleBlur} />
              </p>
            </div>
            
            {(m.subject || m.subjectLabel) && (
              <div className="border-l-4 pl-4 bg-slate-50 py-3" style={{ borderColor: theme.hex }}>
                <p className="text-[11pt] font-black uppercase tracking-wide">
                  <Editable text={m.subjectLabel || 'Subject:'} path="metadata.subjectLabel" onBlur={handleBlur} /> <Editable text={m.subject || 'Reference Topic'} path="metadata.subject" onBlur={handleBlur} />
                </p>
                {(m.referenceNumber || m.referenceLabel) && <p className="text-[8pt] text-slate-400 mt-1 font-mono"><Editable text={m.referenceLabel || 'Ref:'} path="metadata.referenceLabel" onBlur={handleBlur} /> <Editable text={m.referenceNumber || '...'} path="metadata.referenceNumber" onBlur={handleBlur} /></p>}
              </div>
            )}
          </div>

          <div className="min-h-[400px]">
             <Editable 
                element="div" 
                text={data.contentBody} 
                path="contentBody" 
                className="text-[11pt] leading-[1.8] text-slate-700 whitespace-pre-wrap text-justify font-['EB_Garamond',serif]"
                onBlur={handleBlur} 
                placeholder="Start typing your document content here..."
             />
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50">
            <p className="text-[11pt] text-slate-500 mb-8 font-['EB_Garamond',serif]">
              <Editable text={m.signOffLabel || 'Sincerely,'} path="metadata.signOffLabel" onBlur={handleBlur} />
            </p>
            <div className="space-y-1">
              <p className="text-[14pt] font-bold font-['EB_Garamond',serif]" style={{ color: theme.hex }}>{p.fullName}</p>
              <p className="text-[10pt] text-slate-400 uppercase tracking-widest font-['JetBrains_Mono',monospace]">{p.jobTitle}</p>
            </div>
            
            {docType === 'experience-letter' && (
              <div className="mt-16 flex justify-between items-end">
                <div className="w-48 border-t-2 border-slate-200 pt-2 text-center">
                  <p className="text-[8pt] font-bold uppercase tracking-widest text-slate-400">Authorized Signatory</p>
                </div>
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-slate-100 flex items-center justify-center opacity-30 rotate-12">
                   <p className="text-[8pt] font-black uppercase text-center leading-none">Company Seal<br/>Placeholder</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-auto pt-12 text-center opacity-20">
          <p className="text-[7.5pt] font-medium uppercase tracking-[0.6em] text-slate-400 font-['JetBrains_Mono',monospace]">
            {docType.replace('-', ' ')} • Professional Architecture
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      id="resume-content-root"
      className={`bg-white text-slate-900 mx-auto relative transition-all duration-500 shadow-2xl print:shadow-none print:m-0 print:p-0
        ${isMini ? 'w-full p-4' : 'w-[210mm] min-h-[297mm] h-auto p-[20mm] md:p-[25mm]'}`}
      style={{ wordWrap: 'break-word', fontFamily: "'Inter', sans-serif" }}
    >
      <header className="mb-14 break-inside-avoid flex flex-col items-center text-center">
        <div className="relative group mb-6 no-print">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-100 border-2 border-slate-50 overflow-hidden flex items-center justify-center shadow-inner relative transition-all group-hover:border-indigo-100">
            {p.profilePicture ? (
              <img src={p.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-16 h-16 text-slate-300" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
              <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full text-slate-700 hover:bg-indigo-50 transition-colors shadow-lg" title="Upload Photo"><Upload className="w-4 h-4" /></button>
              <button onClick={openCamera} className="p-2 bg-white rounded-full text-slate-700 hover:bg-indigo-50 transition-colors shadow-lg" title="Take Photo"><Camera className="w-4 h-4" /></button>
              {p.profilePicture && <button onClick={() => updateProfilePic(undefined)} className="p-2 bg-white rounded-full text-rose-500 hover:bg-rose-50 transition-colors shadow-lg" title="Remove Photo"><Trash2 className="w-4 h-4" /></button>}
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        </div>

        <div className="hidden print:block mb-6">
          {p.profilePicture && (
            <div className="w-32 h-32 rounded-full border-2 border-slate-100 overflow-hidden mx-auto">
              <img src={p.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <h1 className="text-[40pt] font-bold leading-tight tracking-tight mb-2 font-['EB_Garamond',serif]" style={{ color: theme.hex }}>
          <Editable text={p.fullName} path="personalInfo.fullName" placeholder="FULL NAME" onBlur={handleBlur} />
        </h1>
        <div className="text-[13pt] font-medium text-slate-500 uppercase tracking-[0.35em] mb-8 font-['JetBrains_Mono',monospace]">
          <Editable text={p.jobTitle} path="personalInfo.jobTitle" placeholder="POSITION" onBlur={handleBlur} />
        </div>
        
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-slate-500 text-[8.5pt] font-medium uppercase justify-center tracking-[0.12em] border-y border-slate-100 py-4 font-['JetBrains_Mono',monospace] w-full">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 opacity-60" style={{ color: theme.hex }} />
            <Editable text={p.email} path="personalInfo.email" placeholder="EMAIL" onBlur={handleBlur} />
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 opacity-60" style={{ color: theme.hex }} />
            <Editable text={p.phone} path="personalInfo.phone" placeholder="PHONE" onBlur={handleBlur} />
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 opacity-60" style={{ color: theme.hex }} />
            <Editable text={p.location} path="personalInfo.location" placeholder="LOCATION" onBlur={handleBlur} />
          </div>
          {p.linkedin && (
            <div className="flex items-center gap-2">
              <Linkedin className="w-3.5 h-3.5 opacity-60" style={{ color: theme.hex }} />
              <Editable text={p.linkedin} path="personalInfo.linkedin" placeholder="LINKEDIN" onBlur={handleBlur} />
            </div>
          )}
        </div>
      </header>

      {p.summary && (
        <section className="mb-12 break-inside-avoid">
           <div className="flex items-center justify-between mb-4 group relative">
             <Editable 
               text={st.summary || 'Professional Summary'} 
               path="sectionTitles.summary" 
               className="text-[10pt] font-bold uppercase text-slate-400 tracking-[0.2em] font-['JetBrains_Mono',monospace]" 
               onBlur={handleBlur} 
             />
           </div>
           <Editable element="p" text={p.summary} path="personalInfo.summary" className="text-[11pt] leading-[1.75] text-slate-700 text-justify block font-normal italic border-l-2 border-slate-200 pl-8 font-['EB_Garamond',serif]" onBlur={handleBlur} />
        </section>
      )}

      {/* Skills */}
      <section className="mb-12 break-inside-avoid">
        <SectionHeader title={st.skills || 'Expertise'} icon={Target} path="sectionTitles.skills" />
        <div className="grid grid-cols-2 gap-x-16">
          {['hard', 'tools'].map((type) => (
            <div key={type}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[8.5pt] font-bold uppercase text-slate-400 tracking-[0.2em] font-['JetBrains_Mono',monospace]">
                  {type === 'hard' ? 'Core Skills' : 'Tools & Stack'}
                </h4>
                <button onClick={() => addSkill(type as any)} className="no-print p-1 hover:bg-slate-50 rounded transition-all"><Plus className="w-3 h-3 text-slate-400" /></button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {(data.skills?.[type as keyof typeof data.skills] || []).map((skill, idx) => (
                  <div key={idx} className="group/skill flex items-center gap-1">
                    <span className={`${type === 'hard' ? 'bg-slate-50 text-slate-700 border-slate-100' : 'bg-slate-900 text-white border-transparent'} px-3 py-1 rounded-sm border text-[8.5pt] font-medium font-['JetBrains_Mono',monospace] flex items-center gap-1.5`}>
                      <Editable text={skill} path={`skills.${type}.${idx}`} onBlur={handleBlur} />
                    </span>
                    <button onClick={() => removeSkill(type as any, idx)} className="no-print opacity-0 group-hover/skill:opacity-100 text-rose-400 transition-opacity"><MinusCircle className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="mb-12">
        <SectionHeader title={st.experience || 'Professional Experience'} icon={Briefcase} path="sectionTitles.experience" onAdd={addExperience} />
        <div className="space-y-12">
          {data.experience?.map((exp, idx) => (
            <div key={idx} className="break-inside-avoid relative pl-10 border-l border-slate-100 mb-10 group/entry">
              <div className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white shadow-sm" style={{ backgroundColor: theme.hex }}></div>
              <button onClick={() => removeExperience(idx)} className="no-print absolute -left-12 top-0 p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover/entry:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
              <div className="flex justify-between items-baseline mb-1">
                <Editable text={exp.role} path={`experience.${idx}.role`} className="text-[13pt] font-bold text-slate-900 font-['EB_Garamond',serif] tracking-wide" onBlur={handleBlur} />
                <span className="text-[9pt] font-medium uppercase tracking-[0.15em] whitespace-nowrap text-slate-400 ml-4 font-['JetBrains_Mono',monospace]">
                  <Editable text={exp.startDate} path={`experience.${idx}.startDate`} onBlur={handleBlur} /> — <Editable text={exp.current ? 'Present' : exp.endDate} path={`experience.${idx}.endDate`} onBlur={handleBlur} />
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4 text-[10pt] font-bold text-slate-600">
                <Editable text={exp.company} path={`experience.${idx}.company`} onBlur={handleBlur} />
                <span className="opacity-20 text-xs">•</span>
                <Editable text={exp.location} path={`experience.${idx}.location`} className="font-medium opacity-60 italic font-['EB_Garamond',serif]" onBlur={handleBlur} />
              </div>
              <ul className="space-y-3 list-none">
                {exp.description.map((bullet, bIdx) => (
                  <li key={bIdx} className="text-[10.5pt] text-slate-700 leading-relaxed flex items-start gap-3 group/bullet">
                    <ChevronRight className="w-3.5 h-3.5 mt-1.5 flex-shrink-0 opacity-40" style={{ color: theme.hex }} />
                    <Editable text={bullet} path={`experience.${idx}.description.${bIdx}`} className="flex-1" onBlur={handleBlur} />
                    <button onClick={() => removeExperienceBullet(idx, bIdx)} className="no-print opacity-0 group-hover/bullet:opacity-100 text-rose-300 hover:text-rose-500 transition-opacity"><MinusCircle className="w-3.5 h-3.5" /></button>
                  </li>
                ))}
                <button onClick={() => addExperienceBullet(idx)} className="no-print text-[7.5pt] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1.5 mt-4 font-['JetBrains_Mono',monospace] uppercase tracking-widest"><Plus className="w-3 h-3" /> Add Achievement</button>
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mb-12">
        <SectionHeader title={st.projects || 'Signature Projects'} icon={Zap} path="sectionTitles.projects" onAdd={addProject} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.projects?.map((proj, idx) => (
            <div key={idx} className="break-inside-avoid p-6 rounded-lg border border-slate-100 bg-slate-50/20 transition-all hover:bg-slate-50/50 relative group/entry">
              <button onClick={() => removeProject(idx)} className="no-print absolute top-2 right-2 p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover/entry:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              <Editable text={proj.name} path={`projects.${idx}.name`} className="text-[12pt] font-bold text-slate-900 mb-2 block font-['EB_Garamond',serif] tracking-wide" onBlur={handleBlur} />
              <Editable text={proj.description} path={`projects.${idx}.description`} element="p" className="text-[10pt] text-slate-600 leading-relaxed block mb-5" onBlur={handleBlur} />
              {proj.technologies && (
                <div className="flex flex-wrap gap-2">
                  {proj.technologies.map((t, i) => (
                    <span key={i} className="text-[7.5pt] font-bold uppercase tracking-widest text-slate-400 bg-white px-2.5 py-1 rounded-sm border border-slate-100 font-['JetBrains_Mono',monospace]">
                      <Editable text={t} path={`projects.${idx}.technologies.${i}`} onBlur={handleBlur} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-12">
        <SectionHeader title={st.education || 'Education'} icon={GraduationCap} path="sectionTitles.education" onAdd={addEducation} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {data.education?.map((edu, idx) => (
            <div key={idx} className="break-inside-avoid relative group/entry">
              <button onClick={() => removeEducation(idx)} className="no-print absolute -left-8 top-0 p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover/entry:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              <div className="flex justify-between items-start mb-1">
                <Editable text={edu.school} path={`education.${idx}.school`} className="text-[12pt] font-bold text-slate-900 block font-['EB_Garamond',serif]" onBlur={handleBlur} />
                <span className="text-[8.5pt] font-bold text-slate-400 uppercase tracking-widest font-['JetBrains_Mono',monospace]">
                  <Editable text={edu.graduationDate} path={`education.${idx}.graduationDate`} onBlur={handleBlur} />
                </span>
              </div>
              <div className="text-[10.5pt] text-slate-600">
                <Editable text={edu.degree} path={`education.${idx}.degree`} className="font-bold" onBlur={handleBlur} /> | <Editable text={edu.field} path={`education.${idx}.field`} className="font-medium italic opacity-70" onBlur={handleBlur} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications, Awards, Languages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {['certifications', 'awards', 'languages'].map((field) => {
          const items = (data as any)[field] || [];
          const icon = field === 'certifications' ? CheckCircle2 : field === 'awards' ? Award : Globe;
          const label = st[field as keyof typeof st] || field.charAt(0).toUpperCase() + field.slice(1);
          return (
            <section key={field} className="break-inside-avoid group">
               <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                 <h4 className="text-[9pt] font-bold uppercase text-slate-400 tracking-[0.2em] font-['JetBrains_Mono',monospace] flex items-center gap-2">
                    <Editable text={label} path={`sectionTitles.${field}`} onBlur={handleBlur} />
                 </h4>
                 <button onClick={() => addItemToSection(field as any)} className="no-print p-1 hover:bg-slate-50 rounded transition-all"><Plus className="w-3 h-3 text-slate-400" /></button>
               </div>
               <ul className="space-y-2">
                 {items.map((item: string, idx: number) => (
                   <li key={idx} className="text-[10pt] text-slate-700 flex items-center gap-3 group/item">
                     <Editable text={item} path={`${field}.${idx}`} className="flex-1" onBlur={handleBlur} />
                     <button onClick={() => removeItemFromSection(field as any, idx)} className="no-print opacity-0 group-hover/item:opacity-100 text-rose-300 hover:text-rose-500 transition-opacity"><MinusCircle className="w-3.5 h-3.5" /></button>
                   </li>
                 ))}
               </ul>
            </section>
          );
        })}
      </div>

      {/* Volunteering */}
      {data.volunteering && data.volunteering.length > 0 && (
        <section className="mb-12">
          <SectionHeader title={st.volunteering || 'Volunteering'} icon={Heart} path="sectionTitles.volunteering" onAdd={() => addItemToSection('volunteering')} />
          <div className="space-y-6">
            {data.volunteering.map((v, idx) => (
              <div key={idx} className="break-inside-avoid relative pl-8 group/entry">
                 <button onClick={() => removeItemFromSection('volunteering', idx)} className="no-print absolute -left-4 top-0 p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover/entry:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                 <div className="flex justify-between items-baseline mb-1">
                   <Editable text={v.role} path={`volunteering.${idx}.role`} className="text-[11pt] font-bold text-slate-900" onBlur={handleBlur} />
                   <span className="text-[9pt] font-medium text-slate-400"><Editable text={v.organization} path={`volunteering.${idx}.organization`} onBlur={handleBlur} /></span>
                 </div>
                 <Editable text={v.description} path={`volunteering.${idx}.description`} element="p" className="text-[10pt] text-slate-600 italic" onBlur={handleBlur} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {data.customSections?.map((sec, idx) => (
        <section key={idx} className="mb-12">
          <SectionHeader 
            title={sec.title} 
            icon={List} 
            path={`customSections.${idx}.title`}
            onAdd={() => sec.type === 'table' ? addCustomSectionTableRow(idx) : addCustomSectionItem(idx)}
            onDelete={() => {
              const newData = JSON.parse(JSON.stringify(data));
              newData.customSections.splice(idx, 1);
              onUpdate?.(newData);
            }}
          />
          <div className="break-inside-avoid">
            {sec.type === 'table' && sec.tableData ? (
              <div className="overflow-hidden rounded-sm border border-slate-100 shadow-sm relative group/table">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {sec.tableData.map((row, rIdx) => (
                      <tr key={rIdx} className={`break-inside-avoid relative group/row ${rIdx === 0 ? 'bg-slate-50 font-bold border-b border-slate-200' : 'border-t border-slate-50'}`}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className={`p-4 text-[9.5pt] text-slate-700 align-top ${rIdx === 0 ? "font-['JetBrains_Mono',monospace] uppercase tracking-wider text-[8pt]" : "font-['EB_Garamond',serif] text-[11pt]"}`}>
                            <Editable text={cell} path={`customSections.${idx}.tableData.${rIdx}.${cIdx}`} onBlur={handleBlur} />
                          </td>
                        ))}
                        {rIdx > 0 && (
                          <td className="no-print absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                             <button onClick={() => removeCustomSectionTableRow(idx, rIdx)} className="text-rose-300 hover:text-rose-500"><MinusCircle className="w-4 h-4" /></button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4">
                <ul className="grid grid-cols-2 gap-x-12 gap-y-4">
                  {(sec.items || []).map((item, iIdx) => (
                    <li key={iIdx} className="text-[10.5pt] text-slate-700 flex items-center gap-3 break-inside-avoid group/custom">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-20" style={{ backgroundColor: theme.hex }}></div>
                      <Editable text={item} path={`customSections.${idx}.items.${iIdx}`} className="flex-1" onBlur={handleBlur} />
                      <button onClick={() => removeCustomSectionItem(idx, iIdx)} className="no-print opacity-0 group-hover/custom:opacity-100 text-rose-300 hover:text-rose-500 transition-opacity"><MinusCircle className="w-3.5 h-3.5" /></button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      ))}

      <div className="no-print mt-12 py-8 border-t border-dashed border-slate-200 flex justify-center gap-4 flex-wrap">
        <button onClick={addCustomSection} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">
          <PlusCircle className="w-4 h-4" /> Add Section
        </button>
        <button onClick={() => addItemToSection('volunteering')} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95">
          <Heart className="w-4 h-4" /> Add Volunteering
        </button>
      </div>

      <footer className="mt-20 pt-8 border-t border-slate-50 text-center opacity-20 break-inside-avoid">
        <p className="text-[7.5pt] font-medium uppercase tracking-[0.6em] text-slate-400 font-['JetBrains_Mono',monospace]">Elite Professional Document • Architected</p>
      </footer>

      {showCameraModal && (
        <div className="fixed inset-0 bg-black/90 z-[300] flex flex-col items-center justify-center p-4 no-print">
          <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
             <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-white text-xs font-black uppercase tracking-widest">Capture Profile Picture</h3>
                <button onClick={closeCamera} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-4 h-4 text-white" /></button>
             </div>
             <div className="aspect-square relative bg-black flex items-center justify-center">
                {cameraError ? <div className="p-8 text-center text-rose-400 text-xs font-bold">{cameraError}</div> : <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                   <div className="w-64 h-64 md:w-80 md:h-80 border-4 border-white/40 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
                </div>
             </div>
             <div className="p-6 flex justify-center bg-slate-900">
                {!cameraError && (
                  <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all">
                    <div className="w-12 h-12 border-2 border-indigo-600 rounded-full flex items-center justify-center"><Camera className="w-6 h-6 text-indigo-600" /></div>
                  </button>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeRenderer;
