# Does this site legally need an Impressum?

Researched 18 October 2026. **This is a summary of published sources, not legal
advice.** The conclusion is a grey area and I say so rather than pretending it
resolves cleanly. If the answer has to be load-bearing, it is worth twenty
minutes of a Fachanwalt für IT-Recht.

## First, a correction

I referred to **§ 5 TMG** when I asked the question. That law is gone. The
**Digitale-Dienste-Gesetz (DDG)** replaced the Telemediengesetz on **14 May
2024**, and the obligation now sits at **§ 5 DDG**. Anything citing § 5 TMG today
is pre-May-2024 and worth re-checking for that reason alone.

One source gives 18 February 2024 for the DDG. That date is the EU Digital
Services Act becoming fully applicable (17 February 2024), which is a different
instrument; the German DDG entered into force on 14 May 2024. Flagged because
the two get conflated in exactly the articles a search returns first.

## The test is not profit

§ 5 DDG applies to **"geschäftsmäßige"** digital services. That word is the whole
question, and it does not mean profitable:

- **A profit motive is not required.** Several sources state this directly.
- **Earning nothing is not a defence.** "Geschäftsmäßig" turns on whether the
  service is offered on a sustained, planned basis, not on whether money
  arrives.
- **Courts read "purely private" narrowly.** A single advertising banner or an
  affiliate link has been enough for a court to treat a site as commercial.

Purely private presences are exempt, under both § 5 DDG and § 18 MStV: a hobby
site, a travel diary, a wedding page, a private social profile.

## Where this site falls

Genuinely uncertain. The honest version of the argument on both sides:

**Points towards needing one**

- Guidance aimed at exactly this case lists "portfolio, setcard or project
  pages" among the site types that can attract the obligation.
- The site presents professional capability and seeks paid work. That is an
  economic purpose even with nothing sold.
- **The thirteen articles at `/learn` are the strongest single factor**, and they
  are the one I would not have predicted. § 18 Abs. 2 MStV imposes a separate
  obligation on content that is **journalistisch-redaktionell**: a named person
  responsible for the content, with an address. A regularly updated body of
  written pieces on a professional subject is closer to that line than a CV is.
  This obligation is independent of § 5 DDG and is not escaped by being
  non-commercial.

**Points away from needing one**

- Nothing is offered for compensation. No goods, no services, no freelance
  engagement, no consulting.
- No advertising, no affiliate links, no monetisation of any kind. No tracking.
- The availability line reads "open to full-time roles", which is employment,
  not the provision of a service. Someone seeking a salaried job is not thereby
  a Diensteanbieter offering telemedia commercially.
- There is no CV download and no price list; the site is a record of past work.

**My reading.** A portfolio that advertises freelance availability clearly needs
one. This site advertises employment, which is weaker. But "purely private" is
read narrowly, and the `/learn` corpus pulls towards § 18 MStV regardless of the
commercial question. **The conservative choice is to publish one**, and the cost
of being wrong is asymmetric.

## What one would have to contain

Under **§ 5 Abs. 1 DDG**, for a natural person with no company, no register
entry and no regulated profession, only three items actually apply:

| Required | For this site |
|---|---|
| Name | Mohd Zamin Quadri |
| **Ladungsfähige Anschrift** | **A real street address. This is the problem.** |
| A means of rapid electronic contact, including email | mohdzaminquadri@gmail.com |
| Commercial register and number | Not applicable |
| Supervisory authority | Not applicable |
| VAT identification number | Only if one has actually been issued |

Plus, if the writing is treated as journalistic-editorial, **§ 18 Abs. 2 MStV**:
a named Verantwortlicher für den Inhalt **with an address**, which in practice is
the same address again.

### The address is the whole difficulty

- **It must be "ladungsfähig"**, meaning legal documents can be served there. A
  street name, house number, postcode and town.
- **A Postfach is explicitly not enough.** Nothing can be served on a PO box.
- **A c/o or rented business address is acceptable** if post genuinely reaches
  the operator. Services for this exist in Germany at roughly 5 to 15 EUR a
  month and are a normal arrangement, not a workaround.
- A published home address is **indexed by search engines and archived**. It
  cannot be meaningfully retracted later. For someone applying for jobs across
  Europe under their own name, that is a durable exposure, and it is the reason
  I am not filling it in.

## What omitting it actually risks

Not, realistically, a regulator. The realistic path is a competitor or an
Abmahnverein sending a cease-and-desist letter:

- **Abmahnung**: typically 500 to 2,000 EUR in costs, with a Streitwert usually
  between 1,000 and 5,000 EUR, higher on repeat.
- **Administrative fine**: up to 50,000 EUR under § 33 DDG. Very unlikely against
  a private individual's portfolio, but it is the ceiling the statute sets.
- A missing Impressum on a commercial site is also treated as an unfair
  commercial practice under § 3a UWG, which is what gives a competitor standing
  to send the letter in the first place.

For a site that sells nothing, the practical likelihood of either is low. It is
not zero, and it is the kind of letter that arrives without warning.

## The four options, plainly

1. **Rent a c/o business address and publish that.** Compliant, keeps the home
   address private, costs a few euros a month. **This is what I would do.**
2. **Publish the home address.** Compliant and free, permanently public.
3. **Publish no Impressum.** Defensible on the argument that the site is not
   geschäftsmäßig, weakened by `/learn` and by how narrowly courts read
   "private". Accepts the Abmahnung risk.
4. **Publish no Impressum and move the writing off this domain.** Strengthens
   the private-site position, at the cost of the thing on the site that most
   distinguishes it.

## What is built, pending your decision

`/impressum` exists and carries everything except the address, with the missing
line marked in the page itself rather than hidden. `/datenschutz` is complete and
needs no decision from you: the site sets no cookies, loads no third-party
resource, self-hosts its fonts and runs no analytics, so the privacy page is
largely a description of absences.
