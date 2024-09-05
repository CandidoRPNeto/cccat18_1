import request from 'supertest';
import app from '../src/app';
import connect from "../src/db/connect";
import pgp from "pg-promise";
import crypto from "crypto";

test("Placa Invalida", async function () {
    const result = await request(app).post("/signup").send({
        name: "Alice Carla",
        email: "emai44l@test.com",
        cpf: "154.143.158-84",
        isDriver: true,
        carPlate: "ASQ123",
        password: "1234",
        isPassenger: false,

    });

    expect(result.body).toEqual({ "message": -5 });
});

test("Nome não composto", async function () {
    const result = await request(app).post("/signup").send({
        name: "Candido",
    });

    expect(result.body).toEqual({ "message": -3 });
});

test("Inserção de passageiro", async function () {
    const result = await request(app).post("/signup").send({
        name: "Alice Carla",
        email: "passageiro@email.test",
        cpf: "154.143.158-84",
        isDriver: false,
        carPlate: "ASQ1233",
        password: "1234",
        isPassenger: true
    });
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const connection = pgp()(connect);
    await connection.query("delete from ccca.account where account_id = $1", [result.body.accountId]);
    expect(result.body.accountId).toMatch(uuidRegex);
});

test("Inserção de motorista", async function () {
    const result = await request(app).post("/signup").send({
        name: "Alice Carla",
        email: "email@test.com",
        cpf: "154.143.158-84",
        isDriver: true,
        carPlate: "ASQ1233",
        password: "1234",
        isPassenger: false,

    });
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const connection = pgp()(connect);
    await connection.query("delete from ccca.account where account_id = $1", [result.body.accountId]);
    expect(result.body.accountId).toMatch(uuidRegex);
});

test("Usuario ja inserido", async function () {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const id = crypto.randomUUID();
    const connection = pgp()(connect);
    await connection.query("insert into ccca.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, password) values ($1, $2, $3, $4, $5, $6, $7, $8)", [id, "Alice Carla", "passageiro@email.test", '00000000000', 'XPT0012', true, false, 'password']);
    const result = await request(app).post("/signup").send({
        name: "Alice Carla",
        email: "passageiro@email.test",
        cpf: "154.143.158-84",
        isDriver: false,
        carPlate: "ASQ1233",
        password: "1234",
        isPassenger: true
    });
    await connection.query("delete from ccca.account where account_id = $1", [id]);
    expect(result.body).toEqual({ "message": -4 });
});

test("Email invalido", async function () {
    const result = await request(app).post("/signup").send({
        name: "Alice Carla",
        email: "emailtestcom"
    });

    expect(result.body).toEqual({ "message": -2 });
});

test("Cpf invalido", async function () {
    const result = await request(app).post("/signup").send({
        name: "Alice Carla",
        email: "emai1l@test.com",
        cpf: "154.143.138-34",
        isDriver: true,
        carPlate: "ASQ1233",
        password: "1234",
        isPassenger: false,
    });

    expect(result.body).toEqual({ "message": -1 });
});

