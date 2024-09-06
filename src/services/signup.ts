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
	return verifyDataFormat(body);
}

async function insertAccount(connection: pgp.IDatabase<{}, pg.IClient>, body: Account): Promise<{ accountId: `${string}-${string}-${string}-${string}-${string}`; }> {
	const id = crypto.randomUUID();
	await connection.query("insert into ccca.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, password) values ($1, $2, $3, $4, $5, $6, $7, $8)", [id, body.name, body.email, body.cpf, body.carPlate, body.isPassenger, body.isDriver, body.password]);
	return { accountId: id };
}

async function verifyDataFormat(body: Account): Promise<number | null> {
	if (!validateName(body.name)) return -3;
	if (!validateEmail(body.email)) return -2;
	if (!validateCpf(body.cpf.toString())) return -1;
	if (!validateCarPlate(body.carPlate, body.isDriver)) return -5;
	return null;
}

function validateName(name: String): RegExpMatchArray | null {
	return name.match(/[a-zA-Z] [a-zA-Z]+/);
}

function validateEmail(email: String): RegExpMatchArray | null {
	return email.match(/^(.+)@(.+)$/);
}

function validateCarPlate(carPlate: String, isDriver: boolean): false | RegExpMatchArray | null {
	return isDriver && carPlate.match(/[A-Z]{3}[0-9]{4}/);
}
