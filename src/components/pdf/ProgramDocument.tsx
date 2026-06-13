"use client";

import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto-Regular.ttf" },
    { src: "/fonts/Roboto-Bold.ttf", fontWeight: "bold" },
  ],
});

export type ProgramRow = { id: string; main: string; secondary: string; note: string };
export type ProgramBlock = { id: string; title: string; rows: ProgramRow[] };
export type ProgramData = {
  type: "training" | "nutrition";
  title: string;
  clientName: string;
  dateLabel: string;
  intro: string;
  blocks: ProgramBlock[];
  footer: string;
  themeKey: string;
  contacts: string;
};

export type PdfTheme = { key: string; name: string; accent: string; soft: string; layout: "band" | "minimal" };

export const PDF_THEMES: PdfTheme[] = [
  { key: "violet", name: "Фиолетовый", accent: "#7c3aed", soft: "#ede9fe", layout: "band" },
  { key: "lilac", name: "Лиловый", accent: "#a855f7", soft: "#f3e8ff", layout: "minimal" },
  { key: "insta", name: "Инстаграм", accent: "#c026d3", soft: "#fae8ff", layout: "band" },
  { key: "mint", name: "Мятный", accent: "#0d9488", soft: "#ccfbf1", layout: "minimal" },
  { key: "graphite", name: "Графит", accent: "#3f3f46", soft: "#e4e4e7", layout: "minimal" },
];

const INK = "#27272a";
const MUTED = "#71717a";

function makeStyles(accent: string, soft: string) {
  return StyleSheet.create({
    page: { fontFamily: "Roboto", fontSize: 10.5, color: INK, paddingBottom: 64 },
    headerBand: { backgroundColor: accent, color: "#ffffff", paddingHorizontal: 32, paddingVertical: 24 },
    headerMinimal: { paddingHorizontal: 32, paddingTop: 28, paddingBottom: 16, borderBottom: `2 solid ${accent}` },
    brand: { fontSize: 11, fontWeight: "bold", letterSpacing: 1, opacity: 0.9 },
    brandDark: { fontSize: 10, fontWeight: "bold", letterSpacing: 1, color: MUTED },
    title: { fontSize: 22, fontWeight: "bold", marginTop: 8 },
    titleDark: { fontSize: 22, fontWeight: "bold", marginTop: 6, color: accent },
    headerMeta: { fontSize: 10, marginTop: 8, opacity: 0.95 },
    headerMetaDark: { fontSize: 10, marginTop: 6, color: MUTED },
    body: { paddingHorizontal: 32, paddingTop: 20 },
    intro: { fontSize: 11, lineHeight: 1.5, color: INK, marginBottom: 16 },
    block: { marginBottom: 14, borderRadius: 6, overflow: "hidden", border: `1 solid ${soft}` },
    blockTitle: { backgroundColor: soft, color: accent, fontWeight: "bold", fontSize: 12, paddingHorizontal: 12, paddingVertical: 7 },
    row: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 7, borderTop: "1 solid #f4f4f5" },
    rowMain: { flex: 1, paddingRight: 10 },
    rowMainText: { fontSize: 11, fontWeight: "bold", color: INK },
    rowNote: { fontSize: 9.5, color: MUTED, marginTop: 2 },
    rowSecondary: { fontSize: 11, fontWeight: "bold", color: accent, textAlign: "right" },
    footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 32, paddingVertical: 12, borderTop: "1 solid #f4f4f5" },
    contacts: { fontSize: 8.5, color: accent, marginBottom: 3, textAlign: "center" },
    footerRow: { flexDirection: "row", justifyContent: "space-between" },
    footerText: { fontSize: 9, color: MUTED },
  });
}

export function ProgramDocument({ data }: { data: ProgramData }) {
  const theme = PDF_THEMES.find((t) => t.key === data.themeKey) ?? PDF_THEMES[0];
  const styles = makeStyles(theme.accent, theme.soft);
  const kind = data.type === "training" ? "Программа тренировок" : "План питания";
  const meta = [data.clientName ? `Для: ${data.clientName}` : null, data.dateLabel].filter(Boolean).join("    •    ");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {theme.layout === "band" ? (
          <View style={styles.headerBand} fixed>
            <Text style={styles.brand}>halvafit</Text>
            <Text style={styles.title}>{data.title || kind}</Text>
            <Text style={styles.headerMeta}>{meta}</Text>
          </View>
        ) : (
          <View style={styles.headerMinimal} fixed>
            <Text style={styles.brandDark}>
              halva<Text style={{ color: theme.accent }}>fit</Text>
            </Text>
            <Text style={styles.titleDark}>{data.title || kind}</Text>
            <Text style={styles.headerMetaDark}>{meta}</Text>
          </View>
        )}

        <View style={styles.body}>
          {data.intro ? <Text style={styles.intro}>{data.intro}</Text> : null}

          {data.blocks.map((block) => (
            <View key={block.id} style={styles.block} wrap={false}>
              <Text style={styles.blockTitle}>{block.title || "Без названия"}</Text>
              {block.rows
                .filter((r) => r.main || r.secondary || r.note)
                .map((r) => (
                  <View key={r.id} style={styles.row}>
                    <View style={styles.rowMain}>
                      <Text style={styles.rowMainText}>{r.main}</Text>
                      {r.note ? <Text style={styles.rowNote}>{r.note}</Text> : null}
                    </View>
                    {r.secondary ? <Text style={styles.rowSecondary}>{r.secondary}</Text> : null}
                  </View>
                ))}
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          {data.contacts ? <Text style={styles.contacts}>{data.contacts}</Text> : null}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{data.footer}</Text>
            <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
