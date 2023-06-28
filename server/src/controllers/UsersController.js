const database = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

class UserController {
    static async pegaUser(req, res){
        try{
            const getUser = await database.Users.findAll()
            return res.status(200).json(getUser)
        }
        catch (error){
            return res.status(500).json(error.message)
        }
    }

    static async cadastraUser(req, res) {        
        const novoUser = req.body;
        //console.log('novoUser', novoUser)
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(novoUser.password, salt)
        novoUser.password = hashedPassword
        //const newUser =  [novoUser.name, novoUser.email, novoUser.password ]
        try{
            const criarUser = await database.Users.create(novoUser)
            const  result = await criarUser.save()
            const { password, ...data } = await result.toJSON()
            res.send(data)
            //return res.status(200).json(criarUser)
        }catch (error) {
            return res.status(500).json(error.message);
        }
    }

    static async verificaLogin(req, res) {
        const user = req.body;
        try{
            const  verificaUser = await database.Users.findOne({
                where: { email: user.email }
            })
            if(!verificaUser){
                return res.status(404).send({ message: 'User not found!'})
            }
            if(!await bcrypt.compare(req.body.password, verificaUser.password )){
                return res.status(400).send({ message: 'Invalid credentials'})
            }

            const token = jwt.sign({_id:verificaUser.id}, "secret")

            res.cookie('jwt', token, {
                httpOnly:true,
                maxAge: 24*60*60*1000
            })
            res.send({ message: 'Success' })
            //res.send(verificaUserEmail)
            //return res.status(200).json(verificaUserEmail)
        }catch(error){
            res.send(verificaUserEmail)
            //return res.status(500).json(error.message)
        }        
    }
    static async authenticatedUser(req, res){
        try{
            const cookie = req.cookies['jwt']

        const claims = jwt.verify(cookie, 'secret')

        if(!claims){
            return res.status(401).send({message: 'unauthenticated'})
        }

        const user = await database.Users.findOne({
            where: {id: claims._id}
        })

        const { password, ...data } = await user.toJSON()
        res.send(data)

        }catch(error){
            return res.status(401).send({message: 'unauthenticated'})

        }
        
    }

    static async logout(req, res){
        res.cookie('jwt', '', {maxAge: 0})
        res.send({ message: 'Logout Success!'})
    }
}


module.exports = UserController