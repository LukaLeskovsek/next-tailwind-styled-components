const express = require("express");
const { createServer } = require("http");
const { join } = require("path");
const { parse } = require("url");
const compression = require("compression");
const next = require("next");
const nextI18NextMiddleware = require("next-i18next/middleware").default;
// const Cookies = require("universal-cookie");

const nextI18next = require("./i18n");

const port = process.env.PORT || 3000;
const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

app
	.prepare()
	.then(() => {
		const server = express();

		// Serve as GZIP
		server.use(compression());

		server.use(nextI18NextMiddleware(nextI18next));
		server.get("/service-worker.js", (req, res) => {
			const filePath = path.resolve("service-worker.js");
			// const filePath = join(__dirname, ".next", pathname);
			res.setHeader(
				"Cache-Control",
				"no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
			); // adding no-caching for service worker
			// Don't cache service worker is a best practice
			// Clients wont get emergency bug fixes etc.
			res.set("Content-Type", "application/javascript");
			// res.setHeader('Clear-Site-Data', 'cookies, cache'); // adding kill-switch during new deployment, if you want
			app.serveStatic(req, res, filePath);
		});
		server.get("*", (req, res) => handle(req, res));
		server.listen(port, err => {
			if (err) throw err;
			console.log(`> Ready on http://localhost:${port}`);
		});
	})
	.catch(err => {
		console.error(err.stack);
		process.exit(1);
	});
