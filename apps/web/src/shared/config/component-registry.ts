// Универсальные типы
export type Variant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'light'
  | 'dark'
  | 'link';

export type Size = 'sm' | 'md' | 'lg';

// Конфиг отдельных компонент
export interface ButtonConfig {
  defaultVariant: Exclude<Variant, 'link'>; // 'link' лучше отдельным компонентом
  defaultSize: Size;
  uppercase: boolean;         // ВКЛ капс у текста
  pill: boolean;              // Скругление-pill
  wide: 'narrow' | 'normal' | 'wide'; // Горизонтальные отступы
  iconGapPx: number;          // Зазор между иконкой и текстом
}

export interface InputConfig {
  defaultSize: Size;
  floatingLabels: boolean;    // Поддержка form-floating
  radius: 'sm' | 'md' | 'lg' | 'pill';
  clearable: boolean;         // Появляется крестик-сброс (реализуем позже)
}

export interface LabelConfig {
  requiredAsterisk: 'always' | 'never' | 'auto'; // auto = если поле required
  asteriskClass: string;      // Класс оформления звёздочки (цвет/размер)
  helpTextClass: string;      // Класс для help-текста под полем
}

export interface TextConfig {
  // Карта семантики → bootstrap-класс (или набор классов)
  scale: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
    h6: string;
    lead: string;
    small: string;
    muted: string;
    regular: string; // по умолчанию для <p>
  };
}

export interface ComponentRegistry {
  button: ButtonConfig;
  input: InputConfig;
  label: LabelConfig;
  text: TextConfig;
}

// Дефолты (перекроются админом)
export const defaultRegistry: ComponentRegistry = {
  button: {
    defaultVariant: 'primary',
    defaultSize: 'md',
    uppercase: false,
    pill: false,
    wide: 'normal',
    iconGapPx: 8
  },
  input: {
    defaultSize: 'md',
    floatingLabels: false,
    radius: 'md',
    clearable: false
  },
  label: {
    requiredAsterisk: 'auto',
    asteriskClass: 'text-danger fw-semibold ms-1',
    helpTextClass: 'form-text'
  },
  text: {
    scale: {
      h1: 'display-5 fw-semibold',
      h2: 'h2 fw-semibold',
      h3: 'h3 fw-semibold',
      h4: 'h4 fw-semibold',
      h5: 'h5 fw-semibold',
      h6: 'h6 fw-semibold',
      lead: 'lead',
      small: 'small text-body-secondary',
      muted: 'text-body-secondary',
      regular: '' // def для <p>
    }
  }
};

// Небольшой deep-merge для плоских объектов 2-х уровней глубины
type PlainObject = Record<string, any>;
function isPlainObject(v: unknown): v is PlainObject {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

export function mergeRegistry<T extends object>(base: T, patch?: Partial<T>): T {
  if (!patch) return base;
  const out: any = {...base};
  for (const k of Object.keys(patch) as (keyof T)[]) {
    const pv = patch[k];
    if (pv === undefined) continue;
    const bv = (base as any)[k];
    out[k] = isPlainObject(bv) && isPlainObject(pv) ? {...bv, ...pv} : pv;
  }
  return out;
}

// Хелперы для маппинга размеров → bootstrap классы
export function sizeToBtnClass(size: Size): string {
  if (size === 'sm') return 'btn-sm';
  if (size === 'lg') return 'btn-lg';
  return ''; // md — дефолт
}

export function sizeToInputClass(size: Size): string {
  if (size === 'sm') return 'form-control-sm';
  if (size === 'lg') return 'form-control-lg';
  return ''; // md — дефолт
}

// Хелперы для ширины/радиуса через наши утилити-переменные
export function wideToClass(wide: ButtonConfig['wide']): string {
  if (wide === 'wide') return 'qc-btn-wide';
  if (wide === 'narrow') return 'qc-btn-narrow';
  return ''; // normal
}

export function radiusToClass(radius: InputConfig['radius']): string {
  if (radius === 'sm') return 'qc-rounded-1';
  if (radius === 'md') return 'qc-rounded-2';
  if (radius === 'lg') return 'qc-rounded-3';
  if (radius === 'pill') return 'qc-rounded-pill';
  return '';
}