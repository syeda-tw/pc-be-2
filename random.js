import { generateToken } from './src/features/common/utils.js';

const createClientTokenAndPrintOnConsole = async () => {
  const id = "682a023468bcb902aa36435d";

  const token = generateToken({ _id: id });
  console.log(token);

};
createClientTokenAndPrintOnConsole();