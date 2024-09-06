import express from "express";
import signup from "./services/signup";
import getAccount from "./services/getAccount";

const app = express();
const PORT = 3000;

app.use(express.json());
app.post('/signup', signup);
app.get('/acccount/:id', getAccount);
app.listen(PORT, () => console.log(`Sistema rodando na porta ${PORT}`));

export default app;