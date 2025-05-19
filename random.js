import { generateToken } from './src/features/common/utils.js';

const createClientTokenAndPrintOnConsole = async () => {
  const id = "6829c7af1691f4a2a3d81ccd";

  const token = generateToken({ _id: id });
  console.log(token);

};
createClientTokenAndPrintOnConsole();