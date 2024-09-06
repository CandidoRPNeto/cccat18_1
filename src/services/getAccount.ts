import dbCredentials from "../db/dbCredentials";
import pgp from "pg-promise";

export default async function (req: any, res: any) {
    const id = req.params.id;
    if (!isValidUuid(id)) res.status(422).json({ message: "id type incorrect" })
    else {
        const account = await getAcount(id);
        if (account) res.send(account);
        else res.status(404).json({ message: "account dont exist" })
    }
}

async function getAcount(id: String) {
    const connection = await pgp()(dbCredentials);
    let result;
    try {
        const [account] = await connection.query('select * from ccca.account where account_id = $1', [id]);
        result = account;
    }
    catch (error) { result = false; }
    finally { await connection.$pool.end(); }
    return result;
}

function isValidUuid(uuid: String) {
    return (uuid.length === 36 && uuid.match(/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/))
}