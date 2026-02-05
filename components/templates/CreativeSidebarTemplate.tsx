import React, { useRef, useCallback, memo } from 'react';
import { ResumeData, ColorTheme } from '../../types.ts';
import { 
  Trash2, 
  Mail,
  Phone,
  MapPin,
  Plus,
  MinusCircle,
  Upload,
  User as UserIcon,
  PlusCircle,
  Send
} from 'lucide-react';

interface Props {
  data: ResumeData;
  theme: ColorTheme;
  isMini?: boolean;
  onUpdate?: (newData: ResumeData) => void;
}

const Editable = memo(({ text, path, className, element: Element = 'span', placeholder = "...", onBlur }: any) => {
  const ref = useRef<any>(null);
  return (
    <Element
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e: any) => onBlur(path, e.currentTarget.innerText)}
      className={`${className} outline-none hover:bg-white/20 focus:bg-white/30 rounded px-1 -mx-1 transition-all cursor-text`}
    >
      {text || placeholder}
    </Element>
  );
});

const CreativeSidebarTemplate: React.FC<Props> = ({ data, theme, isMini = false, onUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeColor = `#${theme.hex}`;

  const handleBlur = useCallback((path: string, value: string) => {
    if (!onUpdate) return;
    const keys = path.split('.');
    const newData = JSON.parse(JSON.stringify(data));
    let target: any = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) target[keys[i]] = {};
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;
    onUpdate(newData);
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
      reader.onload = (ev) => updateProfilePic(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
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
      location: "City",
      startDate: "Jan 2024",
      endDate: "Present",
      current: true,
      description: ["Achievement..."]
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
    newData.experience[expIdx].description.push("New achievement...");
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
      school: "University",
      degree: "Degree",
      field: "Field",
      location: "Location",
      graduationDate: "Year"
    });
    onUpdate(newData);
  };

  const removeEducation = (idx: number) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    newData.education.splice(idx, 1);
    onUpdate(newData);
  };

  const p = data?.personalInfo || { fullName: 'NAME', email: 'email@example.com', jobTitle: 'POSITION' };
  const st = data?.sectionTitles || {};

  const SectionHeader = ({ title, path, onAdd, light = false }: { title: string, path?: string, onAdd?: () => void, light?: boolean }) => (
    <div className="flex items-center gap-3 mb-4 group">
      <Editable 
        text={title} 
        path={path} 
        className={`text-[12pt] font-bold uppercase tracking-wide ${light ? 'text-white' : ''}`}
        style={!light ? { color: themeColor } : {}}
        onBlur={handleBlur} 
      />
      <div className={`flex-1 h-0.5 ${light ? 'bg-white/30' : ''}`} style={!light ? { backgroundColor: themeColor } : {}}></div>
      {onAdd && (
        <button onClick={onAdd} className={`no-print p-1 rounded opacity-0 group-hover:opacity-100 ${light ? 'hover:bg-white/20' : 'hover:bg-slate-100'}`}>
          <Plus className={`w-3 h-3 ${light ? 'text-white' : 'text-slate-400'}`} />
        </button>
      )}
    </div>
  );

  return (
    <div 
      ref={containerRef}
      id="resume-content-root"
      className={`bg-white text-slate-900 mx-auto relative shadow-2xl print:shadow-none flex
        ${isMini ? 'w-full' : 'w-[210mm] min-h-[297mm]'}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Left Sidebar */}
      <div 
        className="w-80 p-8 text-white relative overflow-hidden"
        style={{ backgroundColor: themeColor }}
      >
        {/* Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M25 0 L25 25 M0 25 L25 25 M25 25 L50 25 M25 25 L25 50" stroke="white" strokeWidth="1" fill="none"/>
                <circle cx="25" cy="25" r="3" fill="white"/>
                <circle cx="0" cy="25" r="2" fill="white"/>
                <circle cx="50" cy="25" r="2" fill="white"/>
                <circle cx="25" cy="0" r="2" fill="white"/>
                <circle cx="25" cy="50" r="2" fill="white"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)"/>
          </svg>
        </div>

        <div className="relative z-10">
          {/* Photo */}
          <div className="relative group mb-8 no-print">
            <div className="w-48 h-48 mx-auto bg-slate-700 border-4 border-white overflow-hidden">
              {p.profilePicture ? (
                <img src={p.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-20 h-20 text-slate-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full text-slate-700"><Upload className="w-4 h-4" /></button>
                {p.profilePicture && <button onClick={() => updateProfilePic(undefined)} className="p-2 bg-white rounded-full text-rose-500"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>

          {/* Print photo */}
          <div className="hidden print:block mb-8">
            {p.profilePicture && (
              <div className="w-48 h-48 mx-auto border-4 border-white overflow-hidden">
                <img src={p.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="space-y-3 mb-8 text-[9pt]">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <Editable text={p.location} path="personalInfo.location" onBlur={handleBlur} />
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <Editable text={p.phone} path="personalInfo.phone" onBlur={handleBlur} />
            </div>
            <div className="flex items-center gap-3">
              <Send className="w-4 h-4 flex-shrink-0" />
              <Editable text={p.email} path="personalInfo.email" onBlur={handleBlur} />
            </div>
          </div>

          <div className="h-px bg-white/30 mb-8"></div>

          {/* Summary */}
          <section className="mb-8">
            <SectionHeader title={st.summary || 'SUMMARY'} path="sectionTitles.summary" light />
            <Editable 
              element="p" 
              text={p.summary} 
              path="personalInfo.summary" 
              className="text-[9pt] leading-relaxed text-white/90" 
              onBlur={handleBlur} 
            />
          </section>

          {/* Skills */}
          <section className="mb-8">
            <SectionHeader title={st.skills || 'SKILLS'} path="sectionTitles.skills" onAdd={() => addSkill('hard')} light />
            <ul className="space-y-2">
              {(data.skills?.hard || []).concat(data.skills?.tools || []).map((skill, idx) => (
                <li key={idx} className="text-[9pt] flex items-center gap-2 group/skill">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <Editable text={skill} path={`skills.hard.${idx}`} className="flex-1" onBlur={handleBlur} />
                  <button onClick={() => removeSkill('hard', idx)} className="no-print opacity-0 group-hover/skill:opacity-100 text-white/50 hover:text-white">
                    <MinusCircle className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section>
              <SectionHeader title={st.languages || 'LANGUAGES'} path="sectionTitles.languages" light />
              <ul className="space-y-2">
                {data.languages.map((lang, idx) => (
                  <li key={idx} className="text-[9pt] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    <Editable text={lang} path={`languages.${idx}`} onBlur={handleBlur} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 p-10">
        {/* Name */}
        <h1 className="text-[36pt] font-bold mb-2 leading-tight" style={{ color: themeColor }}>
          <Editable text={p.fullName} path="personalInfo.fullName" onBlur={handleBlur} />
        </h1>
        <div className="h-0.5 w-full mb-8" style={{ backgroundColor: themeColor }}></div>

        {/* Experience */}
        <section className="mb-8">
          <SectionHeader title={st.experience || 'EXPERIENCE'} path="sectionTitles.experience" onAdd={addExperience} />
          <div className="space-y-6">
            {data.experience?.map((exp, idx) => (
              <div key={idx} className="relative group/entry">
                <button onClick={() => removeExperience(idx)} className="no-print absolute -left-6 top-0 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover/entry:opacity-100">
                  <Trash2 className="w-3 h-3" />
                </button>
                <div className="flex justify-between items-baseline mb-1">
                  <Editable text={exp.role} path={`experience.${idx}.role`} className="text-[11pt] font-bold" onBlur={handleBlur} />
                  <span className="text-[9pt] text-slate-500">
                    <Editable text={exp.startDate} path={`experience.${idx}.startDate`} onBlur={handleBlur} /> - <Editable text={exp.current ? 'Present' : exp.endDate} path={`experience.${idx}.endDate`} onBlur={handleBlur} />
                  </span>
                </div>
                <Editable text={exp.company} path={`experience.${idx}.company`} className="text-[10pt] text-slate-600 mb-2 block" onBlur={handleBlur} />
                <ul className="space-y-1">
                  {exp.description.map((bullet, bIdx) => (
                    <li key={bIdx} className="text-[9pt] text-slate-700 flex items-start gap-2 group/bullet">
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: themeColor }}></span>
                      <Editable text={bullet} path={`experience.${idx}.description.${bIdx}`} className="flex-1" onBlur={handleBlur} />
                      <button onClick={() => removeExperienceBullet(idx, bIdx)} className="no-print opacity-0 group-hover/bullet:opacity-100 text-rose-300">
                        <MinusCircle className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
                <button onClick={() => addExperienceBullet(idx)} className="no-print text-[8pt] text-slate-400 hover:text-slate-600 mt-2 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="mb-8">
          <SectionHeader title={st.education || 'EDUCATION'} path="sectionTitles.education" onAdd={addEducation} />
          <div className="space-y-4">
            {data.education?.map((edu, idx) => (
              <div key={idx} className="relative group/entry">
                <button onClick={() => removeEducation(idx)} className="no-print absolute -left-6 top-0 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover/entry:opacity-100">
                  <Trash2 className="w-3 h-3" />
                </button>
                <Editable text={edu.degree} path={`education.${idx}.degree`} className="text-[10pt] font-bold" onBlur={handleBlur} />
                <Editable text={edu.school} path={`education.${idx}.school`} className="text-[9pt] text-slate-600 block" onBlur={handleBlur} />
              </div>
            ))}
          </div>
        </section>

        {/* Works */}
        {data.projects && data.projects.length > 0 && (
          <section>
            <SectionHeader title="WORKS" />
            <div className="space-y-3">
              {data.projects.map((proj, idx) => (
                <div key={idx}>
                  <span className="text-[9pt]">• </span>
                  <Editable text={proj.name} path={`projects.${idx}.name`} className="text-[9pt] font-medium" onBlur={handleBlur} />
                  <Editable text={proj.description} path={`projects.${idx}.description`} className="text-[9pt] text-slate-600 block ml-3" onBlur={handleBlur} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Add Section Button */}
      <div className="no-print absolute bottom-4 right-4">
        <button onClick={() => {
          if (!onUpdate) return;
          const newData = JSON.parse(JSON.stringify(data));
          if (!newData.customSections) newData.customSections = [];
          newData.customSections.push({ title: "New Section", items: ["Item 1"], type: 'list' });
          onUpdate(newData);
        }} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">
          <PlusCircle className="w-4 h-4" /> Add Section
        </button>
      </div>
    </div>
  );
};

export default CreativeSidebarTemplate;
