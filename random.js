import { generateToken } from './src/features/common/utils.js';

const createClientTokenAndPrintOnConsole = async () => {
  const id = "682237fde0694528e9c89977";

  const token = generateToken({ _id: id });
  console.log(token);

};
createClientTokenAndPrintOnConsole();