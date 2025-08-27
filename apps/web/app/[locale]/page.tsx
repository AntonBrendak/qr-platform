import Text from '../../src/shared/ui/Text';
import Link from 'next/link';
import {createTranslator} from 'next-intl';
import {allMessages} from '../../src/i18n/messages';
import type {Locale} from '../../src/i18n/locales';

type Props = {params: {locale: Locale}};

export default function HomePage({params: {locale}}: Props) {
  const t = createTranslator({locale, messages: allMessages[locale], namespace: 'home'});

  return (
    <main className="container py-5">
      <Text as="h1" kind="h2" className="mb-3">{t('title')}</Text>
      <p className="text-body-secondary mb-4">{t('subtitle')}</p>

      <section className="mb-4">
        <h2 className="h5 mb-3">{t('demo.sectionTitle')}</h2>
        <div className="row g-2">
          <div className="col-sm-6">
            <label className="form-label">{t('demo.input.label')}</label>
            <input className="form-control" placeholder={t('demo.input.placeholder')} />
            <div className="form-text">{t('demo.input.help')}</div>
          </div>
          <div className="col-sm-3 d-flex align-items-end">
            <button className="btn btn-primary w-100">{t('demo.button.submit')}</button>
          </div>
        </div>
      </section>

      <nav className="d-flex gap-2">
        <Link className="btn btn-outline-secondary" href={`/${locale}/customer`}>{t('links.customer')}</Link>
        <Link className="btn btn-outline-secondary" href={`/${locale}/admin`}>{t('links.admin')}</Link>
        <Link className="btn btn-outline-secondary" href={`/${locale}/waiter`}>{t('links.waiter')}</Link>
        <Link className="btn btn-outline-secondary" href={`/${locale}/kitchen`}>{t('links.kitchen')}</Link>
      </nav>
    </main>
  );
}