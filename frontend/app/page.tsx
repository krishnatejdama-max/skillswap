import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Users, RefreshCcw } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4">
      <section className="py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Zap className="h-4 w-4" />
          Skill bartering, reinvented
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Share what you know.<br />Learn what you need.
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
          SkillSwap connects people who want to trade skills — no money required.
          Offer what you're great at, and get help with what you're learning.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Get started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">Log in</Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-24">
        {[
          {
            icon: <Zap className="h-6 w-6 text-blue-500" />,
            title: 'List your skills',
            desc: 'Share what you can teach or offer to others in the community.',
          },
          {
            icon: <Users className="h-6 w-6 text-blue-500" />,
            title: 'Find matches',
            desc: 'Browse skills others are offering or wanting and find your perfect swap.',
          },
          {
            icon: <RefreshCcw className="h-6 w-6 text-blue-500" />,
            title: 'Swap & grow',
            desc: 'Send a swap request and start exchanging knowledge.',
          },
        ].map((f) => (
          <div key={f.title} className="text-center p-6 rounded-xl border bg-white">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
              {f.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
