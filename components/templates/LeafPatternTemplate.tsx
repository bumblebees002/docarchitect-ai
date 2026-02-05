import React, { useRef, useCallback, memo } from 'react';
import { ResumeData, ColorTheme } from '../../types.ts';
import { 
  Trash2, 
  Plus,
  MinusCircle,
  Upload,
  User as UserIcon,
  PlusCircle
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
      className={`${className} outline-none hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-200 rounded px-1 -mx-1 transition-all cursor-text`}
      style={style}
    >
      {text || placeholder}
    </Element>
  );
});

const LeafPatternTemplate: React.FC<Props> = ({ data, theme, isMini = false, onUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Split name into first and last
  const nameParts = (p.fullName || 'MOHAMED ADEL').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <div 
      ref={containerRef}
      id="resume-content-root"
      className={`bg-white text-slate-900 mx-auto relative shadow-2xl print:shadow-none flex
        ${isMini ? 'w-full' : 'w-[210mm] min-h-[297mm]'}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Left Sidebar with Leaf Pattern */}
      <div 
        className="w-16 relative"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 200'%3E%3Cellipse cx='50' cy='100' rx='40' ry='80' fill='%23355E3B' opacity='0.8'/%3E%3Cellipse cx='30' cy='60' rx='25' ry='50' fill='%232D5016' opacity='0.7'/%3E%3Cellipse cx='70' cy='140' rx='25' ry='50' fill='%23228B22' opacity='0.6'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 120px',
          backgroundColor: '#1a3a1a'
        }}
      >
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with Photo and Name */}
        <div className="pt-8 pb-6 border-b border-slate-200">
          {/* Circular Photo */}
          <div className="relative group no-print mx-auto w-32 h-32 mb-6">
            <div className="w-32 h-32 rounded-full bg-slate-200 overflow-hidden border-4 border-amber-600 shadow-lg mx-auto">
              {p.profilePicture ? (
                <img src={p.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-300">
                  <UserIcon className="w-16 h-16 text-slate-400" />
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
          <div className="hidden print:block mx-auto w-32 h-32 mb-6">
            {p.profilePicture && (
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-600 shadow-lg mx-auto">
                <img src={p.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Name with wide letter spacing */}
          <h1 className="text-center text-[24pt] font-bold tracking-[0.5em] text-slate-800 px-8">
            <span className="inline-block">
              {firstName.split('').map((char, i) => (
                <span key={i}>{char.toUpperCase()}</span>
              ))}
            </span>
            <span className="inline-block ml-8">
              {lastName.split('').map((char, i) => (
                <span key={i}>{char.toUpperCase()}</span>
              ))}
            </span>
          </h1>
        </div>

        {/* Two Column Content */}
        <div className="flex flex-1 p-8 gap-8">
          {/* Left Column */}
          <div className="flex-1 pr-8 border-r border-slate-200">
            {/* Custom Section */}
            <section className="mb-8">
              <h2 className="text-[11pt] font-bold uppercase tracking-wide text-slate-900 mb-3">CUSTOM SECTION</h2>
              <Editable 
                element="p" 
                text={p.summary} 
                path="personalInfo.summary" 
                className="text-[10pt] leading-relaxed text-slate-700" 
                onBlur={handleBlur} 
              />
            </section>

            <div className="h-px bg-slate-200 my-6"></div>

            {/* Summary */}
            <section className="mb-8">
              <h2 className="text-[11pt] font-bold uppercase tracking-wide text-slate-900 mb-3">{st.summary || 'SUMMARY'}</h2>
              <Editable 
                element="p" 
                text={p.summary} 
                path="personalInfo.summary" 
                className="text-[10pt] leading-relaxed text-slate-700" 
                onBlur={handleBlur} 
              />
            </section>

            <div className="h-px bg-slate-200 my-6"></div>

            {/* Experience */}
            <section className="mb-8">
              <div className="flex items-center gap-2 group mb-3">
                <h2 className="text-[11pt] font-bold uppercase tracking-wide text-slate-900">{st.experience || 'EXPERIENCE'}</h2>
                <button onClick={addExperience} className="no-print p-1 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100">
                  <Plus className="w-3 h-3 text-slate-400" />
                </button>
              </div>
              <div className="space-y-5">
                {data.experience?.map((exp, idx) => (
                  <div key={idx} className="relative group/entry">
                    <button onClick={() => removeExperience(idx)} className="no-print absolute -left-5 top-0 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover/entry:opacity-100">
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="flex justify-between items-baseline mb-1">
                      <Editable text={exp.role} path={`experience.${idx}.role`} className="text-[10pt] font-bold" onBlur={handleBlur} />
                      <span className="text-[9pt] text-slate-500">
                        <Editable text={exp.startDate} path={`experience.${idx}.startDate`} onBlur={handleBlur} /> - <Editable text={exp.current ? 'Present' : exp.endDate} path={`experience.${idx}.endDate`} onBlur={handleBlur} />
                      </span>
                    </div>
                    <Editable text={exp.company} path={`experience.${idx}.company`} className="text-[9pt] text-slate-600 mb-2 block" onBlur={handleBlur} />
                    <ul className="space-y-1">
                      {exp.description?.map((bullet, bIdx) => (
                        <li key={bIdx} className="text-[9pt] text-slate-700 flex items-start gap-2 group/bullet">
                          <span className="mt-0.5">•</span>
                          <Editable text={bullet} path={`experience.${idx}.description.${bIdx}`} className="flex-1" onBlur={handleBlur} />
                          <button onClick={() => removeExperienceBullet(idx, bIdx)} className="no-print opacity-0 group-hover/bullet:opacity-100 text-rose-300">
                            <MinusCircle className="w-3 h-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => addExperienceBullet(idx)} className="no-print text-[8pt] text-slate-400 hover:text-slate-600 mt-1 flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="w-56">
            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-[11pt] font-bold uppercase tracking-wide text-slate-900 mb-3">CONTACT</h2>
              <ul className="space-y-2 text-[9pt] text-slate-700">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <Editable text={p.email || 'Email'} path="personalInfo.email" onBlur={handleBlur} />
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <Editable text={p.phone || 'Phone'} path="personalInfo.phone" onBlur={handleBlur} />
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <Editable text={p.location || 'City, Country Pin code'} path="personalInfo.location" onBlur={handleBlur} />
                </li>
              </ul>
            </section>

            <div className="h-px bg-slate-200 my-6"></div>

            {/* Skills */}
            <section className="mb-8">
              <div className="flex items-center gap-2 group mb-3">
                <h2 className="text-[11pt] font-bold uppercase tracking-wide text-slate-900">{st.skills || 'SKILLS'}</h2>
                <button onClick={addSkill} className="no-print p-1 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100">
                  <Plus className="w-3 h-3 text-slate-400" />
                </button>
              </div>
              <ul className="space-y-2">
                {(data.skills?.hard || []).map((skill, idx) => (
                  <li key={idx} className="text-[9pt] text-slate-700 flex items-start gap-2 group/skill">
                    <span>•</span>
                    <Editable text={skill} path={`skills.hard.${idx}`} className="flex-1" onBlur={handleBlur} />
                    <button onClick={() => removeSkill(idx)} className="no-print opacity-0 group-hover/skill:opacity-100 text-rose-300">
                      <MinusCircle className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Education */}
            <section>
              <div className="flex items-center gap-2 group mb-3">
                <h2 className="text-[11pt] font-bold uppercase tracking-wide text-slate-900">{st.education || 'EDUCATION'}</h2>
                <button onClick={addEducation} className="no-print p-1 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100">
                  <Plus className="w-3 h-3 text-slate-400" />
                </button>
              </div>
              <div className="space-y-3">
                {data.education?.map((edu, idx) => (
                  <div key={idx} className="relative group/entry">
                    <button onClick={() => removeEducation(idx)} className="no-print absolute -left-5 top-0 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover/entry:opacity-100">
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <Editable text={edu.degree} path={`education.${idx}.degree`} className="text-[9pt] font-bold block" onBlur={handleBlur} />
                    <Editable text={edu.school} path={`education.${idx}.school`} className="text-[8pt] text-slate-600 block" onBlur={handleBlur} />
                  </div>
                ))}
              </div>
            </section>
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

export default LeafPatternTemplate;
