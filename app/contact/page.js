export const metadata = {
  title: 'Contact',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="text-gray-300 mb-4">Have questions or feedback? Reach out to us anytime.</p>
      <div className="space-y-2 text-gray-400">
        <p>Email: support@bestprn.com</p>
        <p>Business: business@bestprn.com</p>
      </div>
    </div>
  )
}
