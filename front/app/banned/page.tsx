'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserState } from '@/types/enums';
import { Phone, Mail, AlertTriangle, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function BannedPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (user && user.state !== UserState.BANNED) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (user && user.state !== UserState.BANNED) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-orange-50 to-red-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header avec icône d'alerte */}
          <div className="bg-linear-to-r from-red-600 to-orange-600 px-8 py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4"
            >
              <AlertTriangle className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('banned.title')}
            </h1>
            <p className="text-red-100 text-lg">
              {t('banned.subtitle')}
            </p>
          </div>

          {/* Contenu principal */}
          <div className="px-8 py-10">
            <div className="space-y-6">
              {/* Message d'explication */}
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-red-900 mb-2">
                  {t('banned.accountSuspended')}
                </h2>
                <p className="text-red-700 leading-relaxed">
                  {t('banned.explanation')}
                </p>
              </div>

              {/* Actions effectuées */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('banned.actionsPerformed')}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{t('banned.action1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{t('banned.action2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{t('banned.action3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{t('banned.action4')}</span>
                  </li>
                </ul>
              </div>

              {/* Informations sur la réactivation */}
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">
                  {t('banned.reactivationInfo')}
                </h3>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{t('banned.reactivation1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{t('banned.reactivation2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{t('banned.reactivation3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{t('banned.reactivation4')}</span>
                  </li>
                </ul>
              </div>

              {/* Informations de contact */}
              <div className="border-2 border-blue-200 bg-blue-50 p-6 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  {t('banned.contactUs')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-blue-800">
                    <Phone className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{t('banned.phone')}</p>
                      <a
                        href="tel:+33123456789"
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        +33 1 23 45 67 89
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-blue-800">
                    <Mail className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{t('banned.email')}</p>
                      <a
                        href="mailto:support@avenir-bank.fr"
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        support@avenir-bank.fr
                      </a>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-blue-700 mt-4">
                  {t('banned.supportHours')}
                </p>
              </div>

              {/* Bouton de déconnexion */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                {t('banned.logout')}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6 text-sm">
          {user ? `${t('banned.reference')}: ${user.id.substring(0, 8).toUpperCase()}` : t('banned.reference')}
        </p>
      </motion.div>
    </div>
  );
}
