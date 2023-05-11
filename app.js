"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
var cors = require('cors');
const app = express();
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const port = 3000;
app.use(cors());
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.headers.user;
    const password = req.headers.password;
    if (user.length > 4) {
        if (password.length > 6) {
            const haveuser = yield prisma.user.findFirst({
                where: {
                    user: user
                }
            });
            if (haveuser) {
                res.status(400).json({
                    err: 'Usuario ja existe'
                });
            }
            else {
                const newuser = yield prisma.user.create({
                    data: {
                        user: user,
                        password: md5(password),
                        balance: 0
                    }
                }).then((e) => {
                    const secret = process.env.SECRET;
                    const token = jwt.sign({
                        id: e.id,
                    }, secret, { expiresIn: 60 * 60, });
                    res.status(200).json({
                        msg: 'Cadastrado com sucesso',
                        token: token
                    });
                });
            }
        }
        else {
            res.status(400).json({
                err: 'Senha com menos de 6 caracteres.'
            });
        }
    }
    else {
        res.status(400).json({
            err: 'Usuario com menos de 4 caracteres.'
        });
    }
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.headers.user;
    const password = req.headers.password;
    try {
        const finduser = yield prisma.user.findFirst({
            where: {
                user: user
            }
        });
        if ((finduser === null || finduser === void 0 ? void 0 : finduser.password) == md5(password)) {
            const secret = process.env.SECRET;
            const token = jwt.sign({
                id: finduser === null || finduser === void 0 ? void 0 : finduser.id,
            }, secret, { expiresIn: 60 * 60, });
            res.status(200).json({
                message: 'Logado',
                token: token
            });
        }
    }
    catch (_a) {
    }
}));
app.post('/infos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield req.headers.token;
    const secret = process.env.SECRET;
    try {
        const valided = jwt.verify(token, secret);
        if (valided) {
            const consult = yield prisma.user.findFirst({
                where: {
                    id: valided.id
                }
            });
            res.status(200).json({
                id: consult === null || consult === void 0 ? void 0 : consult.id,
                name: consult === null || consult === void 0 ? void 0 : consult.user,
                balance: consult === null || consult === void 0 ? void 0 : consult.balance
            });
        }
    }
    catch (_b) {
        res.status(400).json({
            err: 'Erros inesperado.'
        });
    }
}));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
