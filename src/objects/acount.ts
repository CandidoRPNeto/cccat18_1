export default interface Account{
    id: String | null,
    name: String,
    email: String,
    cpf: String,
    carPlate: String,
    isPassenger: boolean,
    isDriver: boolean,
    password: String
}