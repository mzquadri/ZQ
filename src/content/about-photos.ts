/**
 * The photographs on the About page, and what each may be used for.
 *
 * Rights are a field here, not a convention, because three of these are the
 * subject's own and one is not, and the difference governs what the page is
 * allowed to do with it. A note in a commit message would not survive the next
 * person who wants to crop something.
 */

export interface AboutPhoto {
  src: string;
  alt: string;
  /** The caption a reader sees. Says where and when, not how it was made. */
  caption: string;
  width: number;
  height: number;
  /**
   * Shown under the photograph where a third party owns it. `undefined` means
   * the subject's own photograph with no external claim found.
   */
  credit?: string;
  /**
   * False where the licence requires the whole item to be reproduced. The page
   * must not crop these, and `object-fit: cover` is a crop.
   */
  croppable: boolean;
}

export const aboutPhotos: readonly AboutPhoto[] = [
  {
    src: "/media/about/munich-bmw-welt.webp",
    alt: "Seated on a bench at dusk in Munich, with BMW Welt and the Olympiaturm behind.",
    caption: "Munich, during the TUM years.",
    width: 960,
    height: 1280,
    croppable: true,
  },
  {
    src: "/media/about/munich-snow.webp",
    alt: "Outdoors in Munich during snowfall, snow in the hair, looking off camera.",
    caption: "A Munich winter.",
    width: 1280,
    height: 1280,
    croppable: true,
  },
  {
    src: "/media/about/strasbourg.webp",
    alt: "On the river Ill in Strasbourg in summer, half-timbered houses and tour boats behind.",
    caption: "Strasbourg, June 2023, for the European Youth Event.",
    width: 960,
    height: 1280,
    croppable: true,
  },
  {
    /*
     * The one photograph here that is not his.
     *
     * From the European Parliament's "Faces of Together.eu" album, shot at
     * EYE 2023. The Parliament's terms require the entire item to be reproduced
     * and the source acknowledged, and the exact licence badge on this photo is
     * unread because Flickr blocks automated fetches. So: resized, never
     * cropped, credited in the page, and `croppable: false` so the CSS cannot
     * quietly crop it with `object-fit: cover`.
     */
    src: "/media/about/eye-2023-parliament.webp",
    alt: "Studio portrait taken at the European Youth Event 2023 in Strasbourg, on a white background.",
    caption: "Taken at the European Youth Event 2023, at the Parliament in Strasbourg.",
    width: 800,
    height: 1200,
    credit: "European Union 2023, source: EP, Faces of Together.eu",
    croppable: false,
  },
] as const;
