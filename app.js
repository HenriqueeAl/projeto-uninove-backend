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
                balance: 0,
                dsp: 0,
                lcr: 0
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
                balance: consult === null || consult === void 0 ? void 0 : consult.balance,
                lcr: consult === null || consult === void 0 ? void 0 : consult.lcr,
                dsp: consult === null || consult === void 0 ? void 0 : consult.dsp
            });
        }
    }
    catch (_b) {
        res.status(400).json({
            err: 'Erros inesperado.'
        });
    }
}));
app.post('/lanca', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const name = yield req.headers.name;
    const value = yield req.headers.value;
    const type = yield req.headers.type;
    const token = yield req.headers.token;
    const secret = process.env.SECRET;
    try {
        const valided = jwt.verify(token, secret);
        if (valided) {
            const user = yield prisma.user.findFirst({
                where: {
                    id: valided.id
                }
            });
            if (type == 'lcr') {
                const updateuser = yield prisma.user.update({
                    where: {
                        id: valided.id
                    },
                    data: {
                        lcr: user.lcr + parseFloat(value),
                        balance: user.balance + parseFloat(value)
                    }
                });
            }
            else {
                const updateuser = yield prisma.user.update({
                    where: {
                        id: valided.id
                    },
                    data: {
                        dsp: user.dsp + parseFloat(value),
                        balance: user.balance - parseFloat(value)
                    }
                });
            }
            const lanca = yield prisma.lanca.create({
                data: {
                    name: name,
                    value: parseFloat(value),
                    type: type,
                    userId: valided.id
                }
            }).then((e) => {
                res.status(200).json({
                    msg: 'Lançamento com sucesso'
                });
            });
        }
    }
    catch (_c) {
        res.send('?');
    }
}));
app.get('/lcr', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield req.headers.token;
    const secret = process.env.SECRET;
    try {
        const valided = jwt.verify(token, secret);
        if (valided) {
            const lcr = yield prisma.lanca.findMany({
                where: {
                    userId: valided.id,
                    type: 'lcr'
                }
            });
            res.status(200).json({
                data: lcr
            });
        }
    }
    catch (_d) {
        res.status(400).json({
            err: 'Erros inesperado.'
        });
    }
}));
app.get('/dsp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield req.headers.token;
    const secret = process.env.SECRET;
    try {
        const valided = jwt.verify(token, secret);
        if (valided) {
            const dsp = yield prisma.lanca.findMany({
                where: {
                    userId: valided.id,
                    type: 'dsp'
                }
            });
            res.status(200).json({
                data: dsp
            });
        }
    }
    catch (_e) {
        res.status(400).json({
            err: 'Erros inesperado.'
        });
    }
}));
app.post('/delete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield req.headers.token;
    const secret = process.env.SECRET;
    try {
        const valided = jwt.verify(token, secret);
        if (valided) {
            const deletelanca = yield prisma.lanca.delete({
                where: {
                    id: parseInt(req.headers.id)
                }
            });
            const user = yield prisma.user.findFirst({
                where: {
                    id: valided.id
                }
            });
            if (deletelanca.type == 'lcr') {
                const updateuser = yield prisma.user.update({
                    where: {
                        id: valided.id
                    },
                    data: {
                        lcr: user.lcr - deletelanca.value,
                        balance: user.balance - deletelanca.value
                    }
                });
            }
            else {
                const updateuser = yield prisma.user.update({
                    where: {
                        id: valided.id
                    },
                    data: {
                        dsp: user.dsp - deletelanca.value,
                        balance: user.balance + deletelanca.value
                    }
                });
            }
            res.status(200).json({
                msg: 'Deletado'
            });
        }
    }
    catch (_f) {
        res.status(400).json({
            err: 'Erros inesperado.'
        });
    }
}));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
