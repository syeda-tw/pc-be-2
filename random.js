import { generateToken } from './src/features/common/utils.js';

const createClientTokenAndPrintOnConsole = async () => {
  const id = "682f40d89a3a608a46e0913f";

  const token = generateToken({ _id: id });
  console.log(token);

};
createClientTokenAndPrintOnConsole();