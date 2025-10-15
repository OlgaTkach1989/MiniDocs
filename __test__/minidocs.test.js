const fs = require("fs");

const path = require("path");

const { build, listMarkdownFiles, baseTemplate } = require("../index.js");



function setupTempContent() {

  // kleiner Test-Content

  fs.rmSync("content", { recursive: true, force: true });

  fs.rmSync("dist", { recursive: true, force: true });

  fs.mkdirSync("content", { recursive: true });

  fs.writeFileSync("content/a.md", "# Titel A\n\n**Hallo**");

  fs.writeFileSync("content/b.md", "# Titel B\n\nText");

  fs.writeFileSync("content/ignore.txt", "kein markdown");

}



beforeAll(() => {

  // einfache Config sicherstellen

  fs.writeFileSync("config.json", JSON.stringify({

    siteTitle: "MiniDocs Test",

    contentDir: "content",

    outDir: "dist",

    theme: "light",

    port: 3000

  }, null, 2));

});



test("listMarkdownFiles: nur .md Dateien", () => {

  setupTempContent();

  const files = listMarkdownFiles("content");

  expect(files.every(f => f.endsWith(".md"))).toBe(true);

  expect(files.length).toBe(2);

});



test("build: erzeugt HTML und index.html", () => {

  setupTempContent();

  build();

  expect(fs.existsSync(path.join("dist", "index.html"))).toBe(true);

  const a = fs.readFileSync(path.join("dist", "a.html"), "utf8");

  expect(a).toMatch(/<strong>Hallo<\/strong>/); // Markdown → HTML

});



test("baseTemplate: Navigation wird eingefügt", () => {

  const html = baseTemplate({

    siteTitle: "X",

    pageTitle: "Y",

    navHtml: '<a href="a.html">A</a>',

    contentHtml: "<h2>Hi</h2>"

  });

  expect(html).toMatch(/<nav>.*a\.html.*<\/nav>/s);

});



