import express from "express";
const app = express();
const PORT = 8080;
app.use("/app", express.static("./src/app"));
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
app.get("/healthz", handlerReadiness);
function handlerReadiness(req, res) {
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send("OK");
}
