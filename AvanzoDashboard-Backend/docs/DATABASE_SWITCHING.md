# Switching between SQLite databases

Your project can use **two local SQLite files**:

| File | Purpose |
|------|---------|
| `db.sqlite3` | **Default / “main”** — use for a copy from a teammate, staging data, or “back to normal” after feature work. |
| `db.dev.sqlite3` | **Feature development** — safe to reset; enabled when `DATABASE_URL` is set (see `.env`). |

## Feature work (current setup)

In `.env`:

```env
DATABASE_URL=sqlite:///db.dev.sqlite3
```

Always run Django from the `AvanzoDashboard-Backend` folder:

```powershell
cd "...\AvanzoDashboard-Backend"
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Seed data when you need users (optional):

```powershell
python manage.py load_employee_data
python manage.py load_mock_data
```

Or create an admin interactively:

```powershell
python manage.py create_admin --email admin@avanzo.com --first-name Admin --last-name User
```

## Go back to the previous / shared database

1. **Stop** the Django server.
2. Open `.env` and **remove** the line `DATABASE_URL=sqlite:///db.dev.sqlite3` (or comment it out).
3. Put your “real” data in `db.sqlite3` (e.g. copy your friend’s `db.sqlite3` over yours, or restore a backup you saved).
4. Start the server again — Django will use `db.sqlite3` (see `config/settings.py` default).

## Backup before risky changes

```powershell
copy db.sqlite3 db.sqlite3.backup-before-features
```

Restore later:

```powershell
copy db.sqlite3.backup-before-features db.sqlite3
```

## Notes

- `.env` is gitignored; `db*.sqlite3` files should not be committed.
- If paths ever break on Windows, use an absolute URL, e.g.  
  `DATABASE_URL=sqlite:///C:/full/path/to/AvanzoDashboard-Backend/db.dev.sqlite3`
