
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  BorderStyle, 
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  VerticalAlign
} from "docx";
import { ResumeData } from "../types.ts";

export const generateDocx = async (data: ResumeData): Promise<Blob> => {
  const children: any[] = [];

  // 1. Header Section
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: (data.personalInfo.fullName || "NAME").toUpperCase(),
          bold: true,
          size: 48,
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: (data.personalInfo.jobTitle || "").toUpperCase(),
          size: 24,
          font: "Arial",
          color: "666666",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `${data.personalInfo.email || ""} | ${data.personalInfo.phone || ""} | ${data.personalInfo.location || ""}`,
          size: 18,
          font: "Arial",
          color: "444444",
        }),
        data.personalInfo.linkedin ? new TextRun({ text: ` | LinkedIn: ${data.personalInfo.linkedin}`, size: 18, font: "Arial", color: "444444" }) : new TextRun(""),
      ],
    })
  );

  // 2. Summary
  if (data.personalInfo.summary) {
    addHeader(children, "Professional Summary");
    children.push(
      new Paragraph({
        alignment: AlignmentType.BOTH,
        spacing: { after: 200 },
        children: [new TextRun({ text: data.personalInfo.summary, size: 20, font: "Arial" })],
      })
    );
  }

  // 3. Skills
  if (data.skills && (data.skills.hard?.length || data.skills.tools?.length)) {
    addHeader(children, "Core Competencies");
    const skillParts = [];
    if (data.skills.hard?.length) skillParts.push(`Expertise: ${data.skills.hard.join(", ")}`);
    if (data.skills.tools?.length) skillParts.push(`Technical: ${data.skills.tools.join(", ")}`);
    
    skillParts.forEach(part => {
      children.push(new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: part, size: 20, font: "Arial" })]
      }));
    });
  }

  // 4. Experience
  if (data.experience?.length) {
    addHeader(children, "Professional Experience");
    data.experience.forEach(exp => {
      children.push(
        new Paragraph({
          spacing: { before: 150 },
          children: [
            new TextRun({ text: exp.role.toUpperCase(), bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: `\t${exp.startDate} – ${exp.current ? "Present" : exp.endDate}`, bold: true, size: 18, font: "Arial" })
          ],
          tabStops: [{ type: "right", position: 9350 }],
        }),
        new Paragraph({ 
          spacing: { after: 100 },
          children: [
            new TextRun({ text: exp.company, italics: true, bold: true, size: 18, font: "Arial", color: "333333" }),
            new TextRun({ text: ` | ${exp.location}`, size: 18, font: "Arial", color: "666666" })
          ]
        })
      );
      exp.description.forEach(bullet => {
        children.push(new Paragraph({ 
          bullet: { level: 0 }, 
          children: [new TextRun({ text: bullet, size: 19, font: "Arial" })],
          spacing: { after: 50 }
        }));
      });
    });
  }

  // 5. Projects
  if (data.projects?.length) {
    addHeader(children, "Key Projects");
    data.projects.forEach(proj => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: proj.name, bold: true, size: 20, font: "Arial" })]
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: proj.description, size: 18, font: "Arial" })]
        })
      );
    });
  }

  // 6. Education
  if (data.education?.length) {
    addHeader(children, "Education");
    data.education.forEach(edu => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.school, bold: true, size: 20, font: "Arial" }),
            new TextRun({ text: `\t${edu.graduationDate}`, bold: true, size: 18, font: "Arial" })
          ],
          tabStops: [{ type: "right", position: 9350 }],
        }),
        new Paragraph({
          spacing: { after: 150 },
          children: [new TextRun({ text: `${edu.degree} in ${edu.field}`, italics: true, size: 18, font: "Arial" })]
        })
      );
    });
  }

  // 7. Custom Sections
  data.customSections?.forEach(sec => {
    addHeader(children, sec.title);
    if (sec.type === 'table' && sec.tableData) {
      const rows = sec.tableData.map((r, rIdx) => new TableRow({
        children: r.map(c => new TableCell({
          children: [new Paragraph({ 
            spacing: { before: 100, after: 100 },
            children: [new TextRun({ text: c, size: 18, bold: rIdx === 0, font: "Arial" })]
          })],
          shading: rIdx === 0 ? { fill: "F3F4F6", type: ShadingType.CLEAR } : undefined,
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 100, bottom: 100, left: 100, right: 100 }
        }))
      }));
      children.push(new Table({ 
        width: { size: 100, type: WidthType.PERCENTAGE }, 
        rows,
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
        }
      }));
    } else {
      sec.items?.forEach(i => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: i, size: 19, font: "Arial" })] })));
    }
  });

  const doc = new Document({
    sections: [{
      properties: { 
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 }
        }
      },
      children: children,
    }],
  });

  return await Packer.toBlob(doc);
};

function addHeader(children: any[], text: string) {
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 120 },
      border: { bottom: { color: "000000", space: 2, style: BorderStyle.SINGLE, size: 6 } },
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, font: "Arial" })],
    })
  );
}
