import React, { useRef, useCallback, memo } from 'react';
import { ResumeData, ColorTheme } from '../../types.ts';
import { 
  Trash2, 
  Plus,
  MinusCircle,
  Upload,
  User as UserIcon,
  PlusCircle,
  MapPin,
  Phone,
  Send
} from 'lucide-react';

interface Props {
  data: ResumeData;
  theme: ColorTheme;
  isMini?: boolean;
  onUpdate?: (newData: ResumeData) => void;
}

const Editable = memo(({ text, path, className, element: Element = 'span', placeholder = "...", onBlur, style }: any) => {
  const ref = useRef<any>(null);
  return (
    <Element
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e: any) => onBlur(path, e.currentTarget.innerText)}
      className={`${className} outline-none hover:bg-white/10 focus:bg-white/20 rounded px-1 -mx-1 transition-all cursor-text`}
      style={style}
    >
      {text || placeholder}
    </Element>
  );
});

const CyanStripeSidebarTemplate: React.FC<Props> = ({ data, theme, isMini = false, onUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use theme color from props
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

  const addSkill = useCallback(() => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (!newData.skills) newData.skills = { hard: [], soft: [], tools: [] };
    if (!newData.skills.hard) newData.skills.hard = [];
    newData.skills.hard.push("New Skill");
    onUpdate(newData);
  }, [data, onUpdate]);

  const removeSkill = useCallback((index: number) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (newData.skills?.hard) {
      newData.skills.hard.splice(index, 1);
      onUpdate(newData);
    }
  }, [data, onUpdate]);

  const addExperience = () => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (!newData.experience) newData.experience = [];
    newData.experience.unshift({
      company: "Company Name",
      role: "Position Title",
      location: "City",
      startDate: "2024",
      endDate: "Present",
      current: true,
      description: ["Key achievement or responsibility"]
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
    newData.experience[expIdx].description.push("New achievement");
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
      degree: "Degree",
      field: "Field of Study",
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

  const p = data?.personalInfo || { fullName: 'Your Name', email: 'email@example.com', jobTitle: 'Job Title' };
  const st = data?.sectionTitles || {};

  const SectionHeader = ({ title, path, onAdd }: { title: string, path?: string, onAdd?: () => void }) => (
    <div className="mb-4 group">
      <div className="flex items-center gap-2">
        <div className="w-8 h-1" style={{ backgroundColor: themeColor }}></div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Editable 
          text={title} 
          path={path} 
          className="text-[13pt] font-bold uppercase tracking-wide"
          style={{ color: themeColor }}
          onBlur={handleBlur} 
        />
        {onAdd && (
          <button onClick={onAdd} className="no-print p-1 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100">
            <Plus className="w-3 h-3 text-slate-400" />
          </button>
        )}
      </div>
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
      <div className="w-72 text-white flex flex-col" style={{ backgroundColor: themeColor }}>
        {/* Stripe Pattern Header */}
        <div className="h-16 relative overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute h-full w-3"
              style={{ 
                left: `${i * 16}px`,
                backgroundColor: i % 2 === 0 ? 'rgba(0,0,0,0.15)' : 'transparent'
              }}
            />
          ))}
        </div>

        {/* Photo */}
        <div className="px-6 -mt-2">
          <div className="relative group no-print">
            <div className="w-44 h-44 mx-auto rounded-full bg-slate-200 overflow-hidden border-4 border-white shadow-lg">
              {p.profilePicture ? (
                <img src={p.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-300">
                  <UserIcon className="w-20 h-20 text-slate-400" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full text-slate-700 shadow-lg"><Upload className="w-4 h-4" /></button>
                {p.profilePicture && <button onClick={() => updateProfilePic(undefined)} className="p-2 bg-white rounded-full text-rose-500 shadow-lg"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>

          {/* Print photo */}
          <div className="hidden print:block">
            {p.profilePicture && (
              <div className="w-44 h-44 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img src={p.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className="px-6 mt-8 flex-1">
          <div className="mb-2">
            <div className="w-8 h-1 bg-white/50 mb-2"></div>
            <div className="flex items-center gap-2 group">
              <span className="text-[12pt] font-bold uppercase tracking-wide">
                {st.skills || 'SKILLS'}
              </span>
              <button onClick={addSkill} className="no-print p-1 hover:bg-white/20 rounded opacity-0 group-hover:opacity-100">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          <ul className="space-y-2 mt-4">
            {(data.skills?.hard || []).map((skill, idx) => (
              <li key={idx} className="text-[10pt] flex items-start gap-2 group/skill">
                <span className="mt-1">•</span>
                <Editable text={skill} path={`skills.hard.${idx}`} className="flex-1" onBlur={handleBlur} />
                <button onClick={() => removeSkill(idx)} className="no-print opacity-0 group-hover/skill:opacity-100 text-white/50 hover:text-white">
                  <MinusCircle className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 p-10">
        {/* Name */}
        <h1 className="text-[42pt] font-black leading-tight text-slate-900 mb-1">
          <Editable text={p.fullName?.split(' ')[0]?.toUpperCase() || 'FIRST'} path="personalInfo.fullName" onBlur={handleBlur} />
        </h1>
        <h1 className="text-[42pt] font-black leading-tight text-slate-900 mb-6">
          {p.fullName?.split(' ').slice(1).join(' ')?.toUpperCase() || 'LAST'}
        </h1>

        {/* Contact Info */}
        <div className="space-y-3 mb-8 text-[10pt] text-slate-600">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4" style={{ color: themeColor }} />
            <Editable text={p.location || 'City, Country Pin code'} path="personalInfo.location" onBlur={handleBlur} />
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4" style={{ color: themeColor }} />
            <Editable text={p.phone || 'Phone'} path="personalInfo.phone" onBlur={handleBlur} />
          </div>
          <div className="flex items-center gap-3">
            <Send className="w-4 h-4" style={{ color: themeColor }} />
            <Editable text={p.email || 'Email'} path="personalInfo.email" onBlur={handleBlur} />
          </div>
        </div>

        {/* Custom Section */}
        <section className="mb-8">
          <SectionHeader title="CUSTOM SECTION" />
          <Editable 
            element="p" 
            text={p.summary} 
            path="personalInfo.summary" 
            className="text-[10pt] leading-relaxed text-slate-700" 
            onBlur={handleBlur} 
          />
        </section>

        {/* Summary */}
        <section className="mb-8">
          <SectionHeader title={st.summary || 'SUMMARY'} path="sectionTitles.summary" />
          <Editable 
            element="p" 
            text={p.summary} 
            path="personalInfo.summary" 
            className="text-[10pt] leading-relaxed text-slate-700" 
            onBlur={handleBlur} 
          />
        </section>

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
                  {exp.description?.map((bullet, bIdx) => (
                    <li key={bIdx} className="text-[9pt] text-slate-700 flex items-start gap-2 group/bullet">
                      <span className="mt-1">•</span>
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
                <Editable text={edu.degree} path={`education.${idx}.degree`} className="text-[10pt] font-bold block" onBlur={handleBlur} />
                <Editable text={edu.school} path={`education.${idx}.school`} className="text-[9pt] text-slate-600 block" onBlur={handleBlur} />
                <Editable text={edu.graduationDate} path={`education.${idx}.graduationDate`} className="text-[9pt] text-slate-500 block" onBlur={handleBlur} />
              </div>
            ))}
          </div>
        </section>
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

export default CyanStripeSidebarTemplate;
