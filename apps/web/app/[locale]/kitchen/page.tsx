import Text from '../../../src/shared/ui/Text';
import {createTranslator} from 'next-intl';
import {allMessages} from '../../../src/i18n/messages';
import type {Locale} from '../../../src/i18n/locales';

type Props = {params: {locale: Locale}};

export default function KitchenPage({params: {locale}}: Props) {
  const t = createTranslator({locale, messages: allMessages[locale], namespace: 'kitchen'});

  return (
    <main className="container py-5">
      <Text as="h1" kind="h2" className="mb-3">{t('title')}</Text>
      <p className="text-body-secondary">{t('subtitle')}</p>
    </main>
  );
}