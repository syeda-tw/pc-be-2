import { generateToken } from '../features/common/utils.js';

const createClientTokenAndPrintOnConsole = async () => {
  const id = "68549b9d395429cd9dbe1696";

  const token = generateToken({ _id: id });
  console.log(token);

};
createClientTokenAndPrintOnConsole();