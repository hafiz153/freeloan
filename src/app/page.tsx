'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n';

export default function Home() {
  const t = useT();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white mb-6">
              {t('landing.badge')}
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
              {t('landing.heroTitle')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                {t('landing.heroTitleHighlight')}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('landing.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register?role=donor"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {t('landing.startDonating')}
              </Link>
              <Link
                href="/register?role=borrower"
                className="inline-flex items-center px-8 py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-400 transition-all border border-blue-400"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('landing.applyForLoan')}
              </Link>
            </div>
            <p className="mt-6 text-blue-200 text-sm">{t('landing.noHiddenFees')}</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: t('landing.statDonors'), value: '500+' },
              { label: t('landing.statLoans'), value: '2,000+' },
              { label: t('landing.statFunds'), value: '৳5Cr+' },
              { label: t('landing.statRepayment'), value: '98%' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t('landing.howItWorks')}</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              {t('landing.howItWorksSub')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: t('landing.step1Title'),
                desc: t('landing.step1Desc'),
                color: 'bg-blue-100 text-blue-600',
              },
              {
                step: '02',
                title: t('landing.step2Title'),
                desc: t('landing.step2Desc'),
                color: 'bg-green-100 text-green-600',
              },
              {
                step: '03',
                title: t('landing.step3Title'),
                desc: t('landing.step3Desc'),
                color: 'bg-purple-100 text-purple-600',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${item.color} font-bold text-lg mb-5`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t('landing.whyChoose')}</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              {t('landing.whyChooseSub')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: t('landing.featureZeroInterest'), desc: t('landing.featureZeroInterestDesc'), icon: '💰' },
              { title: t('landing.featureFlexible'), desc: t('landing.featureFlexibleDesc'), icon: '🔄' },
              { title: t('landing.featureSecure'), desc: t('landing.featureSecureDesc'), icon: '🔒' },
              { title: t('landing.featureTransparency'), desc: t('landing.featureTransparencyDesc'), icon: '👁️' },
              { title: t('landing.featureKYC'), desc: t('landing.featureKYCDesc'), icon: '✓' },
              { title: t('landing.featureDashboard'), desc: t('landing.featureDashboardDesc'), icon: '📊' },
            ].map((feature) => (
              <div key={feature.title} className="group p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                <span className="text-3xl mb-4 block">{feature.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Model */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-10 md:p-14">
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">The FreeLoan Model</span>
                <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-6">
                  {t('landing.loanModelTitle')}
                </h2>
                <ul className="space-y-4">
                  {[
                    'You borrow ৳10,000 at 0% interest',
                    'Monthly 1% service charge applies only on the remaining balance',
                    'Repay any amount — early or on schedule, no penalty',
                    'Your payment first covers the service charge, then reduces principal',
                  ].map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-gray-600">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-10 md:p-14 text-white flex flex-col justify-center">
                <p className="text-blue-200 text-sm font-medium uppercase tracking-wider">Example Calculation</p>
                <p className="text-4xl font-bold mt-2">৳10,000</p>
                <p className="text-blue-100 mt-1">{t('landing.exampleLoan')} 12 {t('landing.exampleFor')}</p>
                <div className="mt-8 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">{t('landing.totalServiceCharge')}</span>
                    <span className="font-semibold">~৳650</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">{t('landing.totalRepayable')}</span>
                    <span className="font-semibold">~৳10,650</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">{t('landing.vsTraditional')}</span>
                    <span className="font-semibold">~৳12,662</span>
                  </div>
                  <div className="pt-4 border-t border-blue-500 flex justify-between">
                    <span className="text-blue-200">{t('landing.youSave')}</span>
                    <span className="text-xl font-bold text-yellow-300">~৳2,012</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-xl mx-auto">
            {t('landing.ctaSub')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register?role=donor"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg"
            >
              {t('landing.becomeDonor')}
            </Link>
            <Link
              href="/register?role=borrower"
              className="inline-flex items-center px-8 py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-400 transition-all border border-blue-400"
            >
              {t('landing.applyForLoan')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-3">{t('common.appName')}</h3>
              <p className="text-sm leading-relaxed">
                {t('landing.footerDesc')}
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">{t('landing.quickLinks')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">{t('common.login')}</Link></li>
                <li><Link href="/register?role=donor" className="hover:text-white transition-colors">{t('landing.startDonating')}</Link></li>
                <li><Link href="/register?role=borrower" className="hover:text-white transition-colors">{t('landing.applyForLoan')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">{t('landing.contact')}</h4>
              <ul className="space-y-2 text-sm">
                <li>support@freeloan.com</li>
                <li>Dhaka, Bangladesh</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">
            &copy; {new Date().getFullYear()} {t('common.appName')}. {t('landing.allRights')}.
          </div>
        </div>
      </footer>
    </div>
  );
}
