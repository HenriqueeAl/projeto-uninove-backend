const express = require('express')
var cors = require('cors')
const app = express()
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const md5 = require('md5')
const jwt = require('jsonwebtoken');

const port = 3000

app.use(cors())

app.post('/register', async (req: any, res: any) => {
    const user = req.headers.user
    const password = req.headers.password
    if(user.length > 4){
      if(password.length > 6){
        const haveuser = await prisma.user.findFirst({
          where: {
            user: user
          }
        })
        if(haveuser){
          res.status(400).json({
            err: 'Usuario ja existe'
          })
        }else{
          const newuser = await prisma.user.create({
            data: {
              user: user,
              password: md5(password),
              balance: 0
            }
          }).then((e: any)=>{
            const secret = process.env.SECRET
            const token = jwt.sign(
              {
                id: e.id,
              },
              secret, {expiresIn: 60*60,}
            )
            res.status(200).json({
              msg: 'Cadastrado com sucesso',
              token: token
            })
          })
        }
      }else{
        res.status(400).json({
          err: 'Senha com menos de 6 caracteres.'
        })
      }
    }else{
      res.status(400).json({
        err: 'Usuario com menos de 4 caracteres.'
      })
    }
})

app.post('/login', async (req: any, res: any)=> {
    const user = req.headers.user
    const password = req.headers.password
    try {
      const finduser = await prisma.user.findFirst({
        where: {
          user: user
        }
      })
      if(finduser?.password == md5(password)){
        const secret = process.env.SECRET
        const token = jwt.sign(
          {
            id: finduser?.id,
          },
          secret, {expiresIn: 60*60,}
        )
        res.status(200).json({
          message: 'Logado',
          token: token
        })
      }
    }catch{

    }
})

app.post('/infos', async (req: any, res: any)=> {
  const token = await req.headers.token;
  const secret = process.env.SECRET
  try{
    const valided = jwt.verify(token, secret)
    if(valided){
      const consult = await prisma.user.findFirst({
        where: {
          id: valided.id
        }
      })
      res.status(200).json({
        id: consult?.id,
        name: consult?.user,
        balance: consult?.balance
      })
    }
  }catch{
    res.status(400).json({
      err: 'Erros inesperado.'
    })
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})