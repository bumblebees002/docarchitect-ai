
import React, { useRef, useCallback, memo, useState } from 'react';
import { ResumeData, ColorTheme } from '../../types.ts';
import { 
  Trash2, 
  Edit2, 
  Mail,
  Phone,
  MapPin,
  Linkedin,
  ChevronRight,
  Plus,
  MinusCircle,
  Camera,
  Upload,
  X,
  User as UserIcon,
  PlusCircle,
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
        className={`${className} outline-none hover:bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-slate-200 rounded px-1 -mx-1 transition-all cursor-text`}
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

const ModernHeaderTemplate: React.FC<Props> = ({ data, theme, isMini = false, onUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const themeColor = `#${theme.hex}`;

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

  const p = data?.personalInfo || { fullName: 'NAME', email: 'email@example.com', jobTitle: 'POSITION' };
  const st = data?.sectionTitles || { summary: 'Summary', skills: 'Skills', experience: 'Experience', education: 'Education' };

  const SectionHeader = ({ title, path, onAdd }: { title: string, path?: string, onAdd?: () => void }) => (
    <div className="flex items-center gap-4 mb-6 group break-inside-avoid flex-wrap">
      <div className="w-32 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: themeColor }}></div>
      <Editable 
        text={title} 
        path={path} 
        className="text-[12pt] font-bold uppercase tracking-[0.1em]" 
        style={{ color: themeColor }}
        onBlur={handleBlur} 
      />
      <div className="flex-1 h-px bg-slate-200 min-w-[30px]"></div>
      {onAdd && (
        <button onClick={onAdd} className="no-print p-1.5 hover:bg-slate-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex-shrink-0">
          <Plus className="w-4 h-4 text-slate-400" />
        </button>
      )}
    </div>
  );

  return (
    <div 
      ref={containerRef}
      id="resume-content-root"
      className={`bg-white text-slate-900 mx-auto relative transition-all duration-500 shadow-2xl print:shadow-none print:m-0
        ${isMini ? 'w-full' : 'w-[210mm] min-h-[297mm] h-auto'}`}
      style={{ wordWrap: 'break-word', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header Bar */}
      <div className="h-12 w-full" style={{ backgroundColor: themeColor }}></div>
      
      {/* Header Content */}
      <div className="px-8 py-8">
        <div className="flex gap-8 items-start mb-10">
          {/* Profile Photo */}
          <div className="relative group flex-shrink-0 no-print">
            <div className="w-40 h-48 bg-slate-100 overflow-hidden flex items-center justify-center border-4 border-white shadow-lg">
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

          {/* Print-only photo */}
          <div className="hidden print:block flex-shrink-0">
            {p.profilePicture && (
              <div className="w-40 h-48 overflow-hidden border-4 border-white shadow-lg">
                <img src={p.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Name and Contact */}
          <div className="flex-1 pt-4">
            <h1 className="text-[32pt] font-bold italic leading-tight mb-4" style={{ color: themeColor }}>
              <Editable text={p.fullName} path="personalInfo.fullName" placeholder="FIRST NAME SURNAME" onBlur={handleBlur} />
            </h1>
            
            <div className="space-y-2 text-[10pt] text-slate-600">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" style={{ color: themeColor }} />
                <Editable text={p.location} path="personalInfo.location" placeholder="City, Country Pin code" onBlur={handleBlur} />
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" style={{ color: themeColor }} />
                <Editable text={p.phone} path="personalInfo.phone" placeholder="Phone" onBlur={handleBlur} />
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" style={{ color: themeColor }} />
                <Editable text={p.email} path="personalInfo.email" placeholder="Email" onBlur={handleBlur} />
              </div>
              {p.linkedin && (
                <div className="flex items-center gap-3">
                  <Linkedin className="w-4 h-4" style={{ color: themeColor }} />
                  <Editable text={p.linkedin} path="personalInfo.linkedin" placeholder="LinkedIn" onBlur={handleBlur} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        {p.summary && (
          <section className="mb-10 break-inside-avoid">
            <SectionHeader title={st.summary || 'SUMMARY'} path="sectionTitles.summary" />
            <Editable 
              element="p" 
              text={p.summary} 
              path="personalInfo.summary" 
              className="text-[10.5pt] leading-[1.8] text-slate-700 text-justify block" 
              onBlur={handleBlur} 
            />
          </section>
        )}

        {/* Experience */}
        <section className="mb-10">
          <SectionHeader title={st.experience || 'EXPERIENCE'} path="sectionTitles.experience" onAdd={addExperience} />
          <div className="space-y-8">
            {data.experience?.map((exp, idx) => (
              <div key={idx} className="break-inside-avoid relative group/entry">
                <button onClick={() => removeExperience(idx)} className="no-print absolute -left-8 top-0 p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover/entry:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                <div className="flex justify-between items-baseline mb-2">
                  <div>
                    <Editable text={exp.role} path={`experience.${idx}.role`} className="text-[12pt] font-bold text-slate-900" onBlur={handleBlur} />
                    <span className="text-slate-400 mx-2">|</span>
                    <Editable text={exp.company} path={`experience.${idx}.company`} className="text-[11pt] text-slate-600" onBlur={handleBlur} />
                  </div>
                  <span className="text-[9pt] text-slate-500 whitespace-nowrap">
                    <Editable text={exp.startDate} path={`experience.${idx}.startDate`} onBlur={handleBlur} /> - <Editable text={exp.current ? 'Present' : exp.endDate} path={`experience.${idx}.endDate`} onBlur={handleBlur} />
                  </span>
                </div>
                <ul className="space-y-2 ml-4">
                  {exp.description.map((bullet, bIdx) => (
                    <li key={bIdx} className="text-[10pt] text-slate-700 leading-relaxed flex items-start gap-2 group/bullet">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: themeColor }}></span>
                      <Editable text={bullet} path={`experience.${idx}.description.${bIdx}`} className="flex-1" onBlur={handleBlur} />
                      <button onClick={() => removeExperienceBullet(idx, bIdx)} className="no-print opacity-0 group-hover/bullet:opacity-100 text-rose-300 hover:text-rose-500 transition-opacity"><MinusCircle className="w-3.5 h-3.5" /></button>
                    </li>
                  ))}
                  <button onClick={() => addExperienceBullet(idx)} className="no-print text-[8pt] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1.5 mt-2 uppercase tracking-widest"><Plus className="w-3 h-3" /> Add Point</button>
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="mb-10 break-inside-avoid">
          <SectionHeader title={st.skills || 'SKILLS'} path="sectionTitles.skills" />
          <div className="space-y-4">
            {['hard', 'tools'].map((type) => (
              <div key={type} className="flex flex-wrap gap-2">
                {(data.skills?.[type as keyof typeof data.skills] || []).map((skill, idx) => (
                  <div key={idx} className="group/skill flex items-center gap-1">
                    <span className="px-3 py-1.5 rounded text-[9pt] font-medium border" style={{ borderColor: themeColor, color: themeColor }}>
                      <Editable text={skill} path={`skills.${type}.${idx}`} onBlur={handleBlur} />
                    </span>
                    <button onClick={() => removeSkill(type as any, idx)} className="no-print opacity-0 group-hover/skill:opacity-100 text-rose-400 transition-opacity"><MinusCircle className="w-3 h-3" /></button>
                  </div>
                ))}
                <button onClick={() => addSkill(type as any)} className="no-print px-2 py-1 text-slate-400 hover:text-slate-600 border border-dashed border-slate-300 rounded text-[9pt]"><Plus className="w-3 h-3 inline" /></button>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="mb-10">
          <SectionHeader title={st.education || 'EDUCATION'} path="sectionTitles.education" onAdd={addEducation} />
          <div className="space-y-6">
            {data.education?.map((edu, idx) => (
              <div key={idx} className="break-inside-avoid relative group/entry">
                <button onClick={() => removeEducation(idx)} className="no-print absolute -left-8 top-0 p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover/entry:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                <div className="flex justify-between items-baseline">
                  <div>
                    <Editable text={edu.degree} path={`education.${idx}.degree`} className="text-[11pt] font-bold text-slate-900" onBlur={handleBlur} />
                    <span className="text-slate-400 mx-2">-</span>
                    <Editable text={edu.field} path={`education.${idx}.field`} className="text-[11pt] text-slate-600" onBlur={handleBlur} />
                  </div>
                  <span className="text-[9pt] text-slate-500">
                    <Editable text={edu.graduationDate} path={`education.${idx}.graduationDate`} onBlur={handleBlur} />
                  </span>
                </div>
                <Editable text={edu.school} path={`education.${idx}.school`} className="text-[10pt] text-slate-500 block mt-1" onBlur={handleBlur} />
              </div>
            ))}
          </div>
        </section>

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <section className="mb-10 break-inside-avoid">
            <SectionHeader title={st.languages || 'LANGUAGES'} path="sectionTitles.languages" onAdd={() => addItemToSection('languages')} />
            <div className="flex flex-wrap gap-4">
              {data.languages.map((lang, idx) => (
                <div key={idx} className="flex items-center gap-2 group/item">
                  <Editable text={lang} path={`languages.${idx}`} className="text-[10pt] text-slate-700" onBlur={handleBlur} />
                  <button onClick={() => removeItemFromSection('languages', idx)} className="no-print opacity-0 group-hover/item:opacity-100 text-rose-300 hover:text-rose-500 transition-opacity"><MinusCircle className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <section className="mb-10 break-inside-avoid">
            <SectionHeader title={st.certifications || 'CERTIFICATIONS'} path="sectionTitles.certifications" onAdd={() => addItemToSection('certifications')} />
            <ul className="space-y-2">
              {data.certifications.map((cert, idx) => (
                <li key={idx} className="flex items-center gap-3 group/item">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }}></span>
                  <Editable text={cert} path={`certifications.${idx}`} className="text-[10pt] text-slate-700 flex-1" onBlur={handleBlur} />
                  <button onClick={() => removeItemFromSection('certifications', idx)} className="no-print opacity-0 group-hover/item:opacity-100 text-rose-300 hover:text-rose-500 transition-opacity"><MinusCircle className="w-3.5 h-3.5" /></button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Add Section Buttons */}
        <div className="no-print mt-12 py-8 border-t border-dashed border-slate-200 flex justify-center gap-4 flex-wrap">
          <button onClick={addCustomSection} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            <PlusCircle className="w-4 h-4" /> Add Section
          </button>
          <button onClick={() => addItemToSection('volunteering')} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95">
            <Heart className="w-4 h-4" /> Add Volunteering
          </button>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="h-8 w-full mt-auto" style={{ backgroundColor: themeColor }}></div>

      {/* Camera Modal */}
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

export default ModernHeaderTemplate;
