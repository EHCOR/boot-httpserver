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
app.use(middlewareErrorHandler);
function handleValidateChirp(req, res, next) {
    let maxLength = 140;
    try {
        const data = req.body;
        if (data.body.length > maxLength) {
            // res.status(400).send({ error: "Chirp is too long"});
            // return;
            next(new BadRequestError("Chirp is too long. Max length is 140"));
        }
        else {
            let orgBody = data.body.split(" ");
            let words = data.body.toLowerCase().split(" ");
            if (words.includes("kerfuffle") || words.includes("sharbert") || words.includes("fornax")) {
                for (let nword in words) {
                    if (words[nword] === "kerfuffle" || words[nword] === "sharbert" || words[nword] === "fornax") {
                        orgBody[nword] = "****";
                    }
                }
            }
            let responseBody = orgBody.join(" ");
            res.setHeader("Content-Type", "application/json");
            res.status(200).json({ cleanedBody: responseBody });
        }
    }
    catch (err) {
        next(err);
    }
}
function middlewareErrorHandler(err, req, res, next) {
    console.log(err);
    if (err instanceof BadRequestError) {
        res.status(400).json({ "error": err.message });
    }
    else if (err instanceof UnauthorizedError) {
        res.status(401).json({ "error": err.message });
    }
    else if (err instanceof ForbiddenError) {
        res.status(403).json({ "error": err.message });
    }
    else if (err instanceof NotFoundError) {
        res.status(404).json({ "error": err.message });
    }
    else {
        res.status(500).json({ "error": "Something went wrong on our end" });
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
class BadRequestError extends Error {
    constructor(message) {
        super(message);
    }
}
class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
    }
}
class ForbiddenError extends Error {
    constructor(message) {
        super(message);
    }
}
class NotFoundError extends Error {
    constructor(message) {
        super(message);
    }
}
