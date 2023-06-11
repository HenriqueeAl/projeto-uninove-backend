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
          balance: 0,
          dsp: 0,
          lcr: 0
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
        balance: consult?.balance,
        lcr: consult?.lcr,
        dsp: consult?.dsp
      })
    }
  }catch{
    res.status(400).json({
      err: 'Erros inesperado.'
    })
  }
})

app.post('/lanca', async (req: any, res: any)=> {
  const name = await req.headers.name
  const value = await req.headers.value
  const type = await req.headers.type
  const token = await req.headers.token;

  const secret = process.env.SECRET

  try{
    const valided = jwt.verify(token, secret)
    if(valided){
      const user = await prisma.user.findFirst({
        where: {
          id: valided.id
        }
      })

      if(type == 'lcr'){
        const updateuser = await prisma.user.update({
          where: {
            id: valided.id
          },
          data:{
            lcr: user.lcr + parseFloat(value),
            balance: user.balance + parseFloat(value)
          }
        })
      }else{
        const updateuser = await prisma.user.update({
          where: {
            id: valided.id
          },
          data:{
            dsp: user.dsp + parseFloat(value),
            balance: user.balance - parseFloat(value)
          }
        })
      }


      const lanca = await prisma.lanca.create({
        data: {
          name: name,
          value: parseFloat(value),
          type: type,
          userId: valided.id
        }
      }).then((e: any)=>{
          res.status(200).json({
            msg: 'Lançamento com sucesso'
        })
      })
    }
  }catch{
    res.send('?')
  }
})

app.get('/lcr', async (req: any, res: any)=>{
  const token = await req.headers.token;
  const secret = process.env.SECRET
  try{
    const valided = jwt.verify(token, secret)
    if(valided){
      const lcr = await prisma.lanca.findMany({
        where: {
          userId: valided.id,
          type: 'lcr'
        }
      })
      res.status(200).json({
        data: lcr
      })
    }
  }catch{
    res.status(400).json({
      err: 'Erros inesperado.'
    })
  }
})

app.get('/dsp', async (req: any, res: any)=>{
  const token = await req.headers.token;
  const secret = process.env.SECRET
  try{
    const valided = jwt.verify(token, secret)
    if(valided){
      const dsp = await prisma.lanca.findMany({
        where: {
          userId: valided.id,
          type: 'dsp'
        }
      })
      res.status(200).json({
        data: dsp
      })
    }
  }catch{
    res.status(400).json({
      err: 'Erros inesperado.'
    })
  }
})

app.post('/delete', async (req: any, res: any)=>{
  const token = await req.headers.token;
  const secret = process.env.SECRET
  
  try{
    const valided = jwt.verify(token, secret)
    if(valided){
      const deletelanca = await prisma.lanca.delete({
        where: {
          id: parseInt(req.headers.id)
        }
      })

      const user = await prisma.user.findFirst({
        where: {
          id: valided.id
        }
      })

      if(deletelanca.type == 'lcr'){
        const updateuser = await prisma.user.update({
          where: {
            id: valided.id
          },
          data:{
            lcr: user.lcr - deletelanca.value,
            balance: user.balance - deletelanca.value
          }
        })
      }else{
        const updateuser = await prisma.user.update({
          where: {
            id: valided.id
          },
          data:{
            dsp: user.dsp - deletelanca.value,
            balance: user.balance + deletelanca.value
          }
        })
      }
      
      res.status(200).json({
        msg: 'Deletado'
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