import express from "express";
const app = express();
const PORT = 8080;
const config = {
    fileserverHits: 0,
};
app.use(middlewareLogResponses);
app.use(middlewareMetricsInc);
app.use(express.json());
app.use("/app", express.static("./src/app"));
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerServerHits);
app.post("/admin/reset", handlerServerReset);
app.post("/api/validate_chirp", handleValidateChirp);
function handleValidateChirp(req, res) {
    let maxLength = 140;
    try {
        const data = req.body;
        if (data.body.length > maxLength) {
            res.status(400).send({ error: "Chirp is too long" });
            return;
        }
        else {
            res.setHeader("Content-Type", "application/json");
            res.status(200).json({ valid: true });
        }
    }
    catch (err) {
        res.status(400).send({ error: "Something went wrong" });
        return;
    }
}
function middlewareLogResponses(req, res, next) {
    res.on("finish", () => {
        console.log(`[NON-OK] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
    });
    next();
}
function middlewareMetricsInc(req, res, next) {
    const isAppPath = req.path === "/app" || req.path.startsWith("/app/");
    if (isAppPath) {
        config.fileserverHits++;
    }
    next();
}
function handlerReadiness(req, res) {
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send("OK");
}
function handlerServerHits(req, res) {
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>`);
}
function handlerServerReset(req, res) {
    config.fileserverHits = 0;
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send("OK");
}
