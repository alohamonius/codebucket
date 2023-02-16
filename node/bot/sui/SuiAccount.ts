export class SuiAccount {
  public readonly publicKey: string;
  public readonly schema: string;
  public readonly privateKey: string;
  public readonly mnemonic: string;
  public funded: boolean;
  public registered: boolean;
  public validator: string;
  public role: number;
  public epoch: number;

  constructor(
    publicKey: string,
    privateKey: string,
    schema: string,
    mnemonic: string,
    funded: boolean,
    registered: boolean,
    validator: string,
    epoch: number,
    role: number
  ) {
    if (publicKey.substring(0, 2) === "0x") throw Error("bad wallet format");
    this.publicKey = "0x" + publicKey;
    this.schema = schema;
    this.privateKey = privateKey;
    this.mnemonic = mnemonic;
    this.funded = funded;
    this.registered = registered;
    this.validator = validator;
    this.epoch = epoch;
    this.role = role;
  }

  static From(
    publicKey: string,
    privateKey: string,
    schema: string,
    mnemonic: string,
    funded: boolean,
    registered: boolean,
    validator: string,
    epoch: number,
    role: number
  ) {
    return new SuiAccount(
      publicKey,
      privateKey,
      schema,
      mnemonic,
      funded,
      registered,
      validator,
      epoch,
      role
    );
  }
}
