type WidgetRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: WidgetRouteContext,
) {
  const { slug } = await params;
  const script = `(() => {
  const id = "sysnotes-widget";
  let root = document.getElementById(id);
  if (!root) {
    root = document.createElement("div");
    root.id = id;
    document.currentScript?.parentNode?.insertBefore(root, document.currentScript.nextSibling) ?? document.body.appendChild(root);
  }

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  fetch("/${slug}/widget/data")
    .then((response) => (response.ok ? response.json() : Promise.reject()))
    .then((releases) => {
      root.innerHTML = '<ul style="font-family:inherit;color:inherit;list-style:none;padding:0;margin:0;">' +
        releases.map((release) =>
          '<li style="margin:0 0 12px 0;padding:0;">' +
            '<span style="display:inline-block;font-family:monospace;font-size:12px;margin-right:6px;">' + escapeHtml(release.version) + '</span>' +
            '<a style="font-size:14px;color:inherit;text-decoration:none;" href="' + escapeHtml(release.url) + '">' + escapeHtml(release.title) + '</a>' +
            '<span style="display:block;font-size:12px;opacity:0.62;margin-top:2px;">' + escapeHtml(release.date) + '</span>' +
          '</li>'
        ).join("") +
      "</ul>";
    })
    .catch(() => {});
})();`;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript",
    },
  });
}
