type MediaRange = {
  mediaType: string;
  quality: number;
  order: number;
};

function parseAccept(header: string): MediaRange[] {
  return header
    .split(",")
    .map((part, order) => {
      const [rawMediaType, ...parameters] = part.trim().toLowerCase().split(";");
      if (!rawMediaType?.includes("/")) return null;

      const qualityParameter = parameters
        .map((parameter) => parameter.trim())
        .find((parameter) => parameter.startsWith("q="));
      const parsedQuality = qualityParameter
        ? Number.parseFloat(qualityParameter.slice(2))
        : 1;
      const quality = Number.isFinite(parsedQuality)
        ? Math.min(1, Math.max(0, parsedQuality))
        : 0;

      return { mediaType: rawMediaType, quality, order };
    })
    .filter((range): range is MediaRange => range !== null);
}

function qualityFor(ranges: MediaRange[], mediaType: string): number {
  const [type] = mediaType.split("/");
  const candidates = ranges
    .filter((range) =>
      range.mediaType === mediaType ||
      range.mediaType === `${type}/*` ||
      range.mediaType === "*/*",
    )
    .sort((a, b) => {
      const specificity = (range: MediaRange) =>
        range.mediaType === mediaType ? 2 : range.mediaType === `${type}/*` ? 1 : 0;
      return specificity(b) - specificity(a) || a.order - b.order;
    });

  return candidates[0]?.quality ?? 0;
}

/**
 * Markdown este o reprezentare opt-in. Un wildcard de browser nu este
 * suficient; clientul trebuie să ceară explicit `text/markdown`, iar q-value
 * nu poate fi zero sau mai mic decât preferința pentru HTML.
 */
export function prefersMarkdown(acceptHeader: string): boolean {
  const ranges = parseAccept(acceptHeader);
  const explicitlyRequestsMarkdown = ranges.some(
    (range) => range.mediaType === "text/markdown",
  );
  if (!explicitlyRequestsMarkdown) return false;

  const markdownQuality = qualityFor(ranges, "text/markdown");
  const htmlQuality = qualityFor(ranges, "text/html");
  return markdownQuality > 0 && markdownQuality >= htmlQuality;
}
