# Kalandjáték motor - Közösségi platform

Egy közösségi platform kalandjáték modulok megosztására, letöltésére és értékelésére.

## Funkciók

- **Felhasználói rendszer**: Regisztráció, bejelentkezés, profil szerkesztés
- **Modul feltöltés**: Kalandjáték modulok feltöltése leírással és képekkel
- **Modul böngészés**: Összes feltöltött modul megtekintése
- **Értékelési rendszer**: Modulok értékelése 0.5-5 csillaggal és szöveges véleménnyel
- **Letöltés**: Modulok .zip fájlként történő letöltése
- **Sötét mód**: Teljes dark mode támogatás
- **Biztonság**: Bcrypt alapú jelszó titkosítás

## Technológiák

### Frontend
- React
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express
- MySQL
- Bcrypt (jelszó titkosítás)
- Multer (fájl feltöltés)

## Telepítés

### Előfeltételek
- Node.js
- MySQL szerver

### Lépések

1. **Repository klónozása**
```bash
git clone <repository-url>
cd kjk-community-platform
```

2. **Backend telepítése**
```bash
cd backend
npm install
```

3. **Adatbázis beállítása**

Hozz létre egy `.env` fájlt a `backend` mappában:
```
DB_HOST=localhost
DB_USER=kjk_user
DB_PASSWORD=password
DB_NAME=kaland_jatek_kockazat
PORT=5000
```

Importáld az adatbázis sémát:
```bash
mysql -u root -p < init.sql
```

4. **Frontend telepítése**
```bash
cd ..
npm install
```

## Indítás

### Backend indítása
```bash
cd backend
node index.js
```
A szerver elindul a `http://localhost:5000` címen.

### Frontend indítása
```bash
npm start
```
Az alkalmazás megnyílik a `http://localhost:3000` címen.

## API Végpontok

### Felhasználó kezelés
- `POST /api/register` - Új felhasználó regisztrálása
- `POST /api/login` - Bejelentkezés
- `POST /api/logout` - Kijelentkezés
- `GET /api/user` - Aktuális felhasználó lekérése
- `POST /api/user/update` - Profil frissítése
- `POST /api/user/change-password` - Jelszó módosítása
- `GET /api/users/:username` - Felhasználói profil és modulok

### Modulok
- `GET /api/modules` - Összes modul listázása
- `GET /api/modules/:id` - Egy modul részletes adatai
- `POST /api/modules` - Új modul feltöltése
- `GET /api/modules/:id/download` - Modul letöltése

### Értékelések
- `GET /api/modules/:moduleId/reviews` - Modul értékelései
- `POST /api/reviews` - Új értékelés beküldése

## Adatbázis struktúra

- **users** - Felhasználói adatok (titkosított jelszóval)
- **modules** - Kalandjáték modulok
- **reviews** - Modul értékelések (0.5-5 csillag + szöveg)
- **images** - Modul képek

## Biztonság

- Jelszavak bcrypt titkosítással tárolva (10 salt rounds)
- Session-alapú hitelesítés
- SQL injection védelem prepared statements használatával
- Fájl feltöltés típus ellenőrzéssel (.zip, .png, .jpg, .jpeg)

## Licenc

Ez a projekt oktatási célra készült.
