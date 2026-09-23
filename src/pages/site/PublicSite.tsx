import { useState, type ReactNode } from "react";

import depotImg from "@/assets/depot.png";
import podImg from "@/assets/driver.png";
import corridorImg from "@/assets/corridor.png";
import cargoImg from "@/assets/cargo.png";
import heroTrikeImg from "@/assets/hero.png";
import { Icon, Logo, type IconName } from "@/components/Icon";
import { Badge, Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { Link, useRouter } from "@/router";
import { useStore } from "@/state/store";
import { cn } from "@/utils/cn";

const NAV = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Business Solutions", to: "/business-solutions" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Contact", to: "/contact" },
];

function SiteHeader() {
  const { path } = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="bg-ink text-white no-print">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-2">
          <span className="label text-white/60">Smart. Secure. Traceable.</span>
          <div className="hidden items-center gap-4 sm:flex">
            <Link to="/ops" className="label text-white/60 transition-colors hover:text-white">Operations</Link>
            <Link to="/driver" className="label text-white/60 transition-colors hover:text-white">Driver app</Link>
            <Link to="/portal" className="label text-white/60 transition-colors hover:text-white">Customer portal</Link>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur no-print">
        <div className="mx-auto flex min-h-[68px] max-w-[1240px] items-center justify-between gap-6 px-5">
          <Link to="/" className="flex items-center" aria-label="Easy Drop home">
            <Logo className="h-11 max-w-[170px]" />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "relative px-3 py-2 text-[13.5px] font-semibold transition-colors duration-150",
                  path === n.to ? "text-ink" : "text-slateink hover:text-ink",
                )}
              >
                {n.label}
                <span className={cn("absolute inset-x-3 bottom-0.5 h-[2px]", path === n.to ? "bg-jade" : "bg-transparent")} />
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:inline-flex">
              <Button size="sm" variant="secondary" icon="lock">Login</Button>
            </Link>
            <Link to="/ops">
              <Button size="sm" variant="primary" icon="dashboard">Open Demo</Button>
            </Link>
            <button
              className="grid h-9 w-9 place-items-center rounded-[3px] border border-ink/20 text-ink lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <Icon name={open ? "x" : "menu"} className="h-5 w-5" />
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-rule bg-paper px-5 py-2 lg:hidden" aria-label="Mobile">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block border-b border-rule py-3 text-[14px] font-semibold text-ink">
                {n.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="block py-3 text-[14px] font-semibold text-jade">Login</Link>
          </nav>
        )}
      </header>
    </>
  );
}
function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-navy-950 px-4 py-10 text-mist-300 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed">
            Professional, traceable last-mile delivery for South African businesses, built around a purpose-fit
            three-wheel delivery fleet.
          </p>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-jade">Smart. Secure. Traceable.</p>
        </div>
        <div>
          <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-white">Company</h3>
          <ul className="space-y-1.5 text-[13px]">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-white">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-white">Platform</h3>
          <ul className="space-y-1.5 text-[13px]">
            <li><Link to="/ops" className="hover:text-white">Operations Platform</Link></li>
            <li><Link to="/driver" className="hover:text-white">Driver Application</Link></li>
            <li><Link to="/portal" className="hover:text-white">Business Customer Portal</Link></li>
            <li><Link to="/login" className="hover:text-white">Demo Login</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-white">Operating area</h3>
          <p className="text-[13px] leading-relaxed">
            City Deep Hub, Johannesburg<br />
            Sandton · Rosebank · Randburg · Soweto · Midrand · Centurion · Pretoria
          </p>
          <p className="mt-3 text-[13px]">011 123 4500 · hello@easydrop.co.za</p>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-4 text-[11.5px] text-mist-300/70">
        © {new Date().getFullYear()} Easy Drop Logistics (Pty) Ltd. This is a product demonstration — all data, financials
        and telematics shown are simulated.
      </div>
    </footer>
  );
}

