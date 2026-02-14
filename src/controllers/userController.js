const UserService = require('../services/userService');

class UserController {
    constructor() {
        this.userService = new UserService();
    }

    async createUser(req, res) {
        try {
            // Desestructuramos los campos esperados y llamamos correctamente al servicio
            const { nombre, email, password, role } = req.body;
            const user = await this.userService.registerUser(nombre, email, password, role);
            return res.status(201).json({ status: 'success', data: user });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getUser(req, res) {
        try {
            const user = await this.userService.getUserById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = UserController;