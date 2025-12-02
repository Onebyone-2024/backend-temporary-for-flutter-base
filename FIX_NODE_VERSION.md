# FIX: Node.js Version Issue

## Masalah

Anda menggunakan Node.js 14 yang sudah kadaluarsa. Library `icu4c` tidak kompatibel.

## Solusi

### Option 1: Gunakan NVM (Recommended)

```bash
# Install NVM jika belum ada
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.zshrc

# Install Node 20 LTS
nvm install 20

# Gunakan Node 20
nvm use 20

# Verify
node --version  # Should be v20.x.x
npm --version   # Should be 10.x.x
```

### Option 2: Menggunakan Homebrew

```bash
# Uninstall Node 14
brew uninstall node@14

# Install Node 20
brew install node@20

# Link ke default
brew link node@20 --force

# Verify
node --version  # Should be v20.x.x
```

### Option 3: Hapus dan Install Ulang

```bash
# Hapus Node completely
brew uninstall node icu4c

# Bersihkan cache Homebrew
brew cleanup

# Install Node 20
brew install node

# Verify
node --version  # Should be v20.x.x
```

## Setelah Node.js diperbaiki

Jalankan:

```bash
cd /Users/onebyone/backend-social-media

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Setup .env
cp .env.example .env
# Edit .env dengan connection string Supabase Anda

# Jalankan migration
npx prisma migrate dev --name init

# Jalankan aplikasi
npm run start:dev
```

## Verify Installation

```bash
# Cek Node & NPM
node --version   # v20.x.x
npm --version    # 10.x.x

# Cek npm packages terinstall
npm list | head -20
```