function Section({ children, className, tone = "light" }: { children: ReactNode; className?: string; tone?: "light" | "grey" | "navy" }) {
  return (
    <section className={cn("px-4 py-14 lg:px-8 lg:py-20", tone === "navy" ? "bg-navy-950 text-white" : tone === "grey" ? "bg-mist-100" : "bg-white", className)}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, intro, tone = "light" }: { eyebrow?: string; title: string; intro?: string; tone?: "light" | "navy" }) {
  return (
    <div className="mb-10 max-w-3xl">
      {eyebrow && <p className={cn("mb-2 text-[11.5px] font-bold uppercase tracking-[0.16em]", tone === "navy" ? "text-brand-400" : "text-brand-600")}>{eyebrow}</p>}
      <h2 className={cn("text-[26px] font-bold leading-tight tracking-tight lg:text-[34px]", tone === "navy" ? "text-white" : "text-navy-950")}>{title}</h2>
      {intro && <p className={cn("mt-3 text-[15px] leading-relaxed", tone === "navy" ? "text-mist-300" : "text-charcoal-500")}>{intro}</p>}
    </div>
  );
}

const SERVICES = [
  { icon: "package", name: "Standard Local Delivery", price: "from R30", desc: "Same-suburb and nearby-suburb parcel delivery on scheduled runs. Ideal for regular retail and pharmacy drops.", points: ["Up to 25 kg per parcel", "Next available route", "Tracked end-to-end"] },
  { icon: "route", name: "Extended Urban Delivery", price: "from R45", desc: "Cross-city deliveries between Johannesburg, Sandton, Midrand, Centurion and Pretoria corridors.", points: ["Longer distance bands", "Zone-based routing", "Live ETA updates"] },
  { icon: "zap", name: "Same-Day Priority", price: "from R75", desc: "Urgent parcels collected and delivered within the same working day, prioritised at the hub and on route.", points: ["Priority sorting", "First on the route", "Escalation on exceptions"] },
  { icon: "calendar", name: "Scheduled Dedicated Routes", price: "from R38", desc: "A fixed daily or weekly route built around your store network, branch list or customer cluster.", points: ["Fixed timing", "Predictable capacity", "Volume pricing"] },
  { icon: "refresh", name: "Reverse Logistics", price: "from R55", desc: "Returns, exchanges, recalls and collections brought back to your store, depot or our hub.", points: ["Collection proof", "Return to store or hub", "Condition notes"] },
  { icon: "truck", name: "Dedicated Vehicle + Driver", price: "on quotation", desc: "A branded vehicle and a named driver working only for your business during agreed operating hours.", points: ["Named driver", "Exclusive capacity", "Monthly contract"] },
];

const INDUSTRIES = [
  { icon: "grid", name: "E-commerce", desc: "Fulfil online orders the same day with tracked, proof-backed delivery that keeps customer service enquiries down.", use: "Daily collections from your fulfilment centre and multi-drop routes across Gauteng." },
  { icon: "briefcase", name: "Retail", desc: "Move stock between stores and deliver click-and-collect overflow straight to the customer's door.", use: "Inter-branch transfers plus last-mile from the closest store." },
  { icon: "shield", name: "Pharmacy", desc: "Time-sensitive, discreet scripts and chronic medication deliveries with recipient verification.", use: "Signature-on-delivery with photo proof and named-recipient rules." },
  { icon: "zap", name: "Restaurants", desc: "Catering orders and bulk meal deliveries during lunch and evening peaks.", use: "Priority windows, insulated cargo boxes and short-radius routing." },
  { icon: "leaf", name: "Grocers", desc: "Fresh and dry grocery baskets delivered within agreed windows in your trading area.", use: "Scheduled neighbourhood routes with per-order proof of delivery." },
  { icon: "hub", name: "Wholesale", desc: "Break-bulk deliveries to spaza shops, salons, kitchens and small traders.", use: "Fixed weekly routes with consolidated invoicing." },
  { icon: "building", name: "SMEs", desc: "Pay-as-you-go delivery for small businesses without the cost of running a vehicle.", use: "Book online, pay per delivery, track in the customer portal." },
  { icon: "users", name: "Corporate", desc: "Internal documents, IT equipment and office supplies moved between campuses and branches.", use: "Named driver options and monthly account billing." },
];

