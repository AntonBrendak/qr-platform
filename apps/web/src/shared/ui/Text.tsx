'use client';

import * as React from 'react';
import {useUI} from '../providers/UIProvider';

type Allowed =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'lead' | 'small' | 'muted' | 'regular';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** По умолчанию 'p'. Можно передать 'div' | 'span' | 'h1' ... или любой React-компонент */
  as?: React.ElementType;
  /** Семантическая шкала из реестра */
  kind?: Allowed;
  children: React.ReactNode;
}

/** Универсальный текст, читает классы из реестра (админом настраивается) */
export function Text({as = 'p', kind = 'regular', className, children, ...rest}: TextProps) {
  const {registry} = useUI();
  const Tag = as as React.ElementType;

  const scale = registry.text.scale;
  const base = scale[kind] ?? '';

  return (
    <Tag className={`${base}${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </Tag>
  );
}

export default Text;