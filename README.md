# JO's House of Subs

Angular 15 + Node.js/Express starter organized like the RedCross603 project.

## Structure

```text
JosHouseOfSubs/
├── Client/
│   └── JosHouseOfSubs/
│       ├── src/app/
│       │   ├── components/
│       │   ├── guards/
│       │   ├── interceptors/
│       │   ├── models/
│       │   └── services/
│       ├── src/assets/images/
│       └── package.json
├── Server/
│   ├── config/
│   ├── controllers/
│   ├── interfaces/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── server.js
└── assets/config/
```

## Run the Angular client

```bash
cd Client/JosHouseOfSubs
npm install
npm start
```

Open `http://localhost:4200`.

## Run the API server

```bash
cd Server
cp .env.example .env
npm install
npm start
```

The server runs at `http://localhost:3000`. MongoDB is optional while the landing page is under development.

## Next modules

The project is ready to receive menu, online ordering, customer accounts, staff authentication, and administration components using the same component/service/route/controller/model pattern.
