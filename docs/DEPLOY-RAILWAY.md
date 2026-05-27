# Railway へのデプロイ手順

## 前提

- SQLite + Volume（永続ディスク）必須
- インスタンスは **1台**（SQLite は同時書き込みに弱い）

## 1. Railway でプロジェクト作成

1. [Railway](https://railway.com/) で GitHub リポジトリを接続
2. サービスを追加（`daily-repo` ルート）

## 2. Volume を追加

1. サービス → **Volumes** → Add Volume
2. マウントパス: `/data`
3. 環境変数を設定:

| 変数 | 値 |
|------|-----|
| `DATABASE_URL` | `file:/data/prod.db` |
| `AUTH_SECRET` | 32文字以上のランダム文字列 |
| `MAKER_SECRET` | 16文字以上のランダム文字列 |
| `NODE_ENV` | `production` |

`CRON_SECRET` は LINE リマインダーを使う場合のみ。

## 3. デプロイ

リポジトリに含まれる設定ファイル:

| ファイル | 必要？ | 役割 |
|----------|--------|------|
| `railway.toml` | **推奨** | ビルド・起動・ヘルスチェック・レプリカ1台 |
| `nixpacks.toml` | **推奨** | Node プロバイダ + `better-sqlite3` ビルド（gcc/python） |
| `.nvmrc` | 任意 | Node 20 を明示 |

- **Build:** `npm run build`（`railway.toml`）
- **Start:** `npx prisma migrate deploy` → `next start`（`railway.toml`）
- **必須:** Variables に `DATABASE_URL=file:/data/prod.db`（未設定だと migrate が失敗します）
- ローカルでマイグレーション込み起動する場合は `npm start` も利用可

初回デプロイ後:

1. `https://<your-app>.up.railway.app/maker/login` にアクセス
2. `MAKER_SECRET` でログイン
3. 店舗・オーナー・スタッフを作成（`db:seed` は本番では使わない）

## 4. 動作確認

- [ ] `/login` でオーナー・スタッフログイン
- [ ] `/staff` で保存
- [ ] `/owner` で設定表示

## 5. バックアップ（推奨）

Volume 内の `/data/prod.db` を毎日コピー（Railway CLI または手動ダウンロード）。

## トラブルシュート

| 症状 | 対処 |
|------|------|
| `DATABASE_URL is not set` / `datasource.url property is required` | Variables に `DATABASE_URL=file:/data/prod.db` を設定。Volume を `/data` にマウント |
| `better_sqlite3` / ELF エラー | `node_modules` をコミットしていないか確認。再デプロイ |
| マイグレーション失敗 | ログで `prisma migrate deploy` を確認 |
| 502 / 起動しない | `PORT` は Railway が注入。`next start -H 0.0.0.0` は `package.json` 済み |
