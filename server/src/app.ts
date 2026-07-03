import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

process.loadEnvFile();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use(
	cors({
		credentials: true,
		origin: process.env.CLIENT_URL,
	}),
);

app.listen(PORT, () => {
	console.log(`Сервер успешно запущен на http://localhost:${PORT}`);
});
