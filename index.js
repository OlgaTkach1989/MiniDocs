// index.js (CommonJS)

const fs = require("fs");

const path = require("path");

const { marked } = require("marked");




function readConfig() {

  const defaults = {

    siteTitle: "MiniDocs",

    contentDir: "content",

    outDir: "dist",

    theme: "light",

    port: 3000,

  };

  const cfgPath = path.join(process.cwd(), "config.json");

  if (fs.existsSync(cfgPath)) {

    try {

      const user = JSON.parse(fs.readFileSync(cfgPath, "utf8"));

      return { ...defaults, ...user };

    } catch {

      return defaults;

    }

  }

  return defaults;

}

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }




function listMarkdownFiles(dir) {

  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)

    .filter(f => f.toLowerCase().endsWith(".md"))

    .map(f => path.join(dir, f));

}



function baseTemplate({ siteTitle, pageTitle, navHtml, contentHtml }) {

  return `<!doctype html>

<html><head>

<meta charset="utf-8"/>

<title>${pageTitle ? pageTitle + " – " : ""}${siteTitle}</title>

<meta name="viewport" content="width=device-width,initial-scale=1"/>

<style>body{max-width:900px;margin:40px auto;padding:0 20px;font:16px/1.6 system-ui,sans-serif}nav a{margin-right:12px}</style>

</head><body>

<header><h1>${siteTitle}</h1></header>

<nav>${navHtml || ""}</nav>

<main>${contentHtml || ""}</main>

</body></html>`;

}



function build() {

  const { siteTitle, contentDir, outDir } = readConfig();

  ensureDir(outDir);



  const mdFiles = listMarkdownFiles(contentDir);

  const navHtml = mdFiles.map(p => {

    const name = path.basename(p, ".md");

    return `<a href="${name}.html">${name}</a>`;

  }).join(" ");



  mdFiles.forEach(p => {

    const md = fs.readFileSync(p, "utf8");

    const name = path.basename(p, ".md");

    const page = baseTemplate({

      siteTitle,

      pageTitle: name,

      navHtml,

      contentHtml: marked.parse(md),

    });

    fs.writeFileSync(path.join(outDir, `${name}.html`), page, "utf8");

  });



  const indexHtml = baseTemplate({

    siteTitle,

    pageTitle: "Index",

    navHtml,

    contentHtml: "<ul>" + mdFiles.map(p => {

      const name = path.basename(p, ".md");

      return `<li><a href="${name}.html">${name}</a></li>`;

    }).join("") + "</ul>",

  });

  fs.writeFileSync(path.join(outDir, "index.html"), indexHtml, "utf8");

  console.log("✅ Build fertig:", outDir);

}




if (require.main === module) {

  const cmd = process.argv[2];

  if (cmd === "build") {

    build();

  } else if (cmd === "serve") {

    console.log('Tipp: nutze "npm run serve" (http-server -p 3000 dist)');

  } else {

    console.log(`

Nutzung:

  node index.js build    # Markdown -> HTML

  npm run serve          # lokalen Server starten

`);


  }

}



module.exports = { build, listMarkdownFiles, baseTemplate };

