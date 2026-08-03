import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/brand";
import {
  type CheatSheetSection,
  getCpfCheatSheetData,
} from "@/lib/get-cpf-cheat-sheet-data";

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 32,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: BRAND.ink,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: BRAND.forest,
    paddingBottom: 12,
    marginBottom: 20,
  },
  overline: {
    color: BRAND.forest,
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
    color: BRAND.textBody,
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
    color: BRAND.textSecondary,
    lineHeight: 1.4,
    marginBottom: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: BRAND.bone,
    borderRadius: 6,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BRAND.bone,
  },
  headerRow: {
    backgroundColor: BRAND.card,
  },
  cell: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: BRAND.bone,
  },
  lastCell: {
    borderRightWidth: 0,
  },
  headerCellText: {
    fontFamily: "Helvetica-Bold",
    color: BRAND.textBody,
  },
  bodyCellText: {
    color: BRAND.ink,
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 32,
    right: 32,
    color: BRAND.textSecondary,
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
    </View>
  );
}

export function CpfCheatSheetPdf() {
  const data = getCpfCheatSheetData();

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.overline}>SimplyCPF</Text>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.subtitle}>{data.subtitle}</Text>
        </View>
        {data.sections.map((section) => (
          <SectionTable key={section.title} section={section} />
        ))}
        <Text style={styles.footer}>
          SimplyCPF cheat sheet for quick CPF reference. Always verify final
          decisions against the latest CPF Board publications.
        </Text>
      </Page>
    </Document>
  );
}
