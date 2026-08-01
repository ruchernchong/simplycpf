import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/brand";
import {
  type CheatSheetSection,
  getCpfCheatSheetData,
} from "@/lib/get-cpf-cheat-sheet-data";

/* See cpf-results-pdf.tsx: the PDF renderer cannot read CSS custom properties. */
const TEAL = BRAND.forest;
const SLATE_900 = BRAND.ink;
const SLATE_700 = BRAND.textBody;
const SLATE_500 = BRAND.textSubtle;
const SLATE_100 = BRAND.bone;
const SLATE_50 = BRAND.card;

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 32,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: SLATE_900,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: TEAL,
    paddingBottom: 12,
    marginBottom: 20,
  },
  overline: {
    color: TEAL,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  subtitle: {
    color: SLATE_700,
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  sectionDescription: {
    color: SLATE_500,
    lineHeight: 1.4,
    marginBottom: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: SLATE_100,
    borderRadius: 6,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: SLATE_100,
  },
  headerRow: {
    backgroundColor: SLATE_50,
  },
  cell: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: SLATE_100,
  },
  lastCell: {
    borderRightWidth: 0,
  },
  headerCellText: {
    fontFamily: "Helvetica-Bold",
    color: SLATE_700,
  },
  bodyCellText: {
    color: SLATE_900,
  },
  sourceText: {
    color: SLATE_500,
    fontSize: 7,
    lineHeight: 1.35,
    marginTop: 5,
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 32,
    right: 32,
    color: SLATE_500,
    textAlign: "center",
    fontSize: 8,
  },
});

function SectionTable({ section }: { section: CheatSheetSection }) {
  const headerCells = section.columns.map((column, index) => {
    const isLastColumn = index === section.columns.length - 1;

    return (
      <View
        key={column}
        style={isLastColumn ? [styles.cell, styles.lastCell] : styles.cell}
      >
        <Text style={styles.headerCellText}>{column}</Text>
      </View>
    );
  });

  const bodyRows = section.rows.map((row, rowIndex) => {
    const rowKey = `${section.title}-${row.join("|")}`;
    const isLastRow = rowIndex === section.rows.length - 1;

    return (
      <View
        key={rowKey}
        style={isLastRow ? [styles.row, { borderBottomWidth: 0 }] : styles.row}
      >
        {row.map((cell, cellIndex) => {
          const isLastCell = cellIndex === row.length - 1;

          return (
            <View
              key={`${rowKey}-${section.columns[cellIndex]}`}
              style={isLastCell ? [styles.cell, styles.lastCell] : styles.cell}
            >
              <Text style={styles.bodyCellText}>{cell}</Text>
            </View>
          );
        })}
      </View>
    );
  });

  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionDescription}>{section.description}</Text>
      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>{headerCells}</View>
        {bodyRows}
      </View>
      <Text style={styles.sourceText}>
        {section.status.toUpperCase()} · verified {section.verifiedAt}
        {"\n"}
        {section.sourceUrls.join("\n")}
      </Text>
    </View>
  );
}

export function CpfCheatSheetPdf() {
  const data = getCpfCheatSheetData();
  const keyAgeSection: CheatSheetSection = {
    title: "Key ages",
    description:
      "CPF account and payout ages, plus statutory employment ages effective from July 2026.",
    columns: ["Rule", "Age"],
    rows: data.keyAges.map((age) => [age.label, age.value]),
    status: "official",
    verifiedAt: data.verifiedAt,
    sourceUrls: [...new Set(data.keyAges.map((age) => age.sourceUrl))],
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.overline}>SimplyCPF</Text>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.subtitle}>{data.subtitle}</Text>
          <Text style={styles.sourceText}>
            Effective {data.effectiveFrom} · verified {data.verifiedAt}
            {"\n"}
            Scope: {data.scope}
          </Text>
        </View>
        <SectionTable section={keyAgeSection} />
        {data.sections.map((section) => (
          <SectionTable key={section.title} section={section} />
        ))}
        <Text style={styles.footer}>
          Official datasets verified {data.verifiedAt}. SimplyCPF is an
          independent reference tool; verify personal decisions with CPF Board.
        </Text>
      </Page>
    </Document>
  );
}
