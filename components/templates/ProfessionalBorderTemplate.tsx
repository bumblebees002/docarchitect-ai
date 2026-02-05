import React, { useRef, useCallback, memo } from 'react';
import { ResumeData, ColorTheme } from '../../types.ts';
import { 
  Trash2, 
  Plus,
  MinusCircle,
  Upload,
  User as UserIcon,
  PlusCircle,
  Mail,
  Phone,
  MapPin
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
      className={`${className} outline-none hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-200 rounded px-1 -mx-1 transition-all cursor-text`}
    >
      {text || placeholder}
    </Element>
  );
});

const ProfessionalBorderTemplate: React.FC<Props> = ({ data, theme, isMini = false, onUpdate }) => {
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
      company: "Company",
      role: "Position",
      location: "City",
      startDate: "2024",
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

  const SectionHeader = ({ title, path, onAdd }: { title: string, path?: string, onAdd?: () => void }) => (
    <div className="flex items-center gap-2 mb-4 group">
      <Editable 
        text={title} 
        path={path} 
        className="text-[12pt] font-medium italic"
        style={{ color: themeColor }}
        onBlur={handleBlur} 
      />
      {onAdd && (
        <button onClick={onAdd} className="no-print p-1 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100">
          <Plus className="w-3 h-3 text-slate-400" />
        </button>
      )}
    </div>
  );

  return (
    <div 
      ref={containerRef}
      id="resume-content-root"
      className={`bg-white text-slate-900 mx-auto relative shadow-2xl print:shadow-none
        ${isMini ? 'w-full' : 'w-[210mm] min-h-[297mm]'}`}
      style={{ fontFamily: "'Georgia', serif" }}
    >
      {/* Left Border */}
      <div className="absolute left-0 top-0 bottom-0 w-3" style={{ backgroundColor: themeColor }}></div>

      {/* Content */}
      <div className="pl-10 pr-8 py-10">
        {/* Header with Photo */}
        <div className="flex justify-between items-start mb-8">
          {/* Name and Contact */}
          <div className="flex-1">
            <h1 className="text-[36pt] font-bold mb-2" style={{ color: themeColor }}>
              <Editable text={p.fullName} path="personalInfo.fullName" onBlur={handleBlur} />
            </h1>
            <div className="flex flex-wrap gap-4 text-[9pt] text-slate-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" style={{ color: themeColor }} />
                <Editable text={p.location} path="personalInfo.location" onBlur={handleBlur} />
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" style={{ color: themeColor }} />
                <Editable text={p.phone} path="personalInfo.phone" onBlur={handleBlur} />
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" style={{ color: themeColor }} />
                <Editable text={p.email} path="personalInfo.email" onBlur={handleBlur} />
              </div>
            </div>
          </div>

          {/* Circular Photo */}
          <div className="relative group no-print">
            <div 
              className="w-32 h-32 rounded-full bg-slate-100 overflow-hidden border-4"
              style={{ borderColor: themeColor }}
            >
              {p.profilePicture ? (
                <img src={p.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-slate-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-full">
                <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full text-slate-700"><Upload className="w-4 h-4" /></button>
                {p.profilePicture && <button onClick={() => updateProfilePic(undefined)} className="p-2 bg-white rounded-full text-rose-500"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>

          {/* Print photo */}
          <div className="hidden print:block">
            {p.profilePicture && (
              <div className="w-32 h-32 rounded-full overflow-hidden border-4" style={{ borderColor: themeColor }}>
                <img src={p.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <section className="mb-8">
          <SectionHeader title={st.summary || 'Summary'} path="sectionTitles.summary" />
          <Editable 
            element="p" 
            text={p.summary} 
            path="personalInfo.summary" 
            className="text-[10pt] leading-relaxed text-slate-700" 
            onBlur={handleBlur} 
          />
        </section>

        {/* Two Column Layout */}
        <div className="flex gap-10">
          {/* Left Column - Experience */}
          <div className="flex-1">
            {/* Experience */}
            <section className="mb-8">
              <SectionHeader title={st.experience || 'Experience'} path="sectionTitles.experience" onAdd={addExperience} />
              <div className="space-y-6">
                {data.experience?.map((exp, idx) => (
                  <div key={idx} className="relative group/entry">
                    <button onClick={() => removeExperience(idx)} className="no-print absolute -left-6 top-0 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover/entry:opacity-100">
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="flex justify-between items-baseline mb-1">
                      <Editable text={exp.role} path={`experience.${idx}.role`} className="text-[11pt] font-bold" onBlur={handleBlur} />
                      <span className="text-[9pt] text-slate-500 italic">
                        <Editable text={exp.startDate} path={`experience.${idx}.startDate`} onBlur={handleBlur} /> - <Editable text={exp.current ? 'Present' : exp.endDate} path={`experience.${idx}.endDate`} onBlur={handleBlur} />
                      </span>
                    </div>
                    <Editable text={exp.company} path={`experience.${idx}.company`} className="text-[10pt] italic mb-2 block" style={{ color: themeColor }} onBlur={handleBlur} />
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
          </div>

          {/* Right Column - Education & Skills */}
          <div className="w-64">
            {/* Education */}
            <section className="mb-8">
              <SectionHeader title={st.education || 'Education'} path="sectionTitles.education" onAdd={addEducation} />
              <div className="space-y-4">
                {data.education?.map((edu, idx) => (
                  <div key={idx} className="relative group/entry">
                    <button onClick={() => removeEducation(idx)} className="no-print absolute -right-2 -top-2 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover/entry:opacity-100">
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <Editable text={edu.degree} path={`education.${idx}.degree`} className="text-[10pt] font-bold block" onBlur={handleBlur} />
                    <Editable text={edu.school} path={`education.${idx}.school`} className="text-[9pt] italic block" style={{ color: themeColor }} onBlur={handleBlur} />
                    <Editable text={edu.graduationDate} path={`education.${idx}.graduationDate`} className="text-[8pt] text-slate-500 block" onBlur={handleBlur} />
                  </div>
                ))}
              </div>
            </section>

            {/* Skills */}
            <section className="mb-8">
              <SectionHeader title={st.skills || 'Skills'} path="sectionTitles.skills" onAdd={() => addSkill('hard')} />
              <ul className="space-y-2">
                {(data.skills?.hard || []).concat(data.skills?.tools || []).map((skill, idx) => (
                  <li key={idx} className="text-[9pt] text-slate-700 flex items-center gap-2 group/skill">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }}></span>
                    <Editable text={skill} path={`skills.hard.${idx}`} className="flex-1" onBlur={handleBlur} />
                    <button onClick={() => removeSkill('hard', idx)} className="no-print opacity-0 group-hover/skill:opacity-100 text-rose-300">
                      <MinusCircle className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <section>
                <SectionHeader title={st.languages || 'Languages'} path="sectionTitles.languages" />
                <ul className="space-y-2">
                  {data.languages.map((lang, idx) => (
                    <li key={idx} className="text-[9pt] text-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }}></span>
                      <Editable text={lang} path={`languages.${idx}`} onBlur={handleBlur} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
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

export default ProfessionalBorderTemplate;
