import crypto from "crypto";
import { validateCpf } from "../validations/validateCpf";
import dbCredentials from "../db/dbCredentials";
import pgp from "pg-promise";
import Account from "../objects/acount";
import pg from "pg-promise/typescript/pg-subset";

export default async function (req: any, res: any) {
	const account = req.body;
	const connection = pgp()(dbCredentials);
	try {
		let errNumber = await verifyIfInsertIsValid(connection, { ...account });
		if (typeof errNumber === 'number') res.status(422).json({ message: errNumber });
		else {
			let response = await insertAccount(connection, { ...account });
			res.json(response);
		}
	} finally { await connection.$pool.end(); }
}

async function verifyIfInsertIsValid(connection: pgp.IDatabase<{}, pg.IClient>, body: Account): Promise<number | null> {
	const [acc] = await connection.query("select * from ccca.account where email = $1", [body.email]);
	if (acc) return -4;
	else if (!validateFormat(body.name, /[a-zA-Z] [a-zA-Z]+/)) return -3;
	else if (!validateFormat(body.email, /^(.+)@(.+)$/)) return -2;
	else if (!validateCpf(body.cpf.toString())) return -1;
	else if (body.isDriver && !validateFormat(body.carPlate, /[A-Z]{3}[0-9]{4}/)) return -5;
	else return null;
}

function validateFormat(text: String, regex: RegExp): RegExpMatchArray | null {
	return text.match(regex);
}

async function insertAccount(connection: pgp.IDatabase<{}, pg.IClient>, body: Account): Promise<{ accountId: `${string}-${string}-${string}-${string}-${string}`; }> {
	const id = crypto.randomUUID();
	await connection.query("insert into ccca.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, password) values ($1, $2, $3, $4, $5, $6, $7, $8)", [id, body.name, body.email, body.cpf, body.carPlate, body.isPassenger, body.isDriver, body.password]);
	return { accountId: id };
}