const WHY = [
  { icon: "lock", title: "Protected cargo", desc: "Parcels travel in an enclosed, lockable cargo compartment with load securing checks before departure." },
  { icon: "users", title: "Professional drivers", desc: "Vetted, trained and continuously assessed drivers with defensive driving and theft-awareness modules." },
  { icon: "signal", title: "Fleet visibility", desc: "Every vehicle is visible on the operations map with route, status and progress through the day." },
  { icon: "route", title: "Traceable deliveries", desc: "Each parcel carries a full event history from booking to delivery — nothing disappears into a gap." },
  { icon: "clipboard", title: "Proof of delivery", desc: "Signature, photo, time, location, driver and vehicle captured at the point of handover." },
  { icon: "pin", title: "Urban delivery capability", desc: "Compact vehicles suited to congested streets, tight complexes and high-density suburbs." },
  { icon: "wrench", title: "Maintenance discipline", desc: "Scheduled servicing, daily inspections and parts stock control keep availability high." },
  { icon: "shield", title: "Safety monitoring", desc: "Incidents, near misses and driving events are recorded and reviewed with corrective actions." },
];

const STEPS = [
  { n: "01", title: "BOOK", text: "Create a delivery in the customer portal or ask our operations team to capture it for you.", detail: "Pickup, recipient, parcel details, service level and delivery window are captured in under a minute." },
  { n: "02", title: "COLLECT", text: "A Easy Drop driver collects the parcel from your premises or our hub.", detail: "The parcel is scanned, sorted at City Deep Hub and loaded onto the correct route." },
  { n: "03", title: "DELIVER", text: "The parcel travels through its assigned route with live status updates.", detail: "You can see the driver, vehicle, route position and estimated arrival at any time." },
  { n: "04", title: "CONFIRM", text: "Proof of delivery is captured at the door and shared with you instantly.", detail: "Signature, photo, timestamp, location, driver and vehicle are stored against the delivery." },
];

/* ------------------------------ Pages ------------------------------ */

