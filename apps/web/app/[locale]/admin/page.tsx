import Text from '../../../src/shared/ui/Text';
import dynamic from 'next/dynamic';
import {createTranslator} from 'next-intl';
import {allMessages} from '../../../src/i18n/messages';
import type {Locale} from '../../../src/i18n/locales';

const IconManager = dynamic(() => import('./IconManager'), {ssr: false});

type Props = {params: {locale: Locale}};

export default function AdminPage({params: {locale}}: Props) {
  const t = createTranslator({locale, messages: allMessages[locale], namespace: 'admin'});

  return (
    <main className="container py-5">
      <Text as="h1" kind="h2" className="mb-3">{t('title')}</Text>
      <p className="text-body-secondary mb-4">{t('subtitle')}</p>
      <IconManager />
    </main>
  );
}