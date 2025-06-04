import { generateToken } from '../features/common/utils.js';

const createClientTokenAndPrintOnConsole = async () => {
  const id = "683d7f03c17acdae4ba6c97d";

  const token = generateToken({ _id: id });
  console.log(token);

};
createClientTokenAndPrintOnConsole();