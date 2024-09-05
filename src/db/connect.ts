import pgp from "pg-promise";

const connection = pgp()("cccat18_1-postgres-1://postgres:1234@localhost:3254/app");
export default connection;