export type ReleaseBodyBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "heading";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    };

export type SysnotesRelease = {
  version: string;
  date: string;
  title: string;
  summary: string;
  tags: string[];
  body: ReleaseBodyBlock[];
};

export const releaseNotes: SysnotesRelease[] = [
  {
    version: "v2.4.0",
    date: "May 6, 2026",
    title: "Public changelog refresh",
    summary:
      "A cleaner release-note experience with grouped updates, clearer status labels, and faster scanning.",
    tags: ["Product", "UX", "Website"],
    body: [
      {
        type: "paragraph",
        text: "This release refreshes the public changelog experience around faster scanning, calmer hierarchy, and clearer release status. The page keeps the same editorial structure while giving each update more room to breathe.",
      },
      {
        type: "heading",
        text: "What changed",
      },
      {
        type: "list",
        items: [
          "Grouped release notes now share a consistent version, date, title, summary, and tag structure.",
          "Status labels and accent treatments are more visible without adding extra visual weight.",
          "The public layout uses larger reading surfaces, thin borders, and quieter supporting text.",
        ],
      },
      {
        type: "heading",
        text: "Why it matters",
      },
      {
        type: "paragraph",
        text: "Teams can publish product updates with less formatting effort, and readers can understand what changed without working through dense or mismatched release entries.",
      },
    ],
  },
  {
    version: "v2.3.2",
    date: "April 22, 2026",
    title: "Search quality improvements",
    summary:
      "Release entries now rank more naturally by title, version, and category relevance.",
    tags: ["Search", "Performance"],
    body: [
      {
        type: "paragraph",
        text: "Search now gives stronger priority to exact title matches, version references, and category relevance. The result set should feel more predictable when readers look for a specific release or topic.",
      },
      {
        type: "heading",
        text: "Ranking updates",
      },
      {
        type: "list",
        items: [
          "Version matches are weighted ahead of broad content matches.",
          "Release titles carry more influence in result ordering.",
          "Category tags help narrow broad searches without hiding relevant updates.",
        ],
      },
      {
        type: "paragraph",
        text: "These changes also reduce repeated scanning for editors who need to verify that an update is already documented.",
      },
    ],
  },
  {
    version: "v2.3.0",
    date: "April 8, 2026",
    title: "Team publishing workflow",
    summary:
      "Editors can stage web changes, preview drafts, and publish notes with more predictable review steps.",
    tags: ["Workflow", "Admin"],
    body: [
      {
        type: "paragraph",
        text: "The publishing workflow now gives teams a more deliberate path from draft to release. Editors can prepare changes, review the final presentation, and publish with clearer confidence.",
      },
      {
        type: "heading",
        text: "Editor workflow",
      },
      {
        type: "list",
        items: [
          "Draft release entries can be staged before they appear publicly.",
          "Preview steps make it easier to check date, title, summary, and tags together.",
          "Admin controls keep publishing actions separate from routine content editing.",
        ],
      },
      {
        type: "paragraph",
        text: "This release keeps the public changelog steady while improving the operational steps behind each published update.",
      },
    ],
  },
];

export function getReleasePath(version: string) {
  return `/releases/${version}`;
}

export function getReleaseByVersion(version: string) {
  return releaseNotes.find((release) => release.version === version) ?? null;
}

export function getReleaseNavigation(version: string) {
  const releaseIndex = releaseNotes.findIndex(
    (release) => release.version === version,
  );

  if (releaseIndex === -1) {
    return {
      previousRelease: null,
      nextRelease: null,
    };
  }

  return {
    previousRelease: releaseNotes[releaseIndex - 1] ?? null,
    nextRelease: releaseNotes[releaseIndex + 1] ?? null,
  };
}
