'use client';

import * as React from 'react';
import Link from 'next/link';
import type {UrlObject} from 'url';
import type {Route} from 'next';
import {useUI} from '../providers/UIProvider';
import {
  sizeToBtnClass,
  wideToClass,
  type Size,
  type Variant
} from '../config/component-registry';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size' | 'color'> {
  /** Вариант Bootstrap (primary|secondary|…|link). По умолчанию из реестра. */
  variant?: Variant;
  /** Размер (sm|md|lg). По умолчанию из реестра. */
  uiSize?: Size;
  /** Контурный стиль: btn-outline-*. */
  outline?: boolean;
  /** Скругление-pill независимо от глобальных токенов. */
  pill?: boolean;
  /** Uppercase текста независимо от глобальных настроек. */
  uppercase?: boolean;
  /** Ширина по горизонтали (сдвигает внутренние паддинги через CSS var). */
  wide?: 'narrow' | 'normal' | 'wide';
  /** Иконка слева от текста. */
  startIcon?: React.ReactNode;
  /** Иконка справа от текста. */
  endIcon?: React.ReactNode;
  /** Разрыв между иконкой и текстом в пикселях. По умолчанию из реестра. */
  iconGapPx?: number;
  /** Состояние загрузки — блокирует кнопку и показывает спиннер. */
  loading?: boolean;
  /** Где рисовать спиннер при loading. */
  spinnerPlacement?: 'start' | 'end' | 'replace';
  /**
   * Ссылка (если задана — рендерим <Link/> или <a/>).
   * Внутренние роуты — Route | UrlObject (typedRoutes),
   * внешние абсолютные URL — string.
   */
  href?: Route | UrlObject | string;
  /** Открыть ссылку в новом окне (актуально для внешних ссылок). */
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  /** Полная ширина. */
  block?: boolean;
}

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

/** Универсальная кнопка на Bootstrap 5 с чтением дефолтов из реестра. */
export function Button({
  variant,
  uiSize,
  outline,
  pill,
  uppercase,
  wide,
  startIcon,
  endIcon,
  iconGapPx,
  loading,
  spinnerPlacement = 'start',
  href,
  className,
  disabled,
  block,
  children,
  target,
  rel,
  ...rest
}: ButtonProps) {
  const {registry} = useUI();
  const cfg = registry.button;

  const finalVariant: Variant = variant ?? (cfg.defaultVariant as Variant);
  const isLinkVariant = finalVariant === 'link';

  const bsBase = 'btn';
  const bsVariantClass = isLinkVariant
    ? 'btn-link'
    : outline
    ? `btn-outline-${finalVariant}`
    : `btn-${finalVariant}`;

  const sizeCls = sizeToBtnClass(uiSize ?? cfg.defaultSize);
  const wideCls = wide ? wideToClass(wide) : wideToClass(cfg.wide);
  const pillCls = (pill ?? cfg.pill) ? 'rounded-pill' : '';
  const upCls = (uppercase ?? cfg.uppercase) ? 'text-uppercase' : '';
  const blockCls = block ? 'w-100' : '';

  const gap = iconGapPx ?? cfg.iconGapPx;

  const classes = classNames(
    bsBase,
    bsVariantClass,
    sizeCls,
    wideCls,
    pillCls,
    upCls,
    blockCls,
    'd-inline-flex align-items-center justify-content-center',
    className
  );

  const spinner = (
    <span
      className={classNames(
        'spinner-border',
        (uiSize ?? cfg.defaultSize) === 'sm' ? 'spinner-border-sm' : ''
      )}
      role="status"
      aria-hidden="true"
      style={{marginInline: gap ? 4 : 0}}
    />
  );

  const content = (
    <span style={{display: 'inline-flex', alignItems: 'center', gap}}>
      {loading && spinnerPlacement === 'start' ? spinner : null}
      {startIcon}
      {spinnerPlacement === 'replace' && loading ? null : <span>{children}</span>}
      {endIcon}
      {loading && spinnerPlacement === 'end' ? spinner : null}
    </span>
  );

  // Ветка ссылки
  if (href) {
    const isAbsoluteExternal =
      typeof href === 'string' && /^(https?:|mailto:|tel:)/i.test(href);

    const ariaDisabled = disabled || loading ? true : undefined;
    const commonAnchorProps = {
      className: classes,
      'aria-disabled': ariaDisabled as boolean | undefined,
      tabIndex: ariaDisabled ? -1 : undefined,
      onClick: (e: React.MouseEvent) => {
        if (ariaDisabled) e.preventDefault();
        (rest as any).onClick?.(e);
      }
    };

    if (isAbsoluteExternal) {
      const finalRel = target === '_blank' ? rel ?? 'noopener noreferrer' : rel;
      return (
        <a
          href={href as string}
          target={target}
          rel={finalRel}
          {...commonAnchorProps}
        >
          {content}
        </a>
      );
    }

    // Внутренние роуты (typedRoutes): принимаем Route | UrlObject
    return (
      <Link
        href={href as Route | UrlObject}
        {...commonAnchorProps}
      >
        {content}
      </Link>
    );
  }

  // Обычная кнопка
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      className={classes}
      aria-busy={loading || undefined}
    >
      {content}
    </button>
  );
}

export default Button;