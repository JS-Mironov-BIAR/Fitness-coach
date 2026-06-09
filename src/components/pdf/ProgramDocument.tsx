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
};

const ACCENT = "#e11d48";
const ACCENT_SOFT = "#ffe4e6";
const INK = "#27272a";
const MUTED = "#71717a";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10.5,
    color: INK,
    paddingBottom: 56,
  },
  header: {
    backgroundColor: ACCENT,
    color: "#ffffff",
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  brand: { fontSize: 11, fontWeight: "bold", letterSpacing: 1, opacity: 0.9 },
  title: { fontSize: 22, fontWeight: "bold", marginTop: 8 },
  headerMeta: { fontSize: 10, marginTop: 8, opacity: 0.95 },
  body: { paddingHorizontal: 32, paddingTop: 20 },
  intro: { fontSize: 11, lineHeight: 1.5, color: INK, marginBottom: 16 },
  block: { marginBottom: 14, borderRadius: 6, overflow: "hidden", border: `1 solid ${ACCENT_SOFT}` },
  blockTitle: {
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    fontWeight: "bold",
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderTop: `1 solid #f4f4f5`,
  },
  rowMain: { flex: 1, paddingRight: 10 },
  rowMainText: { fontSize: 11, fontWeight: "bold", color: INK },
  rowNote: { fontSize: 9.5, color: MUTED, marginTop: 2 },
  rowSecondary: { fontSize: 11, fontWeight: "bold", color: ACCENT, textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderTop: `1 solid #f4f4f5`,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 9, color: MUTED },
});

export function ProgramDocument({ data }: { data: ProgramData }) {
  const kind = data.type === "training" ? "Программа тренировок" : "План питания";
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.brand}>FITNESS COACH · АНЯ</Text>
          <Text style={styles.title}>{data.title || kind}</Text>
          <Text style={styles.headerMeta}>
            {[data.clientName ? `Для: ${data.clientName}` : null, data.dateLabel]
              .filter(Boolean)
              .join("    •    ")}
          </Text>
        </View>

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
          <Text style={styles.footerText}>{data.footer}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
