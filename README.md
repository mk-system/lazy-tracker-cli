# Lazy Tracker CLI

Lazy Tracker をターミナルから操作するためのCLI

## インストール

### シングルバイナリ（推奨）

[Releases](https://github.com/mk-system/lazy-tracker-cli/releases) からプラットフォームに合ったバイナリをダウンロード:

```bash
# macOS (Apple Silicon)
curl -L https://github.com/mk-system/lazy-tracker-cli/releases/latest/download/lt-macos-arm64 -o lt
chmod +x lt
sudo mv lt /usr/local/bin/

# macOS (Intel)
curl -L https://github.com/mk-system/lazy-tracker-cli/releases/latest/download/lt-macos-x64 -o lt
chmod +x lt
sudo mv lt /usr/local/bin/

# Linux (x64)
curl -L https://github.com/mk-system/lazy-tracker-cli/releases/latest/download/lt-linux-x64 -o lt
chmod +x lt
sudo mv lt /usr/local/bin/
```

### ソースからビルド

```bash
git clone https://github.com/mk-system/lazy-tracker-cli.git
cd lazy-tracker-cli
bun install && bun run build
sudo cp dist/lt /usr/local/bin/
```

## セットアップ

### 認証

```bash
lt auth login
```

上記コマンドを実行後、ブラウザが自動的に開き、認証フローが開始される。

### プロジェクト設定

リポジトリルートに `.lazy-tracker.json` を作成する。

```json
{
  "team": "your-team-key",
  "project": "your-project-key"
}
```

team または project のみの指定も可能

```json
{ "project": "frontend" }
```

この場合、team はグローバル設定の `default-team` から取得される。

### グローバル設定

```bash
# デフォルトのチームを設定
lt config:set default-team my-team

# デフォルトのプロジェクトを設定
lt config:set default-project my-project

# 設定確認
lt config
```

### team/project の解決優先順位

1. CLI オプション (`--team`, `--project`)
2. `.lazy-tracker.json` ファイル
3. グローバル設定 (`default-team`, `default-project`)

各ソースから team/project を個別に取得してマージする。例えば、グローバルに `default-team` を設定し、`.lazy-tracker.json` で `project` のみ指定すると、両方が組み合わされる。

## 使い方

### 出力形式

全コマンドはデフォルトで JSON 形式で出力する。`--table` オプションを使用するとテーブル形式で表示できる。

### チケット

```bash
# 一覧（JSON 出力）
lt tickets list

# テーブル表示
lt tickets list --table

# カラム指定
lt tickets list --table --columns ticketNumber,title,state,teamKey

# state でフィルタ
lt tickets list --state started

# list-type でフィルタ
lt tickets list --list-type current_backlog

# 作成
lt tickets create --title "タイトル"

# 作成（オプション指定）
lt tickets create --title "タイトル" --state unscheduled --list-type icebox

# 詳細
lt tickets show <ticket-id>

# 更新
lt tickets update <ticket-id> --state started

# 削除
lt tickets delete <ticket-id>

# 削除（確認スキップ）
lt tickets delete <ticket-id> --force
```

#### tickets list オプション

| オプション            | 説明                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------- |
| `-t, --team <key>`    | チームでフィルタ                                                                        |
| `-p, --project <key>` | プロジェクトでフィルタ                                                                  |
| `-s, --state <state>` | 状態でフィルタ (unscheduled, created, started, finished, delivered, accepted, rejected) |
| `--list-type <type>`  | リストタイプでフィルタ (done, current_backlog, icebox)                                  |
| `--table`             | テーブル形式で表示                                                                      |
| `--columns <cols>`    | 表示カラム (カンマ区切り)                                                               |

利用可能なカラム: `id`, `ticketNumber`, `title`, `state`, `listType`, `point`, `projectKey`, `teamKey`, `ticketType`

#### tickets create オプション

| オプション                 | 説明                                         | デフォルト      |
| -------------------------- | -------------------------------------------- | --------------- |
| `--title <title>`          | タイトル（必須）                             | -               |
| `-d, --description <text>` | 説明                                         | 空文字          |
| `--type <type>`            | チケットタイプ (normal, release)             | normal          |
| `--state <state>`          | 初期状態 (unscheduled, created, started)     | created         |
| `--list-type <type>`       | リストタイプ (done, current_backlog, icebox) | current_backlog |
| `--point <points>`         | ストーリーポイント                           | -               |
| `--release-date <date>`    | リリース日 (YYYY-MM-DD)                      | -               |

### コメント

```bash
# 一覧
lt comments list <ticket-id>

# 追加
lt comments add <ticket-id> -m "コメント内容"

# 更新
lt comments update <chat-id> -m "更新内容"

# 削除
lt comments delete <chat-id>

# 削除（確認スキップ）
lt comments delete <chat-id> --force
```

### その他

```bash
# 認証状態
lt auth status

# ログアウト
lt auth logout

# 設定確認
lt config

# 設定変更
lt config:set <key> <value>
```

## オプション

```bash
# API URL を指定（デフォルト: https://api.lazy-tracker.com）
lt --api-url https://example.com tickets list

# カラー出力を無効化
lt --no-color tickets list
```

## 環境変数

| 変数名       | 説明    | デフォルト                     |
| ------------ | ------- | ------------------------------ |
| `LT_API_URL` | API URL | `https://api.lazy-tracker.com` |

## 認証情報の保存場所

認証トークンは以下の場所に**平文で**保存される:

- Linux: `~/.config/lazy-tracker-cli/`
- Mac: `~/Library/Preferences/lazy-tracker-cli/`
- Windows: `%APPDATA%/lazy-tracker-cli/`

共有マシンでの使用時はアカウント保護に注意すること。ログアウト (`lt auth logout`) でトークンは削除される。

## 開発

[Bun](https://bun.sh/) 1.x を使用。

```bash
# 依存関係インストール
bun install

# 開発実行
bun run dev

# ビルド（ローカル用シングルバイナリ）
bun run build

# リリース向け（全プラットフォーム）
bun run build:all

# 個別ビルド（必要な場合のみ）
bun run build:macos-arm64
bun run build:macos-x64
bun run build:linux-x64
bun run build:linux-arm64
bun run build:windows-x64

# API クライアント再生成（バックエンド起動必須）
bun run generate-api

# Lint / Format
bun run lint
bun run format:check
bun run format
```
