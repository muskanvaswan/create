import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-ink-900">
      <div className="grid-backdrop absolute inset-0" aria-hidden="true" />
      <div className="container-page relative flex min-h-[60vh] flex-col items-start justify-center py-24">
        <p className="eyebrow text-brand-300">
          <span className="h-px w-6 bg-brand-400/60" />
          404
        </p>
        <h1 className="heading-xl mt-4 max-w-xl text-white">
          We could not find that page
        </h1>
        <p className="mt-5 max-w-lg text-lg text-ink-200">
          The link may be out of date. Start from the services overview, or get
          in touch and we will point you to the right place.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button href="/services" withArrow>
            Browse services
          </Button>
          <Button href="/contact-us" variant="ghost">
            Contact us
          </Button>
        </div>
      </div>
    </section>
  );
}
