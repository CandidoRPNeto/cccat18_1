import request from 'supertest';
import getAccount from "../src/controllers/getAccount";
import express from 'express';
import { Server } from 'http';

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

test('Buscar acount que não exista', async() => {
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
    const result =  await request(app).get(`/acccount/${id}`);
    expect(result.status).toBe(200);
});

test('Causar erro ao seridor', async() => {
    const id = "024e6196-ac2e-4730-a7bf-e23fb92a15656";
    const result =  await request(app).get(`/acccount/${id}`);
    expect(result.status).toBe(500);
});