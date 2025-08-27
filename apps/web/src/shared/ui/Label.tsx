'use client';

import * as React from 'react';
import {useUI} from '../providers/UIProvider';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** id инпута, с которым связан label */
  htmlFor?: string;
  /** Проставить визуальную «*» — поведение регулируется реестром */
  required?: boolean;
  /** Подсказка под полем (help text) */
  help?: React.ReactNode;
  /** Скрыть визуально, но оставить для скринридеров */
  srOnly?: boolean;
  /** Явная замена символа «*» (по умолчанию берём из реестра) */
  asterisk?: React.ReactNode;
  children: React.ReactNode;
}

/** Универсальный Label: классы, «звёздочка» и help берутся из реестра */
export function Label({
  htmlFor,
  required,
  help,
  srOnly,
  asterisk,
  className,
  children,
  ...rest
}: LabelProps) {
  const {registry} = useUI();
  const cfg = registry.label;

  const shouldShowAsterisk =
    cfg.requiredAsterisk === 'always' ||
    (cfg.requiredAsterisk === 'auto' && !!required);

  const asteriskEl = shouldShowAsterisk ? (
    <span aria-hidden="true" className={cfg.asteriskClass}>
      {asterisk ?? '*'}
    </span>
  ) : null;

  const cls = [
    'form-label',
    srOnly ? 'visually-hidden' : '',
    className || ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <label htmlFor={htmlFor} className={cls} {...rest}>
        {children}
        {asteriskEl}
      </label>
      {help ? <div className={cfg.helpTextClass}>{help}</div> : null}
    </div>
  );
}

export default Label;