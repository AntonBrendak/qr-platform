'use client';

import * as React from 'react';
import {useId, useState} from 'react';
import {useUI} from '../providers/UIProvider';
import {sizeToInputClass, radiusToClass, type Size} from '../config/component-registry';
import {Label} from './Label';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Встроенный label (если нужен сразу). Иначе можно рендерить <Label> отдельно. */
  label?: React.ReactNode;
  /** Подсказка под полем */
  help?: React.ReactNode;
  /** Показывать ошибку (Bootstrap invalid) */
  error?: React.ReactNode;
  /** Состояние валидности вручную: invalid=true проставит is-invalid */
  invalid?: boolean;
  /** Размер контрола (sm|md|lg). По умолчанию берётся из реестра. */
  uiSize?: Size;
  /** Радиус (sm|md|lg|pill). По умолчанию из реестра. */
  uiRadius?: 'sm' | 'md' | 'lg' | 'pill';
  /** Принудительно включить form-floating (иначе из реестра). */
  floating?: boolean;
  /** Принудительно добавить кнопку очистки (X). Иначе из реестра. */
  clearable?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    help,
    error,
    invalid,
    uiSize,
    uiRadius,
    floating,
    clearable,
    className,
    required,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const inputId = id ?? `qc-input-${autoId}`;
  const {registry} = useUI();

  const cfg = registry.input;
  const finalSize: Size = uiSize ?? cfg.defaultSize;
  const finalRadius = uiRadius ?? cfg.radius;
  const wantFloating = floating ?? cfg.floatingLabels;
  const wantClearable = clearable ?? cfg.clearable;

  const sizeCls = sizeToInputClass(finalSize);
  const radiusCls = radiusToClass(finalRadius);
  const invalidCls = invalid || !!error ? 'is-invalid' : '';
  const classes = ['form-control', sizeCls, radiusCls, invalidCls, className || '']
    .filter(Boolean)
    .join(' ');

  // Локальный стейт для clearable, если использован как uncontrolled
  const [localValue, setLocalValue] = useState<string | number | readonly string[] | undefined>(
    rest.defaultValue as any
  );

  // Если передан value — контролируемое поле; иначе используем localValue
  const isControlled = rest.value !== undefined;

  const inputEl = (
    <input
      id={inputId}
      ref={ref}
      className={classes}
      required={required}
      {...rest}
      value={isControlled ? (rest.value as any) : localValue}
      onChange={(e) => {
        rest.onChange?.(e);
        if (!isControlled) setLocalValue(e.target.value);
      }}
      placeholder={
        // Для floating нужен непустой placeholder, чтобы label «плавал»
        wantFloating ? (typeof label === 'string' ? label : ' ') : rest.placeholder
      }
    />
  );

  const clearBtn =
    wantClearable ? (
      <button
        type="button"
        aria-label="Clear"
        className="btn btn-outline-secondary btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
        onClick={() => {
          if (isControlled) {
            // Если контролируемое поле — инициируем onChange пустым значением
            const ev = {target: {value: ''}} as any;
            rest.onChange?.(ev);
          } else {
            setLocalValue('');
          }
        }}
      >
        ×
      </button>
    ) : null;

  // Вариант с floating
  if (wantFloating) {
    return (
      <div className="mb-3 position-relative">
        <div className="form-floating">
          {inputEl}
          {label ? (
            <label htmlFor={inputId} className="form-label">
              {label}
              {required ? <span className="text-danger fw-semibold ms-1">*</span> : null}
            </label>
          ) : null}
        </div>
        {clearBtn}
        {error ? <div className="invalid-feedback d-block">{error}</div> : null}
        {help ? <div className="form-text">{help}</div> : null}
      </div>
    );
  }

  // Обычный вариант с Label-компонентом сверху (если задан label)
  return (
    <div className="mb-3 position-relative">
      {label ? (
        <Label htmlFor={inputId} required={required} help={help}>
          {label}
        </Label>
      ) : null}
      {inputEl}
      {clearBtn}
      {error ? <div className="invalid-feedback d-block">{error}</div> : null}
    </div>
  );
});

export default Input;