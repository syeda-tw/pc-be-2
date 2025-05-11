import Client from "../../../../common/models/Client.js";
import User from "../../../../common/models/User.js";

const getUsersHandler = async (req, res) => {
    try {
        const { _id } = req.body.decodedToken;
        const { page = 1, limit = 20, status, sortBy = 'status', sortOrder = 'asc' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = Math.min(parseInt(limit, 10), 100);
        const skip = (pageNum - 1) * limitNum;
        const sortDir = sortOrder === 'desc' ? -1 : 1;

        const client = await Client.findById(_id).lean();
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        // Filter users by status if provided
        let usersArr = client.users || [];
        if (status) {
            usersArr = usersArr.filter(u => u.status === status);
        }

        // Sort users by status or other field
        usersArr = usersArr.sort((a, b) => {
            if (sortBy === 'status') {
                if (a.status < b.status) return -1 * sortDir;
                if (a.status > b.status) return 1 * sortDir;
                return 0;
            }
            return 0;
        });

        const total = usersArr.length;
        const paginatedUsers = usersArr.slice(skip, skip + limitNum);

        // Populate user and their practice
        const populatedUsers = await Promise.all(
            paginatedUsers.map(async (userObj) => {
                const user = await User.findById(userObj.user.toString())
                    .select('firstName username lastName title practice')
                    .populate({ path: 'practice', select: 'name' })
                    .lean();
                return {
                    ...userObj,
                    userId: userObj.user.toString(),
                    user: user ? {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        title: user.title,
                        username: user.username,
                        practice: user.practice ? {
                            _id: user.practice._id,
                            name: user.practice.name
                        } : null
                    } : null
                };
            })
        );

        return res.status(200).json({
            success: true,
            data: populatedUsers,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

export default getUsersHandler;
