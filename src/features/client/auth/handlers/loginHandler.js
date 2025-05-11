import Client from '../../../../common/models/Client.js';
import { sanitizeClient } from '../../utils.js';
import { isPasswordCorrect, generateToken } from '../../../common/utils.js';

const loginHandler = async (req, res) => {
    try {
        const { phone, password } = req.body;

        const client = await Client.findOne({ phone });
        if (!client) {
            return res.status(401).json({ message: 'Invalid phone number' });
        }

        const isValidPassword = await isPasswordCorrect(password, client.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = generateToken({ _id: client._id });
        const sanitizedClient = sanitizeClient(client);

        res.status(200).json({
            token,
            client: sanitizedClient
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default loginHandler;
