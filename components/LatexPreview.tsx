
import React from 'react';
import { parseLatex } from '../services/parserService.ts';

interface Props {
  latex: string;
  isMini?: boolean;
}

const LatexPreview: React.FC<Props> = ({ latex, isMini = false }) => {
  if (!latex) {
    return (
      <div className={`bg-white shadow-xl w-full mx-auto flex flex-col items-center justify-center text-slate-300 italic border-2 border-dashed border-slate-100 rounded-2xl ${isMini ? 'aspect-[3/4] p-4' : 'min-h-[297mm] p-10 md:p-16'}`}>
        <p className="text-center text-xs">Architect is designing...</p>
      </div>
    );
  }

  const { name, contact, sections } = parseLatex(latex);
  
  // Attempt to extract the primary color defined in LaTeX
  // \definecolor{primary}{HTML}{6366f1}
  const colorMatch = latex.match(/\\definecolor\{primary\}\{HTML\}\{([A-Fa-f0-9]{6})\}/);
  const primaryColor = colorMatch ? `#${colorMatch[1]}` : '#1e293b';

  return (
    <div className={`bg-white shadow-2xl w-full mx-auto text-slate-900 resume-font leading-relaxed print:shadow-none print:m-0 print:w-full overflow-hidden transition-all duration-300 ${isMini ? 'rounded-xl scale-[0.98] origin-top' : 'rounded-none'}`}
         style={isMini ? { fontSize: '0.45rem', lineHeight: '1.2' } : {}}>
      
      <div className={`${isMini ? 'p-4' : 'p-8 md:p-16'}`}>
        <header className={`text-center border-b border-slate-100 ${isMini ? 'mb-2 pb-2' : 'mb-10 pb-8'}`}>
          <h1 className={`${isMini ? 'text-sm' : 'text-3xl md:text-5xl'} font-black uppercase tracking-tighter mb-1`} style={{ color: primaryColor }}>{name}</h1>
          {contact && (
            <div className={`${isMini ? 'text-[6px]' : 'text-[10px] md:text-sm'} text-slate-500 flex flex-wrap justify-center gap-x-2 font-medium`}>
              {contact.split('|').map((c, i) => (
                <span key={i} className="flex items-center">
                  {i > 0 && <span className="mr-2 text-slate-300 opacity-50">|</span>}
                  {c.trim()}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className={isMini ? 'space-y-2' : 'space-y-10'}>
          {sections.map((section, idx) => (
            <section key={idx} className="relative">
              <h2 className={`${isMini ? 'text-[7px] border-b mb-1' : 'text-lg md:text-xl border-b-2 mb-5'} font-black uppercase tracking-tight`} style={{ color: primaryColor, borderColor: primaryColor }}>
                {section.title}
              </h2>
              
              {section.bodyText && !section.items.length && (
                <div className={`${isMini ? 'text-[6px] mb-1' : 'text-[10pt] md:text-[11pt] mb-6'} text-slate-700 whitespace-pre-wrap pl-1 leading-relaxed`}>
                  {section.bodyText}
                </div>
              )}

              {section.tables.map((table, tIdx) => (
                <div key={tIdx} className={`overflow-x-auto ${isMini ? 'mb-1 ring-[0.5px]' : 'mb-8 ring-1'} ring-slate-100 rounded-sm`}>
                  <table className="w-full text-left">
                    <tbody>
                      {table.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-slate-50 last:border-0">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className={`${isMini ? 'p-1 text-[5px]' : 'p-4 text-[10pt]'} text-slate-700 font-medium`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              {section.items.length > 0 && (
                <ul className={`grid grid-cols-1 ${isMini ? 'gap-0.5 mt-1' : 'gap-3 mt-4'}`}>
                  {section.items.map((item, i) => (
                    <li key={i} className={`${isMini ? 'text-[6px] pl-2' : 'text-[10pt] md:text-[11pt] pl-6'} text-slate-700 relative leading-tight`}>
                      <span className={`absolute left-0 top-[0.4em] rounded-full opacity-60 ${isMini ? 'w-0.5 h-0.5' : 'w-2 h-2'}`} style={{ backgroundColor: primaryColor }}></span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LatexPreview;