function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy-950">
        <img src={heroTrikeImg} alt="A Easy Drop three-wheel cargo delivery vehicle on a Johannesburg street" className="absolute inset-0 h-full w-full object-cover opacity-35" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/25" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.16em] text-brand-300">
            <Icon name="shield" className="h-3.5 w-3.5" /> Protected urban last mile
          </p>
          <h1 className="max-w-3xl text-[32px] font-bold leading-[1.1] tracking-tight text-white sm:text-[44px] lg:text-[56px]">
            Reliable delivery built for the way South African cities move.
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-mist-200 lg:text-[17px]">
            Easy Drop provides professional, traceable last-mile delivery for South African businesses using a
            purpose-built three-wheel delivery fleet.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/portal/create">
              <Button size="lg" variant="primary" icon="plus">
                Request a delivery
              </Button>
            </Link>
            <Link to="/business-solutions">
              <Button size="lg" variant="secondary" icon="briefcase">
                Business solutions
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="dark" icon="lock">
                Login
              </Button>
            </Link>
          </div>
          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-5 border-t border-white/15 pt-6 sm:grid-cols-4">
            {[
              ["386", "Deliveries today"],
              ["10", "Vehicles in the fleet"],
              ["15", "Professional drivers"],
              ["91%", "On-time performance"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="num text-[26px] font-bold text-white">{v}</dt>
                <dd className="text-[12.5px] text-mist-300">{l}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[11px] uppercase tracking-wider text-mist-300/70">Figures shown are from the live demo environment</p>
        </div>
      </section>

      <Section tone="grey">
        <SectionTitle eyebrow="How it works" title="Four simple steps from booking to proof of delivery" intro="No complicated onboarding, no logistics jargon. You book, we collect, we deliver, you get proof." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <Card key={s.n} className="p-5">
              <span className="num text-[30px] font-bold text-brand-500">{s.n}</span>
              <h3 className="mt-1 text-[17px] font-bold tracking-tight text-navy-950">{s.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-charcoal-500">{s.text}</p>
            </Card>
          ))}
        </div>
        <div className="mt-6">
          <Link to="/how-it-works">
            <Button variant="secondary" icon="arrowRight">
              See the full delivery journey
            </Button>
          </Link>
        </div>
      </Section>

      <Section>
        <SectionTitle eyebrow="Services" title="Delivery options for the way your business actually works" intro="Choose per delivery, or build a scheduled route around your branches and customers." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.slice(0, 6).map((s) => (
            <Card key={s.name} className="flex flex-col p-5">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-50 text-brand-600">
                <Icon name={s.icon as IconName} className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-[15.5px] font-bold text-navy-950">{s.name}</h3>
              <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-charcoal-500">{s.desc}</p>
              <p className="mt-3 text-[13px] font-bold text-brand-700">{s.price}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="navy">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle tone="navy" eyebrow="Why Easy Drop" title="Built for protected, traceable urban delivery" intro="Three-wheel vehicles are well suited to dense urban streets. They are operated with the same discipline you would expect from any professional fleet — inspections, maintenance, training and incident review." />
            <div className="grid gap-4 sm:grid-cols-2">
              {WHY.slice(0, 6).map((w) => (
                <div key={w.title} className="flex gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand-500/15 text-brand-400">
                    <Icon name={w.icon as IconName} className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-[14px] font-semibold text-white">{w.title}</h3>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-mist-300">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <img src={depotImg} alt="Easy Drop delivery vehicles being loaded at the City Deep depot" className="w-full rounded-lg border border-white/10 object-cover shadow-2xl" loading="lazy" />
        </div>
      </Section>

      <Section tone="grey">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <img src={podImg} alt="A Easy Drop driver capturing proof of delivery from a customer" className="w-full rounded-lg object-cover shadow-lg" loading="lazy" />
          <div>
            <SectionTitle eyebrow="One connected platform" title="Every delivery is visible to everyone who needs it" intro="Operations, dispatchers, drivers and your own team all work off the same live information — so nobody has to phone around to find a parcel." />
            <ul className="space-y-3">
              {[
                ["Operations Platform", "Dashboard, dispatch, routes, fleet, safety, KPIs and finance in one place.", "/ops"],
                ["Driver Application", "Mobile-first app for inspections, route stops, deliveries and proof of delivery.", "/driver"],
                ["Business Customer Portal", "Book deliveries, track parcels, download proof of delivery and view reports.", "/portal"],
              ].map(([title, desc, to]) => (
                <li key={title}>
                  <Link to={to} className="flex items-start gap-3 rounded-lg border border-mist-200 bg-white p-4 transition-colors hover:border-brand-300">
                    <Icon name="chevronRight" className="mt-0.5 h-4 w-4 text-brand-600" />
                    <span>
                      <span className="block text-[14.5px] font-semibold text-navy-950">{title}</span>
                      <span className="block text-[13px] text-charcoal-500">{desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl bg-navy-950 p-8 lg:flex-row lg:items-center lg:p-12">
          <div>
            <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-brand-400">Delivering a smarter tomorrow</p>
            <h2 className="mt-2 max-w-xl text-[24px] font-bold leading-tight text-white lg:text-[30px]">
              Ready to move your parcels with a fleet you can actually see?
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact">
              <Button size="lg" variant="primary" icon="send">
                Talk to our team
              </Button>
            </Link>
            <Link to="/portal/create">
              <Button size="lg" variant="secondary" icon="package">
                Request a delivery
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

function About() {
  return (
    <>
      <PageHero title="About Easy Drop" text="A South African last-mile delivery company built around a simple idea: small, purpose-fit vehicles, run with professional fleet discipline, moving parcels through busy cities reliably." />
      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionTitle eyebrow="Who we are" title="Last-mile delivery designed for Gauteng streets" />
            <div className="space-y-4 text-[14.5px] leading-relaxed text-charcoal-500">
              <p>
                Easy Drop operates a fleet of enclosed three-wheel cargo vehicles from our hub in City Deep, Johannesburg.
                We collect from business customers, sort at the hub and deliver across Johannesburg, Sandton, Rosebank,
                Randburg, Roodepoort, Soweto, Midrand, Centurion and Pretoria.
              </p>
              <p>
                Our vehicles are compact and economical to run, which means we can serve dense suburbs, tight complexes
                and CBD streets at a lower cost per delivery than a light commercial vehicle — while still carrying a
                meaningful parcel load in a protected, lockable compartment.
              </p>
              <p>
                Everything we do is recorded on one platform. A parcel is never "somewhere on a van". It has a driver, a
                vehicle, a route, a status and a proof of delivery.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Founded", "2023"],
                ["Hub", "City Deep, Johannesburg"],
                ["Fleet", "10 three-wheel cargo vehicles"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-mist-200 bg-mist-50 p-4">
                  <p className="text-[11.5px] font-bold uppercase tracking-wide text-charcoal-400">{k}</p>
                  <p className="mt-1 text-[15px] font-semibold text-navy-950">{v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-[15px] font-bold text-navy-950">Our positioning</h3>
              <p className="mt-2 text-[13.5px] text-charcoal-500">Smart. Secure. Traceable.</p>
              <ul className="mt-3 space-y-2 text-[13.5px] text-charcoal-500">
                <li className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 text-brand-600" /> Smart routing around delivery zones</li>
                <li className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 text-brand-600" /> Secure, enclosed cargo compartments</li>
                <li className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 text-brand-600" /> Traceable events on every parcel</li>
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="text-[15px] font-bold text-navy-950">Safety statement</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-charcoal-500">
                Three-wheel vehicles are well suited to urban delivery, but like any road vehicle they carry real road
                risk. We manage that risk actively with daily inspections, driver training, speed and load discipline,
                route planning and a blame-free near-miss reporting culture. We do not claim that our vehicles eliminate
                accident or rollover risk.
              </p>
            </Card>
          </div>
        </div>
      </Section>
      <Section tone="grey">
        <SectionTitle eyebrow="Why Easy Drop" title="What we hold ourselves to" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w) => (
            <Card key={w.title} className="p-5">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-50 text-brand-600">
                <Icon name={w.icon as IconName} className="h-4.5 w-4.5" />
              </span>
              <h3 className="mt-3 text-[14.5px] font-bold text-navy-950">{w.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-charcoal-500">{w.desc}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}

function ServicesPage() {
  return (
    <>
      <PageHero title="Services" text="Six delivery products covering everyday local drops, cross-city runs, urgent parcels, fixed routes, returns and dedicated capacity." />
      <Section>
        <div className="grid gap-5 lg:grid-cols-2">
          {SERVICES.map((s) => (
            <Card key={s.name} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-navy-950 text-brand-400">
                  <Icon name={s.icon as IconName} className="h-5 w-5" />
                </span>
                <Badge tone="success">{s.price}</Badge>
              </div>
              <h3 className="mt-3 text-[17px] font-bold text-navy-950">{s.name}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-charcoal-500">{s.desc}</p>
              <ul className="mt-3 space-y-1.5">
                {s.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-[13px] text-charcoal-700">
                    <Icon name="check" className="h-4 w-4 text-brand-600" /> {p}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <div className="mt-8 rounded-lg border border-mist-200 bg-mist-50 p-5">
          <h3 className="text-[15px] font-bold text-navy-950">Pricing approach</h3>
          <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-charcoal-500">
            Pricing is per delivery and depends on distance band, service level and monthly volume. Typical local
            deliveries fall between R30 and R125. Contracted customers receive volume rates and monthly invoicing.
            Indicative pricing shown here is for demonstration purposes.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/contact"><Button variant="primary" icon="send">Request a quotation</Button></Link>
            <Link to="/portal/create"><Button variant="secondary" icon="package">Book a delivery now</Button></Link>
          </div>
        </div>
      </Section>
    </>
  );
}

function BusinessSolutions() {
  return (
    <>
      <PageHero title="Business Solutions" text="Delivery built around how your industry actually operates — from pharmacy scripts to wholesale drops in the townships." />
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {INDUSTRIES.map((i) => (
            <Card key={i.name} className="p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-50 text-brand-600">
                  <Icon name={i.icon as IconName} className="h-5 w-5" />
                </span>
                <h3 className="text-[16.5px] font-bold text-navy-950">{i.name}</h3>
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-charcoal-500">{i.desc}</p>
              <p className="mt-3 rounded-md border border-mist-200 bg-mist-50 px-3 py-2 text-[12.5px] text-charcoal-700">
                <span className="font-semibold text-navy-950">Typical use: </span>
                {i.use}
              </p>
            </Card>
          ))}
        </div>
      </Section>
      <Section tone="navy">
        <SectionTitle tone="navy" eyebrow="What you get" title="Every business account includes" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Customer portal", "Book, track and download proof of delivery yourself."],
            ["Account management", "A named contact for day-to-day operational questions."],
            ["Monthly reporting", "Volume, on-time, first-attempt and exception reporting."],
            ["Service level targets", "Agreed on-time targets tracked against actual performance."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-lg border border-white/10 bg-white/5 p-5">
              <h3 className="text-[14.5px] font-bold text-white">{t}</h3>
              <p className="mt-1.5 text-[13px] text-mist-300">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link to="/portal"><Button size="lg" variant="primary" icon="briefcase">Open the customer portal demo</Button></Link>
        </div>
      </Section>
    </>
  );
}

function HowItWorks() {
  return (
    <>
      <PageHero title="How It Works" text="From the moment a delivery is booked to the moment proof of delivery lands in your portal." />
      <Section>
        <div className="space-y-6">
          {STEPS.map((s, i) => (
            <div key={s.n} className="grid gap-5 rounded-lg border border-mist-200 bg-white p-6 lg:grid-cols-[110px_1fr_1fr]">
              <span className="num text-[40px] font-bold leading-none text-brand-500">{s.n}</span>
              <div>
                <h3 className="text-[20px] font-bold tracking-tight text-navy-950">{s.title}</h3>
                <p className="mt-1.5 text-[14px] text-charcoal-500">{s.text}</p>
              </div>
              <p className="self-center rounded-md bg-mist-50 px-4 py-3 text-[13px] leading-relaxed text-charcoal-700">{s.detail}</p>
              {i < 0 && <div />}
            </div>
          ))}
        </div>
      </Section>
      <Section tone="grey">
        <SectionTitle eyebrow="Behind the scenes" title="What happens inside the hub" intro="Every parcel moves through a controlled sequence so nothing is lost between collection and delivery." />
        <ol className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {["Received", "Scanned", "Sorted", "Assigned", "Loaded", "Dispatched"].map((stage, i) => (
            <li key={stage} className="rounded-lg border border-mist-200 bg-white p-4">
              <span className="num text-[12px] font-bold text-brand-600">STEP {i + 1}</span>
              <p className="mt-1 text-[14.5px] font-semibold text-navy-950">{stage}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["For your team", "Book deliveries and watch them progress without phoning anyone.", "/portal", "briefcase"],
            ["For our drivers", "A guided mobile app: inspect, load, deliver, capture proof.", "/driver", "truck"],
            ["For our controllers", "A live dashboard of deliveries, fleet, safety and performance.", "/ops", "dashboard"],
          ].map(([t, d, to, icon]) => (
            <Link key={t} to={to} className="rounded-lg border border-mist-200 bg-white p-5 transition-colors hover:border-brand-300">
              <Icon name={icon} className="h-5 w-5 text-brand-600" />
              <h3 className="mt-2 text-[15px] font-bold text-navy-950">{t}</h3>
              <p className="mt-1 text-[13px] text-charcoal-500">{d}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700">
                Open demo <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}

function Contact() {
  const { toast } = useStore();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", business: "", email: "", phone: "", industry: "Retail", volume: "Under 100", message: "" });
  return (
    <>
      <PageHero title="Contact" text="Tell us what you need to move and we will come back with a delivery plan and pricing." />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <Card className="p-6">
            <h2 className="text-[18px] font-bold text-navy-950">Request a quotation</h2>
            <p className="mt-1 text-[13.5px] text-charcoal-500">This demo form does not send an email — it confirms on screen.</p>
            <form
              className="mt-5 grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
                toast({ tone: "success", title: "Enquiry captured", message: "A consultant would normally contact you within one working day." });
              }}
            >
              <Field label="Your name" required><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Business name" required><Input required value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} /></Field>
              <Field label="Email" required><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="Phone" required><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="Industry">
                <Select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} options={INDUSTRIES.map((i) => ({ value: i.name, label: i.name }))} />
              </Field>
              <Field label="Monthly delivery volume">
                <Select value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })} options={["Under 100", "100 – 500", "500 – 1 500", "1 500 – 3 000", "3 000+"].map((v) => ({ value: v, label: v }))} />
              </Field>
              <Field label="What do you need to move?" className="sm:col-span-2">
                <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Parcel types, areas, times of day, any special handling" />
              </Field>
              <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                <Button type="submit" variant="primary" icon="send">Send enquiry</Button>
                {sent && (
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700">
                    <Icon name="check" className="h-4 w-4" /> Thank you — enquiry captured in the demo.
                  </span>
                )}
              </div>
            </form>
          </Card>
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-[15px] font-bold text-navy-950">Operations hub</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-charcoal-500">
                City Deep Hub<br />Heidelberg Road, City Deep<br />Johannesburg, Gauteng
              </p>
              <p className="mt-3 text-[13.5px] text-charcoal-700">011 123 4500</p>
              <p className="text-[13.5px] text-charcoal-700">hello@easydrop.co.za</p>
              <p className="mt-3 text-[12.5px] text-charcoal-400">Operating hours 06:00 – 18:00, Monday to Saturday</p>
            </Card>
            <Card className="p-5">
              <h3 className="text-[15px] font-bold text-navy-950">Delivery areas</h3>
              <ul className="mt-2 grid grid-cols-2 gap-1 text-[13px] text-charcoal-500">
                {["Johannesburg CBD", "Braamfontein", "Johannesburg South", "City Deep", "Sandton", "Rosebank", "Morningside", "Wynberg", "Parkhurst", "Randburg", "Roodepoort", "Soweto", "Midrand", "Centurion", "Pretoria"].map((s) => (
                  <li key={s} className="flex items-center gap-1.5"><Icon name="pin" className="h-3.5 w-3.5 text-brand-600" />{s}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}

function LoginPage() {
  const { navigate } = useRouter();
  const { dispatch } = useStore();
  const options = [
    { role: "OPERATIONS", title: "Operations Platform", desc: "Dashboard, dispatch, fleet, safety, KPIs and finance.", to: "/ops", icon: "dashboard", user: "john@easydrop.co.za" },
    { role: "DRIVER", title: "Driver Application", desc: "Inspections, route stops, deliveries and proof of delivery.", to: "/driver", icon: "truck", user: "thabo.mokoena@easydrop.co.za" },
    { role: "BUSINESS CUSTOMER", title: "Business Customer Portal", desc: "Book, track, download POD and view reports.", to: "/portal", icon: "briefcase", user: "logistics@abcretail.co.za" },
  ] as const;
  return (
    <section className="grid min-h-[calc(100vh-64px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy-950 lg:block">
        <img src={depotImg} alt="Easy Drop depot operations" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 to-navy-950/40" />
        <div className="relative flex h-full flex-col justify-end p-10">
          <Logo />
          <h2 className="mt-4 max-w-md text-[30px] font-bold leading-tight text-white">Delivering a smarter tomorrow.</h2>
          <p className="mt-2 max-w-md text-[14px] text-mist-300">
            One platform for operations, drivers and business customers — all working from the same live delivery data.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-mist-100 px-4 py-14">
        <div className="w-full max-w-md">
          <Badge tone="warning">Demo login — no password required</Badge>
          <h1 className="mt-3 text-[26px] font-bold tracking-tight text-navy-950">Choose how you want to sign in</h1>
          <p className="mt-1.5 text-[13.5px] text-charcoal-500">
            Authentication is simulated for this demonstration. Pick a role to enter that part of the platform.
          </p>
          <div className="mt-6 space-y-3">
            {options.map((o) => (
              <button
                key={o.role}
                onClick={() => {
                  dispatch({ type: "SET_SESSION", patch: { role: o.role } });
                  navigate(o.to);
                }}
                className="flex w-full items-center gap-4 rounded-lg border border-mist-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-brand-400 hover:bg-brand-50/40"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-navy-950 text-brand-400">
                  <Icon name={o.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-navy-950">{o.title}</span>
                  <span className="block text-[12.5px] text-charcoal-500">{o.desc}</span>
                  <span className="mt-1 block truncate text-[11.5px] text-charcoal-400">{o.user}</span>
                </span>
                <Icon name="chevronRight" className="h-5 w-5 text-charcoal-400" />
              </button>
            ))}
          </div>
          <Link to="/" className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-charcoal-500 hover:text-navy-950">
            <Icon name="chevronLeft" className="h-4 w-4" /> Back to website
          </Link>
        </div>
      </div>
    </section>
  );
}

function PageHero({ title, text }: { title: string; text: string }) {
  return (
    <section className="border-b border-rule bg-ink px-4 py-14 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-brand-400">Smart. Secure. Traceable.</p>
        <h1 className="mt-2 text-[30px] font-bold tracking-tight text-white lg:text-[40px]">{title}</h1>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-mist-300">{text}</p>
      </div>
    </section>
  );
}

export default function PublicSite({ page }: { page: string }) {
  return (
    <div className="public-site min-h-screen bg-paper">
      <SiteHeader />
      {page === "/" && <Home />}
      {page === "/about" && <About />}
      {page === "/services" && <ServicesPage />}
      {page === "/business-solutions" && <BusinessSolutions />}
      {page === "/how-it-works" && <HowItWorks />}
      {page === "/contact" && <Contact />}
      {page === "/login" && <LoginPage />}
      <SiteFooter />
    </div>
  );
}
