import dbCredentials from "../db/dbCredentials";
import pgp from "pg-promise";
import Account from "../objects/acount";

export default async function (req: any, res: any) {
    const id = req.params.id;
    if (id.lenght !== 32 && !id.match(/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/)) res.status(422).json({ message: "id type incorrect" })
    else {
        const connection = await pgp()(dbCredentials);
        try {
            const [account] = await connection.query('select * from ccca.account where account_id = $1', [id]);
            if (account) res.send(account);
            else res.status(404).json({ message: "account dont exist" })
        }
        catch(error) { res.status(500).json({ message: error }) }
        finally { await connection.$pool.end(); }
    }
}