// Единый конфиг анкеты: используется и формой (рендер), и сервером
// (сборка строки заявки для Telegram). Имена полей совпадают со столбцами
// таблицы `leads` в Supabase.

export type AnketaFieldType = "text" | "number" | "textarea" | "select";

export interface AnketaField {
  name: string;
  label: string;
  type: AnketaFieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  full?: boolean; // занимать всю ширину строки
}

export interface AnketaGroup {
  title: string;
  emoji: string;
  fields: AnketaField[];
}

export const ANKETA_GROUPS: AnketaGroup[] = [
  {
    title: "Контакт",
    emoji: "📇",
    fields: [
      { name: "name", label: "Как тебя зовут?", type: "text", required: true, placeholder: "Имя" },
      { name: "contact_method", label: "Как удобнее связаться?", type: "select", options: ["Telegram", "Instagram", "Телефон"] },
      { name: "contact_value", label: "Контакт для связи", type: "text", required: true, placeholder: "@ник или номер телефона" },
      { name: "city", label: "Формат занятий", type: "select", options: ["Гомель — очно", "Онлайн"] },
    ],
  },
  {
    title: "О тебе",
    emoji: "🌸",
    fields: [
      { name: "sex", label: "Пол", type: "select", options: ["Женский", "Мужской"] },
      { name: "age", label: "Возраст", type: "number" },
      { name: "height_cm", label: "Рост, см", type: "number" },
      { name: "weight_kg", label: "Вес, кг", type: "number" },
      { name: "target_weight_kg", label: "Желаемый вес, кг", type: "number" },
    ],
  },
  {
    title: "Цель",
    emoji: "🎯",
    fields: [
      { name: "goal", label: "Главная цель", type: "select", options: ["Похудение", "Коррекция фигуры", "Набор массы", "Поддержание формы", "Постановка техники"] },
      { name: "goal_term", label: "За какой срок хочешь прийти к цели?", type: "text", placeholder: "например, 3 месяца" },
    ],
  },
  {
    title: "Опыт",
    emoji: "💪",
    fields: [
      { name: "experience", label: "Уровень подготовки", type: "select", options: ["Новичок", "Средний уровень", "Опытный"] },
      { name: "training_years", label: "Сколько уже занимаешься?", type: "text", placeholder: "например, полгода / не занималась" },
    ],
  },
  {
    title: "Условия тренировок",
    emoji: "🏋️",
    fields: [
      { name: "place", label: "Где будешь заниматься?", type: "select", options: ["Дома", "В зале", "Дома и в зале"] },
      { name: "equipment", label: "Какой инвентарь доступен?", type: "textarea", full: true, placeholder: "гантели, резинки, турник… или ничего" },
      { name: "days_per_week", label: "Дней в неделю на тренировки", type: "number" },
      { name: "session_minutes", label: "Минут на одну тренировку", type: "number" },
    ],
  },
  {
    title: "Здоровье",
    emoji: "🩺",
    fields: [
      { name: "health_limitations", label: "Травмы, болезни, противопоказания?", type: "textarea", full: true, placeholder: "если ничего — так и напиши" },
      { name: "cycle_notes", label: "Особенности цикла и самочувствия", type: "textarea", full: true, placeholder: "по желанию — это поможет мягко подобрать нагрузку" },
      { name: "pregnancy", label: "Беременность / ГВ", type: "select", options: ["Нет", "Беременность", "Грудное вскармливание"] },
    ],
  },
  {
    title: "Питание",
    emoji: "🥗",
    fields: [
      { name: "allergies", label: "Аллергии и непереносимости", type: "textarea", full: true },
      { name: "food_prefs", label: "Что любишь и что не ешь?", type: "textarea", full: true },
      { name: "meals_per_day", label: "Привычное число приёмов пищи", type: "number" },
      { name: "food_budget", label: "Бюджет на питание (примерно)", type: "text" },
      { name: "diet_experience", label: "Опыт диет — что уже пробовала?", type: "textarea", full: true },
    ],
  },
  {
    title: "Образ жизни",
    emoji: "☀️",
    fields: [
      { name: "work_type", label: "Характер работы", type: "select", options: ["Сидячая", "Стоячая", "Физическая", "Смешанная"] },
      { name: "sleep", label: "Сколько часов спишь?", type: "text" },
      { name: "stress", label: "Уровень стресса", type: "select", options: ["Низкий", "Средний", "Высокий"] },
      { name: "daily_activity", label: "Активность за день", type: "text", placeholder: "шаги, прогулки" },
    ],
  },
  {
    title: "Сейчас",
    emoji: "📋",
    fields: [
      { name: "current_program", label: "Тренируешься сейчас? Опиши программу", type: "textarea", full: true },
      { name: "stuck_points", label: "Что не получается или где застопорился прогресс?", type: "textarea", full: true },
    ],
  },
  {
    title: "Техника",
    emoji: "🎥",
    fields: [
      { name: "video_url", label: "Ссылка на видео техники (YouTube / Instagram)", type: "text", full: true, placeholder: "по желанию" },
    ],
  },
  {
    title: "Напоследок",
    emoji: "✨",
    fields: [
      { name: "service_interest", label: "Что тебя интересует?", type: "select", options: ["Разовая консультация", "Онлайн-ведение", "Очно в Гомеле", "Пока просто присматриваюсь"] },
      { name: "source", label: "Откуда узнала обо мне?", type: "text" },
    ],
  },
];

export const ANKETA_FIELDS: AnketaField[] = ANKETA_GROUPS.flatMap((g) => g.fields);
export const FIELD_NAMES: string[] = ANKETA_FIELDS.map((f) => f.name);
export const NUMERIC_FIELDS = new Set(
  ANKETA_FIELDS.filter((f) => f.type === "number").map((f) => f.name),
);

// Текст заявки для Telegram (обычный текст, без разметки)
export function buildLeadMessage(data: Record<string, unknown>): string {
  const lines: string[] = ["🆕 Новая заявка с сайта", ""];
  for (const group of ANKETA_GROUPS) {
    const filled = group.fields.filter((f) => {
      const v = data[f.name];
      return v !== undefined && v !== null && String(v).trim() !== "";
    });
    if (filled.length === 0) continue;
    lines.push(`${group.emoji} ${group.title}`);
    for (const f of filled) {
      lines.push(`• ${f.label}: ${String(data[f.name]).trim()}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}
