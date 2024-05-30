import { Buffer } from 'buffer';
import { saveAs } from 'file-saver';
import {
  OnChainRegistry,
  signCertificate,
  PinkContractPromise,
  types,
  fixture,
  periodicityChecker,
} from '@phala/sdk';
import { Keyring, WsProvider, ApiPromise } from '@polkadot/api';
import rust_vault_snippets from '../data/rust_vault_snippets.json';

let account: any = null;
let phalaContract: any = null;
let phalaCertificate: any = null;

// Creates a Contract instance and connects to the phala network (PoC5 atm)
const initPhalaContract = async function () {
  if (!account || !phalaCertificate || !phalaContract) {
    const provider = new WsProvider('wss://api.phala.network/ws');

    // @ts-ignore
    const api = await ApiPromise.create({ provider, types });
    console.log('api', api);
    const phatRegistry = await OnChainRegistry.create(api);
    console.log('phatRegistry', phatRegistry);

    const keyring = new Keyring({ type: 'sr25519' });
    account = keyring.addFromUri('//Alice');

    phalaCertificate = await signCertificate({ api, pair: account });

    console.log('phalaCertificate', phalaCertificate);
    console.log('import.meta.env.VITE_NFT_ADDRESS', import.meta.env.VITE_CONTRACT_ADDRESS);

    const contractKey = await phatRegistry.getContractKeyOrFail(
      import.meta.env.VITE_CONTRACT_ADDRESS
    );
    console.log('contractKey', contractKey);
    phalaContract = new PinkContractPromise(
      api,
      phatRegistry,
      rust_vault_snippets,
      import.meta.env.VITE_CONTRACT_ADDRESS,
      contractKey
    );
    console.log('phalaContract', phalaContract);
  }

  return [account, phalaCertificate, phalaContract];
};

export async function decryptContent(nftId: number, timestamp: number, signature: string) {
  const [account, certificate, contract] = await initPhalaContract();

  // toast("Decrypting and downloading file", { type: "info" });
  let response = null;
  console.log('account.address', account.address);
  console.log('certificate', certificate);
  console.log('nftId', nftId);
  console.log('timestamp', timestamp);
  console.log('signature', signature);
  try {
    response = await contract.query.downloadAndDecrypt(
      account.address,
      { cert: certificate },
      nftId,
      timestamp,
      signature
    );
  } catch (error) {
    console.log(error);

    return null;
  }

  console.log(response);
  const output = response.output.toJSON();
  console.log('output', output);

  if ('err' in output) {
    throw new Error(`Failed to decrypt content: ${output.err}`);
  } else if (!output.ok) {
    throw new Error(`Failed to decrypt content: unknown error`);
  } else if ('err' in output.ok) {
    throw new Error(`Failed to decrypt content: ${output.ok.err}`);
  }
  return output.ok.ok;
}

export function saveFile(content: string) {
  let [type, contentData] = content.split(',');
  let data = Buffer.from(contentData, 'base64').toString();

  const fileExt = detectType(type);

  var blob = new Blob([data]);
  saveAs(blob, `decrypted_file.${fileExt}`);
}

function detectType(type: any) {
  let fileType = null;

  const extensions = {
    xls: 'application/vnd.ms-excel',
    ppt: 'application/vnd.ms-powerpoint',
    doc: 'application/msword',
    xml: 'text/xml',
    mpeg: 'audio/mpeg',
    mpg: 'audio/mpeg',
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    csv: 'text/csv',
    txt: 'text/plain',
  };
  Object.entries(extensions).forEach(([ext, name]) => {
    if (type.includes(name)) {
      fileType = ext;
    }
  });

  // try {
  //   fileType = type.split(';')[0].split('/')[1].split('+')[0];
  //   if (fileType) {
  //     return fileType;
  //   }
  // } catch (error) {
  //   console.debug(error);
  // }
  return fileType || 'txt';
}
