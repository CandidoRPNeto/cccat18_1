import request from 'supertest';
import getAccount from "../src/services/getAccount";
import express from 'express';
import { Server } from 'http';
import dbCredentials from "../src/db/dbCredentials";
import pgp from "pg-promise";

let server: Server;
const app = express();
app.use(express.json());
app.get('/acccount/:id', getAccount);

beforeAll((done) => {
  server = app.listen(3031, () => {
    done();
  });
});

afterAll(() => {
  server.close();
});

test('Buscar acount que não existe', async() => {
    const id = "4675cd60-ccde-4c20-be9a-6e7c5c1729b3";
    const result =  await request(app).get(`/acccount/${id}`);
    expect(result.status).toBe(404);
});

test('Buscar uuid invalido', async() => {
    const id = "024e6196e23fb92a1565";
    const result =  await request(app).get(`/acccount/${id}`);
    expect(result.status).toBe(422);
});

test('Buscar acount existente', async() => {
    const id = "024e6196-ac2e-4730-a7bf-e23fb92a1565";
    const connection = pgp()(dbCredentials);
    await connection.query("insert into ccca.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, password) values ($1, $2, $3, $4, $5, $6, $7, $8)", [id, "Alice Carla", "passageiro@email.test", '00000000000', 'XPT0012', true, false, 'password']);
    const result =  await request(app).get(`/acccount/${id}`);
    expect(result.status).toBe(200);
    await connection.query("delete from ccca.account where account_id = $1", [id]); 
  });
