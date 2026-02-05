
export interface ParsedDocument {
  name: string;
  contact: string;
  sections: ParsedSection[];
}

export interface ParsedSection {
  title: string;
  items: string[];
  bodyText: string;
  tables: string[][][];
}

export const cleanLatex = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\\textbf\s*\{([^}]*)\}/g, '$1')
    .replace(/\\textit\s*\{([^}]*)\}/g, '$1')
    .replace(/\\underline\s*\{([^}]*)\}/g, '$1')
    .replace(/\\href\s*\{[^}]*\}\s*\{([^}]*)\}/g, '$1')
    .replace(/\\color\s*(?:\[[^\]]*\])?\s*\{[^}]*\}\s*\{([^}]*)\}/g, '$1')
    .replace(/\\hspace\s*\{[^}]*\}/g, '')
    .replace(/\\hfill/g, ' ')
    .replace(/\\hline|\\midrule|\\toprule|\\bottomrule/g, '')
    .replace(/\\\[[^\]]*\]/g, '')
    .replace(/\[[^\]]{3,}\]/g, '')
    .replace(/\\/g, '')
    .replace(/\{|\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const parseLatex = (latex: string): ParsedDocument => {
  if (!latex) return { name: '', contact: '', sections: [] };

  const getValue = (cmd: string) => {
    const regex = new RegExp(`\\\\${cmd}\\s*\\{([^}]+)\\}`, 'i');
    const match = latex.match(regex);
    return match ? cleanLatex(match[1]) : '';
  };

  const name = getValue('name') || "Professional Document";
  const contact = getValue('contact') || "";

  // Split by \section{...} while keeping the titles
  const sections: ParsedSection[] = [];
  const sectionRegex = /\\section\s*\{([^}]+)\}/g;
  let match;
  let lastIndex = 0;

  const rawSections: {title: string, content: string}[] = [];
  
  while ((match = sectionRegex.exec(latex)) !== null) {
    if (rawSections.length > 0) {
      rawSections[rawSections.length - 1].content = latex.substring(lastIndex, match.index);
    }
    rawSections.push({ title: match[1], content: '' });
    lastIndex = sectionRegex.lastIndex;
  }
  
  if (rawSections.length > 0) {
    rawSections[rawSections.length - 1].content = latex.substring(lastIndex);
  }

  rawSections.forEach(raw => {
    const title = cleanLatex(raw.title);
    const content = raw.content;
    
    // Extract Items
    const items = [...content.matchAll(/\\item\s+([\s\S]*?)(?=\\item|\\end\{itemize\}|\\section|\\$)/g)]
      .map(m => cleanLatex(m[1]))
      .filter(i => i.length > 0);
    
    // Extract Tables
    const tableRegex = /\\begin\{tabularx?\}\s*(?:\{[^}]*\})\s*(?:\{[^}]*\})?([\s\S]*?)\\end\{tabularx?\}/g;
    const tables = [...content.matchAll(tableRegex)].map(m => {
      const tableContent = m[1].trim();
      return tableContent.split('\\\\').map(row => 
        row.split('&').map(cell => cleanLatex(cell))
      ).filter(row => row.length > 0 && row.some(cell => cell !== ''));
    });

    // Extract Body Text (content not in items or tables)
    let bodyText = content
      .replace(/\\begin\{itemize\}[\s\S]*?\\end\{itemize\}/g, '')
      .replace(tableRegex, '')
      .replace(/\\section\s*\{[^}]*\}/g, '')
      .split('\n')
      .map(line => cleanLatex(line))
      .filter(line => line.length > 5)
      .join('\n');

    sections.push({ title, items, bodyText, tables });
  });

  return { name, contact, sections };
};
